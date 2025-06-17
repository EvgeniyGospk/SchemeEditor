import type { ICommand } from "./ICommand";
import { Scheme } from "../models/Scheme";
import type { ShapeFactory } from "../core/services/ShapeFactory";
import type { SchemeStoreData } from "../core/services/StorageService";
import { v4 as uuidv4 } from "uuid";

interface ImportCallbacks {
  onSuccess?: (importedScheme: Scheme) => void;
  onError?: (error: Error) => void;
}

export class ImportFromFileCommand implements ICommand {
  private currentScheme: Scheme;
  private shapeFactory: ShapeFactory;
  private callbacks: ImportCallbacks;

  constructor(
    currentScheme: Scheme,
    shapeFactory: ShapeFactory,
    callbacks: ImportCallbacks = {},
  ) {
    this.currentScheme = currentScheme;
    this.shapeFactory = shapeFactory;
    this.callbacks = callbacks;
  }

  execute(): void {
    const input = this.createFileInput();
    input.onchange = (event) => this.handleFileSelection(event);

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  undo(): void {}

  private createFileInput(): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    return input;
  }

  private handleFileSelection(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.handleFileLoad(e);
    reader.onerror = () => this.handleError(new Error("Failed to read file"));
    reader.readAsText(file);
  }

  private handleFileLoad(event: ProgressEvent<FileReader>): void {
    try {
      const data = this.parseFileData(event.target?.result as string);

      const importedScheme = Scheme.fromJSON(
        data as SchemeStoreData,
        this.shapeFactory,
      );
      this.updateCurrentScheme(importedScheme);
      this.callbacks.onSuccess?.(this.currentScheme);
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error("Import failed"),
      );
    }
  }

  private parseFileData(content: string): unknown {
    const data = JSON.parse(content);
    this.validateSchemeData(data);
    return data;
  }

  private validateSchemeData(data: unknown): void {
    const schemeData = data as Record<string, unknown>;

    if (
      !schemeData.id ||
      !schemeData.name ||
      !Array.isArray(schemeData.shapes) ||
      !Array.isArray(schemeData.lines)
    ) {
      throw new Error("Invalid scheme file format");
    }
  }

  private updateCurrentScheme(importedScheme: Scheme): void {
    this.currentScheme.id = uuidv4();
    this.currentScheme.name = `${importedScheme.name} (imported)`;
    this.currentScheme.shapes = importedScheme.shapes;
    this.currentScheme.lines = importedScheme.lines;
    this.currentScheme.lastModified = Date.now();
  }

  private handleError(error: Error): void {
    this.callbacks.onError?.(error);
  }
}
