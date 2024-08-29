const DIFF_SETTINGS = {
	EE: {
		MAX: 12,
		COR: 0,
		MOD: [3,  4]
	},
	VE: {
		MAX: 60,
		COR: 0,
		MOD: [3,  4, 5]
	},
	E: {
		MAX: 35,
		COR: 1,
		MOD: [5,  7,  8,  9]
	},
	M: {
		MAX: 99,
		COR: 2,
		MOD: [9,  11, 13, 14, 16, 17]
	},
	H: {
		MAX: 1287,
		COR: 3,
		MOD: [9,  11, 13, 14, 16, 17, 19, 23, 29]
	},
	VH: {
		MAX: 200583,
		COR: 4,
		MOD: [17, 19, 23, 27, 29, 31, 32, 35, 37, 41, 43, 47]
	},
	EH: {
		MAX: 58642669,
		COR: 5,
		MOD: [29, 31, 37, 39, 41, 43, 47, 49, 53, 55, 59, 61, 64, 67, 71]
	}
};

var currentGame;

function makeTable(solution, settings) {
	var mods = [];
	for (var i = 0; i < settings.MOD.length; i++) {
		var mod = settings.MOD[i];
		var rem = solution % mod;
		mods.push({modulus: mod, remainder: rem});
	}
	return mods;
}

function makeCorruptedTable(solution, settings) {
	var mods = makeTable(solution, settings);
	for (var i = 0; i < settings.COR; i++) {
		var toCorrupt = Math.floor(Math.random()*settings.MOD.length);
		mods[toCorrupt].remainder = Math.floor(Math.random()*mods[toCorrupt].modulus);
	}
	return mods;
}

function makeNewGame(difficulty_str) {
	const settings = DIFF_SETTINGS[difficulty_str];
	
	var solution = Math.floor(Math.random()*settings.MAX);
	
	var table = makeTable(solution, settings);
	var corruptedTable = makeCorruptedTable(solution, settings);

	return {answer: solution, corrupted: corruptedTable, corrected: table, config: settings};
}

function generateWorkSheet() {
	var problemCount = document.getElementById("problemCount").valueAsNumber;
	var difficulty = document.getElementById("difficulty").value;
	var allGames = [];
	for (var i = 0; i < problemCount; i++) {
		allGames.push(makeNewGame(difficulty));
	}
	
	var settings = DIFF_SETTINGS[difficulty];
	
	var worksheetHTML = "<div class=\"worksheet\"><div class=\"problems\"><div class=\"problemDescription\"><p>Max value: " + settings.MAX + ".</p><p>Max number of errors: " + settings.COR + ".</p></div>";
	for (var i = 0; i < problemCount; i++) {
		worksheetHTML += "<div class=\"problem\"><p>Problem, " + i + ".</p>" + generateModTable(allGames[i].corrupted) + "</div>";
	}
	
	worksheetHTML += "</div><div class=\"solutions\"><div class=\"problemDescription\"><h2>Solutions</h2><p>You know an integer is a solution if all but " + settings.COR + " of the remainders agree with the given remainders and the integer is less than " + settings.MAX + "</div></p>";
	for (var i = 0; i < problemCount; i++) {
		worksheetHTML += "<div class=\"problem\"><p>Problem, " + i + ", solution: " + allGames[i].answer + ".</p>" + generateModTable(allGames[i].corrected) + "</div>";
	}
	worksheetHTML += "</div>";
	
	document.getElementById("gameContent").innerHTML = worksheetHTML;
	
}

function startNewGame() {
	currentGame = makeNewGame(document.getElementById("difficulty").value);
	var settings = currentGame.config;
	var corruptedTable = currentGame.corrupted;

	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<p>Max value: " + settings.MAX + ".</p><p>Max number of errors: " + settings.COR + ".</p>" + generateModTable(corruptedTable) + "<p>What is the actual value of X?</p> <input type=\"number\" id=\"playerChoice\" min=\"0\" max=\"" + settings.MAX + "\" value=\"0\"> <button type=\"button\" onclick=\"submitDecision()\">Submit</button> <button type=\"button\" onclick=\"giveUp()\">Give Up</button> <div id=\"result\"></div>";
}

function generateModTable(mods) {
	var codeTable = "<table><tr><th>Modulus</th>";
	for (var i = 0; i < mods.length; i++) {
		codeTable += "<th>" + mods[i].modulus + "</th>";
	}
	codeTable += "</tr><tr><td>Remainder</td>";
	for (var i = 0; i < mods.length; i++) {
		codeTable += "<td>" + mods[i].remainder + "</td>";
	}
	codeTable += "</tr></table>";
	return codeTable;
}


function submitDecision() {
	const choice = document.getElementById("playerChoice").valueAsNumber;
	if (choice == currentGame.answer) {
		document.getElementById("result").innerHTML = "<p>Congratulations, that is correct!</p>";
	} else {
		document.getElementById("result").innerHTML = "<p>Sorry, that was wrong.</p>";
	}
}


function giveUp() {
	document.getElementById("result").innerHTML = "<p>The right answer was:" + currentGame.answer + "</p>";
}