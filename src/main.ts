import "./style.css";
import { setupCounter } from "./counter.ts";
import { Fruit } from "./fruit.ts";
import { resolveCollision } from "./physics.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="gameCanvas" width="400" style="border: 1px solid red;" height="400"></canvas>
`;

// Initialize canvas and context
const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById("gameCanvas")
);
const ctx = canvas?.getContext("2d");

// Fruits array
let fruits: Fruit[] = [];

// Click event to drop fruit
canvas.addEventListener("click", function (event) {
  let x = event.clientX - canvas.offsetLeft;
  let y = event.clientY - canvas.offsetTop;
  dropFruit(x, y);
});

const gravity = 0.1;
const friction = 0.05;

// Function to drop a fruit
function dropFruit(x: number, y: number) {
  const newFruit = new Fruit(x, y);
  fruits.push(newFruit);
}
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  clearCanvas();

  for (let fruit of fruits) {
    // Simple gravity
    worldPhysics(fruit);

    checkCollisions(fruit);

    // draw
    drawFruit(fruit);
  }
}

function checkCollisions(f: Fruit) {
  for (let i = 0; i < fruits.length; i++) {
    const other = fruits[i];
    if (f !== other && f.collidesWith(other)) {
      if (f.color === other.color) {
        combineFruits(f, other);
      }
      resolveCollision(f, other);
    }
  }
}

function combineFruits(f1: Fruit, f2: Fruit) {
  f1.x = (f1.x + f2.x) / 2;
  f1.y = (f1.y + f2.y) / 2;
  f1.dy = (f1.dy + f2.dy) / 2;
  f1.dx = (f1.dx + f2.dx) / 2;
  f1.type++;
  f1.updateType();
  fruits = fruits.filter((f) => f !== f2);
}

function clearCanvas() {
  if (ctx == null) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFruit(f: Fruit) {
  if (ctx == null) return;
  ctx.beginPath();
  ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
  ctx.fillStyle = f.color;
  ctx.fill();
  ctx.closePath();
}

function worldPhysics(f: Fruit) {
  f.dy += gravity;
  f.y += f.dy;
  f.x += f.dx;
  if (f.y + f.radius > canvas.height) {
    f.y = canvas.height - f.radius;
    f.dy = -0.3 * f.dy; // Bounce back up, lose some speed

    // apply some friction at the ground
    if (Math.abs(f.dx) > 0) {
      if (f.dx > 0) f.dx -= friction;
      else f.dx += friction;

      if (Math.abs(f.dx) < friction) f.dx = 0;
    }
  }

  if (f.x + f.radius > canvas.width) {
    f.x = canvas.width - f.radius;
    f.dx = -0.3 * f.dx;
  } else if (f.x - f.radius < 0) {
    f.x = f.radius;
    f.dx = -0.3 * f.dx;
  }
}

animate();
