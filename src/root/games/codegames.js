const PARITY_MODE = "parity";
const CUSTOM_MODE = "custom";

const BINARY_ALPH = "binary";
const DECIMAL_ALPH = "decimal";
const ALNUM_ALPH = "alphanumeric";

var game;

function toggleGameMode() {
	var mode = document.getElementById('mode').value;
    if (mode === PARITY_MODE) {
        document.getElementById('EraseContainer').style.display = 'none';
    } 
    else {
        document.getElementById('EraseContainer').style.display = 'block';
    }
}

function makeNewGame() {
	var mode = document.getElementById('mode').value;
	
	if (mode === PARITY_MODE) {
		game = startNewParityGame();
    } 
    else {
        game = startNewCustomGame();
    }
}

function getAlphabetSize() {
	const alph = document.getElementById('alphabet').value;
	if (alph === BINARY_ALPH) {
		return 2;
	} if (alph === DECIMAL_ALPH) {
		return 10;
	} if (alph === ALNUM_ALPH) {
		return 62;
	}
	return 1;
}

function numToLet(num) {
	if (num <= 36) {
		return num.toString();
	}
	return (num - 36).toString().toUpperCase();
}

function rand(range) {
	return Math.floor(Math.random()*range)
}

function swap(str, index, newVal) {
	return str.substring(0, index) + newVal + str.substring(index+1);
}

function corrupt(str) {
	return swap(str, rand(str.length), "-");
}

function startNewParityGame() {
	const messageLength = document.getElementById("messageLength").valueAsNumber ;
	const alSize = getAlphabetSize();
	
	var messageString = "";
	var sum = 0;
	for (var i = 0; i < messageLength; i++) {
		var symNum = rand(alSize);
		sum = (sum + symNum) % alSize;
		messageString += numToLet(symNum);
	}
	var codeString = messageString + numToLet((alSize - sum) % alSize);
	
	var corruptedString = corrupt(codeString);
	
	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<h2>Recieved: " + corruptedString + "</h2><p> Correct me <input type=\"text\" id=\"correction\" value=\"" + corruptedString + "\"> </p><p><button type=\"button\" onclick=\"submitParityCorrection()\">Submit Correction</button> </p>";
	return {message: messageString, code: codeString, corrupted: corruptedString, mode: PARITY_MODE};
}

function submitParityCorrection() {
	const corrected = document.getElementById("correction").value;
	const gameHTML = document.getElementById("gameContent");
	if (corrected === game.code) {
		gameHTML.innerHTML = "<h2>Recieved: " + game.corrupted + "</h2><p> Corrected " + corrected + "</p><h2>Correct :)</h2><p>Original codeword: " + game.code + "</p>";
	} else {
		gameHTML.innerHTML = "<h2>Recieved: " + game.corrupted + "</h2><p> Guess " + corrected + "</p><h2>Wrong :(</h2><p>Original codeword: " + game.code + "</p>";
	}
}

function startNewCustomGame() {
	const messageLength = document.getElementById("messageLength").valueAsNumber ;
	const alSize = getAlphabetSize();
	
	var messageString = "";
	var sum = 0;
	for (var i = 0; i < messageLength; i++) {
		var symNum = rand(alSize);
		sum = (sum + symNum) % alSize;
		messageString += numToLet(symNum);
	}
	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<p>Please hand to the encoder. Decoder, don't look.</p> <p><button type=\"button\" onclick=\"startEncodeRound()\">Start Game</button> </p>";
	return {message: messageString, mode: CUSTOM_MODE};
}

function startEncodeRound() {
	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<h2>Message: " + game.message + "</h2><p> Encode me: <input type=\"text\" id=\"encoding\" value=\"" + game.message + "\"> </p> <p><button type=\"button\" onclick=\"startDecodeRound()\">Submit Correction</button> </p>";
}

function startDecodeRound() {
	var codeword = document.getElementById("encoding").value;
	const corruptions = document.getElementById("eraseCount").valueAsNumber ;
	var corruptedString = codeword;
	for (var i = 0; i < corruptions; i++) {
		corruptedString = corrupt(corruptedString);
	}
	
	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<p>Hand me to the decoder</p><h2>Recieved: " + corruptedString + "</h2><p> Correct me <input type=\"text\" id=\"correction\" value=\"" + corruptedString + "\"> </p><p><button type=\"button\" onclick=\"submitCustomCorrection()\">Submit Correction</button> </p>";
	game["code"] = codeword;
	game["corrupted"] = corruptedString;
	game["erasureCount"] = corruptions;
}

function submitCustomCorrection() {
	const corrected = document.getElementById("correction").value;
	const gameHTML = document.getElementById("gameContent");
	if (corrected === game.code) {
		gameHTML.innerHTML = "<h2>Recieved: " + game.corrupted + "</h2><p> Corrected " + corrected + "</p><h2>Correct :)</h2><p>Original codeword: " + game.code + "</p><h2>Score (Rate): " + ((game.message.length)/game.code.length) + "</h2>";
	} else {
		gameHTML.innerHTML = "<h2>Recieved: " + game.corrupted + "</h2><p> Guess " + corrected + "</p><h2>Wrong :(</h2><p>Original codeword: " + game.code + "</p>";
	}
}