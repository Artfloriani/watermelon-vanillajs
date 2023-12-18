import "./style.css";
import { Fruit } from "./fruit.ts";

import * as p2 from "p2-es";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="gameCanvas"></canvas>
`;

// Initialize canvas and context
const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById("gameCanvas")
);

const numImages = 10;
const images: any[] = [];
for (let i = 0; i < numImages; i++) {
  const image: any = document.getElementById(i.toString());
  images.push(image);
}

const ctx = canvas?.getContext("2d");

if (ctx) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;

let w: number, h: number;
var scaleX = 50,
  scaleY = -50;

let world: p2.World;

// Fruits array
let fruits: Fruit[] = [];
let markedForDeletion: Fruit[] = [];

// end Line
let endLineY: number;
let endLineX: number;
let endTimeStamp: number | null = null;
let endGameTimerSeconds = 2;

// Next fruit logic
var lastMove: TouchEvent | null = null;
var nextFruit: Fruit | null;
var touchStart: TouchEvent | null = null;
let lastMouseX: number | null = null;

function afterPageLoad() {
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;

  canvas.height = canvasHeight;
  canvas.width = canvasWidth;

  init();
  requestAnimationFrame(animate);
}

window.addEventListener("load", () => {
  afterPageLoad();
});

// Save the touchstart to always have a position
document.addEventListener("touchstart", (event) => {
  lastMove = event;
  touchStart = event;
  if (nextFruit && touchStart) {
    const rect = canvas.getBoundingClientRect();
    nextFruit.x =
      (touchStart.touches[0].clientX - rect.left - canvasWidth / 2) / scaleX;
    nextFruit?.updatePosition();
  }
});

// Override with touchmove, which is triggered only on move
document.addEventListener("touchmove", (event) => {
  if (nextFruit == null) {
    touchStart = event;
  }
  lastMove = event;
  if (nextFruit && touchStart) {
    nextFruit.x =
      (event.touches[0].clientX - touchStart.touches[0].clientX) / scaleX;
    nextFruit?.updatePosition();
  }
});

document.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  lastMouseX = event.clientX - rect.left;
  if (nextFruit) {
    const newPosX = (lastMouseX - canvasWidth / 2) / scaleX;
    const xLimit = canvasWidth / scaleX / 2;
    if (newPosX > -xLimit && newPosX < xLimit) {
      nextFruit.x = newPosX;
      nextFruit?.updatePosition();
    }
  }
});

document.addEventListener("touchend", () => {
  if (lastMove) {
    dropFruit();
  }
});

document.addEventListener("mouseup", () => {
  dropFruit();
});

function dropFruit() {
  if (nextFruit && nextFruit.body) {
    nextFruit.body.wakeUp();
    nextFruit = null;
    setTimeout(() => {
      if (lastMouseX) {
        nextFruit = createFruit(lastMouseX, 0);
      } else {
        nextFruit = createFruit(canvasWidth / 2 + Math.random() * 5, 0);
      }
    }, 500);
  }
}

// Convert a canvas coordiante to physics coordinate
/* function getPhysicsCoord(px: number, py: number) {
  var rect = canvas.getBoundingClientRect();
  var x = px - rect.left;
  var y = py - rect.top;

  x = (x - w / 2) / scaleX;
  y = (y - h / 2) / scaleY;

  return [x, y];
} */

function createFruit(
  x: number,
  y: number,
  skipConversion = false,
  type: number = -1
) {
  let posX = x;
  let posY = y;
  if (!skipConversion) {
    posX = (x - w / 2) / scaleX;
    posY = (y - h / 2) / scaleY;
  }
  const position = [posX, posY];
  const newFruit = new Fruit(position[0], position[1], type);

  if (!skipConversion) {
    newFruit.y = (newFruit.radius * scaleX - h / 2) / scaleY;
    position[1] = newFruit.y;
  }

  const circleShape = new p2.Circle({ radius: newFruit.radius });
  const circleBody = new p2.Body({
    mass: newFruit.mass,
    position,
    damping: 0.85,
    collisionResponse: true,
    ccdSpeedThreshold: 0,
    allowSleep: true,
  });

  if (!skipConversion) {
    circleBody.sleep();
  }
  circleBody.addShape(circleShape);
  world.addBody(circleBody);

  newFruit.body = circleBody;
  newFruit.shape = circleShape;
  fruits.push(newFruit);
  return newFruit;
}

// Function to drop a fruit
/* function dropFruit(x: number, y: number) {
  const position = getPhysicsCoord(x, y);
  const newFruit = new Fruit(position[0], position[1]);

  const circleShape = new p2.Circle({ radius: newFruit.radius });
  const circleBody = new p2.Body({
    mass: 3,
    position,
    damping: 0.75,
    collisionResponse: true,
    ccdSpeedThreshold: 0,
  });
  circleBody.addShape(circleShape);
  world.addBody(circleBody);

  newFruit.body = circleBody;
  newFruit.shape = circleShape;
  fruits.push(newFruit);
} */

let planes: { planeShape: p2.Shape; planeBody: p2.Body }[] = [];

function init() {
  if (canvas === null || ctx === null) return;
  // Init canvas
  w = canvasWidth;
  h = canvasHeight;

  ctx.lineWidth = 0.05;

  // Init p2.js
  world = new p2.World();

  world.defaultContactMaterial.friction = 0.9;
  world.defaultContactMaterial.restitution = 0.25;

  endLineY = -h / scaleY / 2 + h / scaleY / 6;
  endLineX = w / scaleX / 2;

  const y = canvasHeight / 2 / scaleY;
  const x = canvasWidth / 2 / scaleX;
  createPlane(0, y);
  createPlane(x, 0, { angle: 1.5708, type: p2.Body.STATIC });
  createPlane(-x, 0, { angle: -1.5708, type: p2.Body.STATIC });

  world.on("beginContact", function (event: any) {
    const shapeA: p2.Circle = event.shapeA,
      shapeB: p2.Circle = event.shapeB;
    if (shapeA.radius !== undefined && shapeB.radius !== undefined) {
      checkMerge(shapeA, shapeB);
    }
  });

  nextFruit = createFruit(canvasWidth / 2, 0);
}

function createPlane(x: number, y: number, opts: p2.BodyOptions = {}) {
  let planeShape: p2.Shape, planeBody: p2.Body | null;

  // Add a plane
  planeShape = new p2.Plane();
  planeBody = new p2.Body({ position: [x, y], ...opts });
  planeBody.addShape(planeShape);
  world.addBody(planeBody);
  planes.push({ planeShape, planeBody });
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

  if (nextFruit) {
    ctx.beginPath();
    ctx.moveTo(nextFruit.x, nextFruit.y);
    ctx.lineTo(nextFruit.x, canvasHeight / scaleY);
    ctx.strokeStyle = "#FFFFFF60";
    ctx.lineWidth = 0.1;
    ctx.stroke();
  }

  for (let fruit of fruits) {
    drawFruit(fruit);
  }

  // Draw all bodies
  planes.forEach((plane) => {
    drawPlane(plane);
  });

  // draw end line
  ctx.beginPath();
  ctx.strokeStyle = "#E4000F50";
  ctx.moveTo(-endLineX, endLineY);
  ctx.lineTo(endLineX, endLineY);
  ctx.lineWidth = 0.1;
  ctx.stroke();

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
  world.gravity[1] = -30;
  world.setGlobalStiffness(1e30);

  for (let fruit of fruits) {
    fruit.grow();
  }

  checkEndGame(fruits);

  for (let fruit of markedForDeletion) {
    if (fruit.body) {
      world.removeBody(fruit.body);
      fruits = fruits.filter((f) => f !== fruit);
    }
  }

  // Render scene
  render();
}

function checkEndGame(fruits: Fruit[]) {
  let isOverEndLine = false;
  fruits.forEach((fruit) => {
    if (
      fruit.body &&
      Math.abs(fruit.body?.velocity[1]) < 0.2 &&
      fruit !== nextFruit
    ) {
      fruit.body?.position[1] > endLineY;
      if (fruit.body?.position[1] > endLineY) {
        if (endTimeStamp == null) {
          document
            .querySelector<HTMLDivElement>("#gameCanvas")
            ?.classList.add("app__end");
          endTimeStamp = Date.now();
        }
        isOverEndLine = true;
      }
    }
  });

  // check seconds difference between now and end time
  if (endTimeStamp) {
    const seconds = (Date.now() - endTimeStamp) / 1000;
    if (seconds > endGameTimerSeconds) {
      reset();
    }
  }

  if (!isOverEndLine) {
    endTimeStamp = null;
    document
      .querySelector<HTMLDivElement>("#gameCanvas")
      ?.classList.remove("app__end");
  }
}

function drawFruit(f: Fruit) {
  if (ctx == null || !f.body || !f.shape) return;
  // ctx.beginPath();
  const x = f.body.interpolatedPosition[0],
    y = f.body.interpolatedPosition[1],
    radius = f.shape.radius;
  // ctx.arc(x, y, radius, 0, Math.PI * 2);
  // ctx.fillStyle = f.color;
  // ctx.fill();
  // ctx.closePath();
  if (images.length > 0) {
    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    ctx.save();

    // move to the center of the canvas
    ctx.translate(x, y);

    // rotate the canvas to the specified degrees
    ctx.rotate(f.body.angle);

    // we’re done with the rotating so restore the unrotated context
    ctx.drawImage(
      images[f.type % images.length],
      -radius,
      -radius,
      radius * 2,
      radius * 2
    );
    ctx.restore();
  }
}

function drawPlane(p: { planeShape: p2.Shape; planeBody: p2.Body }) {
  if (p == null) return;
  if (ctx == null) return;
  var y = p.planeBody.interpolatedPosition[1];
  ctx.moveTo(-w, y);
  ctx.lineTo(w, y);
}

function checkMerge(shapeA: p2.Circle, shapeB: p2.Circle) {
  const fruitA = fruits.find((f) => f.shape === shapeA);
  const fruitB = fruits.find((f) => f.shape === shapeB);
  if (fruitA?.type == fruitB?.type) {
    if (fruitA && fruitB && fruitA.body && fruitB.body) {
      const [posX, posY] = fruitB.body.position;
      const { type } = fruitB;

      setTimeout(() => {
        const newFruit = createFruit(posX, posY, true, type);
        newFruit.evolve();
      });

      markedForDeletion.push(fruitB);
      markedForDeletion.push(fruitA);
    }
    //

    if (fruitA && fruitB) {
      // markedForDeletion.push(fruitA);
    }
  }
}

/* function findMidPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number } {
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;

  return { x: midX, y: midY };
} */

document
  .getElementById("resetButton")
  ?.addEventListener("click", () => reset());

function reset() {
  endTimeStamp = null;
  for (let fruit of fruits) {
    if (fruit.body && fruit !== nextFruit) {
      markedForDeletion.push(fruit);
    }
  }
}
