import {
  BaseShape,
  type BaseShapeProperties,
  type ConnectionPoint,
} from "../BaseShape";

export interface RectangleShapeProperties extends BaseShapeProperties {
  width: number;
  height: number;
}

export class RectangleShape
  extends BaseShape
  implements RectangleShapeProperties
{
  width: number;
  height: number;

  constructor(props: RectangleShapeProperties) {
    super(props);
    this.type = "rectangle";
    this.width = props.width;
    this.height = props.height;
  }

  getProperties(): RectangleShapeProperties {
    return {
      ...super.getProperties(),
      width: this.width,
      height: this.height,
    };
  }

  setProperties(properties: Partial<RectangleShapeProperties>): void {
    super.setProperties(properties);
    if (properties.width !== undefined) {
      this.width = properties.width;
    }
    if (properties.height !== undefined) {
      this.height = properties.height;
    }
  }

  clone(): RectangleShape {
    return new RectangleShape(this.getProperties());
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  getConnectionPoints(): ConnectionPoint[] {
    const points = [
      "right",
      "bottom-right",
      "bottom",
      "bottom-left",
      "left",
      "top-left",
      "top",
      "top-right",
    ];

    return points.map((direction) => {
      let x, y;

      switch (direction) {
        case "right":
          x = this.x + this.width;
          y = this.y + this.height / 2;
          break;
        case "bottom-right":
          x = this.x + this.width;
          y = this.y + this.height;
          break;
        case "bottom":
          x = this.x + this.width / 2;
          y = this.y + this.height;
          break;
        case "bottom-left":
          x = this.x;
          y = this.y + this.height;
          break;
        case "left":
          x = this.x;
          y = this.y + this.height / 2;
          break;
        case "top-left":
          x = this.x;
          y = this.y;
          break;
        case "top":
          x = this.x + this.width / 2;
          y = this.y;
          break;
        case "top-right":
          x = this.x + this.width;
          y = this.y;
          break;
        default:
          x = this.x;
          y = this.y;
      }

      return {
        id: direction,
        x,
        y,
        label: direction,
      };
    });
  }
}
