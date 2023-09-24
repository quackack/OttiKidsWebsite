const fs = require('fs');

const OUT_DIR = "./build";
const SRC_DIR = "./src/root";
const HEADER_DIR = "./src/templates/header.html";
const HEADER_LOCATION_STRING = "<!--{header.html}-->";

function setUpBuild() {
	if (fs.existsSync(OUT_DIR)) {
		fs.rmSync(OUT_DIR, { recursive: true, force: true });
	}
	fs.mkdirSync(OUT_DIR);
}
setUpBuild();

const headerHTML = fs.readFileSync(HEADER_DIR);

function copyWithProcessing(outRoot, sourceRoot, currentFile) {
	var fullSourcePath = sourceRoot + "/" + currentFile;
	if (fs.lstatSync(fullSourcePath).isDirectory()) {
		for (file of fs.readdirSync(fullSourcePath)) {
			copyWithProcessing(outRoot, sourceRoot, currentFile + "/" + file);
		}
		return;
	}

	fs.readFile(fullSourcePath, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		//Put in the header.
		let fixedData = data.replace(HEADER_LOCATION_STRING, headerHTML);
		
		fs.writeFileSync(outRoot + "/" + currentFile, fixedData);
	});
}
copyWithProcessing(OUT_DIR, SRC_DIR, "");
