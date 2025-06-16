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
