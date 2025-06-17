import type { ICommand } from "./ICommand";
import { Scheme } from "../models/Scheme";
import { StorageService } from "../core/services/StorageService";
import { LoggingService } from "../core/services/LoggingService";

export class SaveToDbCommand implements ICommand {
  private scheme: Scheme;
  private storageService: StorageService;
  private preview?: string;

  constructor(
    scheme: Scheme,
    storageService: StorageService,
    preview?: string,
  ) {
    this.scheme = scheme;
    this.storageService = storageService;
    this.preview = preview;
  }

  execute(): void {
    this.scheme.lastModified = Date.now();

    LoggingService.info(
      `SaveToDbCommand: Attempting to save scheme "${this.scheme.name}" with ${
        this.scheme.getShapes().length
      } shapes and ${this.scheme.getLines().length} lines`,
    );
    LoggingService.debug("SaveToDbCommand: Scheme data:", {
      id: this.scheme.id,
      name: this.scheme.name,
      shapesCount: this.scheme.getShapes().length,
      linesCount: this.scheme.getLines().length,
      lastModified: this.scheme.lastModified,
    });

    this.storageService
      .saveSchemeToDB(this.scheme, this.preview)
      .then(() => {
        LoggingService.info(
          `Scheme "${this.scheme.name}" saved to IndexedDB with preview`,
        );
      })
      .catch((error) => {
        LoggingService.error("Failed to save scheme:", error);
      });
  }

  undo(): void {}
}
