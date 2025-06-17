import { ShapeFactory } from "../core/services/ShapeFactory";
import { CommandManager } from "../core/managers/CommandManager";
import { SelectionManager } from "../core/managers/SelectionManager";
import { EditorStateManager } from "../core/managers/EditorStateManager";
import { Scheme } from "../models/Scheme";
import { BaseShape } from "../models/BaseShape";
import { Line } from "../models/Line";
import type {
  CanvasMouseEventData,
  CanvasKeyboardEventData,
} from "../core/states/IEditorState";
import { v4 as uuidv4 } from "uuid";
import type Konva from "konva";
import {
  StorageService,
  type SchemeMetadata,
} from "../core/services/StorageService";
import { LoggingService } from "../core/services/LoggingService";

let instanceCounter = 0;

class AppController {
  private commandManager: CommandManager;
  private selectionManager: SelectionManager;
  private editorStateManager: EditorStateManager;
  private shapeFactory: ShapeFactory;
  private scheme: Scheme;
  private konvaStage: Konva.Stage | null = null;
  private storageService: StorageService;
  private instanceId: number;

  constructor() {
    this.instanceId = ++instanceCounter;

    this.commandManager = new CommandManager();
    this.selectionManager = new SelectionManager();
    this.shapeFactory = new ShapeFactory();
    this.storageService = new StorageService();

    this.scheme = new Scheme({
      id: uuidv4(),
      name: "New Scheme",
      shapes: [],
      lines: [],
      lastModified: Date.now(),
    });

    this.editorStateManager = new EditorStateManager({
      commandManager: this.commandManager,
      selectionManager: this.selectionManager,
      scheme: this.scheme,
      shapeFactory: this.shapeFactory,
    });

    this.editorStateManager.setDefaultState();

    LoggingService.info(
      `AppController initialized (instance #${this.instanceId}). Current editor state:`,
      this.editorStateManager.getCurrentStateName()
    );
    LoggingService.info("SelectionManager initialized.");

    LoggingService.debug(
      `Command manager initialized for instance #${this.instanceId}`
    );
  }

