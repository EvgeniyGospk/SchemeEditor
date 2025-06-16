export * from "./RectangleShape";
export * from "./CircleShape";
export * from "./UmlClassShape";
export * from "./UmlComponentShape";

import type {
  RectangleShape,
  RectangleShapeProperties,
} from "./RectangleShape";
import type { CircleShape, CircleShapeProperties } from "./CircleShape";
import type { UmlClassShape, UmlClassShapeProperties } from "./UmlClassShape";
import type {
  UmlComponentShape,
  UmlComponentShapeProperties,
} from "./UmlComponentShape";
import type { BaseShapeProperties } from "../BaseShape";

export type AnyShape =
  | RectangleShape
  | CircleShape
  | UmlClassShape
  | UmlComponentShape;

export type AnyShapeProperties =
  | BaseShapeProperties
  | RectangleShapeProperties
  | CircleShapeProperties
  | UmlClassShapeProperties
  | UmlComponentShapeProperties;
