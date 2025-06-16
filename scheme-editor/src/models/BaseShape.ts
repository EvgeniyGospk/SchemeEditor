import type { UID } from "../types/common";

export interface ConnectionPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface BaseShapeProperties {
  id: UID;
  type: string;
  x: number;
  y: number;
  zIndex: number;
  text: string;
  fillColor: string;
  strokeWidth: number;
  strokeColor: string;
}

export class BaseShape implements BaseShapeProperties {
  id: UID;
  type: string;
  x: number;
  y: number;
  zIndex: number;
  text: string;
  fillColor: string;
  strokeWidth: number;
  strokeColor: string;

  constructor(props: BaseShapeProperties) {
    this.id = props.id;
    this.type = props.type;
    this.x = props.x;
    this.y = props.y;
    this.zIndex = props.zIndex;
    this.text = props.text;
    this.fillColor = props.fillColor;
    this.strokeWidth = props.strokeWidth;
    this.strokeColor = props.strokeColor;
  }

  getProperties(): BaseShapeProperties {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      zIndex: this.zIndex,
      text: this.text,
      fillColor: this.fillColor,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
    };
  }

  setProperties(properties: Partial<BaseShapeProperties>): void {
    if (properties.x !== undefined) {
      this.x = properties.x;
    }
    if (properties.y !== undefined) {
      this.y = properties.y;
    }
    if (properties.zIndex !== undefined) {
      this.zIndex = properties.zIndex;
    }
    if (properties.text !== undefined) {
      this.text = properties.text;
    }
    if (properties.fillColor !== undefined) {
      this.fillColor = properties.fillColor;
    }
    if (properties.strokeWidth !== undefined) {
      this.strokeWidth = properties.strokeWidth;
    }
    if (properties.strokeColor !== undefined) {
      this.strokeColor = properties.strokeColor;
    }
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setZIndex(zIndex: number): void {
    this.zIndex = zIndex;
  }

  getZIndex(): number {
    return this.zIndex;
  }

  setColor(color: string): void {
    this.fillColor = color;
  }

  getColor(): string {
    return this.fillColor;
  }

  setStrokeWidth(strokeWidth: number): void {
    this.strokeWidth = strokeWidth;
  }

  getStrokeWidth(): number {
    return this.strokeWidth;
  }
  setStrokeColor(strokeColor: string): void {
    this.strokeColor = strokeColor;
  }

  getStrokeColor(): string {
    return this.strokeColor;
  }

  getType(): string {
    return this.type;
  }

  setType(type: string): void {
    this.type = type;
  }

  getId(): UID {
    return this.id;
  }

  setId(id: UID): void {
    this.id = id;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: 50,
      height: 50,
    };
  }

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  clone(): BaseShape {
    return new BaseShape({
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      zIndex: this.zIndex,
      text: this.text,
      fillColor: this.fillColor,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
    });
  }

  getConnectionPoints(): ConnectionPoint[] {
    const bounds = this.getBounds();

    return [
      {
        id: "center",
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
        label: "Center",
      },
      {
        id: "top",
        x: bounds.x + bounds.width / 2,
        y: bounds.y,
        label: "Top",
      },
      {
        id: "bottom",
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height,
        label: "Bottom",
      },
      {
        id: "left",
        x: bounds.x,
        y: bounds.y + bounds.height / 2,
        label: "Left",
      },
      {
        id: "right",
        x: bounds.x + bounds.width,
        y: bounds.y + bounds.height / 2,
        label: "Right",
      },
    ];
  }

  getConnectionPoint(pointId: string): ConnectionPoint | null {
    const points = this.getConnectionPoints();
    return points.find((point) => point.id === pointId) || null;
  }
}
