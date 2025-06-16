import {
  BaseShape,
  type BaseShapeProperties,
  type ConnectionPoint,
} from "../BaseShape";

export interface UmlClassShapeProperties extends BaseShapeProperties {
  className: string;
  attributes: string;
  methods: string;
  width: number;
  height: number;
}

export class UmlClassShape
  extends BaseShape
  implements UmlClassShapeProperties
{
  className: string;
  attributes: string;
  methods: string;
  width: number;
  height: number;

  constructor(props: UmlClassShapeProperties) {
    super(props);
    this.type = "umlClass";
    this.className = props.className;
    this.attributes = props.attributes;
    this.methods = props.methods;
    this.width = props.width;
    this.height = props.height;
  }

  getProperties(): UmlClassShapeProperties {
    return {
      ...super.getProperties(),
      className: this.className,
      attributes: this.attributes,
      methods: this.methods,
      width: this.width,
      height: this.height,
    };
  }

  setProperties(properties: Partial<UmlClassShapeProperties>): void {
    super.setProperties(properties);
    if (properties.className !== undefined) {
      this.className = properties.className;
    }
    if (properties.attributes !== undefined) {
      this.attributes = properties.attributes;
    }
    if (properties.methods !== undefined) {
      this.methods = properties.methods;
    }
    if (properties.width !== undefined) {
      this.width = properties.width;
    }
    if (properties.height !== undefined) {
      this.height = properties.height;
    }
  }

  clone(): UmlClassShape {
    return new UmlClassShape(this.getProperties());
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
