import "./style.css";
import { setupCounter } from "./counter.ts";
import { Fruit } from "./fruit.ts";

import * as p2 from "p2-es";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="gameCanvas" width="400" style="border: 1px solid red;" height="400"></canvas>
`;

// Initialize canvas and context
const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById("gameCanvas")
);
const ctx = canvas?.getContext("2d");
let w: number, h: number;
var scaleX = 50,
  scaleY = -50;

let world: p2.World;

// Fruits array
let fruits: Fruit[] = [];
let markedForDeletion: Fruit[] = [];

// Click event to drop fruit
canvas.addEventListener("click", function (event) {
  let x = event.clientX - canvas.offsetLeft;
  let y = event.clientY - canvas.offsetTop;
  dropFruit(x, y);
});

// Convert a canvas coordiante to physics coordinate
function getPhysicsCoord(px: number, py: number) {
  var rect = canvas.getBoundingClientRect();
  var x = px - rect.left;
  var y = py - rect.top;

  x = (x - w / 2) / scaleX;
  y = (y - h / 2) / scaleY;

  return [x, y];
}

// Function to drop a fruit
function dropFruit(x: number, y: number) {
  const newFruit = new Fruit(x, y);

  const circleShape = new p2.Circle({ radius: newFruit.radius });
  const position = getPhysicsCoord(x + newFruit.radius * scaleX, y);
  const circleBody = new p2.Body({ mass: 1, position });
  circleBody.addShape(circleShape);
  world.addBody(circleBody);

  newFruit.body = circleBody;
  newFruit.shape = circleShape;
  fruits.push(newFruit);
}

let planeShape: p2.Shape, planeBody: p2.Body | null;

function init() {
  if (canvas === null || ctx === null) return;
  // Init canvas
  w = canvas.width;
  h = canvas.height;

  ctx.lineWidth = 0.05;

  // Init p2.js
  world = new p2.World();

  // Add a plane
  planeShape = new p2.Plane();
  planeBody = new p2.Body({ position: [0, -4] });
  planeBody.addShape(planeShape);
  world.addBody(planeBody);

  world.on("beginContact", function (event) {
    const shapeA: p2.Circle = event.shapeA,
      shapeB: p2.Circle = event.shapeB;
    if (shapeA.radius !== undefined && shapeB.radius !== undefined) {
      checkMerge(shapeA, shapeB);
    }
  });
}

function render() {
  if (ctx == null) return;
  // Clear the canvas
  ctx.clearRect(0, 0, w, h);

  // Transform the canvas
  // Note that we need to flip the y axis since Canvas pixel coordinates
  // goes from top to bottom, while physics does the opposite.
  ctx.save();
  ctx.translate(w / 2, h / 2); // Translate to the center
  ctx.scale(scaleX, scaleY); // Zoom in and flip y axis

  for (let fruit of fruits) {
    drawFruit(fruit);
  }

  // Draw all bodies
  drawPlane();

  // Restore transform
  ctx.restore();
}

var lastTime = 0,
  timeStep = 1 / 60,
  maxSubSteps = 5;

// Animation loop
function animate(time: number) {
  requestAnimationFrame(animate);

  var dt = lastTime ? (time - lastTime) / 1000 : 0;
  dt = Math.min(1 / 10, dt);
  lastTime = time;

  // Move physics bodies forward in time
  world.step(timeStep, dt, maxSubSteps);

  for (let fruit of markedForDeletion) {
    if (fruit.body) {
      world.removeBody(fruit.body);
      fruits = fruits.filter((f) => f !== fruit);
    }
  }

  // Render scene
  render();
}

function drawFruit(f: Fruit) {
  if (ctx == null || !f.body || !f.shape) return;
  ctx.beginPath();
  const x = f.body.interpolatedPosition[0],
    y = f.body.interpolatedPosition[1],
    radius = f.shape.radius;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = f.color;
  ctx.fill();
  ctx.closePath();
}

function drawPlane() {
  if (planeBody == null) return;
  if (ctx == null) return;
  var y = planeBody.interpolatedPosition[1];
  ctx.moveTo(-w, y);
  ctx.lineTo(w, y);
  ctx.stroke();
}

function checkMerge(shapeA: p2.Circle, shapeB: p2.Circle) {
  if (shapeA.radius == shapeB.radius) {
    const fruitA = fruits.find((f) => f.shape === shapeA);
    const fruitB = fruits.find((f) => f.shape === shapeB);
    if (fruitA && fruitB) {
      markedForDeletion.push(fruitA);
    }
  }
}

init();
requestAnimationFrame(animate);
