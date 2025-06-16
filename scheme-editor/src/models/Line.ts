import type { UID } from "../types/common";

export interface LineProperties {
  id: UID;
  fromShapeId: UID;
  fromConnectionPointId?: string;
  toShapeId: UID;
  toConnectionPointId?: string;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex?: number;
}

export class Line implements LineProperties {
  id: UID;
  fromShapeId: UID;
  fromConnectionPointId?: string;
  toShapeId: UID;
  toConnectionPointId?: string;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex?: number;

  constructor(props: LineProperties) {
    this.id = props.id;
    this.fromShapeId = props.fromShapeId;
    this.fromConnectionPointId = props.fromConnectionPointId ?? "center";
    this.toShapeId = props.toShapeId;
    this.toConnectionPointId = props.toConnectionPointId ?? "center";
    this.strokeColor = props.strokeColor ?? "#000000";
    this.strokeWidth = props.strokeWidth ?? 2;
    this.zIndex = props.zIndex ?? 0;
  }

  getProperties(): LineProperties {
    return {
      id: this.id,
      fromShapeId: this.fromShapeId,
      fromConnectionPointId: this.fromConnectionPointId,
      toShapeId: this.toShapeId,
      toConnectionPointId: this.toConnectionPointId,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      zIndex: this.zIndex,
    };
  }

  setProperties(properties: Partial<LineProperties>): void {
    if (properties.fromShapeId !== undefined) {
      this.fromShapeId = properties.fromShapeId;
    }
    if (properties.fromConnectionPointId !== undefined) {
      this.fromConnectionPointId = properties.fromConnectionPointId;
    }
    if (properties.toShapeId !== undefined) {
      this.toShapeId = properties.toShapeId;
    }
    if (properties.toConnectionPointId !== undefined) {
      this.toConnectionPointId = properties.toConnectionPointId;
    }
    if (properties.strokeColor !== undefined) {
      this.strokeColor = properties.strokeColor;
    }
    if (properties.strokeWidth !== undefined) {
      this.strokeWidth = properties.strokeWidth;
    }
    if (properties.zIndex !== undefined) {
      this.zIndex = properties.zIndex;
    }
  }

  clone(): Line {
    return new Line(this.getProperties());
  }
}
