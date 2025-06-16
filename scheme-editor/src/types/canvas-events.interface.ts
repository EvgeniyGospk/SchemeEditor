import type Konva from "konva";

export interface Point {
  x: number;
  y: number;
}

export interface CanvasMouseEventData {
  originalEvent: MouseEvent | TouchEvent;
  konvaEvent?: Konva.KonvaEventObject<MouseEvent | TouchEvent>;
  pointerPosition: Point;
  targetShapeId?: string;
}

export interface CanvasKeyboardEventData {
  originalEvent: KeyboardEvent;
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}
