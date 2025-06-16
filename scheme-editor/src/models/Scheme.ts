import type { UID } from "../types/common";
import { Line } from "./Line";
import type { BaseShape } from "./BaseShape";
import type { ISchemeMemento } from "./ShemeMemento/ISchemeMemento";
import SchemeMemento from "./ShemeMemento/SchemeMemento";
import type { SchemeStoreData } from "../core/services/StorageService";
import { Subject } from "../ObserverPattern/Subject";
import type { ShapeFactory } from "../core/services/ShapeFactory";

export interface SchemeProperties {
  id: UID;
  name: string;
  shapes: BaseShape[];
  lines: Line[];
  lastModified: number;
}

export class Scheme extends Subject implements SchemeProperties {
  id: UID;
  name: string;
  shapes: BaseShape[];
  lines: Line[];
  lastModified: number;

  constructor(props: SchemeProperties) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.shapes = props.shapes;
    this.lines = props.lines;
    this.lastModified = props.lastModified;
  }

  getProperties(): object {
    return {
      id: this.id,
      name: this.name,
      shapes: this.shapes,
      lines: this.lines,
      lastModified: this.lastModified,
    };
  }

  setProperties(properties: Partial<SchemeProperties>): void {
    if (properties.name !== undefined) {
      this.name = properties.name;
    }
    if (properties.shapes !== undefined) {
      this.shapes = properties.shapes;
    }
    if (properties.lines !== undefined) {
      this.lines = properties.lines;
    }
    if (properties.lastModified !== undefined) {
      this.lastModified = properties.lastModified;
    }
  }

  toJSON(): SchemeStoreData {
    return {
      id: this.id,
      name: this.name,
      lastModified: this.lastModified,
      shapes: this.shapes.map((shape) => shape.getProperties()),
      lines: this.lines.map((line) => line.getProperties()),
    };
  }

  createMemento(): ISchemeMemento {
    return new SchemeMemento(this.shapes, this.lines, this.lastModified);
  }

  restoreFromMemento(memento: ISchemeMemento): void {
    this.shapes = memento.getShapes();
    this.lines = memento.getLines();
    this.lastModified = memento.getLastModified();
  }

  getShapes(): BaseShape[] {
    return [...this.shapes];
  }

  getLines(): Line[] {
    return [...this.lines];
  }

  getShapeById(id: string): BaseShape | undefined {
    return this.shapes.find((shape) => shape.getId() === id);
  }

  getLineById(id: string): Line | undefined {
    return this.lines.find((line) => line.id === id);
  }

  addShape(shape: BaseShape): void {
    this.shapes.push(shape);
    this.lastModified = Date.now();
    this.notifyObservers();
  }

  removeShape(shapeId: string): boolean {
    const index = this.shapes.findIndex((shape) => shape.getId() === shapeId);
    if (index !== -1) {
      this.shapes.splice(index, 1);

      this.lines = this.lines.filter(
        (line) => line.fromShapeId !== shapeId && line.toShapeId !== shapeId,
      );
      this.lastModified = Date.now();
      this.notifyObservers();
      return true;
    }
    return false;
  }

  updateShape(shape: BaseShape): void {
    const index = this.shapes.findIndex((s) => s.getId() === shape.getId());
    if (index !== -1) {
      this.shapes[index] = shape;
      this.lastModified = Date.now();
      this.notifyObservers();
    }
  }

  addLine(line: Line): void {
    this.lines.push(line);
    this.lastModified = Date.now();
    this.notifyObservers();
  }

  removeLine(lineId: string): boolean {
    const index = this.lines.findIndex((line) => line.id === lineId);
    if (index !== -1) {
      this.lines.splice(index, 1);
      this.lastModified = Date.now();
      this.notifyObservers();
      return true;
    }
    return false;
  }

  updateLine(line: Line): void {
    const index = this.lines.findIndex((l) => l.id === line.id);
    if (index !== -1) {
      this.lines[index] = line;
      this.lastModified = Date.now();
      this.notifyObservers();
    }
  }

  getLinesConnectedToShape(shapeId: string): Line[] {
    return this.lines.filter(
      (line) => line.fromShapeId === shapeId || line.toShapeId === shapeId,
    );
  }

  static fromJSON(data: SchemeStoreData, shapeFactory: ShapeFactory): Scheme {
    const shapes: BaseShape[] = [];

    for (const shapeData of data.shapes) {
      const shape = shapeFactory.createShape(shapeData.type, shapeData);
      if (shape) {
        shapes.push(shape);
      }
    }

    const lines: Line[] = data.lines.map((lineData) => new Line(lineData));

    return new Scheme({
      id: data.id,
      name: data.name,
      shapes,
      lines,
      lastModified: data.lastModified,
    });
  }
}
