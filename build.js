const fs = require('fs');

const OUT_DIR = "./build";
const SRC_DIR = "./src/root";
const HEADER_DIR = "./src/templates/header.html";
const HEADER_LOCATION_STRING = "<!--{header.html}-->";
const FOOTER_DIR = "./src/templates/footer.html";
const FOOTER_LOCATION_STRING = "<!--{footer.html}-->";
const DEPTH_PLACEHOLDER = "<!--depth-->";

const WIKI_SRC_DIR = "./src/wiki";
const WIKI_OUT_DIR = "./build/wiki";

function cleanUpBuild() {
	if (fs.existsSync(OUT_DIR)) {
		fs.rmSync(OUT_DIR, { recursive: true, force: true });
	}
}
cleanUpBuild();

const headerHTML = fs.readFileSync(HEADER_DIR).toString('utf8');
const footerHTML = fs.readFileSync(FOOTER_DIR).toString('utf8');

function copyWithProcessing(outRoot, sourceRoot, currentFile, depth) {
	var fullSourcePath = sourceRoot + "/" + currentFile;
	var fullOutPath = outRoot + "/" + currentFile;
	if (fs.lstatSync(fullSourcePath).isDirectory()) {
		fs.mkdirSync(fullOutPath);
		
		for (file of fs.readdirSync(fullSourcePath)) {
			copyWithProcessing(outRoot, sourceRoot, currentFile + "/" + file, depth + 1);
		}
		return;
	}

	fs.readFile(fullSourcePath, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		//Put in the header.
		let fixedHeader = formatFileForDepth(headerHTML, depth);
		let fixedFooter = formatFileForDepth(footerHTML, depth);
		let fixedData = data.replaceAll(HEADER_LOCATION_STRING, fixedHeader)
							.replaceAll(FOOTER_LOCATION_STRING, fixedFooter);
		
		fs.writeFileSync(fullOutPath, fixedData);
	});
}

function formatFileForDepth(file, depth) {
	var depthString = ".";
	for (var i = 0; i < depth; i++) {
		depthString += "/..";
	}
	return file.replaceAll(DEPTH_PLACEHOLDER, depthString);
}

copyWithProcessing(OUT_DIR, SRC_DIR, "", -1);

function createWiki() {
	fs.mkdirSync(WIKI_OUT_DIR);
	//Get all Wiki files and put them in a map
	var pageSourceMap = {};
	var pageSources = [];
	for (file of fs.readdirSync(WIKI_SRC_DIR)) {
		var data = fs.readFileSync(WIKI_SRC_DIR + "/" + file, 'utf8');
		
		var jsonContent = JSON.parse(data);
		pageSourceMap[jsonContent.PageName] = jsonContent;
		pageSources.push(jsonContent);
	}
	
	var characters = [];
	var places = [];
	var books = [];
	
	for (let jsonContent of pageSources) {
		var pageContent = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\" />" +
				"<!-- Need to add an icon!! <link rel=\"shortcut icon\" href=\"./favicon.ico\" /> -->" +
				"<link rel=\"stylesheet\" href=\"../index.css\"><title>"
				+ jsonContent.Name + ": Stem Forest Wiki</title></head><body>";
		pageContent += formatFileForDepth(headerHTML, 1);
		pageContent += "<h1>" + jsonContent.Name + "</h1>";
		pageContent += "<p>" + jsonContent.Summary + "</p>";
		if (jsonContent.Category === "Character") {
			pageContent += getCharacterPage(jsonContent, pageSourceMap);
			characters.push(jsonContent.PageName);
		} else if (jsonContent.Category === "Place") {
			places.push(jsonContent.PageName);
		} else if (jsonContent.Category === "Book") {
			books.push(jsonContent.PageName);
		}
		
		pageContent += "<h1>Biography</h1>" + jsonContent.Biography;
		pageContent += "</body></html>";
		
		fs.writeFileSync(WIKI_OUT_DIR + "/" + jsonContent.PageName + ".html", pageContent);
	}
	
	var wikiPage = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\" />" +
				"<!-- Need to add an icon!! <link rel=\"shortcut icon\" href=\"./favicon.ico\" /> -->" +
				"<link rel=\"stylesheet\" href=\"../index.css\"><title>Stem Forest Wiki</title></head><body>" +
				formatFileForDepth(headerHTML, 1) +
				"<h1>Welcome to the Stem Forest Wiki!</h1>";
	wikiPage += listLinks("Characters", characters, pageSourceMap);
	wikiPage += listLinks("Books", books, pageSourceMap);
	wikiPage += listLinks("Places", places, pageSourceMap);

	wikiPage += formatFileForDepth(footerHTML, 1) + "</body>";
	fs.writeFileSync(WIKI_OUT_DIR + "/index.html", wikiPage);
}

function getCharacterPage(jsonContent, pageSourceMap) {
	var pageContent = "<h1>Links</h1>";
	pageContent += listLinks("Friends", jsonContent.Friends, pageSourceMap);
	pageContent += listLinks("Books", jsonContent.Books, pageSourceMap);
	pageContent += listLinks("Places", jsonContent.Places, pageSourceMap);
	pageContent += "<h1>Appearance</h1><ul>" +
			"<li>Species: " + jsonContent.Appearance.Species + "</li>" +
			"<li>Sex: " + jsonContent.Appearance.Sex + "</li>" +
			"<li>Height: " + jsonContent.Appearance + "</li>" +
			"<li>Weight: " + jsonContent.Appearance + "</li>" +
			"<li>Skin: <ul><li>Color: " + jsonContent.Appearance.Skin.Color +
			"</li><li>Texture: " + jsonContent.Appearance.Skin.Texture +
			"</li></ul></li><li>Hair: <ul><li>Color: " + jsonContent.Appearance.Hair.Color +
			"</li><li>Texture: " + jsonContent.Appearance.Hair.Texture +
			"</li><li>Length: " + jsonContent.Appearance.Hair.Length +
			"</li><ul>";
	pageContent += "<h1>Personality</h1><p>Big 5 Personality (OCEAN), Scale of 1 to 10.</p><ul>" +
			"<li>Openness: " + jsonContent.OCEAN.O + "</li>" +
			"<li>Conscientiousness: " + jsonContent.OCEAN.C + "</li>" +
			"<li>Extraversion: " + jsonContent.OCEAN.E + "</li>" +
			"<li>Agreeableness: " + jsonContent.OCEAN.A + "</li>" +
			"<li>Neuroticism: " + jsonContent.OCEAN.N + "</li></ul>";
	pageContent += "<h1>Powers</h1>"
	for (let power of jsonContent.Powers) {
		pageContent += "<h2>" + power.PowerName + "</h2>";
		pageContent += "<p>" + power.Description + "</p>";
	}
	pageContent += "<h1>Hobies</h1>" + htmlList(jsonContent.Hobbies);
	pageContent += "<h1>Expertise</h1>" + htmlList(jsonContent.Expertise);
	pageContent += "<h1>Jobs</h1>" + htmlList(jsonContent.Jobs);
	
	return pageContent;
}

function htmlList(items) {
	var pageContent = "<ul>";
	for (let item of items) {
		pageContent += "<li>" + item + "</li>";
	}
	pageContent += "</ul>";
	return pageContent;
}

function listLinks(category, items, pageSourceMap) {
	var pageContent = "<h2>" + category + "</h2><ul>";
	for (let item of items) {
		pageContent += "<li><a href=\"./" + item + ".html\">" + pageSourceMap[item].Name + "</a>: " + pageSourceMap[item].ShortDescription + "</li>";
	}
	pageContent += "</ul>";
	return pageContent;
}

createWiki();