  public requestCreateShape(
    shapeType: string,
    properties: Record<string, unknown> = {}
  ): void {
    import("../Commands/CreateShapeCommand").then(({ CreateShapeCommand }) => {
      const simpleProperties: Record<string, string | number | boolean> = {};
      Object.entries(properties).forEach(([key, value]) => {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          simpleProperties[key] = value;
        }
      });

      const createCommand = new CreateShapeCommand(
        this.scheme,
        this.shapeFactory,
        shapeType,
        simpleProperties
      );
      this.commandManager.executeCommand(createCommand);
    });
  }

  public async getAvailableShapeTypes(): Promise<
    Array<{
      type: string;
      label: string;
      defaultProperties: Record<string, unknown>;
    }>
  > {
    const { shapePluginRegistry } = await import(
      "../plugins/ShapePluginRegistry"
    );
    return shapePluginRegistry.getAllPluginDefinitions().map((plugin) => ({
      type: plugin.type,
      label: plugin.label,
      defaultProperties: plugin.defaultProperties,
    }));
  }

  public getCurrentShapes(): BaseShape[] {
    return this.scheme.getShapes();
  }

  public getCurrentLines(): Line[] {
    return this.scheme.getLines();
  }

  public undo(): boolean {
    const historySize = this.commandManager.getHistorySize();
    LoggingService.debug(
      `AppController (instance #${this.instanceId}): Attempting undo. History: ${historySize.undoCount} undo, ${historySize.redoCount} redo`
    );

    const success = this.commandManager.undo();
    LoggingService.info(
      success
        ? `AppController (instance #${this.instanceId}): Undo successful`
        : `AppController (instance #${this.instanceId}): Nothing to undo`
    );
    return success;
  }

  public redo(): boolean {
    const historySize = this.commandManager.getHistorySize();
    LoggingService.debug(
      `AppController (instance #${this.instanceId}): Attempting redo. History: ${historySize.undoCount} undo, ${historySize.redoCount} redo`
    );

    const success = this.commandManager.redo();
    LoggingService.info(
      success
        ? `AppController (instance #${this.instanceId}): Redo successful`
        : `AppController (instance #${this.instanceId}): Nothing to redo`
    );
    return success;
  }

  public canUndo(): boolean {
    return this.commandManager.canUndo();
  }

  public canRedo(): boolean {
    return this.commandManager.canRedo();
  }

  public getCommandHistoryInfo(): {
    undoCount: number;
    redoCount: number;
    instanceId: number;
  } {
    const historySize = this.commandManager.getHistorySize();
    return {
      undoCount: historySize.undoCount,
      redoCount: historySize.redoCount,
      instanceId: this.instanceId,
    };
  }

  public selectElement(elementId: string, multiSelect: boolean = false): void {
    this.selectionManager.selectElement(elementId, multiSelect);
  }

  public clearAllSelections(): void {
    this.selectionManager.clearSelection();
  }

  public isElementSelected(elementId: string): boolean {
    return this.selectionManager.isSelected(elementId);
  }

  public getSelectedElementIds(): string[] {
    const result = this.selectionManager.getSelectedIds();

    if (!Array.isArray(result)) {
      LoggingService.error(
        "ERROR: getSelectedIds() returned non-array:",
        result
      );
      return [];
    }

    const validIds: string[] = [];
    const invalidItems: unknown[] = [];

    result.forEach((item) => {
      if (typeof item === "string") {
        validIds.push(item);
      } else {
        invalidItems.push(item);
      }
    });

    if (invalidItems.length > 0) {
      LoggingService.error(
        "ERROR: getSelectedIds() returned non-string items:",
        invalidItems,
        "Full result:",
        result
      );
      LoggingService.error("Stack trace:", new Error().stack);
    }

    return validIds;
  }

  public getSelectedShapes(): BaseShape[] {
    return this.selectionManager.getSelectedShapes(this.scheme);
  }

  public getSelectedLines(): Line[] {
    return this.selectionManager.getSelectedLines(this.scheme);
  }

  public getSelectedElements(): (BaseShape | Line)[] {
    return this.selectionManager.getSelectedElements(this.scheme);
  }

  public getSelectionCount(): number {
    return this.selectionManager.getSelectionCount();
  }

  public onSelectionChanged(listener: (event: unknown) => void): void {
    this.selectionManager.onSelectionChanged(listener);
  }

  public offSelectionChanged(listener: (event: unknown) => void): void {
    this.selectionManager.offSelectionChanged(listener);
  }

  public startAddingShape(shapeType: string): void {
    const defaultProperties = this.shapeFactory.getDefaultProperties(shapeType);
    this.editorStateManager.setAddingShapeState(shapeType, defaultProperties);
  }

  public startDrawingLine(): void {
    LoggingService.info("AppController: Starting drawing line mode");
    this.editorStateManager.setDrawingLineState();
  }

  public startDrawingLineFromConnectionPoint(
    shapeId: string,
    pointId: string
  ): void {
    LoggingService.info("AppController: Starting line from connection point");
    this.editorStateManager.setDrawingLineState({
      fromShapeId: shapeId,
      fromPointId: pointId,
    });
  }

  public finishLineToConnectionPoint(
    targetShapeId: string,
    targetPointId: string
  ): void {
    this.editorStateManager.finishLineToConnectionPoint(
      targetShapeId,
      targetPointId
    );
  }

  public isInDrawingLineMode(): boolean {
    return this.editorStateManager.isInDrawingLineMode();
  }

  public cancelCurrentAction(): void {
    this.editorStateManager.setDefaultState();
  }

  public getCurrentStateName(): string {
    return this.editorStateManager.getCurrentStateName();
  }

  public getLinePreview(): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null {
    return this.editorStateManager.getLinePreview();
  }

  public getSelectionBox(): {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  } | null {
    return this.editorStateManager.getSelectionBox();
  }

  public handleCanvasMouseDown(event: CanvasMouseEventData): void {
    this.editorStateManager.handleCanvasMouseDown(event);
  }

  public handleCanvasMouseMove(event: CanvasMouseEventData): void {
    this.editorStateManager.handleCanvasMouseMove(event);
  }

  public handleCanvasMouseUp(event: CanvasMouseEventData): void {
    this.editorStateManager.handleCanvasMouseUp(event);
  }

  public handleCanvasDoubleClick(event: CanvasMouseEventData): void {
    this.editorStateManager.handleCanvasDoubleClick(event);
  }

  public handleKeyDown(event: CanvasKeyboardEventData): void {
    this.editorStateManager.handleKeyDown(event);
  }

  public handleKeyUp(event: CanvasKeyboardEventData): void {
    this.editorStateManager.handleKeyUp(event);
  }

  public setKonvaStage(stage: Konva.Stage): void {
    this.konvaStage = stage;
    LoggingService.info("AppController: Konva Stage has been set.");
  }

  public getKonvaStage(): Konva.Stage | null {
    return this.konvaStage;
  }

  public saveScheme(): void {
    let previewData: string | undefined;
    if (this.konvaStage) {
      try {
        previewData = this.konvaStage.toDataURL({
          pixelRatio: 0.1,
          mimeType: "image/png",
          quality: 0.8,
        });
      } catch (error) {
        LoggingService.warn(
          "AppController: Failed to generate preview:",
          error
        );
        previewData = undefined;
      }
    } else {
      LoggingService.warn(
        "AppController: No Konva Stage available for preview generation"
      );
    }

    import("../Commands/SaveToDbCommand").then(({ SaveToDbCommand }) => {
      const saveCommand = new SaveToDbCommand(
        this.scheme,
        this.storageService,
        previewData
      );
      this.commandManager.executeCommand(saveCommand);
    });
  }

  public saveSchemeAsFile(): void {
    LoggingService.info("AppController: Save scheme as file requested");
    import("../Commands/ExportToFileCommand").then(
      ({ ExportToFileCommand }) => {
        const exportCommand = new ExportToFileCommand(this.scheme);
        this.commandManager.executeCommand(exportCommand);
      }
    );
  }

  public importSchemeFromFile(): void {
    LoggingService.info("AppController: Import scheme from file requested");
    import("../Commands/ImportFromFileCommand").then(
      ({ ImportFromFileCommand }) => {
        const importCommand = new ImportFromFileCommand(
          this.scheme,
          this.shapeFactory,
          {
            onSuccess: (importedScheme: Scheme) => {
              this.setScheme(importedScheme);
            },
            onError: (error: Error) =>
              LoggingService.error("Import failed:", error),
          }
        );
        this.commandManager.executeCommand(importCommand);
      }
    );
  }

  public getCommandManager(): CommandManager {
    return this.commandManager;
  }

  public getSelectionManager(): SelectionManager {
    return this.selectionManager;
  }

  public getShapeFactory(): ShapeFactory {
    return this.shapeFactory;
  }

  public getScheme(): Scheme {
    return this.scheme;
  }

  public setScheme(scheme: Scheme, clearCommandHistory: boolean = true): void {
    LoggingService.info(
      `AppController (instance #${this.instanceId}): Setting new scheme:`,
      scheme.name
    );

    this.selectionManager.clearSelection();
    this.editorStateManager.setDefaultState();

    if (clearCommandHistory) {
      this.commandManager.clearHistory();
      LoggingService.debug(
        `AppController (instance #${this.instanceId}): Command history cleared for new scheme`
      );
    }

    this.scheme = scheme;

    this.editorStateManager.updateDependencies({
      scheme: this.scheme,
      commandManager: this.commandManager,
      selectionManager: this.selectionManager,
      shapeFactory: this.shapeFactory,
    });

    LoggingService.info(
      `AppController (instance #${this.instanceId}): New scheme set successfully with`,
      scheme.getShapes().length,
      "shapes"
    );
  }

  public getEditorStateManager(): EditorStateManager {
    return this.editorStateManager;
  }

  public convertKonvaMouseEvent(
    konvaEvent: Konva.KonvaEventObject<MouseEvent>
  ): CanvasMouseEventData {
    const stage = konvaEvent.target.getStage();
    const pointerPosition = stage?.getPointerPosition() || { x: 0, y: 0 };

    return {
      x: pointerPosition.x,
      y: pointerPosition.y,
      stageX: pointerPosition.x,
      stageY: pointerPosition.y,
      button: konvaEvent.evt.button,
      ctrlKey: konvaEvent.evt.ctrlKey,
      shiftKey: konvaEvent.evt.shiftKey,
      altKey: konvaEvent.evt.altKey,
      target: konvaEvent.target,
    };
  }

  public convertKeyboardEvent(
    keyboardEvent: KeyboardEvent
  ): CanvasKeyboardEventData {
    return {
      key: keyboardEvent.key,
      code: keyboardEvent.code,
      ctrlKey: keyboardEvent.ctrlKey,
      shiftKey: keyboardEvent.shiftKey,
      altKey: keyboardEvent.altKey,
      metaKey: keyboardEvent.metaKey,
    };
  }

  public sendToBack(shapeId: string): void {
    const shape = this.scheme.getShapeById(shapeId);
    if (!shape) {
      LoggingService.error(`Shape with id ${shapeId} not found`);
      return;
    }

    const allShapes = this.scheme.getShapes();
    const minZIndex = Math.min(...allShapes.map((s) => s.getZIndex()));
    const newZIndex = minZIndex - 1;

    import("../Commands/ChangePropertyCommand").then(
      ({ ChangePropertyCommand }) => {
        const command = new ChangePropertyCommand(
          this.scheme,
          shapeId,
          { zIndex: newZIndex },
          "shape"
        );
        this.commandManager.executeCommand(command);
        LoggingService.info(
          `Shape ${shapeId} sent to back with z-index: ${newZIndex}`
        );
      }
    );
  }

  public bringToFront(shapeId: string): void {
    const shape = this.scheme.getShapeById(shapeId);
    if (!shape) {
      LoggingService.error(`Shape with id ${shapeId} not found`);
      return;
    }

    const allShapes = this.scheme.getShapes();
    const maxZIndex = Math.max(...allShapes.map((s) => s.getZIndex()));
    const newZIndex = maxZIndex + 1;

    import("../Commands/ChangePropertyCommand").then(
      ({ ChangePropertyCommand }) => {
        const command = new ChangePropertyCommand(
          this.scheme,
          shapeId,
          { zIndex: newZIndex },
          "shape"
        );
        this.commandManager.executeCommand(command);
        LoggingService.info(
          `Shape ${shapeId} brought to front with z-index: ${newZIndex}`
        );
      }
    );
  }

  public deleteShape(shapeId: string): void {
    import("../Commands/DeleteElementCommand").then(
      ({ DeleteElementCommand }) => {
        const command = new DeleteElementCommand(this.scheme, shapeId);
        this.commandManager.executeCommand(command);

        if (this.selectionManager.isSelected(shapeId)) {
          this.selectionManager.deselectElement(shapeId);
        }

        LoggingService.info(`Shape ${shapeId} deleted`);
      }
    );
  }

  public async getAllSchemes(): Promise<SchemeMetadata[]> {
    return this.storageService.getAllSchemesFromDB();
  }

  public async deleteSchemeFromStorage(schemeId: string): Promise<void> {
    return this.storageService.deleteSchemeFromDB(schemeId);
  }

  public logInfo(message: string, ...args: unknown[]): void {
    LoggingService.info(message, ...args);
  }

  public logError(message: string, ...args: unknown[]): void {
    LoggingService.error(message, ...args);
  }

  public logDebug(message: string, ...args: unknown[]): void {
    LoggingService.debug(message, ...args);
  }

  public logWarn(message: string, ...args: unknown[]): void {
    LoggingService.warn(message, ...args);
  }

  public executeChangePropertyCommand(
    shapeId: string,
    properties: Record<string, unknown>,
    elementType: "shape" | "line" = "shape"
  ): void {
    import("../Commands/ChangePropertyCommand").then(
      ({ ChangePropertyCommand }) => {
        const simpleProperties: Record<string, string | number | boolean> = {};
        Object.entries(properties).forEach(([key, value]) => {
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            simpleProperties[key] = value;
          }
        });

        const command = new ChangePropertyCommand(
          this.scheme,
          shapeId,
          simpleProperties,
          elementType
        );
        this.commandManager.executeCommand(command);
      }
    );
  }

  public executeChangeMultiplePropertiesCommand(
    elementIds: string[],
    properties: Record<string, unknown>,
    elementType: "shape" | "line" = "shape"
  ): void {
    import("../Commands/ChangeMultiplePropertiesCommand").then(
      ({ ChangeMultiplePropertiesCommand }) => {
        const simpleProperties: Record<string, string | number | boolean> = {};
        Object.entries(properties).forEach(([key, value]) => {
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            simpleProperties[key] = value;
          }
        });

        const command = new ChangeMultiplePropertiesCommand(
          this.scheme,
          elementIds,
          simpleProperties,
          elementType
        );
        this.commandManager.executeCommand(command);
      }
    );
  }

  public async loadSchemeFromStorage(schemeId: string): Promise<Scheme | null> {
    LoggingService.info(
      `AppController: Loading scheme from storage with ID: ${schemeId}`
    );

    try {
      const schemeData = await this.storageService.getSchemeDataFromDB(
        schemeId
      );
      if (schemeData) {
        LoggingService.info(
          `AppController: Creating scheme from loaded data. Shapes: ${schemeData.shapes.length}, Lines: ${schemeData.lines.length}`
        );
        const scheme = Scheme.fromJSON(schemeData, this.shapeFactory);
        LoggingService.info(
          `AppController: Successfully loaded scheme "${scheme.name}" with ${
            scheme.getShapes().length
          } shapes and ${scheme.getLines().length} lines`
        );
        return scheme;
      } else {
        LoggingService.warn(
          `AppController: No scheme data found for ID: ${schemeId}`
        );
      }
      return null;
    } catch (error) {
      LoggingService.error("Failed to load scheme:", error);
      return null;
    }
  }
}

const appController = new AppController();

export default appController;
