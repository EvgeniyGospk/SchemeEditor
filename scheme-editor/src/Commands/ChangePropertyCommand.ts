import type { ICommand } from "./ICommand";
import type { Scheme } from "../models/Scheme";
import { LoggingService } from "../core/services/LoggingService";

type PropertyValue = string | number | boolean;

export class ChangePropertyCommand implements ICommand {
  private scheme: Scheme;
  private elementId: string;
  private properties: Record<string, PropertyValue>;
  private elementType: "shape" | "line";
  private previousProperties: Record<string, PropertyValue> = {};

  constructor(
    scheme: Scheme,
    elementId: string,
    properties: Record<string, PropertyValue>,
    elementType: "shape" | "line" = "shape",
  ) {
    this.scheme = scheme;
    this.elementId = elementId;
    this.properties = properties;
    this.elementType = elementType;
  }

  private findElement() {
    if (this.elementType === "shape") {
      return this.scheme.shapes.find((s) => s.getId() === this.elementId);
    } else {
      return this.scheme.lines.find((l) => l.id === this.elementId);
    }
  }

  execute(): void {
    try {
      const element = this.findElement();
      if (!element) {
        return;
      }

      const currentProperties = element.getProperties() as unknown as Record<
        string,
        unknown
      >;
      Object.keys(this.properties).forEach((key) => {
        this.previousProperties[key] = currentProperties[key] as PropertyValue;
      });

      element.setProperties(this.properties);
      this.scheme.notifyObservers();
    } catch (error) {
      LoggingService.error(
        `Error changing property for ${this.elementType} ${this.elementId}`,
        error,
      );
    }
  }

  undo(): void {
    try {
      const element = this.findElement();
      if (!element) {
        LoggingService.warn(
          `${this.elementType} with id ${this.elementId} not found`,
        );
        return;
      }

      element.setProperties(this.previousProperties);
      this.scheme.notifyObservers();
    } catch (error) {
      LoggingService.error(
        `Error reverting properties for ${this.elementType} ${this.elementId}`,
        error,
      );
    }
  }
}
