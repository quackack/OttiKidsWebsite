const ChooseWhereToCheck = "ChooseWhereToCheck";
const NotifyLessThan = "NotifyLessThan";
const NotifyGreaterThan = "NotifyGreaterThan";
const AcknowledgeTrapPlaced = "AcknowledgeTrapPlaced";
const NotifyGotTrapped = "NotifyGotTrapped";
const NotifyTrappedTarget = "NotifyTrappedTarget";
const NotifyFoundTarget = "NotifyFoundTarget";

var currentGame;

function makeNewGame() {
	const playerNumb = document.getElementById("playerNumbInput").valueAsNumber ;
	var playerList = [];
	for (var i = 0; i < playerNumb; i++) {
		playerList.push({points: 0});
	}
	const gameMax = document.getElementById("rangeInput").valueAsNumber;
	
	const gameHTML = document.getElementById("gameContent");
	gameHTML.innerHTML = "<p>Number of players " + playerNumb + ", try to find a number in the range 0-" + gameMax + "</p><div id=\"scoreTable\"></div><div id=\"roundDiv\"></div>";
	
	const gameData = {players: playerList, gameRange: gameMax, roundNumb: 0, round:{}};
	startNewRound(gameData);
	currentGame = gameData;
}

function startNewRound(gameData) {
	updateScoreTable(gameData);
	gameData.roundNumb++;
	
	const numberWanted = Math.floor(Math.random()*(gameData.gameRange +1));
	var playersAlive = new Set();
	for (var i = 0; i < gameData.players.length; i++) {
		playersAlive.add(i);
	}
	
	gameData.round = {target: numberWanted, boobyTraps: new Set(), playersTurn: 0, inRoundPlayers: playersAlive, stage: NotifyLessThan};
	
	var roundHtml = "<p>Current Players Turn: <span id=\"currentPlayersTurn\">0</span></p><p id=\"prompt\">Please enter a location you would like to trap.</p><input type=\"number\" id=\"playerChoice\" min=\"0\" max=\"" + gameData.gameRange + "\" value=\"0\"> <button type=\"button\" onclick=\"submitDecision()\">Submit</button>";
	
	document.getElementById("roundDiv").innerHTML = roundHtml;
}

function updateScoreTable(gameData) {
	var scoreTableHtml = "<table><tr><th>Player Number</th>";
	for (var i = 0; i < gameData.players.length; i++) {
		scoreTableHtml += "<th>" + i + "</th>";
	}
	scoreTableHtml += "</tr><tr><td>Score</td>";
	for (var i = 0; i < gameData.players.length; i++) {
		scoreTableHtml += "<td>" + gameData.players[i].points + "</td>";
	}
	scoreTableHtml += "</tr></table>";
	document.getElementById("scoreTable").innerHTML = scoreTableHtml;
}


function getNextPlayerInRound(gameData) {
	for (var i = gameData.round.playersTurn+1; i < gameData.players.length; i++) {
		if (gameData.round.inRoundPlayers.has(i)) {
			return i;
		}
	}
	for (var i = 0; i < gameData.players.length; i++) {
		if (gameData.round.inRoundPlayers.has(i)) {
			return i;
		}
	}
	alert("Uh Oh, tried to find a player but none found!!!");
}
function setNextPlayer(gameData) {
	gameData.round.stage = ChooseWhereToCheck;
	const promptHTML = document.getElementById("prompt");
	promptHTML.innerHTML = "Please enter the location you would like to check.";
	var newPlayer = getNextPlayerInRound(gameData);
	document.getElementById("currentPlayersTurn").innerHTML = newPlayer;
	gameData.round.playersTurn = newPlayer;
}

function submitDecision() {
	const gameData = currentGame;
	const round = gameData.round;
	const player = round.playersTurn;
	const choice = document.getElementById("playerChoice").valueAsNumber;
	document.getElementById("playerChoice").value = "0";
	const promptHTML = document.getElementById("prompt");
	switch (round.stage) {
		default: alert("Uh Oh! Unexpected state occured!");
		break;
		case ChooseWhereToCheck: 
		if (round.boobyTraps.has(choice)) {
			round.inRoundPlayers.delete(player);
			round.stage = NotifyGotTrapped;
			promptHTML.innerHTML = "Oh no, you clicked on a trap. You are out of the round. Please click submit and give to the next player.";
		}
		else if (round.target === choice) {
			gameData.players[player].points++;
			round.stage = NotifyFoundTarget;
			promptHTML.innerHTML = "Good job, you found the gold. Please click submit to start another round.";
		}
		else if (round.target < choice) {
			round.stage = NotifyLessThan;
			promptHTML.innerHTML = "You chose a number that was too high. Now choose where to place a trap.";
		}
		else {
			round.stage = NotifyGreaterThan;
			promptHTML.innerHTML = "You chose a number that was too low. Now choose where to place a trap.";
		}
		break;
		case NotifyGreaterThan:
		case NotifyLessThan:
			if (round.target === choice) {
				round.stage = NotifyTrappedTarget;
				promptHTML.innerHTML = "Oh no, why did you booby trap the target?! Bad, minus one point for you. Click submit to start a new round.";
				gameData.players[player].points--;
			} else {
				round.boobyTraps.add(choice);
				round.stage = AcknowledgeTrapPlaced;
				promptHTML.innerHTML = "Trap placed. Please click submit and pass to the next player.";
			}
		break;
		case AcknowledgeTrapPlaced:
		setNextPlayer(gameData);
		break;
		case NotifyGotTrapped:
			if (round.inRoundPlayers.size <= 0) {
				promptHTML.innerHTML = "Everyone was elminated. Click submit to start a new round.";
				round.stage = NotifyFoundTarget;
			} else {
				setNextPlayer(gameData);
			}
		break;
		case NotifyTrappedTarget:
		case NotifyFoundTarget:
		startNewRound(gameData);
		break;
	}
}
