import type { Line } from "../Line";
import type { BaseShape } from "../BaseShape";

export interface ISchemeMemento {
  shapes: BaseShape[];
  lines: Line[];
  lastModified: number;
  getShapes(): BaseShape[];
  getLines(): Line[];
  getLastModified(): number;
}
