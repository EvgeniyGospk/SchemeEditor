import type {
  ShapePluginDefinition,
  PropertyUIDefinition,
} from "../../types/plugins.interface.ts";
import type { UmlComponentShapeProperties } from "../../models/shapes";

const umlComponentPropertyUIDefinitions: PropertyUIDefinition[] = [
  { key: "componentName", label: "Имя компонента", type: "text" },
  { key: "width", label: "Ширина", type: "number" },
  { key: "height", label: "Высота", type: "number" },
  { key: "x", label: "X", type: "number" },
  { key: "y", label: "Y", type: "number" },
  { key: "fillColor", label: "Цвет заливки", type: "color" },
  { key: "strokeColor", label: "Цвет обводки", type: "color" },
  { key: "strokeWidth", label: "Толщина обводки", type: "number" },
];

export const umlComponentPlugin: ShapePluginDefinition<UmlComponentShapeProperties> =
  {
    type: "umlComponent",
    label: "Компонент UML",
    defaultProperties: {
      fillColor: "#E0FFE0",
      strokeColor: "#000000",
      strokeWidth: 1,
      width: 180,
      height: 100,
      componentName: "NewComponent",
    },
    propertyUIDefinitions: umlComponentPropertyUIDefinitions,
  };
