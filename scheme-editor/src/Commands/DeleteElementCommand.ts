import type { ICommand } from "./ICommand";
import type { Scheme } from "../models/Scheme";
import type { BaseShape } from "../models/BaseShape";
import type { Line } from "../models/Line";

export class DeleteElementCommand implements ICommand {
  private scheme: Scheme;
  private elementIds: string[];
  private deletedShapes: BaseShape[] = [];
  private deletedLines: Line[] = [];

  constructor(scheme: Scheme, elementIds: string | string[]) {
    this.scheme = scheme;
    this.elementIds = Array.isArray(elementIds) ? elementIds : [elementIds];
  }

  execute(): void {
    this.deletedShapes = [];
    this.deletedLines = [];

    this.elementIds.forEach((id) => {
      if (this.deleteShape(id)) return;
      if (this.deleteLine(id)) return;
    });
    this.scheme.notifyObservers();
  }

  undo(): void {
    this.deletedShapes.forEach((shape) => this.scheme.addShape(shape));
    this.deletedLines.forEach((line) => this.scheme.addLine(line));
    this.scheme.notifyObservers();
  }

  private deleteShape(shapeId: string): boolean {
    const shape = this.scheme.shapes.find((s) => s.getId() === shapeId);
    if (!shape) return false;

    this.deletedShapes.push(shape);
    this.deleteConnectedLines(shapeId);
    this.scheme.removeShape(shapeId);
    return true;
  }

  private deleteLine(lineId: string): boolean {
    const line = this.scheme.lines.find((l) => l.id === lineId);
    if (!line) return false;

    this.deletedLines.push(line);
    this.scheme.removeLine(lineId);
    return true;
  }

  private deleteConnectedLines(shapeId: string): void {
    const connectedLines = this.scheme.lines.filter(
      (line) => line.fromShapeId === shapeId || line.toShapeId === shapeId,
    );
    this.deletedLines.push(...connectedLines);
  }
}
