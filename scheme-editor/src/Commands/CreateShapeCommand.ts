import type { ICommand } from "./ICommand";
import type { ShapeFactory } from "../core/services/ShapeFactory";
import type { Scheme } from "../models/Scheme";
import type { BaseShape } from "../models/BaseShape";
import { LoggingService } from "../core/services/LoggingService";

export class CreateShapeCommand implements ICommand {
  private scheme: Scheme;
  private shapeFactory: ShapeFactory;
  private shapeType: string;
  private properties: Record<string, string | number | boolean>;
  private createdShape?: BaseShape | null;

  constructor(
    scheme: Scheme,
    shapeFactory: ShapeFactory,
    shapeType: string,
    properties: Record<string, string | number | boolean> = {},
  ) {
    this.scheme = scheme;
    this.shapeFactory = shapeFactory;
    this.shapeType = shapeType;
    this.properties = properties;
  }

  execute(): void {
    try {
      if (this.createdShape) {
        this.scheme.addShape(this.createdShape);
        return;
      }

      this.createdShape = this.shapeFactory.createShape(
        this.shapeType,
        this.properties,
      );
      if (this.createdShape) {
        this.scheme.addShape(this.createdShape);
      }
    } catch (error) {
      LoggingService.error("Failed to create shape:", error);
    }
    this.scheme.notifyObservers();
  }

  undo(): void {
    if (this.createdShape) {
      this.scheme.removeShape(this.createdShape.getId());
    }
    this.scheme.notifyObservers();
  }

  getCreatedShape(): BaseShape | undefined | null {
    return this.createdShape;
  }
}
