import {
  BaseShape,
  type BaseShapeProperties,
  type ConnectionPoint,
} from "../BaseShape";

export interface UmlComponentShapeProperties extends BaseShapeProperties {
  componentName: string;
  width: number;
  height: number;
}

export class UmlComponentShape
  extends BaseShape
  implements UmlComponentShapeProperties
{
  componentName: string;
  width: number;
  height: number;

  constructor(props: UmlComponentShapeProperties) {
    super(props);
    this.type = "umlComponent";
    this.componentName = props.componentName;
    this.width = props.width;
    this.height = props.height;
  }

  getProperties(): UmlComponentShapeProperties {
    return {
      ...super.getProperties(),
      componentName: this.componentName,
      width: this.width,
      height: this.height,
    };
  }

  setProperties(properties: Partial<UmlComponentShapeProperties>): void {
    super.setProperties(properties);
    if (properties.componentName !== undefined) {
      this.componentName = properties.componentName;
    }
    if (properties.width !== undefined) {
      this.width = properties.width;
    }
    if (properties.height !== undefined) {
      this.height = properties.height;
    }
  }

  clone(): UmlComponentShape {
    return new UmlComponentShape(this.getProperties());
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
