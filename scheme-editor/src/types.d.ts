declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

import type { Node } from "konva/lib/Node";

export interface CanvasMouseEventData {
  x: number;
  y: number;
  stageX: number;
  stageY: number;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  target?: Node;
}

export interface CanvasKeyboardEventData {
  key: string;
  code: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface ShapeProperties {
  id: string;
  type: string;
  x: number;
  y: number;
  zIndex: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  text?: string;
  width?: number;
  height?: number;
  radius?: number;
}

export interface ConnectionPoint {
  id: string;
  x: number;
  y: number;
  type: "input" | "output" | "bidirectional";
}
