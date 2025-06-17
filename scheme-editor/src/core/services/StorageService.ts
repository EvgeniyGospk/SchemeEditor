import type { Scheme } from "../../models/Scheme";
import type { UID } from "../../types/common";
import type { BaseShapeProperties } from "../../models/BaseShape";
import type { LineProperties } from "../../models/Line";
import { LoggingService } from "./LoggingService";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface SchemeMetadata {
  id: UID;
  name: string;
  lastModified: number;
  preview?: string;
}

export interface SchemeStoreData {
  id: UID;
  name: string;
  lastModified: number;
  shapes: BaseShapeProperties[];
  lines: LineProperties[];
  preview?: string;
}

interface SchemeEditorDB extends DBSchema {
  schemes: {
    key: UID;
    value: SchemeStoreData;
    indexes: {
      name: string;
      lastModified: number;
    };
  };
}

export class StorageService {
  private readonly dbName = "SchemeEditorDB";
  private readonly storeName = "schemes";
  private readonly version = 1;
  private dbPromise: Promise<IDBPDatabase<SchemeEditorDB>>;

  constructor() {
    this.dbPromise = openDB<SchemeEditorDB>(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("schemes")) {
          const store = db.createObjectStore("schemes", { keyPath: "id" });
          store.createIndex("name", "name");
          store.createIndex("lastModified", "lastModified");
        }
      },
    });
  }

  async getAllSchemesFromDB(): Promise<SchemeMetadata[]> {
    try {
      const db = await this.dbPromise;
      const schemes = await db.getAll(this.storeName);
      return schemes.map((scheme) => ({
        id: scheme.id,
        name: scheme.name,
        lastModified: scheme.lastModified,
        preview: scheme.preview,
      }));
    } catch (error) {
      LoggingService.error("Failed to fetch schemes from IndexedDB:", error);
      throw new Error("Failed to fetch schemes");
    }
  }

  async getSchemeDataFromDB(id: UID): Promise<SchemeStoreData | undefined> {
    LoggingService.info(`StorageService: Loading scheme with ID: ${id}`);

    try {
      const db = await this.dbPromise;
      const result = await db.get(this.storeName, id);

      if (result) {
        LoggingService.info(
          `StorageService: Successfully loaded scheme "${result.name}" with ${result.shapes.length} shapes and ${result.lines.length} lines`,
        );
        LoggingService.debug("StorageService: Loaded data:", {
          id: result.id,
          name: result.name,
          shapesCount: result.shapes.length,
          linesCount: result.lines.length,
          lastModified: result.lastModified,
        });
      } else {
        LoggingService.warn(`StorageService: No scheme found with ID: ${id}`);
      }

      return result;
    } catch (error) {
      LoggingService.error("Failed to fetch scheme from IndexedDB:", error);
      throw new Error("Failed to fetch scheme");
    }
  }

  async saveSchemeToDB(scheme: Scheme, preview?: string): Promise<void> {
    const storeData: SchemeStoreData = {
      ...scheme.toJSON(),
      preview: preview,
    };

    LoggingService.info(
      `StorageService: Saving scheme "${scheme.name}" to IndexedDB`,
    );
    LoggingService.debug("StorageService: Data being saved:", {
      id: storeData.id,
      name: storeData.name,
      shapesCount: storeData.shapes.length,
      linesCount: storeData.lines.length,
      hasPreview: !!preview,
      lastModified: storeData.lastModified,
    });

    try {
      const db = await this.dbPromise;
      await db.put(this.storeName, storeData);
      LoggingService.info(
        `StorageService: Successfully saved scheme "${scheme.name}" to IndexedDB`,
      );
    } catch (error) {
      LoggingService.error(
        `Failed to save scheme "${scheme.name}" to IndexedDB:`,
        error,
      );
      throw new Error("Failed to save scheme");
    }
  }

  async deleteSchemeFromDB(id: UID): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.delete(this.storeName, id);
    } catch (error) {
      LoggingService.error("Failed to delete scheme from DB:", error);
      throw new Error("Failed to delete scheme");
    }
  }

  exportSchemeToFile(scheme: Scheme): void {
    const data = scheme.toJSON();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${scheme.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async importSchemeFromFile(): Promise<SchemeStoreData | undefined> {
    try {
      const fileContent = await this._selectAndReadFile();
      return JSON.parse(fileContent) as SchemeStoreData;
    } catch (error) {
      LoggingService.error("File import failed:", error);
      return undefined;
    }
  }

  private _selectAndReadFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          return reject(new Error("No file selected."));
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file."));
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }
}
