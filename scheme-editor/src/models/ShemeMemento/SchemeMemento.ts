import type { Line } from "../Line";
import type { BaseShape } from "../BaseShape";
import type { ISchemeMemento } from "./ISchemeMemento";

class SchemeMemento implements ISchemeMemento {
  shapes: BaseShape[];
  lines: Line[];
  lastModified: number;

  constructor(shapes: BaseShape[], lines: Line[], lastModified: number) {
    this.shapes = shapes.map((shape) => shape.clone());
    this.lines = lines.map((line) => line.clone());
    this.lastModified = lastModified;
  }

  getShapes(): BaseShape[] {
    return this.shapes;
  }

  getLines(): Line[] {
    return this.lines;
  }

  getLastModified(): number {
    return this.lastModified;
  }
}

export default SchemeMemento;
