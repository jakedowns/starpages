let img;
let tiles = [];
let blankIdx;
let gridSize = 3;
let tileSize = 100;
let animating = false;
let puzzleSolved = false;
let animationStart;
let animationEnd;
let animationProgress = 0;
let animationTileIdx;
let animationBlankIdx;

function preload() {
  img = loadImage('https://source.unsplash.com/random/');
}

function setup() {
  createCanvas(gridSize * tileSize, gridSize * tileSize);
  initTiles();
  shuffleTiles();

  let shuffleButton = createButton('Shuffle');
  shuffleButton.mousePressed(shuffleAndLoadNewImage);
}

function shuffleAndLoadNewImage() {
  if (!animating) {
    loadImage('https://source.unsplash.com/random/', newImg => { // Replace with your image URL
      img = newImg;
      initTiles();
      shuffleTiles();
    });
  }
}

function draw() {
  background(0);

  if (puzzleSolved) {
    // Display a message or some visual feedback for the solved puzzle
  } else {
    drawTiles();
    handleAnimation();
  }
}

function drawTiles() {
  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    if (tile !== blankIdx) {
      let x = (i % gridSize) * tileSize;
      let y = Math.floor(i / gridSize) * tileSize;
      if (animating && i === animationTileIdx) {
        let blankX = (animationBlankIdx % gridSize) * tileSize;
        let blankY = Math.floor(animationBlankIdx / gridSize) * tileSize;
        x = lerp(x, blankX, animationProgress);
        y = lerp(y, blankY, animationProgress);
      }
      image(img, x, y, tileSize, tileSize, tile % gridSize * tileSize, Math.floor(tile / gridSize) * tileSize, tileSize, tileSize);
    }
  }
}

function handleAnimation() {
  if (animating) {
    let now = Date.now();
    animationProgress = (now - animationStart) / (animationEnd - animationStart);
    if (animationProgress >= 1) {
      animating = false;
      animationProgress = 0;
      swapTiles(animationTileIdx, animationBlankIdx);
      checkPuzzleSolved();
    }
  }
}

function mousePressed() {
  if (animating || puzzleSolved) {
    return;
  }

  let x = Math.floor(mouseX / tileSize);
  let y = Math.floor(mouseY / tileSize);
  let clickedIdx = x + y * gridSize;

  if (clickedIdx !== blankIdx && isNeighbor(clickedIdx, blankIdx)) {
    startAnimation(clickedIdx, blankIdx);
  }
}

function startAnimation(tileIdx, blankIdx) {
  animationTileIdx = tileIdx;
  animationBlankIdx = blankIdx;
  animationStart = Date.now();
  animationEnd = animationStart + 500; // 500ms for animation
  animating = true;
}

function isNeighbor(a, b) {
  let ax = a % gridSize;
  let ay = Math.floor(a / gridSize);
  let bx = b % gridSize;
  let by = Math.floor(b / gridSize);
  return abs(ax - bx) + abs(ay - by) === 1;
}

function swapTiles(tileIdx, blankIdx) {
  let temp = tiles[tileIdx];
  tiles[tileIdx] = tiles[blankIdx];
  tiles[blankIdx] = temp;
}

function checkPuzzleSolved() {
  puzzleSolved = tiles.every((tile, i) => tile === i);
}

function initTiles() {
  tiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  blankIdx = tiles.length - 1;
}

function shuffleTiles() {
  let n = tiles.length;
  while (n > 1) {
    n--;
    let k = Math.floor(Math.random() * (n + 1));
    [tiles[k], tiles[n]] = [tiles[n], tiles[k]];
  }
  blankIdx = tiles.indexOf(gridSize * gridSize - 1);
  puzzleSolved = false; // Reset puzzle solved state
}
