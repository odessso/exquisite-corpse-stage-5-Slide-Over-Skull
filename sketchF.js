let startButton, pauseButton;
let line = 0;
let soundFile;
let fft;
let isPlaying = false;

let source;
let tiles = [];
let cols = 4;
let rows = 4;
let w, h;
let board = [];
let blankSpot = -1;

function preload() {
  soundFile = loadSound('music.mp3');
  source = loadImage("Scull.png");
}

function setup() {
  createCanvas(800, 800);
  w = width / cols;
  h = height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * h;
      let img = createImage(w, h);
      img.copy(source, x, y, w, h, 0, 0, w - 10, h - 10);

      let index = i + j * cols;
      let tile = new Tile(index, img);
      tiles.push(tile);

      board.push(index);
      if (index === cols * rows - 1) {
        blankSpot = index;
      }
    }
  }
  tiles.pop();
  board.pop();
  board.push(-1);

  simpleShuffle(board);

  drawButtons();
}

function drawButtons() {
  startButton = createButton('Let\'s Play A GAME');
  startButton.position(20, 20);
  startButton.size(110, 50);
  startButton.mousePressed(startMusic);
}

function startMusic() {
  soundFile.play();
  isPlaying = true;
}

function move(i, j) {
  let index = i + j * cols;
  if (isNeighbor(i, j, floor(blankSpot / cols), blankSpot % cols)) {
    swap(index, blankSpot);
    blankSpot = index;
  }
}

function isNeighbor(i, j, x, y) {
  return (i === x && abs(j - y) === 1) || (j === y && abs(i - x) === 1);
}

function swap(i, j) {
  let temp = board[i];
  board[i] = board[j];
  board[j] = temp;
}

function simpleShuffle(arr) {
  for (let i = 0; i < 1000; i++) {
    randomMove();
  }
}

function randomMove() {
  let r1 = floor(random(cols));
  let r2 = floor(random(rows));
  move(r1, r2);
}

function mousePressed() {
  let i = floor(mouseX / w);
  let j = floor(mouseY / h);
  move(i, j);
}

function draw() {
  if (isPlaying) {
    background(150, 33, 100);
    let spectrum = fft.analyze();
    stroke(0);
    for (let i = 0; i < spectrum.length; i++) {
      let amp = spectrum[i];
      let y = map(amp, 0, 255, 0, height);
      // Replace icecream with your desired drawing function
      // icecream(i * 10, y); 
    }
  } else {
    background(100, 230, 240);
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = i + j * cols;
      let x = i * w;
      let y = j * h;
      let tileIndex = board[index];
      if (tileIndex > -1) {
        let img = tiles[tileIndex].img;
        image(img, x, y);
      }
      noFill();
      stroke(0);
      rect(x, y, w, h);
    }
  }

  if (isSolved()) {
    console.log("SOLVED");
  }
}

function isSolved() {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i) {
      return false;
    }
  }
  return true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

