import { Fruit } from "./fruit";

export function resolveCollision(fruit1: Fruit, fruit2: Fruit) {
  const dx = fruit1.x - fruit2.x;
  const dy = fruit1.y - fruit2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Minimum translation distance to push fruits apart after intersecting
  const overlap = fruit1.radius + fruit2.radius - distance;

  // Calculate angle based on positions
  const angle = Math.atan2(dy, dx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  let dx1 = fruit1.dx * cos + fruit1.dy * sin;
  let dy1 = fruit1.dy * cos - fruit1.dx * sin;

  // fruit2 perpendicular velocities
  let dx2 = fruit2.dx * cos + fruit2.dy * sin;
  let dy2 = fruit2.dy * cos - fruit2.dx * sin;

  // Move fruits so they no longer overlap
  fruit1.x += overlap * Math.cos(angle);
  fruit1.y += overlap * Math.sin(angle);
  fruit2.x -= overlap * Math.cos(angle);
  fruit2.y -= overlap * Math.sin(angle);

  // Velocity before collision
  fruit1.dx = dx2 * cos - dy1 * sin;
  fruit1.dy = dy1 * cos + dx2 * sin;
  fruit2.dx = dx1 * cos - dy2 * sin;
  fruit2.dy = dy2 * cos + dx1 * sin;

  // apply some friction at the ground
  if (Math.abs(fruit1.dx) > 0) {
    if (fruit1.dx > 0) fruit1.dx -= fruit2.friction;
    else fruit1.dx += fruit2.friction;

    if (Math.abs(fruit1.dx) < fruit2.friction) fruit1.dx = 0;
  }
}
