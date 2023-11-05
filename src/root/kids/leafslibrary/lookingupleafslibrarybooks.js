var gameState;

function Main() {
	gameState = makeDefaultState();
	resetBooks(gameState);
	canvas.addEventListener('click', canvasClicked);
	canvas.onmousemove = canvasHovered;
}

const canvas = document.getElementById("GameContainer");
const ctx = canvas.getContext("2d");

function createLargeSettings() {
	return {
		booksPerRow: 40,
		rowsPerPage: 8,
		bookCount: 40 * 8,
		canvasWidth: 1600,
		canvasHeight: 800,
		bookAreaWidth: 1150,
		bookAreaHeight: 700,
		bookAreaStartX: 50,
		bookAreaStartY: 0,
		maxBookHeight: 0.8,
		size: 3,
	};
}

function makeDefaultState() {
	return {
		settings: createLargeSettings(),
		state: 1,
		books: [],
		wantedBookTitle: "",
		lastSelectedBook: -1,
		highlightedBook: -1
	};
}

function resetBooks(gameState) {
	createBooks(gameState);
	gameState.state = 1;
	reDraw(gameState);
}

function canvasClicked(event) {
	if (gameState.state == 1) {
		var clickedBook = getBookBelowMouse(event, gameState);
		if (clickedBook == -1 || clickedBook.selected) {
			return;
		}
		clickedBook.selected = true;
		gameState.lastSelectedBook = clickedBook;
		
		if (clickedBook.title == gameState.wantedBook) {
			gameState.state = 2;
		}
		
		reDraw(gameState);
	} else {
		resetBooks(gameState);
	}
}

function canvasHovered(event) {
	var newHighlightedBook = getBookBelowMouse(event, gameState);
	if (gameState.highlightedBook != -1) {
		gameState.highlightedBook.highlighted = false;
	}
	if (newHighlightedBook != -1) {
		newHighlightedBook.highlighted = true;
	}
	gameState.highlightedBook = newHighlightedBook;
	reDraw(gameState);
}

function getBookBelowMouse(event, gameState) {
	var rawX = (event.offsetX - gameState.settings.bookAreaStartX) / gameState.settings.bookAreaWidth;
	var rawY = (event.offsetY - gameState.settings.bookAreaStartY) / gameState.settings.bookAreaHeight;
	
	if (rawX <0 || rawX >= 1 || rawY < 0 || rawY >= 1) {
		return -1;
	}
	
	var row = Math.floor(rawY * gameState.settings.rowsPerPage);
	var bookInRow = Math.floor(rawX * gameState.settings.booksPerRow);
	
	var bookIndex = row * gameState.settings.booksPerRow + bookInRow;
	if (bookIndex < 0 || bookIndex >=  gameState.books.length) {
		return -1;
	}
	return gameState.books[bookIndex];
}

function createBooks(gameState) {
	var bookTitles = createBookNames(gameState.settings.bookCount);
	
	bookInfo = [];
	for (index in bookTitles) {
		var book = {
			"title": bookTitles[index],
			"color": GetRandomColor(),
			"viewed": false,
			"highlighted": false,
			"width": 0.35 + Math.random()*0.45,
			"height": (0.5 + Math.random()*0.5) * gameState.settings.maxBookHeight,
			"offset": Math.random()*0.2,
			"index": index};
		bookInfo.push(book);
	}
	gameState.books = bookInfo;
	gameState.wantedBook = GetRand(bookTitles);
	gameState.lastSelectedBook = -1;
	gameState.highlightedBook = -1;
}

function reDraw(gameState) {
	if (gameState.state == 1) {
		writeBackground(gameState);
		writeBooks(gameState);
		writeDesiredTitle(gameState);
	}
	if (gameState.state == 2) {
		writeWinScreen(gameState);
	}
}

function writeWinScreen(gameState) {
	ctx.fillStyle = "pink";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	writeBooks(gameState);
	
	ctx.fillStyle = "white";
	ctx.font = "30px Arial";
	ctx.fillText("You found \"" + gameState.wantedBook + "\"!", gameState.settings.bookAreaStartX + gameState.settings.bookAreaWidth, 50 );
}

function writeDesiredTitle(gameState) {
	ctx.fillStyle = "black";
	ctx.font = "25px Arial";
	ctx.fillText("Bouquet Wants: \"" + gameState.wantedBook + "\"", gameState.settings.bookAreaStartX + gameState.settings.bookAreaWidth, 50 );
	if (gameState.lastSelectedBook != -1) {
		ctx.fillText("That Book Is: \"" + gameState.lastSelectedBook.title + "\"", gameState.settings.bookAreaStartX + gameState.settings.bookAreaWidth, 100 ); 
	}
}

function writeBooks(gameState) {
	for (book of gameState.books) {
		if (book.selected) {
			continue;
		}
		writeBookOnShelf(book, gameState.settings);
	}
	if (gameState.lastSelectedBook != -1) {
		writeBookOnShelf(gameState.lastSelectedBook, gameState.settings);
	}
}

function writeBookOnShelf(book, settings) {
	var currentBook = book.index;
	var currentRow = Math.floor(currentBook / settings.booksPerRow);
	var bookInRow = currentBook - currentRow*settings.booksPerRow;

	var startX = bookInRow / settings.booksPerRow;
	var width = book.width/ settings.booksPerRow;
	var height = book.height/settings.rowsPerPage;
	var startY = ((currentRow+1)/settings.rowsPerPage) - height;
	if (book.selected) {
		startX -= 0.2 * width;
		width *= 1.4;
		startY -= height * 0.2;
		height *= 1.2;
	} else if (book.highlighted) {
		startX -= 0.1 * width;
		width *= 1.2;
		startY -= height * 0.1;
		height *= 1.2;
	}
	
	startX = settings.bookAreaStartX + startX * settings.bookAreaWidth;
	startY = settings.bookAreaStartY + startY * settings.bookAreaHeight;
	
	width *= settings.bookAreaWidth;
	height *= settings.bookAreaHeight;
	
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
		return toColor(book.color[0]/10, book.color[1]/10, book.color[2]/10);
	}
	
	if (book.highlighted) {
		return toColor(255 - (255 - book.color[0])/2, 255 - (255 - book.color[1])/2, 255 - (255 - book.color[2])/2);
	}
	return toColor(book.color[0], book.color[1], book.color[2]);
}

function toByte(x) {
	if (x < 1) {
		return 0;
	}
	if (x >= 255) {
		return 255;
	}
	return Math.floor(x);
}

function toColor(r, g, b) {
	return "rgb("+toByte(r)+","+toByte(g)+","+toByte(b)+")"
}

function GetRandomColor() {
	return [Math.floor(20 + Math.random()*195), Math.floor(20 + Math.random()*195), Math.floor(20 + Math.random()*195)];
}

Main();
