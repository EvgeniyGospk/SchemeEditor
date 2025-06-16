import type {
  IEditorState,
  IEditorStateManager,
  CanvasMouseEventData,
  CanvasKeyboardEventData,
} from "../../../core/states/IEditorState";
import type { CommandManager } from "./CommandManager";
import type { SelectionManager } from "./SelectionManager";
import type { ShapeFactory } from "../../../core/services/ShapeFactory";
import type { Scheme } from "../../../models/Scheme";
import { LoggingService } from "../../../core/services/LoggingService";

interface EditorStateManagerDependencies {
  commandManager: CommandManager;
  selectionManager: SelectionManager;
  scheme: Scheme;
  shapeFactory: ShapeFactory;
}

interface StateWithFinishLine {
  finishLineToConnectionPoint(
    targetShapeId: string,
    targetPointId: string,
    manager: IEditorStateManager,
  ): void;
}

interface StateWithLinePreview {
  getLinePreview(): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
}

interface StateWithSelectionBox {
  getSelectionBox(): {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  };
}

export class EditorStateManager implements IEditorStateManager {
  private currentState: IEditorState | null;
  private dependencies: EditorStateManagerDependencies;

  constructor(dependencies: EditorStateManagerDependencies) {
    this.dependencies = dependencies;
    this.currentState = null;
  }

  public setState(newState: IEditorState, transitionArgs?: unknown): void {
    const oldStateName = this.currentState?.getStateName() ?? "Unknown";
    const newStateName = newState.getStateName();

    LoggingService.info(`Exiting state: ${oldStateName}`);

    if (this.currentState?.onExitState) {
      this.currentState.onExitState(this);
    }

    this.currentState = newState;

    LoggingService.info(`Entering state: ${newStateName}`);

    this.currentState.onEnterState(this, transitionArgs);
  }

  public getCurrentState(): IEditorState | null {
    return this.currentState;
  }

  public getCurrentStateName(): string {
    return this.currentState?.getStateName() ?? "Unknown";
  }

  public getDependencies(): EditorStateManagerDependencies {
    return this.dependencies;
  }

  public updateDependencies(
    newDependencies: EditorStateManagerDependencies,
  ): void {
    this.dependencies = newDependencies;
  }

  public isInState(stateName: string): boolean {
    return this.currentState?.getStateName() === stateName;
  }

  public setDefaultState(): void {
    import("../../../core/states/DefaultState")
      .then(({ DefaultState }) => {
        this.setState(new DefaultState());
      })
      .catch((error) => {
        LoggingService.error("Failed to load DefaultState", error);
      });
  }

  public setAddingShapeState(
    shapeType: string,
    defaultProperties: Record<string, unknown>,
  ): void {
    import("../../../core/states/AddingShapeState")
      .then(({ AddingShapeState }) => {
        this.setState(new AddingShapeState(), {
          shapeType,
          defaultProperties,
        });
      })
      .catch((error) => {
        LoggingService.error("Failed to load AddingShapeState", error);
      });
  }

  public setDrawingLineState(args?: {
    fromShapeId?: string;
    fromPointId?: string;
  }): void {
    import("../../../core/states/DrawingLineState")
      .then(({ DrawingLineState }) => {
        this.setState(new DrawingLineState(), args);
      })
      .catch((error) => {
        LoggingService.error("Failed to load DrawingLineState", error);
      });
  }

  public isInDrawingLineMode(): boolean {
    return this.isInState("DrawingLineState");
  }

  public finishLineToConnectionPoint(
    targetShapeId: string,
    targetPointId: string,
  ): void {
    if (
      this.currentState?.getStateName() === "DrawingLineState" &&
      this.hasMethod(this.currentState, "finishLineToConnectionPoint")
    ) {
      (
        this.currentState as unknown as StateWithFinishLine
      ).finishLineToConnectionPoint(targetShapeId, targetPointId, this);
    }
  }

  public getLinePreview(): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null {
    if (
      this.currentState?.getStateName() === "DrawingLineState" &&
      this.hasMethod(this.currentState, "getLinePreview")
    ) {
      return (
        (
          this.currentState as unknown as StateWithLinePreview
        ).getLinePreview() || null
      );
    }
    return null;
  }

  public getSelectionBox(): {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  } | null {
    if (
      this.currentState?.getStateName() === "DefaultState" &&
      this.hasMethod(this.currentState, "getSelectionBox")
    ) {
      return (
        this.currentState as unknown as StateWithSelectionBox
      ).getSelectionBox();
    }
    return null;
  }

  private hasMethod(obj: unknown, methodName: string): boolean {
    return (
      obj !== null &&
      obj !== undefined &&
      typeof obj === "object" &&
      methodName in obj &&
      typeof (obj as Record<string, unknown>)[methodName] === "function"
    );
  }

  public getCommandManager(): CommandManager {
    return this.dependencies.commandManager;
  }

  public getSelectionManager(): SelectionManager {
    return this.dependencies.selectionManager;
  }

  public getScheme(): Scheme {
    return this.dependencies.scheme;
  }

  public getShapeFactory(): ShapeFactory {
    return this.dependencies.shapeFactory;
  }

  public handleCanvasMouseDown(event: CanvasMouseEventData): void {
    if (this.currentState) {
      this.currentState.handleMouseDown(event, this);
    }
  }

  public handleCanvasMouseMove(event: CanvasMouseEventData): void {
    if (this.currentState) {
      this.currentState.handleMouseMove(event, this);
    }
  }

  public handleCanvasMouseUp(event: CanvasMouseEventData): void {
    if (this.currentState) {
      this.currentState.handleMouseUp(event, this);
    }
  }

  public handleCanvasDoubleClick(event: CanvasMouseEventData): void {
    if (this.currentState) {
      this.currentState.handleDoubleClick(event, this);
    }
  }

  public handleKeyDown(event: CanvasKeyboardEventData): void {
    if (this.currentState) {
      this.currentState.handleKeyDown(event, this);
    }
  }

  public handleKeyUp(event: CanvasKeyboardEventData): void {
    if (this.currentState) {
      this.currentState.handleKeyUp(event, this);
    }
  }
}
