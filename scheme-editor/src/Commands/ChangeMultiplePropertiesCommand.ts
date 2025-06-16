import type { ICommand } from "./ICommand";
import type { Scheme } from "../models/Scheme";
import { LoggingService } from "../core/services/LoggingService";

type PropertyValue = string | number | boolean;

interface ElementChange {
  elementId: string;
  elementType: "shape" | "line";
  previousProperties: Record<string, PropertyValue>;
}

interface ElementWithProperties {
  id: string;
  getProperties: () => unknown;
  setProperties: (properties: Record<string, PropertyValue>) => void;
}

export class ChangeMultiplePropertiesCommand implements ICommand {
  private scheme: Scheme;
  private elementIds: string[];
  private properties: Record<string, PropertyValue>;
  private elementType: "shape" | "line";

  private previousChanges: ElementChange[] = [];

  constructor(
    scheme: Scheme,
    elementIds: string[],
    properties: Record<string, PropertyValue>,
    elementType: "shape" | "line" = "shape",
  ) {
    this.scheme = scheme;
    this.elementIds = elementIds;
    this.properties = properties;
    this.elementType = elementType;
  }

  private findElements(): ElementWithProperties[] {
    const elementMap = new Map<string, ElementWithProperties>();

    if (this.elementType === "shape") {
      this.scheme.shapes.forEach((shape) => {
        const shapeId = shape.getId();
        if (typeof shapeId === "string") {
          elementMap.set(shapeId, {
            id: shapeId,
            getProperties: () => shape.getProperties(),
            setProperties: (props: Record<string, PropertyValue>) =>
              shape.setProperties(props),
          });
        }
      });
    } else {
      this.scheme.lines.forEach((line) => {
        elementMap.set(line.id, {
          id: line.id,
          getProperties: () => line.getProperties(),
          setProperties: (props: Record<string, PropertyValue>) =>
            line.setProperties(props),
        });
      });
    }

    return this.elementIds
      .map((id) => {
        const element = elementMap.get(id);
        if (!element) {
          LoggingService.warn(`${this.elementType} with id ${id} not found`);
          return null;
        }
        return element;
      })
      .filter((el): el is ElementWithProperties => el !== null);
  }

  execute(): void {
    this.previousChanges = [];
    const elements = this.findElements();

    elements.forEach((element) => {
      const currentProperties = element.getProperties() as Record<
        string,
        unknown
      >;

      const previousProperties: Record<string, PropertyValue> = {};
      Object.keys(this.properties).forEach((key) => {
        previousProperties[key] = currentProperties[key] as PropertyValue;
      });

      this.previousChanges.push({
        elementId: element.id,
        elementType: this.elementType,
        previousProperties,
      });

      element.setProperties(this.properties);
    });

    this.scheme.notifyObservers();
  }

  undo(): void {
    const elements = this.findElements();
    const elementMap = new Map(elements.map((el) => [el.id, el]));

    this.previousChanges.forEach((change) => {
      const element = elementMap.get(change.elementId);
      if (element) {
        element.setProperties(change.previousProperties);
      } else {
        LoggingService.warn(
          `${change.elementType} with id ${change.elementId} not found`,
        );
      }
    });

    this.scheme.notifyObservers();
  }
}
