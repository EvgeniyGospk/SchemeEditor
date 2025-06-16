import type {
  ShapePluginDefinition,
  PropertyUIDefinition,
} from "../../types/plugins.interface.ts";
import type { CircleShapeProperties } from "../../models/shapes";

const circlePropertyUIDefinitions: PropertyUIDefinition[] = [
  { key: "text", label: "Текст", type: "text" },
  { key: "radius", label: "Радиус", type: "number" },
  { key: "x", label: "X", type: "number" },
  { key: "y", label: "Y", type: "number" },
  { key: "fillColor", label: "Цвет заливки", type: "color" },
  { key: "strokeColor", label: "Цвет обводки", type: "color" },
  { key: "strokeWidth", label: "Толщина обводки", type: "number" },
];

export const circlePlugin: ShapePluginDefinition<CircleShapeProperties> = {
  type: "circle",
  label: "Круг",

  defaultProperties: {
    text: "Круг",
    fillColor: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 1,

    radius: 50,
  },
  propertyUIDefinitions: circlePropertyUIDefinitions,
};
