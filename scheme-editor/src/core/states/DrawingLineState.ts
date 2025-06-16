import type {
  IEditorState,
  IEditorStateManager,
  CanvasMouseEventData,
  CanvasKeyboardEventData,
} from "./IEditorState";
import { CreateLineCommand } from "../../Commands/CreateLineCommand";
import { DefaultState } from "./DefaultState";
import { LoggingService } from "../services/LoggingService";

export class DrawingLineState implements IEditorState {
  private startShapeId?: string;
  private startConnectionPointId?: string;
  private isInitializedFromConnectionPoint = false;

  getStateName(): string {
    return "DrawingLineState";
  }

  onEnterState(
    _manager: IEditorStateManager,
    args?: {
      fromShapeId?: string;
      fromPointId?: string;
    },
  ): void {
    LoggingService.info("DrawingLineState: Entered");

    if (typeof window !== "undefined" && window.__appController) {
      const konvaStage = window.__appController.getKonvaStage();
      if (konvaStage) {
        const stageContainer = konvaStage.container();
        if (stageContainer) {
          stageContainer.style.cursor = "crosshair";
        }
      }
    }

    this.startShapeId = undefined;
    this.startConnectionPointId = undefined;
    this.isInitializedFromConnectionPoint = false;

    if (args) {
      this.startShapeId = args.fromShapeId;
      this.startConnectionPointId = args.fromPointId;
      this.isInitializedFromConnectionPoint = true;

      LoggingService.info(
        "DrawingLineState: Started line drawing from connection point",
        { fromShapeId: args.fromShapeId, fromPointId: args.fromPointId },
      );
    } else {
      LoggingService.info(
        "DrawingLineState: Entered without initial connection point",
      );
    }
  }

  onExitState(): void {
    LoggingService.info("DrawingLineState: Exited");

    if (typeof window !== "undefined" && window.__appController) {
      const konvaStage = window.__appController.getKonvaStage();
      if (konvaStage) {
        const stageContainer = konvaStage.container();
        if (stageContainer) {
          stageContainer.style.cursor = "default";
        }
      }
    }

    this.startShapeId = undefined;
    this.startConnectionPointId = undefined;
    this.isInitializedFromConnectionPoint = false;
  }

  handleMouseDown(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { target } = event;

    if (this.isInitializedFromConnectionPoint && this.startShapeId) {
      if (
        target &&
        (this.isShapeTarget(target) || this.isConnectionPointTarget(target))
      ) {
        const targetShapeId = this.getShapeIdFromTarget(target);

        if (targetShapeId && targetShapeId !== this.startShapeId) {
          let targetConnectionPointId = "center";

          if (this.isConnectionPointTarget(target)) {
            targetConnectionPointId =
              this.getConnectionPointIdFromTarget(target) || "center";
          }

          const deps = manager.getDependencies();
          const createLineCommand = new CreateLineCommand(deps.scheme, {
            fromShapeId: this.startShapeId,
            fromConnectionPointId: this.startConnectionPointId!,
            toShapeId: targetShapeId,
            toConnectionPointId: targetConnectionPointId,
          });

          deps.commandManager.executeCommand(createLineCommand);

          LoggingService.info(
            `DrawingLineState: Created line from ${this.startShapeId}:${this.startConnectionPointId} to ${targetShapeId}:${targetConnectionPointId}`,
          );

          manager.setState(new DefaultState());
        } else {
          LoggingService.info(
            "DrawingLineState: Cannot connect to the same shape, exiting drawing mode",
          );
          manager.setState(new DefaultState());
        }
      } else {
        LoggingService.info(
          "DrawingLineState: Clicked on empty space, canceling line drawing",
        );
        manager.setState(new DefaultState());
      }
      return;
    }

    if (!this.startShapeId) {
      if (
        target &&
        (this.isShapeTarget(target) || this.isConnectionPointTarget(target))
      ) {
        const shapeId = this.getShapeIdFromTarget(target);
        if (shapeId) {
          this.startShapeId = shapeId;

          if (this.isConnectionPointTarget(target)) {
            this.startConnectionPointId =
              this.getConnectionPointIdFromTarget(target) || "center";
          } else {
            this.startConnectionPointId = "center";
          }

          LoggingService.info(
            `DrawingLineState: Selected start point - shape ${shapeId}, point ${this.startConnectionPointId}`,
          );
        }
      } else {
        LoggingService.info(
          "DrawingLineState: Please click on a shape or connection point to start drawing a line",
        );
      }
    }
  }

