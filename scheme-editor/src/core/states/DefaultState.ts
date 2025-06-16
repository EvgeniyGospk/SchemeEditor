import type {
  IEditorState,
  IEditorStateManager,
  CanvasMouseEventData,
  CanvasKeyboardEventData,
} from "./IEditorState";
import { MoveShapesCommand } from "../../Commands/MoveShapesCommand";
import { DeleteElementCommand } from "../../Commands/DeleteElementCommand";
import { LoggingService } from "../services/LoggingService";
import type { ICommand } from "../../Commands/ICommand";
import type { Scheme } from "../../models/Scheme";
import type { BaseShape } from "../../models/BaseShape";
import type { ShapeFactory } from "../services/ShapeFactory";

type EditorDependencies = {
  commandManager: {
    executeCommand(command: ICommand): void;
  };
  selectionManager: {
    clearSelection(): void;
    selectElement(id: string, multiSelect?: boolean): void;
    deselectElement(id: string): void;
    getSelectedIds(): string[];
    getSelectedShapes(scheme: Scheme): BaseShape[];
    selectInArea(
      scheme: Scheme,
      area: { x: number; y: number; width: number; height: number },
      multiSelect?: boolean,
    ): void;
    selectAll(scheme: Scheme): void;
  };
  scheme: Scheme;
  shapeFactory: ShapeFactory;
};

