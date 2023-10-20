import * as p2 from "p2-es";

export class Fruit {
  constructor(
    public x: number,
    public y: number,
    public radius: number = 10,
    public color: string = "green",
    public type = 0,
    public body?: p2.Body,
    public shape?: p2.Circle
  ) {
    const chance = Math.round(Math.random() * 1);

    if (chance < 5) {
      this.type = 0;
    } else if (chance < 9) {
      this.type = 1;
    } else if (chance < 13) {
      this.type = 2;
    } else {
      this.type = 3;
    }

    this.updateType();
  }

  updateType() {
    switch (this.type) {
      case 0:
        this.color = "#00FF00"; // Unripe, Green
        this.radius = 1;
        break;
      case 1:
        this.color = "#FFFF00"; // Ripe, Yellow
        this.radius = 1.5;
        break;
      case 2:
        this.color = "#FFA500"; // Juicy, Orange
        this.radius = 20;
        break;
      case 3:
        this.color = "#FF0000"; // Sweet, Red
        this.radius = 30;
        break;
      case 4:
        this.color = "#800080"; // Exotic, Purple
        this.radius = 40;
        break;
      case 5:
        this.color = "#FFD700"; // Luxurious, Gold
        this.radius = 50;
        break;
      case 6:
        this.color = "#C0C085"; // Platinum
        this.radius = 65;
        break;
      case 7:
        this.color = "#B5B5B5"; // Silver
        this.radius = 80;
        break;
      case 8:
        this.color = "#4B0082"; // Indigo
        this.radius = 95;
        break;
      case 9:
        this.color = "#7FFF00"; // Chartreuse
        this.radius = 110;
        break;
      case 10:
        this.color = "#00FFFF"; // Cyan
        this.radius = 130;
        break;
      default:
        // Handle default case if needed
        break;
    }
  }
}
