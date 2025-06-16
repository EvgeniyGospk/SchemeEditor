import type { ICommand } from "./ICommand";
import type { BaseShape } from "../models/BaseShape";
import type { Scheme } from "../models/Scheme";

export class MoveShapesCommand implements ICommand {
  private shapes: BaseShape[];
  private deltaX: number;
  private deltaY: number;
  private scheme: Scheme;

  constructor(
    shapes: BaseShape[],
    deltaX: number,
    deltaY: number,
    scheme: Scheme,
  ) {
    this.shapes = shapes;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.scheme = scheme;
  }

  execute(): void {
    this.shapes.forEach((shape) => {
      shape.move(this.deltaX, this.deltaY);
    });
    this.scheme.notifyObservers();
  }

  undo(): void {
    this.shapes.forEach((shape) => {
      shape.move(-this.deltaX, -this.deltaY);
    });
    this.scheme.notifyObservers();
  }
}
