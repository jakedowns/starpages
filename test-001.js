let cachedBitmap;
let cycleLength = 4 * 100; // Length of one full cycle of the animation
let isReversed = 1;
function setup() {
  createCanvas(400, 400);
  drawQuadrants();
  cachedBitmap = get(); // Cache the initial state
}
let initPositions = [
  {x:0,y:0},
  {x:200,y:0},
  {x:0,y:200},
  {x:200,y:200}
]

function draw() {
    background(0);

    const step = frameCount % cycleLength; // Current step in the cycle

    let positions = [
        { index: 0, pos: calculatePosition(0, step) },
        { index: 1, pos: calculatePosition(1, step) },
        { index: 2, pos: calculatePosition(2, step) },
        { index: 3, pos: calculatePosition(3, step) }
    ];

    positions.sort((a, b) => {
        if (a.pos[1] === b.pos[1]) {
            return a.pos[0] - b.pos[0]; // Sort by x if y is the same
        }
        return a.pos[1] - b.pos[1]; // Otherwise, sort by y
    });

    // Draw each quadrant in the sorted order
    for (let i = 0; i < positions.length; i++) {
        let _position = positions[i].pos;
        drawQuadrant({
          positions,
            initX: _position[0], 
            initY: _position[1], 
            x: _position[0], 
            y: _position[1], 
            w: 200, 
            h: 200
        });
    }
}


// Define the target positions for each slot
const targets = [
  { x: 0, y: 0 },    // Slot 1
  { x: 200, y: 200 },// Slot 4
  { x: 0, y: 200 },   // Slot 3
  { x: 200, y: 0 }  // Slot 2
  
];

function calculatePosition(cubeIndex, step) {
  let phaseLength = cycleLength / targets.length;
  let totalPhases = targets.length;
  let adjustedStep = isReversed
    ? (cycleLength - step + cubeIndex * phaseLength) % cycleLength
    : (step + cubeIndex * phaseLength) % cycleLength;
  let easeStep = easeInOut((adjustedStep % phaseLength) / phaseLength);
  let currentPhase = Math.floor(adjustedStep / phaseLength) % totalPhases;
  let nextPhase = (currentPhase + 1) % totalPhases;

  // Determine the starting position offset for each cube
  let offset = initPositions[cubeIndex];

  let x = lerp(targets[currentPhase].x, targets[nextPhase].x, easeStep) - offset.x;
  let y = lerp(targets[currentPhase].y, targets[nextPhase].y, easeStep) - offset.y;

  return [x, y];
}


// draw once to cache
function drawQuadrants() {
  //scale(.5)
  //translate(200,200)
  // First Quadrant
  fill('red');
  rect(0, 0, 200, 200);
  fill(255);
  text('1', 20, 20);

  // Second Quadrant
  fill('green');
  rect(200, 0, 200, 200);
  fill(255);
  text('2', 220, 20);

  // Third Quadrant
  fill('blue');
  rect(0, 200, 200, 200);
  fill(255);
  text('3', 20, 220);

  // Fourth Quadrant
  fill('yellow');
  rect(200, 200, 200, 200);
  fill(255);
  text('4', 220, 220);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function drawQuadrant({positions, initX, initY, x, y, w, h}) {
  image(cachedBitmap, initX + x, initY + y, w, h, initX, initY, w, h);
}
function getTargetSlot(currentSlot, phase) {
  // Calculate the target slot based on the current slot and the phase
  return (currentSlot + phase - 1) % 4 + 1;
}
function getCurrentSlot(quadrant, phase) {
  // Calculate the current slot based on the quadrant and phase
  // Since each phase shifts quadrants to the next slot, we reverse the shift
  return (quadrant + 3 * phase) % 4 + 1;
}
function mouseClicked() {
  isReversed = !isReversed; // Toggle the direction
}
