import type {
  IEditorState,
  IEditorStateManager,
  CanvasMouseEventData,
  CanvasKeyboardEventData,
} from "./IEditorState";
import { ChangePropertyCommand } from "../../Commands/ChangePropertyCommand";
import { DefaultState } from "./DefaultState";
import { LoggingService } from "../services/LoggingService";

export class TextEditingState implements IEditorState {
  private editingShapeId: string = "";
  private originalText: string = "";
  private textInputElement?: HTMLTextAreaElement;
  private currentShape?: {
    getBounds(): { x: number; y: number; width: number; height: number };
  };

  private updatePositionHandler = (): void => {
    this.updateTextInputPosition();
  };

  getStateName(): string {
    return "TextEditingState";
  }

  onEnterState(manager: IEditorStateManager, args?: { shapeId: string }): void {
    if (!args?.shapeId) {
      manager.setState(new DefaultState());
      return  ;
    }

    this.editingShapeId = args.shapeId;

    const deps = manager.getDependencies();
    const shape = deps.scheme.getShapeById(this.editingShapeId);

    if (!shape) {
      manager.setState(new DefaultState());
      return;
    }

    const properties = shape.getProperties();
    this.originalText = properties.text || "";
    this.currentShape = shape;

    this.createTextInput(shape);
    this.addEventListeners();
  }

  onExitState(): void {

    this.removeEventListeners();

    if (this.textInputElement) {
      this.textInputElement.remove();
      this.textInputElement = undefined;
    }

    this.editingShapeId = "";
    this.originalText = "";
    this.currentShape = undefined;
  }

  handleMouseDown(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void {
    const { target } = event;

    if (target !== this.textInputElement) {
      this.applyTextChanges(manager);
      manager.setState(new DefaultState());
    }
  }

  handleMouseMove(): void {}

  handleMouseUp(): void {}

  handleDoubleClick(): void {}

  handleKeyDown(
    event: CanvasKeyboardEventData,
    manager: IEditorStateManager,
  ): void {
    switch (event.key) {
      case "Enter":
        if (!event.shiftKey) {
          this.applyTextChanges(manager);
          manager.setState(new DefaultState());
        }
        break;

      case "Escape":
        if (this.textInputElement) {
          this.textInputElement.value = this.originalText;
        }
        manager.setState(new DefaultState());
        break;

      default:
        break;
    }
  }

  handleKeyUp(): void {}

  private createTextInput(shape: {
    getBounds(): { x: number; y: number; width: number; height: number };
  }): void {
    if (typeof document === "undefined") {
      return;
    }

    const bounds = shape.getBounds();

    const canvasElement = document.querySelector("canvas");
    if (!canvasElement) {
      return;
    }

    const canvasRect = canvasElement.getBoundingClientRect();

    this.textInputElement = document.createElement("textarea");
    this.textInputElement.value = this.originalText;
    this.textInputElement.style.position = "fixed";
    this.textInputElement.style.left = `${canvasRect.left + bounds.x}px`;
    this.textInputElement.style.top = `${canvasRect.top + bounds.y}px`;
    this.textInputElement.style.width = `${Math.max(bounds.width, 100)}px`;
    this.textInputElement.style.height = `${Math.max(bounds.height, 50)}px`;
    this.textInputElement.style.border = "2px solid #007acc";
    this.textInputElement.style.borderRadius = "4px";
    this.textInputElement.style.padding = "4px";
    this.textInputElement.style.fontSize = "14px";
    this.textInputElement.style.fontFamily = "Arial, sans-serif";
    this.textInputElement.style.resize = "none";
    this.textInputElement.style.outline = "none";
    this.textInputElement.style.backgroundColor = "white";
    this.textInputElement.style.zIndex = "1000";
    this.textInputElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

    document.body.appendChild(this.textInputElement);

    setTimeout(() => {
      if (this.textInputElement) {
        this.textInputElement.focus();
        this.textInputElement.select();
      }
    }, 10);

  
  }

  private applyTextChanges(manager: IEditorStateManager): void {
    if (!this.textInputElement) {
      return;
    }

    const newText = this.textInputElement.value;

    if (newText !== this.originalText) {
      const deps = manager.getDependencies();
      const changePropertyCommand = new ChangePropertyCommand(
        deps.scheme,
        this.editingShapeId,
        { text: newText },
      );

      deps.commandManager.executeCommand(changePropertyCommand);
    } else {
      LoggingService.info("TextEditingState: No text changes to apply");
    }
  }

  private addEventListeners(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("resize", this.updatePositionHandler);
    window.addEventListener("scroll", this.updatePositionHandler);
  }

  private removeEventListeners(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.removeEventListener("resize", this.updatePositionHandler);
    window.removeEventListener("scroll", this.updatePositionHandler);
  }

  private updateTextInputPosition(): void {
    if (!this.currentShape) {
      return;
    }

    const bounds = this.currentShape.getBounds();
    const canvasElement = document.querySelector("canvas");
    if (!canvasElement) {
      return;
    }

    const canvasRect = canvasElement.getBoundingClientRect();

    if (this.textInputElement) {
      this.textInputElement.style.left = `${canvasRect.left + bounds.x}px`;
      this.textInputElement.style.top = `${canvasRect.top + bounds.y}px`;
    }
  }
}