  handleMouseMove(): void {}

  handleMouseUp(): void {}

  handleDoubleClick(
    _event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    LoggingService.info(
      "DrawingLineState: Double click, canceling line drawing",
    );
    manager.setState(new DefaultState());
  }

  handleKeyDown(
    event: CanvasKeyboardEventData,
    manager: IEditorStateManager,
  ): void {
    switch (event.key) {
      case "Escape":
        LoggingService.info(
          "DrawingLineState: Escape pressed, canceling line drawing",
        );
        manager.setState(new DefaultState());
        break;

      default:
        break;
    }
  }

  handleKeyUp(): void {}

  private isShapeTarget(target: unknown): boolean {
    return target != null && typeof target === "object" && "attrs" in target;
  }

  private isConnectionPointTarget(target: unknown): boolean {
    const konvaNode = target as { name?: () => string };
    if (konvaNode.name && typeof konvaNode.name === "function") {
      const name = konvaNode.name();
      return typeof name === "string" && name.startsWith("connection-point-");
    }
    return false;
  }

  private getConnectionPointIdFromTarget(target: unknown): string | null {
    const konvaNode = target as { name?: () => string };
    if (konvaNode.name && typeof konvaNode.name === "function") {
      const name = konvaNode.name();
      if (typeof name === "string" && name.startsWith("connection-point-")) {
        return name.replace("connection-point-", "");
      }
    }
    return null;
  }

  private getShapeIdFromTarget(target: unknown): string | null {
    const konvaNode = target as {
      id?: string | (() => string);
      attrs?: {
        shapeId?: string;
        id?: string;
      };
      name?: () => string;
      parent?: {
        id?: string | (() => string);
        name?: () => string;
      };
    };

    if (this.isConnectionPointTarget(target)) {
      let current = konvaNode.parent;
      while (current) {
        if (current.name && typeof current.name === "function") {
          const parentName = current.name();
          if (
            typeof parentName === "string" &&
            !parentName.startsWith("connection-point-")
          ) {
            return parentName;
          }
        }
        if (current.id) {
          if (typeof current.id === "string") {
            return current.id;
          }
          if (typeof current.id === "function") {
            const result = current.id();
            return typeof result === "string" ? result : null;
          }
        }
        current = (current as unknown as { parent?: typeof current }).parent;
      }
    }

    if (konvaNode.id) {
      if (typeof konvaNode.id === "string") {
        return konvaNode.id;
      }

      if (typeof konvaNode.id === "function") {
        const result = konvaNode.id();
        return typeof result === "string" ? result : null;
      }
    }

    if (konvaNode.name && typeof konvaNode.name === "function") {
      const result = konvaNode.name();
      return typeof result === "string" ? result : null;
    }

    if (konvaNode.attrs) {
      if (
        konvaNode.attrs.shapeId &&
        typeof konvaNode.attrs.shapeId === "string"
      ) {
        return konvaNode.attrs.shapeId;
      }
      if (konvaNode.attrs.id && typeof konvaNode.attrs.id === "string") {
        return konvaNode.attrs.id;
      }
    }

    return null;
  }

  public getLinePreview(): null {
    return null;
  }

  public finishLineToConnectionPoint(
    targetShapeId: string,
    targetPointId: string,
    manager: IEditorStateManager,
  ): void {
    if (!this.startShapeId || !this.startConnectionPointId) {
      LoggingService.warn(
        "DrawingLineState: Cannot finish line - no start point defined",
      );
      return;
    }

    if (targetShapeId === this.startShapeId) {
      LoggingService.info("DrawingLineState: Cannot connect shape to itself");
      return;
    }

    const deps = manager.getDependencies();
    const createLineCommand = new CreateLineCommand(deps.scheme, {
      fromShapeId: this.startShapeId,
      fromConnectionPointId: this.startConnectionPointId,
      toShapeId: targetShapeId,
      toConnectionPointId: targetPointId,
    });

    deps.commandManager.executeCommand(createLineCommand);

    LoggingService.info(
      `DrawingLineState: Created line from ${this.startShapeId}:${this.startConnectionPointId} to ${targetShapeId}:${targetPointId}`,
    );

    manager.setState(new DefaultState());
  }
}
