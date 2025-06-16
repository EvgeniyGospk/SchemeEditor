import type React from "react";
import type { BaseShapeProperties } from "../models/BaseShape";
import type { RectangleShapeProperties } from "../models/shapes/RectangleShape";
import type { CircleShapeProperties } from "../models/shapes/CircleShape";
import type { UmlClassShapeProperties } from "../models/shapes/UmlClassShape";
import type { UmlComponentShapeProperties } from "../models/shapes/UmlComponentShape";

export type AnyShapeProperties =
  | BaseShapeProperties
  | RectangleShapeProperties
  | CircleShapeProperties
  | UmlClassShapeProperties
  | UmlComponentShapeProperties;

export interface PropertyUIDefinition {
  key:
    | keyof BaseShapeProperties
    | keyof RectangleShapeProperties
    | keyof CircleShapeProperties
    | keyof UmlClassShapeProperties
    | keyof UmlComponentShapeProperties;
  label: string;
  type: "text" | "number" | "color" | "textarea";
}

export interface ShapePluginDefinition<
  T extends AnyShapeProperties = AnyShapeProperties,
> {
  type: T["type"];
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  defaultProperties: Partial<T>;
  propertyUIDefinitions?: PropertyUIDefinition[];
}
