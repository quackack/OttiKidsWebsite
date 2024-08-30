const canvas = document.getElementById("GameContainer");
const ctx = canvas.getContext("2d");

const output = document.getElementById("output");

function makeEmptyEdgeGraph(n, d) {
	var empty = new Array(n);
	for (var i = 0; i < n; i++) {
		empty[i] = new Array(0);
	}
	return empty;
}

function addEdge(edges, a, b) {
	edges[a].push(b);
	edges[b].push(a);
}

function getIthFreeNode(edges, start, index, d) {
	var relativeIndex = index;
	for (var i = start; i < edges.length; i++) {
		var edgesAvailable = d - edges[i].length;
		if (relativeIndex < edgesAvailable) {
			return i;
		}
		relativeIndex -= edgesAvailable;
	}
	fail("Ran out of nodes when trying to find free node!");
}

function getNextFreeNode(edges, start, d) {
	return getIthFreeNode(edges, start, 0, d);
}

function isInRange(edges, a, b, range) {
	if (a === b) {
		return true;
	}
	if (range <= 0) {
		return false;
	}
	for (var i = 0; i < edges[a].length; i++) {
		var neighbor = edges[a][i];
		if (isInRange(edges, neighbor, b, range-1)) {
			return true;
		}
	}
	return false
}

function addEdgeInRange(edges, sourceStart, sourceAvailable, destStart, destEdgesAvailable, d, rangeToAvoid) {
	for (var i = 0; i < 100; i++) {
		var a = getIthFreeNode(edges, sourceStart, Math.floor(Math.random()*sourceAvailable), d);
		var b = getIthFreeNode(edges, destStart, Math.floor(Math.random()*destEdgesAvailable), d);
		if (edges[a].includes(b) || isInRange(edges, a, b, rangeToAvoid)) {
			continue;
		}
		addEdge(edges, a, b);
		return false;
	}
	console.log("Couldn't add a new edge to the graph");
	return true;
}

function makeRandomRegularGraph(r, g, b, d, rangeToAvoid) {
	restartMakingGraph: for (var i = 0; i < 100; i++) {
		var edges = makeEmptyEdgeGraph(r + g + b, d);
		var rTog = (r + g - b) * d / 2;
		var rTob = (r + b - g) * d / 2;
		var gTob = (g + b - r) * d / 2;
		
		for (var i = 0; i < rTog; i++) {
			if (addEdgeInRange(edges, 0, r*d - i, r, g*d - i, d, rangeToAvoid)) {
				continue restartMakingGraph;
			}
		}
		
		for (var i = 0; i < rTob; i++) {
			if (addEdgeInRange(edges, 0, r*d - rTog - i, r + g, b*d - i, d, rangeToAvoid)) {
				continue restartMakingGraph;
			}
		}
		
		for (var i = 0; i < gTob; i++) {
			if (addEdgeInRange(edges, r, g*d - rTog - i, r + g, b*d - rTob - i, d, rangeToAvoid)) {
				continue restartMakingGraph;
			}
		}
		return edges;
	}
	fail("Couldn't make graph.");
}

function makeRandomGraph(r, g, b, d, rangeToAvoid) {
	var n = r + g + b;
	var edges = makeEmptyEdgeGraph(r + g + b, d);
	
	for (var i = 0; i < n*d / 2; i++) {
		var x = Math.floor(Math.random()*n);
		var y = Math.floor(Math.random()*n);
		if ((x < r && y < r) || 
			(x >= r && x < r + g && y >= r && y < r + g) ||
			(x >= r + g && y >= r + g) ||
			isInRange(edges, x, y, rangeToAvoid)) {
			continue;
		}
		addEdge(edges, x, y);
	}
	return edges;
}

function fail(message) {
	console.log(message);
	alert(message);
}


