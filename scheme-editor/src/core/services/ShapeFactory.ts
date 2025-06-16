import { BaseShape } from "../../models/BaseShape";
import {
  RectangleShape,
  CircleShape,
  UmlClassShape,
  UmlComponentShape,
} from "../../models/shapes";
import type {
  AnyShape,
  AnyShapeProperties,
  RectangleShapeProperties,
  CircleShapeProperties,
  UmlClassShapeProperties,
  UmlComponentShapeProperties,
} from "../../models/shapes";
import { LoggingService } from "./LoggingService";
import { v4 as uuidv4 } from "uuid";
import { shapePluginRegistry } from "../../plugins/ShapePluginRegistry";

export class ShapeFactory {
  createShape(
    type: string,
    properties: Partial<AnyShapeProperties> = {},
  ): BaseShape | null {
    const plugin = shapePluginRegistry.getPluginDefinition(type);
    if (!plugin) {
      LoggingService.warn(`Unknown shape type: ${type}. Returning null.`);
      return null;
    }

    const finalProperties = {
      ...plugin.defaultProperties,
      ...properties,
      id: properties.id || uuidv4(),
      type: type,
    };

    switch (type) {
      case "rectangle":
        return this.createRectangle(
          finalProperties as RectangleShapeProperties,
        );

      case "circle":
        return this.createCircle(finalProperties as CircleShapeProperties);

      case "umlClass":
        return this.createUmlClass(finalProperties as UmlClassShapeProperties);

      case "umlComponent":
        return this.createUmlComponent(
          finalProperties as UmlComponentShapeProperties,
        );

      default:
        LoggingService.warn(`Unknown shape type: ${type}. Returning null.`);
        return null;
    }
  }

  private createRectangle(props: RectangleShapeProperties): RectangleShape {
    return new RectangleShape(props);
  }

  private createCircle(props: CircleShapeProperties): CircleShape {
    return new CircleShape(props);
  }

  private createUmlClass(props: UmlClassShapeProperties): UmlClassShape {
    return new UmlClassShape(props);
  }

  private createUmlComponent(
    props: UmlComponentShapeProperties,
  ): UmlComponentShape {
    return new UmlComponentShape(props);
  }

  getSupportedTypes(): string[] {
    return shapePluginRegistry
      .getAllPluginDefinitions()
      .map((plugin) => plugin.type);
  }

  isTypeSupported(type: string): boolean {
    return this.getSupportedTypes().includes(type);
  }

  getDefaultProperties(type: string): Partial<AnyShape> {
    const plugin = shapePluginRegistry.getPluginDefinition(type);
    if (plugin?.defaultProperties) {
      return plugin.defaultProperties as Partial<AnyShape>;
    }

    return {
      fillColor: "#ffffff",
      strokeColor: "#000000",
    };
  }
}
