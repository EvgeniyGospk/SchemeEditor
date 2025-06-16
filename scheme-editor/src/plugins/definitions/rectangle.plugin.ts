import type {
  ShapePluginDefinition,
  PropertyUIDefinition,
} from "../../types/plugins.interface";
import type { RectangleShapeProperties } from "../../models/shapes/RectangleShape";

const rectanglePropertyUIDefinitions: PropertyUIDefinition[] = [
  { key: "text", label: "Текст", type: "text" },
  { key: "width", label: "Ширина", type: "number" },
  { key: "height", label: "Высота", type: "number" },
  { key: "x", label: "X", type: "number" },
  { key: "y", label: "Y", type: "number" },
  { key: "fillColor", label: "Цвет заливки", type: "color" },
  { key: "strokeColor", label: "Цвет обводки", type: "color" },
  { key: "strokeWidth", label: "Толщина обводки", type: "number" },
];

export const rectanglePlugin: ShapePluginDefinition<RectangleShapeProperties> =
  {
    type: "rectangle",
    label: "Прямоугольник",
    defaultProperties: {
      width: 150,
      height: 80,
      text: "Прямоугольник",
      fillColor: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 1,
    },
    propertyUIDefinitions: rectanglePropertyUIDefinitions,
  };
