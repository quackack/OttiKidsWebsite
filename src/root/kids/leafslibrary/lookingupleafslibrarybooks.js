function Main() {
	resetBooks();
	canvas.addEventListener('click', canvasClicked);
	canvas.onmousemove = canvasHovered;
}

const canvas = document.getElementById("GameContainer");
const ctx = canvas.getContext("2d");

var booksPerRow = 40;
var rowsPerPage = 8;
var maxBooksPerPage = rowsPerPage * booksPerRow;
var maxPages = 1;
var maxBooks = maxPages * maxBooksPerPage;

var bookSpacing = 20;
var shelfDistance = 100;
var bookStart = 100;

var bookWidth = 8;
var bookHeight = 40;
var bookInfo;

var GameState = 0;

var wantedBook;
var lastSelectedBook = -1;
var highlightedBook = -1;

function resetBooks() {
	createBooks();
	lastSelectedBook = -1;
	highlightedBook = -1;
	GameState = 1;
	reDraw();
}

function canvasClicked(event) {
	if (GameState == 1) {
		var clickedBook = getBookBelowMouse(event);
		if (clickedBook == -1 || clickedBook.selected) {
			return;
		}
		clickedBook.selected = true;
		lastSelectedBook = clickedBook;
		
		if (clickedBook.title == wantedBook) {
			GameState = 2;
		}
		
		reDraw();
	} else {
		resetBooks();
	}
}

function canvasHovered(event) {
	var newHighlightedBook = getBookBelowMouse(event);
	if (highlightedBook != -1) {
		highlightedBook.highlighted = false;
	}
	if (newHighlightedBook != -1) {
		newHighlightedBook.highlighted = true;
	}
	highlightedBook = newHighlightedBook;
	reDraw();
}

function getBookBelowMouse(event) {
	var rawX = event.offsetX;
	var rawY = event.offsetY;
	
	var row = Math.floor(rawY / shelfDistance);
	if (row < 0 || row >= rowsPerPage) {
		return -1;
	}
	var bookInRow = Math.floor((rawX - bookStart)/bookSpacing);
	if (bookInRow < 0 || bookInRow >= booksPerRow) {
		return - 1;
	}
	var bookIndex = row * booksPerRow + bookInRow;
	if (bookIndex < 0 || bookIndex >=  bookInfo.length) {
		return -1;
	}
	return bookInfo[bookIndex];
}

function createBooks() {
	var bookCountInput = document.getElementById("NumbBooks").value;
	if (bookCountInput > maxBooks) {
		bookCountInput = maxBooks;
		document.getElementById("NumbBooks").value = bookCountInput;
	}
	
	var bookTitles = CreateBooks(bookCountInput);
	
	bookInfo = [];
	for (index in bookTitles) {
		var book = {
			"title": bookTitles[index],
			"color": GetRandomColor(),
			"viewed": false,
			"highlighted": false,
			"width": bookWidth + Math.random()*8,
			"height": bookHeight + Math.random()*40,
			"offset": Math.random(3),
			"index": index};
		bookInfo.push(book);
	}
	wantedBook = GetRand(bookTitles);
}

function reDraw() {
	if (GameState == 1) {
		writeBackground();
		writeBooks();
		writeDesiredTitle();
	}
	if (GameState == 2) {
		writeWinScreen();
	}
}

function writeWinScreen() {
	ctx.fillStyle = "pink";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	writeBooks();
	
	ctx.fillStyle = "white";
	ctx.font = "30px Arial";
	ctx.fillText("You found \"" + wantedBook + "\"!", 50, 900 );
}

function writeDesiredTitle() {
	ctx.fillStyle = "black";
	ctx.font = "25px Arial";
	ctx.fillText("Bouquet Wants: \"" + wantedBook + "\"", 50, 900 );
	if (lastSelectedBook != -1) {
		ctx.fillText("That Book Is: \"" + lastSelectedBook.title + "\"", 50, 950 ); 
	}
}

function writeBooks() {
	for (book of bookInfo) {
		if (book.selected) {
			continue;
		}
		writeBookOnShelf(book);
	}
	if (lastSelectedBook != -1) {
		writeBookOnShelf(lastSelectedBook);
	}
}

