const fs = require('fs');

const OUT_DIR = "./build";
const SRC_DIR = "./src/root";
const HEADER_DIR = "./src/templates/header.html";
const HEADER_LOCATION_STRING = "<!--{header.html}-->";
const DEPTH_PLACEHOLDER = "<!--depth-->";

function cleanUpBuild() {
	if (fs.existsSync(OUT_DIR)) {
		fs.rmSync(OUT_DIR, { recursive: true, force: true });
	}
}
cleanUpBuild();

const headerHTML = fs.readFileSync(HEADER_DIR).toString('utf8');

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
		let fixedHeader = formatHeaderForDepth(depth);
		let fixedData = data.replace(HEADER_LOCATION_STRING, fixedHeader);
		
		fs.writeFileSync(fullOutPath, fixedData);
	});
}

function formatHeaderForDepth(depth) {
	var depthString = ".";
	for (var i = 0; i < depth; i++) {
		depthString += "/..";
	}
	return headerHTML.replaceAll(DEPTH_PLACEHOLDER, depthString);
}

copyWithProcessing(OUT_DIR, SRC_DIR, "", -1);
