import {
  BaseShape,
  type BaseShapeProperties,
  type ConnectionPoint,
} from "../BaseShape";

export interface CircleShapeProperties extends BaseShapeProperties {
  radius: number;
}

export class CircleShape extends BaseShape implements CircleShapeProperties {
  radius: number;

  constructor(props: CircleShapeProperties) {
    super(props);
    this.type = "circle";
    this.radius = props.radius;
  }

  getProperties(): CircleShapeProperties {
    return {
      ...super.getProperties(),
      radius: this.radius,
    };
  }

  setProperties(properties: Partial<CircleShapeProperties>): void {
    super.setProperties(properties);
    if (properties.radius !== undefined) {
      this.radius = properties.radius;
    }
  }

  clone(): CircleShape {
    return new CircleShape(this.getProperties());
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    const diameter = this.radius * 2;
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: diameter,
      height: diameter,
    };
  }

  getConnectionPoints(): ConnectionPoint[] {
    const directions = [
      "right",
      "bottom-right",
      "bottom",
      "bottom-left",
      "left",
      "top-left",
      "top",
      "top-right",
    ];

    return directions.map((direction, i) => {
      const angle = i * (Math.PI / 4);

      return {
        id: direction,
        x: this.x + Math.cos(angle) * this.radius,
        y: this.y + Math.sin(angle) * this.radius,
        label: direction,
      };
    });
  }
}