function writeBookOnShelf(book) {
	var currentBook = book.index;
	var currentRow = Math.floor(currentBook / booksPerRow);
	var bookInRow = currentBook - currentRow*booksPerRow;

	var startX = bookStart + bookSpacing*bookInRow + book.offset;
	var width = book.width;
	var startY = shelfDistance*(currentRow+1) - book.height
	var height = book.height
	if (book.selected) {
		startX -= 5;
		width += 10;
		startY -= 15;
		height += 10;
	} else if (book.highlighted) {
		startX -= 2;
		width += 4;
		startY -= 2;
		height += 4;
	}
	
	ctx.fillStyle = getColor(book);
	ctx.fillRect(startX, startY, width, height);
}

function writeBackground(){
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function GetRand(Array) {
	return Array[Math.floor(Math.random()*Array.length)];
}

function getColor(book) {
	if (book.selected) {
		return toColor(book.color[0] - 120, book.color[1] - 120, book.color[2] - 120);
	}
	
	if (book.highlighted) {
		return toColor(book.color[0] + 80, book.color[1] + 80, book.color[2] + 80);
	}
	return toColor(book.color[0], book.color[1], book.color[2]);
}

function toColor(r, g, b) {
	return "rgb("+Math.min(255, Math.max(0, r))+","+Math.min(255, Math.max(0, g))+","+Math.min(255, Math.max(0, b))+")"
}

function GetRandomColor() {
	return [Math.floor(20 + Math.random()*195), Math.floor(20 + Math.random()*195), Math.floor(20 + Math.random()*195)];
}

function MakeNounVerbNounBook() {
	return GetRand(adjectives) + " " + GetRand(nouns) + " " + GetRand(ObjectVerbs) + " The " + GetRand(adjectives) + " " + GetRand(nouns);
}

function MakeNounNounVerbBook() {
	return GetRand(adjectives) + " " + GetRand(nouns) + " And " + GetRand(adjectives) + " " + GetRand(nouns) + " " + GetRand(ReflexiveVerbs);
}

function MakeAdjAdjAdjNoun() {
	return GetRand(adjectives) + ", " + GetRand(adjectives) + ", and " + GetRand(adjectives) + " " + GetRand(nouns);
}

function MakeNounNounNounVerb() {
	return GetRand(nouns) + ", " + GetRand(nouns) + ", and " + GetRand(nouns) + " " + GetRand(ReflexiveVerbs);
}

function MakeNounIsAdj() {
	return GetRand(nouns) + " is " + GetRand(adjectives);
}

function makeRandomBook() {
	var rVal = Math.random();
	if (rVal < 0.4) {
		return GetRand(booktitles);
	}
	if (rVal < 0.55) {
		return MakeNounVerbNounBook();
	}
	if (rVal < 0.7) {
		return MakeNounNounVerbBook();
	}
	if (rVal < 0.8) {
		return MakeAdjAdjAdjNoun();
	}
	if (rVal < 0.9) {
		return MakeNounNounNounVerb();
	}
	return MakeNounIsAdj();
}

function CreateBooks(numberOfBooks) {
	var ourSet = new Set();
	while (ourSet.size < numberOfBooks) {
		ourSet.add(makeRandomBook());
	}
	return [...ourSet].sort();
}

var booktitles = ["Ancient Mage Wife",
"Aaronson's Bizzare Adventrue",
"Leaf's Library",
"Bouqet Balances Ballet",
"Airons Arithmetic",
"Ututu's Time Integrators",
"Ahia's Hash",
"Bouquet's Moment (of Inertia)",
"Ahia Is Not a Ghost",
"Leaf's Sorted Story",
"Quinn Won't Quit",
"A Stroll Through Cecily's Sets",
"Ackermann Escapes The Primitives",
"Amanda Automates",
"Arthur Merlin Games",
"Ben's Binary Basics",
"Bounded By Space",
"Busy Beavers",
"Cecily's Complex Theory",
"Cellular Automation",
"Choosing Choice",
"Church Turing Thesis",
"Complexity Zoo",
"Counting Above the Hierarchy",
"Descending Grades While Deep Learning?!",
"Dynamic Programming",
"Older Scrolls V: Print Edition",
"Error Correction: The Code",
"Following The First Order's Logic",
"Fourier's Fast Transformation",
"Gentle Measurements",
"Halting Problems?",
"Henry's Heuristics Help",
"Hermit's Singular Value",
"How to Salt Your Hash",
"In The Density Matrix",
"Interaction During Proofs",
"It's polynomial time",
"Just in Time for Execution",
"Kernel Panic",
"Lazy Loaders",
"Lily Learns Lists",
"Lily Likes Logic",
"Locked Threads",
"Markov's Chains",
"Min Cuts For Max Flow",
"Nick's Class",
"No Witnesses Without Collapse",
"Oracles of Separation",
"PCP, a local problem",
"Pigeon Hole Principles",
"Problems on Promises",
"Pseudo-telepathy",
"Quackack: The Sound of a Speaker With a Duck Bill Taped to it.",
"Quinn's Quantum Query",
"Raven Researches Randomness",
"Removing Randomness is Hard!",
"Satisfying Your Circuits",
"Seth, are you too strong?",
"Sexadecimal, and Other Radixal Ideas",
"Space and Time Hierarchies",
"Spooky Action With Teams",
"Stop Repeating Yourself and Memoize",
"Superdense Coders",
"Switching Lemmas For Shorter Trees",
"Thresholds Multiplying",
"Too Much Red In my Black Tree: A Shift In Balance",
"Trap Doors For Privacy",
"Trusted Advice for All Situations",
"Undirected Paths In The Log Space",
"Virtually Machines and Virtually Reality",
"Witness",
"XOR",
"You Complete Me (and that's what makes this hard)",
"Zero Knowledge in Proofs, Statistically",
"Adventure Rhyme",
"Ghouls and Goods",
"Help, I'm Not a Book",
"Ladies Love",
"Lock Looks",
"Automatic Hugs",
"Fates Shook",
"Toasted Tots",
"Bloated Bots",
"Roots with Rots",
"Local Lots",
"Comfy Cots",
"Quantum Quips",
"Whirly Whips",
"Hoppy Hips",
"Sweet Sips",
"Ballet Feet",
"The Underneath",
"Gear Teeth!",
"Discrete Peak",
"Quantum Leak",
"Bots Battling in Lots",
"Data Bleach",
"Manico",
"Fairy Feuds",
"Fairy Fords",
"Fae Wards",
"Fae Doors",
"Spirits of The Seasons",
"Flowers as Medicine",
"The Beautiful Hour",
"Few Fast Friends"];

var nouns = ["Apple",
		"Ant",
		"Amy",
		"Bat",
		"Bannana",
		"Boss",
		"Bird",
		"Butterfly",
		"Cat",
		"Carrot",
		"Chalk",
		"Dingbat",
		"Dude",
		"Diamond",
		"Dragon",
		"Duck",
		"Donut",
		"Elephant",
		"Egg",
		"Ezekial",
		"Fairy",
		"Fish",
		"Fae",
		"Frog",
		"Food",
		"Gold",
		"Gnome",
		"Gobblin",
		"Ghoul",
		"Ghost",
		"Goo",
		"Gravy",
		"Honey Suckle",
		"Helpers",
		"Heart",
		"Hood",
		"Home",
		"Hyena",
		"Interior",
		"Ice Cream",
		"Igloo",
		"Iguana",
		"Jim",
		"Jack-O'-Lanturn",
		"Jerky",
		"Kid",
		"Kite",
		"King",
		"Light",
		"Ladie",
		"Lad",
		"Lavender Meadow",
		"Lesson",
		"Lemon",
		"Lemur",
		"Moment",
		"Moon",
		"Mime",
		"Minnow",
		"Mouse",
		"Monkey",
		"Mermaid",
		"Niece",
		"Neighbor",
		"Nest",
		"Obstacle",
		"Orangutane",
		"Orange",
		"Prince",
		"Princess",
		"Price",
		"Person",
		"Pickle",
		"Platypus",
		"Queen",
		"Query",
		"Quail",
		"Quest",
		"Rake",
		"Rail",
		"Rule",
		"Royalty",
		"Spirit",
		"Suit",
		"Song",
		"Salad",
		"Star",
		"Sun",
		"Theif",
		"Teacher",
		"Torch",
		"Tinsel",
		"Tree",
		"Time",
		"Umbrella",
		"Unicorn",
		"Vortex",
		"Vince",
		"Wizard",
		"Will-O'-Wisp",
		"Water",
		"Xenon",
		"Yack",
		"Zebra",
		"Zealot"];

var adjectives = ["Amazing",
"Angry",
"Aquatic",
"Barbaric",
"Beautiful",
"Brave",
"Blue",
"Bold",
"Brown",
"Burning",
"Black",
"Big",
"Bright",
"Brittle",
"Bored",
"Courageous",
"Colorful",
"Cold",
"Chilly",
"Cyan",
"Cute",
"Dizzy",
"Digital",
"Dry",
"Dark",
"Durable",
"Doomed",
"Digging",
"Evil",
"Electronic",
"Enchanted",
"Embarressed",
"Fabled",
"Firey",
"Flying",
"Fast",
"Foolish",
"Fantastic",
"Good",
"Gray",
"Goofy",
"Greedy",
"Green",
"Healthy",
"Hot",
"Horrible",
"Hidden",
"Happy",
"Hard",
"Hungry",
"Hairy",
"Huge",
"Ingenious",
"Icy",
"Jaded",
"Joyful",
"Knowledgable",
"Lazy",
"Lovely",
"Little",
"Magic",
"Magical",
"Mysterious",
"Noble",
"Naked",
"Open",
"Old",
"Pious",
"Poor",
"Proud",
"Pretty",
"Purple",
"Pink",
"Pastel",
"Quirky",
"Queer",
"Reasonable",
"Red",
"Rich",
"Spooky",
"Sparkly",
"Shiney",
"Stable",
"Scary",
"Scared",
"Shy",
"Sad",
"Sick",
"Slimey",
"Suspicious",
"Slow",
"Soft",
"Surprised",
"Sleepy",
"Small",
"Space",
"Strong",
"Twinkling",
"Thankful",
"Tiny",
"Tall",
"Tired",
"Talented",
"Ugly",
"Unending",
"Valuable",
"Vigilant",
"Violet",
"Virtual",
"Warm",
"Weird",
"Wise",
"Weak",
"White",
"Wet",
"Worried",
"Exciting",
"Extreme",
"Yodelling",
"Young",
"Zany"];

var ObjectVerbs = ["Attacks",
"And",
"Aids",
"Burdens",
"Buries",
"Curses",
"Cures",
"Casts A Spell On",
"Dates",
"Dumps",
"Eats",
"Elects",
"Forgets",
"Feeds",
"Frolics With",
"Greets",
"Helps",
"Heals",
"Hurts",
"Ignites",
"Irritates",
"Ignores",
"Juices",
"Jokes With",
"Joins",
"Jumps Over",
"Keeps",
"Limits",
"Mimics",
"Needs",
"Pleases",
"Plays a Trick on",
"Raises",
"Runs From",
"Steals",
"Scratches",
"Soothes",
"Stimulates",
"Takes",
"Teaches",
"Undermines",
"Wins",
"Won't Talk To",
"With",
"Watches",
"Zaps"];

var ReflexiveVerbs = ["Agree",
"Battle",
"Collude",
"Cook",
"Cry",
"Chill",
"Dine",
"Elope",
"Fly",
"Are Faries",
"Flee",
"Help",
"Hear",
"Itch",
"Jump",
"Jam",
"Lose",
"Love",
"Marry",
"Open",
"Play",
"Practice",
"Run",
"Race",
"Riot",
"Get Revenge",
"Are Rivals",
"Sleep",
"Sing",
"Smile",
"Sneak",
"Steal",
"Teleport",
"Talk",
"Trip",
"Wait"];

Main();
