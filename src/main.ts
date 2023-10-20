import './style.css';
import { setupCounter } from './counter.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="gameCanvas" width="400" height="400"></canvas>

  </div>
`;

// Initialize canvas and context
const canvas :HTMLCanvasElement = document.getElementById('gameCanvas');
const ctx = canvas?.getContext('2d');

// Fruits array
let fruits = [];

// Click event to drop fruit
canvas.addEventListener('click', function (event) {
  let x = event.clientX - canvas.offsetLeft;
  let y = event.clientY - canvas.offsetTop;
  dropFruit(x, y);
});

// Function to drop a fruit
function dropFruit(x, y) {
  const newFruit = {
    x: x,
    y: y,
    radius: 10,
    color: 'green',
    dy: 2, // falling speed
  };
  fruits.push(newFruit);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw and move fruits
  for (let i = 0; i < fruits.length; i++) {
    let f = fruits[i];
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = f.color;
    ctx.fill();
    ctx.closePath();

    // Simple gravity
    f.y += f.dy;

    // Boundary check
    if (f.y + f.radius > canvas.height) {
      f.y = canvas.height - f.radius;
    }
  }
}
animate();
