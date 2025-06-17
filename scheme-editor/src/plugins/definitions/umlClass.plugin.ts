import type {
  ShapePluginDefinition,
  PropertyUIDefinition,
} from "../../types/plugins.interface.ts";
import type { UmlClassShapeProperties } from "../../models/shapes";

const umlClassPropertyUIDefinitions: PropertyUIDefinition[] = [
  { key: "className", label: "Имя класса", type: "text" },
  { key: "attributes", label: "Атрибуты", type: "textarea" },
  { key: "methods", label: "Методы", type: "textarea" },
  { key: "width", label: "Ширина", type: "number" },
  { key: "height", label: "Высота", type: "number" },
  { key: "x", label: "X", type: "number" },
  { key: "y", label: "Y", type: "number" },
  { key: "fillColor", label: "Цвет заливки", type: "color" },
  { key: "strokeColor", label: "Цвет обводки", type: "color" },
  { key: "strokeWidth", label: "Толщина обводки", type: "number" },
];

export const umlClassPlugin: ShapePluginDefinition<UmlClassShapeProperties> = {
  type: "umlClass",
  label: "Класс UML",
  defaultProperties: {
    fillColor: "#FFFFE0",
    strokeColor: "#000000",
    strokeWidth: 1,
    zIndex: 0,

    width: 200,
    height: 150,
    className: "NewClass",
    attributes: "- attribute: Type\n- anotherAttribute: String",
    methods: "+ method(param: Type): ReturnType\n+ anotherMethod(): void",
  },
  propertyUIDefinitions: umlClassPropertyUIDefinitions,
};