function verifyGraphIsSimple(edges) {
	for (var i = 0; i < edges.length; i++) {
		var incidentNodes = edges[i];
		for (var j = 0; j < incidentNodes.length; j++) {
			if (incidentNodes[j] === i) {
				fail("Graph had a self loop! " + i + ", " + j);
			}
			
			for (var k = j + 1; k < incidentNodes.length; k++) {
				if (incidentNodes[j] === incidentNodes[k]) {
					fail("Had two edges to the same node: " + i + ", " + j + ", " + k);
				}
			}
			var neighborsNeighbors = edges[incidentNodes[j]];
			var IamNeighborOfNeighbor = false;
			for (var k = 0; k < neighborsNeighbors.length; k++) {
				if (neighborsNeighbors[k] === i) {
					IamNeighborOfNeighbor = true;
				}
			}
			if (!IamNeighborOfNeighbor) {
				fail("Graph is not symmetric, it is not undirected: " + i + ", " + j);
			}
		}
	}
}

function verifyGraphIsRegular(edges, n, d) {
	for (var i = 0; i < n; i++) {
		var incidentNodes = edges[i];
		if (incidentNodes.length != d) {
			fail("Graph is not d regular! " + i);
		}
	}
}

function verifyGraphIsPartitioned(edges, r, g, b) {
	for (var i = 0; i < r; i++) {
		for (var j = 0; j < edges[i].length; j++) {
			if (edges[i][j] < r) {
				fail("Edges from r to r: " + i);
			}
		}
	}
	for (var i = r; i < r + g; i++) {
		for (var j = 0; j < edges[i].length; j++) {
			if (edges[i][j] >= r && edges[i][j] < r + g) {
				fail("Edges from g to g: " + i);
			}
		}
	}
	for (var i = r + g; i < r + g + b; i++) {
		for (var j = 0; j < edges[i].length; j++) {
			if (edges[i][j] >= r + g) {
				fail("Edges from b to b: " + i);
			}
		}
	}
}

function verifyGraph(edges, r, g, b, d) {
	verifyGraphIsSimple(edges, r + g + b);
	//verifyGraphIsRegular(edges, r + g + b, d);
	verifyGraphIsPartitioned(edges, r, g, b);
}

function hasErrors(edges, colors) {
	for (var i = 0; i < edges.length; i++) {
		if (colors[i] === undefined) {
			continue;
		}
		for (var j = 0; j < edges[i].length; j++) {
			if (colors[edges[i][j]] === colors[i]) {
				return true;
			}
		}
	}
	return false;
}

function fillImpliedColorsOneRound(edges, colors, neighborsOfColored) {
	var changed = false;
	for (var k = 0; k < neighborsOfColored.length; k++) {
		var i = neighborsOfColored[k];
		if (colors[i] !== undefined) {
			continue;
		}
		var neighborColors = Array(3);
		for (var j = 0; j < edges[i].length; j++) {
			var neighborColor = colors[edges[i][j]];
			if (neighborColor !== undefined) {
				neighborColors[neighborColor] = true;
			}
		}
		if (neighborColors[0] && neighborColors[1]) {
			giveColor(edges, colors, i, 2, neighborsOfColored);
			changed = true;
		}
		if (neighborColors[0] && neighborColors[2]) {
			giveColor(edges, colors, i, 1, neighborsOfColored);
			changed = true;
		}
		if (neighborColors[1] && neighborColors[2]) {
			giveColor(edges, colors, i, 0, neighborsOfColored);
			changed = true;
		}
	}
	return changed;
}

function fillImpliedColors(edges, colors, neighborsOfColored) {
	while (fillImpliedColorsOneRound(edges, colors, neighborsOfColored)) { }
}

function findNeighborToColor(edges, colors, neighborsOfColored) {
	while (neighborsOfColored.length > 0) {
		var neighborIndexSelected = Math.floor(Math.random()*neighborsOfColored.length);
		var neighborToColor = neighborsOfColored[neighborIndexSelected];
		if (colors[neighborToColor] === undefined) {
			return neighborToColor;
		}
		neighborsOfColored[neighborIndexSelected] = neighborsOfColored[neighborsOfColored.length-1];
		neighborsOfColored.pop();
	}
	//Looks like all connected components have been colored.
	if (!colors.includes(undefined)) {
		fail("Asked to find uncolored neighbor after all neighbors colored. ");
	}
	for (var i = 0; i < 1000; i++) {
		var possibleNeighbor = Math.floor(Math.random()*colors.length);
		if (colors[possibleNeighbor] === undefined) {
			return possibleNeighbor;
		}
	}
	fail("Somehoe couldn't find any uncolored element even though there is one!");
}


