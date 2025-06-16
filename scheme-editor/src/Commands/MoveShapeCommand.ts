import type { ICommand } from "./ICommand";
import type { BaseShape } from "../models/BaseShape";

export class MoveShapeCommand implements ICommand {
  private shape: BaseShape;
  private deltaX: number;
  private deltaY: number;
  private originalX: number;
  private originalY: number;

  constructor(shape: BaseShape, deltaX: number, deltaY: number) {
    this.shape = shape;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.originalX = shape.x;
    this.originalY = shape.y;
  }

  execute(): void {
    this.shape.move(this.deltaX, this.deltaY);
  }

  undo(): void {
    this.shape.x = this.originalX;
    this.shape.y = this.originalY;
  }
}
