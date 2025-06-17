import type { ICommand } from "./ICommand";
import { Scheme } from "../models/Scheme";
import { Line } from "../models/Line";
import type { UID } from "../types/common";
import { v4 as uuidv4 } from "uuid";

interface CreateLineProperties {
  fromShapeId: UID;
  fromConnectionPointId: string;
  toShapeId: UID;
  toConnectionPointId: string;
}

export class CreateLineCommand implements ICommand {
  private scheme: Scheme;
  private lineProperties: CreateLineProperties;
  private createdLine: Line | null = null;
  private readonly lineId: string;

  constructor(scheme: Scheme, lineProperties: CreateLineProperties) {
    this.scheme = scheme;
    this.lineProperties = lineProperties;
    this.lineId = uuidv4();
  }

  execute(): void {
    if (this.createdLine) {
      this.scheme.addLine(this.createdLine);
      return;
    }

    this.createdLine = new Line({
      id: this.lineId,
      fromShapeId: this.lineProperties.fromShapeId,
      fromConnectionPointId: this.lineProperties.fromConnectionPointId,
      toShapeId: this.lineProperties.toShapeId,
      toConnectionPointId: this.lineProperties.toConnectionPointId,
      strokeColor: "#000000",
      strokeWidth: 2,
      zIndex: 0,
    });

    this.scheme.addLine(this.createdLine);
    this.scheme.notifyObservers();
  }

  undo(): void {
    if (this.createdLine) {
      this.scheme.removeLine(this.createdLine.id);
    }
    this.scheme.notifyObservers();
  }
}