function giveColor(edges, colors, toColor, color, neighborsOfColored) {
	colors[toColor] = color;
	for (var i = 0; i < edges[toColor].length; i++) {
		var newNeighbor = edges[toColor][i];
		if (neighborsOfColored.includes(newNeighbor)) {
			continue;
		}
		if (colors[newNeighbor] !== undefined) {
			continue;
		}
		neighborsOfColored.push(newNeighbor);
	}
}

function giveRandomColor(edges, colors, toColor, neighborsOfColored) {
	var colorNotAvailable = Array(3);
	for (var i = 0; i < edges[toColor].length; i++) {
		var neighbor = edges[toColor][i];
		if (colors[neighbor] !== undefined) {
			colorNotAvailable[colors[neighbor]] = true;
		}
	}
	var availableColors = new Array();
	for (var i = 0; i < 3; i++) {
		if (colorNotAvailable[i]) {
			continue;
		}
		availableColors.push(i);
	}
	
	giveColor(edges, colors, toColor, availableColors[Math.floor(Math.random()*availableColors.length)], neighborsOfColored);
}

function tryToColor(edges) {
	var colors = Array(edges.length);
	var neighborsOfColored = Array(0);
	giveRandomColor(edges, colors, Math.floor(Math.random()*colors.length), neighborsOfColored);
	while (colors.includes(undefined)) {
		if (hasErrors(edges, colors)) {
			return false;
		}
		var neighborToColor = findNeighborToColor(edges, colors, neighborsOfColored);
		giveRandomColor(edges, colors, neighborToColor, neighborsOfColored);
		fillImpliedColors(edges, colors, neighborsOfColored);
	}
	return true;
}

function estimateDifficulty(edges, n) {
	var correctColorings = 0;
	for (var i = 0; i < n; i++) {
		if (tryToColor(edges)) {
			correctColorings++;
		}
	}
	return correctColorings/n;
}

//rangeToAvoid = 2 means triangle free, that is, rangeToAvoid is the min girth - 2
function getToughGraph(r, g, b, d, rangeToAvoid, n, s, regular) {
	var best;
	var bestEase = 2;
	for (var i = 0; i < n; i++) {
		if (regular) {
			var graph = makeRandomRegularGraph(r, g, b, d, rangeToAvoid);
		} else {
			graph = makeRandomGraph(r, g, b, d, rangeToAvoid);
		}
		verifyGraph(graph, r, g, b, d);
		
		var thisEase = estimateDifficulty(graph, s);
		if (thisEase < bestEase) {
			best = graph;
			bestEase = thisEase;
		}
	}
	console.log("Best Ease: " + bestEase);
	return best;
}

function getGMLFormattedString(edges, r, g, b) {
	var outputString = "graph[directed 0\n"
	var color = "red";
	for (var i = 0; i < edges.length; i++) {
		if (i >= r) {
			color = "green";
		}
		if (i >= r + g) {
			color = "blue"
		}
		
		outputString += "node[id " + i + " label \"" + color + "\"]\n";
	}
	for (var i = 0; i < edges.length; i++) {
		var curEdges = edges[i];
		for (var j = 0; j < curEdges.length; j++) {
			var outvertex = curEdges[j];
			if (outvertex < i) {
				continue;
			}
			outputString += "edge[source " + i + " target " + outvertex + "]\n";
		}
	}
	outputString += "]";
	return outputString;
}
//12, 10, 8, 5, 2 ~ 0.385
//16, 16, 16, 5, 2 ~ 0.25
//10, 9, 8, 7, 1, 200, 500, false ~ 0.2
//8, 8, 8, 6, 1, 300, 600, false ~ 0.2
//10, 10, 10, 6, 1, 300, 1000, false ~ 0.2
//11, 11, 11, 7, 1, 300, 1000, false ~ 0.1
//16, 16, 16, 8, 2, 1000, 1000, false ~ 0.05
//50, 40, 40, 5, 2 ~ 0.065
var best = getToughGraph(8, 8, 8, 7, 1, 100, 200, false);
console.log("Best: " + best);

var gmlString = getGMLFormattedString(best, 8, 8, 8);
console.log(gmlString);
