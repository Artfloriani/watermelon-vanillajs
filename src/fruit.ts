import * as p2 from "p2-es";

export class Fruit {
  baseRadius = 0.2;
  constructor(
    public x: number,
    public y: number,
    public type = -1,
    public radius: number = 0.3,
    public previousRadius: number = 0.3,
    public targetRadius: number = 0.3,
    public color: string = "green",
    public body?: p2.Body,
    public shape?: p2.Circle,
    public mass: number = 1
  ) {
    const chance = Math.round(Math.random() * 15);

    this.radius = this.baseRadius;
    this.targetRadius = this.baseRadius;
    this.previousRadius = this.baseRadius;

    if (this.type === -1) {
      if (chance < 3) {
        this.type = 0;
      } else if (chance < 7) {
        this.type = 1;
      } else if (chance < 11) {
        this.type = 2;
      } else {
        this.type = 3;
      }
    }

    this.updateType();
    this.reachTarget();
  }

  evolve() {
    this.type++;
    this.previousRadius = this.radius;
    this.updateType();
    if (this.shape) {
      this.shape.radius = this.radius;
      this.shape.updateBoundingRadius();
      this.body?.updateBoundingRadius();
    }
  }

  /**
   * Increase radius if the radius is below target radio
   * Use evolveTime to determine how fast the fruit should grow
   * consider that the game is running at 60fps
   */
  grow() {
    if (this.radius < this.targetRadius && this.shape) {
      this.radius += (this.targetRadius - this.previousRadius) / 8;
      this.shape.radius = this.radius;
      this.shape?.updateBoundingRadius();
      this.body?.updateBoundingRadius();
    } else {
      this.radius = this.targetRadius;
    }
  }

  updateType() {
    switch (this.type) {
      case 0:
        this.color = "#00FF00"; // Unripe, Green
        this.targetRadius = this.baseRadius;
        break;
      case 1:
        this.color = "#FFFF00"; // Ripe, Yellow
        this.targetRadius = this.baseRadius * 1.5;

        break;
      case 2:
        this.color = "#FFA500"; // Juicy, Orange
        this.targetRadius = this.baseRadius * 2;
        break;
      case 3:
        this.color = "#FF0000"; // Sweet, Red
        this.targetRadius = this.baseRadius * 3;
        break;
      case 4:
        this.color = "#800080"; // Exotic, Purple
        this.targetRadius = this.baseRadius * 4;
        break;
      case 5:
        this.color = "#FFD700"; // Luxurious, Gold
        this.radius = this.baseRadius * 5;
        break;
      case 6:
        this.color = "#C0C085"; // Platinum
        this.radius = this.baseRadius * 6;
        break;
      case 7:
        this.color = "#B5B5B5"; // Silver
        this.radius = this.baseRadius * 7.5;
        break;
      case 8:
        this.color = "#4B0082"; // Indigo
        this.radius = this.baseRadius * 9;
        break;
      case 9:
        this.color = "#7FFF00"; // Chartreuse
        this.radius = this.baseRadius * 11;
        break;
      case 10:
        this.color = "#00FFFF"; // Cyan
        this.radius = this.baseRadius * 12;
        break;
      default:
        // Handle default case if needed
        break;
    }
    this.mass = (this.targetRadius * this.targetRadius) / 0.2;
    if (this.body) {
      this.body.mass = this.mass;
      this.body.updateMassProperties();
    }
  }

  reachTarget() {
    this.radius = this.targetRadius;
  }

  updatePosition() {
    if (!this.body) return;
    this.body.position = [this.x, this.y];
    this.body.updateBoundingRadius();
  }
}
