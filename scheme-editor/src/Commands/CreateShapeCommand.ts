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
    properties: Record<string, string | number | boolean> = {}
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

      // Calculate the next z-index for the new shape
      const allShapes = this.scheme.getShapes();
      const validZIndices = allShapes
        .map((s) => s.getZIndex())
        .filter(
          (zIndex): zIndex is number =>
            typeof zIndex === "number" && !isNaN(zIndex)
        );

      const maxZIndex =
        validZIndices.length > 0 ? Math.max(...validZIndices) : -1;
      const nextZIndex = maxZIndex + 1;

      // Add zIndex to properties if not already set
      const propertiesWithZIndex = {
        ...this.properties,
        zIndex:
          this.properties.zIndex !== undefined &&
          typeof this.properties.zIndex === "number"
            ? this.properties.zIndex
            : nextZIndex,
      };

      this.createdShape = this.shapeFactory.createShape(
        this.shapeType,
        propertiesWithZIndex
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