export class DefaultState implements IEditorState {
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private isSelectionBoxActive = false;
  private selectionBoxStart = { x: 0, y: 0 };
  private currentSelectionBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  };

  private lastSelectionBoxUpdate = 0;
  private lastDragUpdate = 0;

  private dragOriginalPositions = new Map<string, { x: number; y: number }>();

  private clickedSelectedShapeInMultiSelection: string | null = null;

  private actualDragOccurred = false;

  getStateName(): string {
    return "DefaultState";
  }

  onEnterState(): void {
    LoggingService.info("DefaultState: Entered default state");

    this.isDragging = false;
    this.isSelectionBoxActive = false;
    this.currentSelectionBox.visible = false;

    if (typeof document !== "undefined") {
      document.body.style.cursor = "default";
    }
  }

  onExitState(): void {
    LoggingService.info("DefaultState: Exited default state");

    this.isDragging = false;
    this.isSelectionBoxActive = false;
  }

  handleMouseDown(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { x, y, target, ctrlKey, shiftKey } = event;
    const deps = manager.getDependencies();

    if (!deps) return;

    if (target && this.isShapeTarget(target)) {
      const shapeId = this.getShapeIdFromTarget(target);

      if (shapeId) {
        const selectedIdsBefore = deps.selectionManager.getSelectedIds();

        const isShapeAlreadySelected = selectedIdsBefore.includes(shapeId);

        if (!shiftKey && !ctrlKey) {
          if (!isShapeAlreadySelected) {

            deps.selectionManager.clearSelection();
            this.clickedSelectedShapeInMultiSelection = null;
          } else if (selectedIdsBefore.length > 1) {
            this.clickedSelectedShapeInMultiSelection = shapeId;
          } else {
            this.clickedSelectedShapeInMultiSelection = null;
          }
        }

        if (!isShapeAlreadySelected && !ctrlKey) {
          deps.selectionManager.selectElement(shapeId, false);
        } else if (ctrlKey) {
          if (isShapeAlreadySelected) {
            deps.selectionManager.deselectElement(shapeId);
          } else {
            deps.selectionManager.selectElement(shapeId, true);
          }
        } else {
          LoggingService.debug(
            `DefaultState: Shape already selected - no selection change needed`,
          );
        }

        const selectedIdsAfter = deps.selectionManager.getSelectedIds();
        LoggingService.debug(
          `DefaultState: Selected IDs after processing:`,
          selectedIdsAfter,
        );

        this.dragOriginalPositions.clear();
        selectedIdsAfter.forEach((id: string) => {
          const shape = deps.scheme.getShapeById(id);
          if (shape) {
            this.dragOriginalPositions.set(id, { x: shape.x, y: shape.y });
          }
        });

        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        this.actualDragOccurred = false;

        LoggingService.debug(
          `DefaultState: Starting drag with ${selectedIdsAfter.length} shapes selected`,
        );
      }
    } else {
      LoggingService.debug(
        `DefaultState: Click on empty space, starting selection box`,
      );
      if (!ctrlKey && !shiftKey) {
        deps.selectionManager.clearSelection();
      }

      this.isSelectionBoxActive = true;
      this.selectionBoxStart = { x, y };

      this.currentSelectionBox = {
        x,
        y,
        width: 0,
        height: 0,
        visible: true,
      };
    }
  }

  handleMouseMove(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { x, y } = event;
    const deps = manager.getDependencies();

    if (!deps) return;

    const now = performance.now();

    if (this.isDragging) {
      const totalDeltaX = x - this.dragStartX;
      const totalDeltaY = y - this.dragStartY;
      /**120 fps */
      if (now - this.lastDragUpdate >= 8) {
        const selectedIds = deps.selectionManager.getSelectedIds();
        selectedIds.forEach((id: string) => {
          const shape = deps.scheme.getShapeById(id);
          const originalPos = this.dragOriginalPositions.get(id);
          if (shape && originalPos) {
            shape.x = originalPos.x + totalDeltaX;
            shape.y = originalPos.y + totalDeltaY;
          }
        });

        deps.scheme.notifyObservers();
        this.lastDragUpdate = now;
      }
    } else if (this.isSelectionBoxActive) {
      /**120 fps */
      if (now - this.lastSelectionBoxUpdate >= 8) {
        const startX = this.selectionBoxStart.x;
        const startY = this.selectionBoxStart.y;

        this.currentSelectionBox = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY),
          visible: true,
        };
        this.lastSelectionBoxUpdate = now;
      }
    }
  }

  handleMouseUp(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { x, y, ctrlKey } = event;
    const deps = manager.getDependencies();

    if (!deps) return;

    const selectedIdsAtStart = deps.selectionManager.getSelectedIds();
    LoggingService.debug(
      `DefaultState: MouseUp - Selected IDs at start:`,
      selectedIdsAtStart,
    );

    if (this.isSelectionBoxActive) {
      const width = Math.abs(x - this.selectionBoxStart.x);
      const height = Math.abs(y - this.selectionBoxStart.y);

      if (width > 5 || height > 5) {
        LoggingService.debug(`DefaultState: Selection box area select`);
        this.selectElementsInArea(
          this.selectionBoxStart.x,
          this.selectionBoxStart.y,
          x,
          y,
          deps,
          ctrlKey,
        );
      } else {
        if (!ctrlKey) {
          LoggingService.debug(
            `DefaultState: Small selection box - clearing selection`,
          );
          deps.selectionManager.clearSelection();
        }
      }
    }

    if (this.isDragging) {
      const totalDeltaX = x - this.dragStartX;
      const totalDeltaY = y - this.dragStartY;

      LoggingService.debug(
        `DefaultState: Drag ended - delta: (${totalDeltaX}, ${totalDeltaY}), actualDragOccurred: ${this.actualDragOccurred}`,
      );

      if (Math.abs(totalDeltaX) > 1 || Math.abs(totalDeltaY) > 1) {
        this.actualDragOccurred = true;

        const selectedIds = deps.selectionManager.getSelectedIds();
        LoggingService.debug(
          `DefaultState: Real drag occurred - moving ${selectedIds.length} shapes`,
        );

        const selectedShapes = selectedIds
          .map((id: string) => deps.scheme.getShapeById(id))
          .filter(
            (shape): shape is NonNullable<typeof shape> => shape !== undefined,
          );

        if (selectedShapes.length > 0) {
          this.dragOriginalPositions.forEach((originalPos, id) => {
            const shape = deps.scheme.getShapeById(id);
            if (shape) {
              shape.x = originalPos.x;
              shape.y = originalPos.y;
            }
          });

          const command = new MoveShapesCommand(
            selectedShapes,
            totalDeltaX,
            totalDeltaY,
            deps.scheme,
          );
          deps.commandManager.executeCommand(command);
        }
      }

      LoggingService.debug(
        `DefaultState: Checking multi-selection reset - actualDragOccurred: ${this.actualDragOccurred}, clickedSelectedShapeInMultiSelection: ${this.clickedSelectedShapeInMultiSelection}`,
      );

      if (
        !this.actualDragOccurred &&
        this.clickedSelectedShapeInMultiSelection
      ) {
        LoggingService.debug(
          `DefaultState: No drag occurred in multi-selection - resetting to single shape:`,
          this.clickedSelectedShapeInMultiSelection,
        );
        deps.selectionManager.clearSelection();
        deps.selectionManager.selectElement(
          this.clickedSelectedShapeInMultiSelection,
          false,
        );
      }
    }

    this.isDragging = false;
    this.isSelectionBoxActive = false;
    this.currentSelectionBox.visible = false;
    this.dragOriginalPositions.clear();
    this.clickedSelectedShapeInMultiSelection = null;
    this.actualDragOccurred = false;

    const selectedIdsAtEnd = deps.selectionManager.getSelectedIds();
    LoggingService.debug(
      `DefaultState: MouseUp - Selected IDs at end:`,
      selectedIdsAtEnd,
    );

    deps.scheme.notifyObservers();
  }

  handleDoubleClick(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { target } = event;

    if (target && this.isShapeTarget(target)) {
      const shapeId = this.getShapeIdFromTarget(target);
      if (shapeId) {
        const deps = manager.getDependencies();
        const shape = deps?.scheme.getShapeById(shapeId);

        if (!shape) {
          LoggingService.warn(
            `DefaultState: Shape ${shapeId} not found for double click`,
          );
          return;
        }

        const shapeType = shape.getType();

        if (shapeType === "umlClass" || shapeType === "umlComponent") {
          LoggingService.info(
            `DefaultState: Double click on ${shapeType} ${shapeId} - text editing disabled for UML shapes. Use Properties panel instead.`,
          );
          return;
        }

        LoggingService.info(
          `DefaultState: Double click on shape ${shapeId} (${shapeType}) - starting text editing`,
        );

        import("./TextEditingState").then(({ TextEditingState }) => {
          manager.setState(new TextEditingState(), { shapeId });
        });
      }
    }
  }

  handleKeyDown(
    event: CanvasKeyboardEventData,
    manager: IEditorStateManager,
  ): void {
    const deps = manager.getDependencies();
    if (!deps) return;

    switch (event.key) {
      case "Delete":
      case "Backspace":
        this.deleteSelectedElements(deps);
        break;

      case "a":
      case "A":
        if (event.ctrlKey) {
          this.selectAllElements(deps);
        }
        break;

      case "z":
      case "Z":
        if (event.ctrlKey) {
          LoggingService.debug(
            "DefaultState: Undo/Redo handled by EditorScreen",
          );
        }
        break;

      case "y":
      case "Y":
        if (event.ctrlKey) {
          LoggingService.debug(
            "DefaultState: Undo/Redo handled by EditorScreen",
          );
        }
        break;

      case "s":
      case "S":
        if (event.ctrlKey) {
          LoggingService.info(
            "DefaultState: Save shortcut pressed - delegating to higher level handler",
          );
        }
        break;

      case "ArrowUp":
        this.moveSelectedElementsByKey(0, -1, deps, event.shiftKey);
        break;

      case "ArrowDown":
        this.moveSelectedElementsByKey(0, 1, deps, event.shiftKey);
        break;

      case "ArrowLeft":
        this.moveSelectedElementsByKey(-1, 0, deps, event.shiftKey);
        break;

      case "ArrowRight":
        this.moveSelectedElementsByKey(1, 0, deps, event.shiftKey);
        break;

      case "Escape":
        if (this.isDragging) {
          this.dragOriginalPositions.forEach((originalPos, id) => {
            const shape = deps.scheme.getShapeById(id);
            if (shape) {
              shape.x = originalPos.x;
              shape.y = originalPos.y;
            }
          });
          deps.scheme.notifyObservers();
          this.isDragging = false;
          this.dragOriginalPositions.clear();
        }

        deps.selectionManager.clearSelection();
        break;
    }
  }

  handleKeyUp(): void {}

  private isShapeTarget(target: unknown): boolean {
    const konvaNode = target as {
      constructor?: { name?: string };
      attrs?: { shapeId?: string };
      id?: string | (() => string);
      name?: () => string;
    };

    const constructorName = konvaNode?.constructor?.name;
    if (
      constructorName === "Stage" ||
      constructorName === "Stage2" ||
      constructorName === "Layer" ||
      constructorName === "Layer2" ||
      constructorName?.startsWith("Stage") ||
      constructorName?.startsWith("Layer")
    ) {
      LoggingService.debug(
        `DefaultState: isShapeTarget - Stage/Layer detected: ${constructorName}`,
      );
      return false;
    }

    if (target != null && typeof target === "object") {
      const shapeId = this.getShapeIdFromTarget(target);
      LoggingService.debug(
        `DefaultState: isShapeTarget - shapeId found: "${shapeId}"`,
      );
      return Boolean(shapeId && shapeId.length > 0);
    }

    LoggingService.debug(
      `DefaultState: isShapeTarget - target is not an object`,
    );
    return false;
  }

  private getShapeIdFromTarget(target: unknown): string | null {
    const konvaNode = target as {
      id?: string | (() => string);
      attrs?: {
        shapeId?: string;
        id?: string;
        "data-shape-id"?: string;
        lineId?: string;
      };
      name?: () => string;
      parent?: {
        id?: string | (() => string);
        name?: () => string;
        attrs?: {
          shapeId?: string;
          id?: string;
          "data-shape-id"?: string;
          lineId?: string;
        };
        parent?: {
          id?: string | (() => string);
          name?: () => string;
          attrs?: {
            shapeId?: string;
            id?: string;
            "data-shape-id"?: string;
            lineId?: string;
          };
        };
      };
    };

    LoggingService.debug(
      `DefaultState: getShapeIdFromTarget - checking target:`,
      target,
    );

    const isValidShapeId = (id: string): boolean => {
      return (
        id.length > 0 &&
        !id.startsWith("connection-point-") &&
        !id.startsWith("temp-")
      );
    };

    if (konvaNode.attrs) {
      if (
        konvaNode.attrs.lineId &&
        typeof konvaNode.attrs.lineId === "string"
      ) {
        const id = konvaNode.attrs.lineId;
        if (isValidShapeId(id)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - found lineId: "${id}"`,
          );
          return id;
        }
      }
      if (
        konvaNode.attrs["data-shape-id"] &&
        typeof konvaNode.attrs["data-shape-id"] === "string"
      ) {
        const id = konvaNode.attrs["data-shape-id"];
        if (isValidShapeId(id)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - found data-shape-id: "${id}"`,
          );
          return id;
        }
      }
      if (
        konvaNode.attrs.shapeId &&
        typeof konvaNode.attrs.shapeId === "string"
      ) {
        const id = konvaNode.attrs.shapeId;
        if (isValidShapeId(id)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - found shapeId: "${id}"`,
          );
          return id;
        }
      }
      if (konvaNode.attrs.id && typeof konvaNode.attrs.id === "string") {
        const id = konvaNode.attrs.id;
        if (isValidShapeId(id)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - found attrs.id: "${id}"`,
          );
          return id;
        }
      }
    }

    if (konvaNode.id) {
      if (typeof konvaNode.id === "string" && isValidShapeId(konvaNode.id)) {
        LoggingService.debug(
          `DefaultState: getShapeIdFromTarget - found string id: "${konvaNode.id}"`,
        );
        return konvaNode.id;
      }

      if (typeof konvaNode.id === "function") {
        const result = konvaNode.id();
        if (typeof result === "string" && isValidShapeId(result)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - found function id result: "${result}"`,
          );
          return result;
        }
      }
    }

    if (konvaNode.name && typeof konvaNode.name === "function") {
      const result = konvaNode.name();
      if (typeof result === "string" && isValidShapeId(result)) {
        LoggingService.debug(
          `DefaultState: getShapeIdFromTarget - found name result: "${result}"`,
        );
        return result;
      }
    }

    let current = konvaNode.parent;
    let parentLevel = 0;
    while (current && parentLevel < 5) {
      LoggingService.debug(
        `DefaultState: getShapeIdFromTarget - checking parent level ${parentLevel}:`,
        current,
      );

      if (current.attrs) {
        if (current.attrs.lineId && typeof current.attrs.lineId === "string") {
          const id = current.attrs.lineId;
          if (isValidShapeId(id)) {
            LoggingService.debug(
              `DefaultState: getShapeIdFromTarget - returning parent lineId: "${id}"`,
            );
            return id;
          }
        }
        if (
          current.attrs["data-shape-id"] &&
          typeof current.attrs["data-shape-id"] === "string"
        ) {
          const id = current.attrs["data-shape-id"];
          if (isValidShapeId(id)) {
            LoggingService.debug(
              `DefaultState: getShapeIdFromTarget - returning parent data-shape-id: "${id}"`,
            );
            return id;
          }
        }
        if (
          current.attrs.shapeId &&
          typeof current.attrs.shapeId === "string"
        ) {
          const id = current.attrs.shapeId;
          if (isValidShapeId(id)) {
            LoggingService.debug(
              `DefaultState: getShapeIdFromTarget - returning parent attrs.shapeId: "${id}"`,
            );
            return id;
          }
        }
        if (current.attrs.id && typeof current.attrs.id === "string") {
          const id = current.attrs.id;
          if (isValidShapeId(id)) {
            LoggingService.debug(
              `DefaultState: getShapeIdFromTarget - returning parent attrs.id: "${id}"`,
            );
            return id;
          }
        }
      }

      if (current.name && typeof current.name === "function") {
        const parentName = current.name();
        LoggingService.debug(
          `DefaultState: getShapeIdFromTarget - parent name: "${parentName}"`,
        );
        if (typeof parentName === "string" && isValidShapeId(parentName)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - returning parent name: "${parentName}"`,
          );
          return parentName;
        }
      }

      if (current.id) {
        if (typeof current.id === "string" && isValidShapeId(current.id)) {
          LoggingService.debug(
            `DefaultState: getShapeIdFromTarget - returning parent string id: "${current.id}"`,
          );
          return current.id;
        }
        if (typeof current.id === "function") {
          const result = current.id();
          if (typeof result === "string" && isValidShapeId(result)) {
            LoggingService.debug(
              `DefaultState: getShapeIdFromTarget - returning parent function id: "${result}"`,
            );
            return result;
          }
        }
      }

      current = current.parent as typeof current;
      parentLevel++;
    }

    LoggingService.debug(
      `DefaultState: getShapeIdFromTarget - no ID found, returning null`,
    );
    return null;
  }

  private moveSelectedElements(
    deltaX: number,
    deltaY: number,
    deps: EditorDependencies,
  ): void {
    const selectedIds = deps.selectionManager.getSelectedIds();
    const selectedShapes = selectedIds
      .map((id: string) => deps.scheme.getShapeById(id))
      .filter(
        (shape): shape is NonNullable<typeof shape> => shape !== undefined,
      );

    if (selectedShapes.length > 0) {
      const command = new MoveShapesCommand(
        selectedShapes,
        deltaX,
        deltaY,
        deps.scheme,
      );
      deps.commandManager.executeCommand(command);
    }
  }

  private selectElementsInArea(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    deps: EditorDependencies,
    ctrlKey: boolean = false,
  ): void {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    if (!ctrlKey) {
      deps.selectionManager.clearSelection();
    }

    deps.scheme.getShapes().forEach((shape) => {
      const properties = shape.getProperties() as {
        x: number;
        y: number;
        width?: number;
        height?: number;
        radius?: number;
      };

      let shapeMinX = properties.x;
      let shapeMaxX = properties.x;
      let shapeMinY = properties.y;
      let shapeMaxY = properties.y;

      if (properties.width && properties.height) {
        shapeMinX = properties.x;
        shapeMaxX = properties.x + properties.width;
        shapeMinY = properties.y;
        shapeMaxY = properties.y + properties.height;
      } else if (properties.radius) {
        shapeMinX = properties.x - properties.radius;
        shapeMaxX = properties.x + properties.radius;
        shapeMinY = properties.y - properties.radius;
        shapeMaxY = properties.y + properties.radius;
      } else {
        const defaultSize = 50;
        shapeMinX = properties.x - defaultSize / 2;
        shapeMaxX = properties.x + defaultSize / 2;
        shapeMinY = properties.y - defaultSize / 2;
        shapeMaxY = properties.y + defaultSize / 2;
      }

      const intersects = !(
        shapeMaxX < minX ||
        shapeMinX > maxX ||
        shapeMaxY < minY ||
        shapeMinY > maxY
      );

      if (intersects) {
        deps.selectionManager.selectElement(shape.getId(), true);
      }
    });
  }

  private deleteSelectedElements(deps: EditorDependencies): void {
    const selectedIds = deps.selectionManager.getSelectedIds();

    if (selectedIds.length > 0) {
      const command = new DeleteElementCommand(deps.scheme, selectedIds);
      deps.commandManager.executeCommand(command);
      deps.selectionManager.clearSelection();
    }
  }

  private selectAllElements(deps: EditorDependencies): void {
    deps.selectionManager.clearSelection();
    deps.scheme.getShapes().forEach((shape) => {
      deps.selectionManager.selectElement(shape.getId(), true);
    });
  }

  private moveSelectedElementsByKey(
    deltaX: number,
    deltaY: number,
    deps: EditorDependencies,
    isShiftPressed: boolean,
  ): void {
    const step = isShiftPressed ? 10 : 1;
    this.moveSelectedElements(deltaX * step, deltaY * step, deps);
  }

  public getSelectionBox(): typeof this.currentSelectionBox {
    return this.currentSelectionBox;
  }
}
