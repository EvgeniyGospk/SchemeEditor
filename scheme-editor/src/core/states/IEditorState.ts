import type {
  CanvasMouseEventData,
  CanvasKeyboardEventData,
} from "../../types.d";
import type { Scheme } from "../../models/Scheme";
import type { SelectableElement } from "../../components/editor/managers/SelectionManager";
import type { ICommand } from "../../Commands/ICommand";
import type { BaseShape } from "../../models/BaseShape";
import type { Line } from "../../models/Line";
import type { ShapeFactory } from "../services/ShapeFactory";
import type { SelectionChangedEvent } from "../../components/editor/managers/SelectionManager";

export type { CanvasMouseEventData, CanvasKeyboardEventData };

interface CommandManager {
  executeCommand(command: ICommand): void;
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  clearHistory(): void;
  getHistorySize(): { undoCount: number; redoCount: number };
}

interface SelectionManager {
  selectElement(id: string, multiSelect?: boolean): void;
  selectElements(ids: string[], multiSelect?: boolean): void;
  deselectElement(id: string): void;
  toggleElement(id: string): void;
  clearSelection(): void;
  getSelectedIds(): string[];
  getSelectedElements(scheme: Scheme): SelectableElement[];
  getSelectedShapes(scheme: Scheme): BaseShape[];
  getSelectedLines(scheme: Scheme): Line[];
  isSelected(id: string): boolean;
  getSelectionCount(): number;
  hasSelection(): boolean;
  selectAll(scheme: Scheme): void;
  selectInArea(
    scheme: Scheme,
    area: { x: number; y: number; width: number; height: number },
    multiSelect?: boolean,
  ): void;
  onSelectionChanged(listener: (event: SelectionChangedEvent) => void): void;
  offSelectionChanged(listener: (event: SelectionChangedEvent) => void): void;
}

interface EditorDependencies {
  commandManager: CommandManager;
  selectionManager: SelectionManager;
  scheme: Scheme;
  shapeFactory: ShapeFactory;
}

export interface IEditorStateManager {
  getDependencies(): EditorDependencies;
  setState(newState: IEditorState, transitionArgs?: unknown): void;
  getCurrentState(): IEditorState | null;
  getCurrentStateName(): string;
  isInState(stateName: string): boolean;
  getCommandManager(): CommandManager;
  getSelectionManager(): SelectionManager;
  getScheme(): Scheme;
  getShapeFactory(): ShapeFactory;
}

export interface IEditorState {
  onEnterState(manager: IEditorStateManager, args?: unknown): void;

  onExitState(manager: IEditorStateManager): void;

  handleMouseDown(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void;

  handleMouseMove(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void;

  handleMouseUp(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void;

  handleDoubleClick(
    event: CanvasMouseEventData,
    manager: IEditorStateManager,
  ): void;

  handleKeyDown(
    event: CanvasKeyboardEventData,
    manager: IEditorStateManager,
  ): void;

  handleKeyUp(
    event: CanvasKeyboardEventData,
    manager: IEditorStateManager,
  ): void;

  getStateName(): string;

  finishLineToConnectionPoint?: (
    targetShapeId: string,
    targetPointId: string,
    manager: IEditorStateManager,
  ) => void;
}
