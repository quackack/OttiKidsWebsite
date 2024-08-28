const DIFF_SETTINGS = {
	VE: {
		MAX: 12,
		COR: 0,
		MOD: [3,  4]
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

function makeNewGame() {
	const difficulty_str = document.getElementById("difficulty").value;
	const settings = DIFF_SETTINGS[difficulty_str];
	
	var solution = Math.floor(Math.random()*settings.MAX);
	
	var mods = [];
	for (var i = 0; i < settings.MOD.length; i++) {
		var mod = settings.MOD[i];
		var rem = solution % mod;
		mods.push({modulus: mod, remainder: rem});
	}
	
	for (var i = 0; i < settings.COR; i++) {
		var toCorrupt = Math.floor(Math.random()*settings.MOD.length);
		mods[toCorrupt].remainder = Math.floor(Math.random()*mods[toCorrupt].modulus);
	}
	
	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<p>Max value: " + settings.MAX + ".</p><p>Max number of errors: " + settings.COR + ".</p>" + generateModTable(mods) + "<p>What is the actual value of X?</p> <input type=\"number\" id=\"playerChoice\" min=\"0\" max=\"" + settings.MAX + "\" value=\"0\"> <button type=\"button\" onclick=\"submitDecision()\">Submit</button> <button type=\"button\" onclick=\"giveUp()\">Give Up</button> <div id=\"result\"></div>";

	currentGame = {answer: solution};
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