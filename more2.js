let img, tiles = [], blankIdx, gridSize = 3, tileSize = 100, moving = false;

function preload() { img = loadImage(getRandomUrl(), () => console.log("Image loaded"), () => console.log("Image failed to load")); }

function setup() { createCanvas(gridSize * tileSize, gridSize * tileSize); initTiles(); shuffleTiles(); let btn = createButton('Shuffle'); btn.mousePressed(shuffleTiles); }

function draw() { background(255); for (let i = 0; i < tiles.length; i++) { if (i !== blankIdx && tiles[i].img) { let t = tiles[i]; image(t.img, t.x * tileSize, t.y * tileSize, tileSize, tileSize); } } }

function mousePressed() { 
    let x = floor(mouseX / tileSize), y = floor(mouseY / tileSize), idx = x + y * gridSize; 
    if (idx < tiles.length && idx !== blankIdx) { 
        let d = abs(tiles[idx].x - tiles[blankIdx].x) + abs(tiles[idx].y - tiles[blankIdx].y); 
        if (d === 1) { 
            moving = true; 
            swap(idx, blankIdx); 
            animateMove(tiles[blankIdx], tiles[idx], () => { 
                moving = false; 
                if (isSolved()) { 
                    noLoop(); 
                    alert('Puzzle Solved!'); 
                } else { 
                    redraw(); 
                } 
            }); 
        } 
    } 
}

function swap(a, b) { 
    animateMove(tiles[a], tiles[b], () => {
        [tiles[a], tiles[b]] = [tiles[b], tiles[a]]; 
        [tiles[a].x, tiles[b].x] = [tiles[b].x, tiles[a].x]; 
        [tiles[a].y, tiles[b].y] = [tiles[b].y, tiles[a].y]; 
        blankIdx = a; 
        moving = false;
    });
}

function animateMove(fromTile, toTile, callback) { 
    if ((!fromTile.img && fromTile !== tiles[blankIdx]) || !toTile.img) { 
        console.log("Null image"); 
        return; 
    } 
    let dx = (toTile.x - fromTile.x) * tileSize, dy = (toTile.y - fromTile.y) * tileSize, st = millis(), dur = 300; 
    function cubicInOut(t) {
        return t < 0.5
            ? 4 * t * t * t
            : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    function anim() { 
        let ct = millis() - st, t = cubicInOut(min(1, ct / dur)); 
        if (t < 1) { 
            background(255); // Clear the canvas
            for (let i = 0; i < tiles.length; i++) { // Redraw all tiles
                if (i !== blankIdx && tiles[i].img) { 
                    let t = tiles[i]; 
                    image(t.img, t.x * tileSize, t.y * tileSize, tileSize, tileSize); 
                } 
            }
            let ix = fromTile.x * tileSize + dx * t, iy = fromTile.y * tileSize + dy * t; 
            image(toTile.img, ix, iy, tileSize, tileSize); // Draw the moving tile
            requestAnimationFrame(anim); 
        } else { 
            callback(); 
        } 
    } 
    requestAnimationFrame(anim); 
}

function shuffleTiles() { loadImage(getRandomUrl(), newImg => { img = newImg; initTiles(); let s = 0, t = 30; function shuffle() { let pp = potentialPositions(); if (pp.length > 0) { let choice = pp[floor(random(pp.length))]; swap(choice, blankIdx); } if (++s < t) { requestAnimationFrame(shuffle); } else { moving = false; redraw(); } } moving = true; shuffle(); }); }

function animTile(fromTile, toTile) { let dx = (toTile.x - fromTile.x) * tileSize, dy = (toTile.y - fromTile.y) * tileSize, steps = 10; for (let s = 1; s <= steps; s++) { setTimeout(() => { if (fromTile.img && toTile.img) { let ix = fromTile.x * tileSize + dx * s / steps, iy = fromTile.y * tileSize + dy * s / steps; image(toTile.img, ix, iy, tileSize, tileSize); } }, s * (200 / steps)); } }

function potentialPositions() { return tiles.filter((_, i) => abs(tiles[i].x - tiles[blankIdx].x) + abs(tiles[i].y - tiles[blankIdx].y) === 1).map(t => tiles.indexOf(t)); }

function isSolved() { return tiles.every((t, i) => t.img === img.get(tileSize * (i % gridSize), tileSize * floor(i / gridSize), tileSize, tileSize)); }

function initTiles() { tiles = Array.from({ length: gridSize ** 2 }, (_, i) => ({ img: null, x: i % gridSize, y: floor(i / gridSize) })); for (let i = 0; i < tiles.length - 1; i++) { tiles[i].img = img.get(tileSize * (i % gridSize), tileSize * floor(i / gridSize), tileSize, tileSize); } blankIdx = gridSize ** 2 - 1; }

function getRandomUrl() { return 'https://source.unsplash.com/random/' + gridSize * tileSize + 'x' + gridSize * tileSize; }
