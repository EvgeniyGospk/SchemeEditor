import type {
  IEditorState,
  IEditorStateManager,
  CanvasMouseEventData,
} from "./IEditorState";
import { CreateShapeCommand } from "../../Commands/CreateShapeCommand";
import { DefaultState } from "./DefaultState";
import { LoggingService } from "../services/LoggingService";

interface AddingShapeStateArgs {
  shapeType: string;
  defaultProperties: Record<string, unknown>;
}


export class AddingShapeState implements IEditorState {
  private shapeType: string = "";
  private defaultProperties: Record<string, unknown> = {};

  constructor() {
    this.shapeType = "";
    this.defaultProperties = {};
  }

  getStateName(): string {
    return "AddingShapeState";
  }

  onEnterState(
    manager: IEditorStateManager,
    args?: AddingShapeStateArgs,
  ): void {
    if (args) {
      this.shapeType = args.shapeType;
      this.defaultProperties = args.defaultProperties;
      LoggingService.info(
        `AddingShapeState: Entered for shape type ${this.shapeType}`,
      );
    } else {
      LoggingService.error("AddingShapeState: No args provided");
    }

    const deps = manager.getDependencies();
    if (deps && typeof window !== "undefined" && window.__appController) {
      const konvaStage = window.__appController.getKonvaStage();
      if (konvaStage) {
        const stageContainer = konvaStage.container();
        if (stageContainer) {
          stageContainer.style.cursor = "crosshair";
        }
      }
    }
  }

  onExitState(): void {
    LoggingService.info("AddingShapeState: Exited");

    if (typeof window !== "undefined" && window.__appController) {
      const konvaStage = window.__appController.getKonvaStage();
      if (konvaStage) {
        const stageContainer = konvaStage.container();
        if (stageContainer) {
          stageContainer.style.cursor = "default";
        }
      }
    }
  }

  handleMouseDown(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { stageX, stageY } = event;

    const deps = manager.getDependencies();
    const createCommand = new CreateShapeCommand(
      deps.scheme,
      deps.shapeFactory,
      this.shapeType,
      {
        ...this.defaultProperties,
        x: stageX,
        y: stageY,
      },
    );

    deps.commandManager.executeCommand(createCommand);

    LoggingService.info(
      `AddingShapeState: Created ${this.shapeType} at (${stageX}, ${stageY})`,
    );

    manager.setState(new DefaultState());
  }

  handleMouseMove(): void {}

  handleMouseUp(): void {}

  handleDoubleClick(): void {}

  handleKeyDown(): void {}

  handleKeyUp(): void {}
}
