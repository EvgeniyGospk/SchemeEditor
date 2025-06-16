import type { ICommand } from "./ICommand";
import { Scheme } from "../models/Scheme";
import { LoggingService } from "../core/services/LoggingService";

export class ExportToFileCommand implements ICommand {
  private scheme: Scheme;
  private fileName?: string;

  constructor(scheme: Scheme, fileName?: string) {
    this.scheme = scheme;
    this.fileName = fileName;
  }

  execute(): void {
    const schemeData = {
      id: this.scheme.id,
      name: this.scheme.name,
      shapes: this.scheme.shapes.map((shape) => shape.getProperties()),
      lines: this.scheme.lines.map((line) => line.getProperties()),
      lastModified: this.scheme.lastModified,
      exportedAt: Date.now(),
      version: "1.0",
    };

    const jsonString = JSON.stringify(schemeData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const fileName =
      this.fileName ||
      `${this.scheme.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    LoggingService.info(`Exported "${this.scheme.name}" to file: ${fileName}`);
  }

  undo(): void {}
}
