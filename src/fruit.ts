export class Fruit {
  constructor(
    public x: number,
    public y: number,
    public radius: number = 10,
    public color: string = "green"
  ) {
    this.dy = 0; // initial vertical speed
    this.dx = 0; // initial horizontal speed
  }
  dy: number;
  dx: number;
  acceleration: number = 0.1; // gravitational acceleration
  friction: number = 0.05; // friction coefficient

  hasCollided: boolean = false;
  collisionCooldown: number = 0; // in frames

  collidesWith(other: Fruit): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius + other.radius;
  }
}
