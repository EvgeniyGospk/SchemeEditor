import type { ICommand } from "../../../Commands/ICommand";
import { LoggingService } from "../../../core/services/LoggingService";

let commandManagerInstanceCounter = 0;

export class CommandManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private instanceId: number;

  constructor() {
    this.instanceId = ++commandManagerInstanceCounter;
    LoggingService.debug(
      `CommandManager created (instance #${this.instanceId})`,
    );
  }

  executeCommand(command: ICommand): void {
    try {
      command.execute();

      this.undoStack.push(command);

      this.redoStack = [];
    } catch (error) {
      LoggingService.error(
        `Failed to execute command: ${command.constructor.name}`,
        error,
      );
      throw error;
    }
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.undoStack.pop()!;

    try {
      command.undo();
      this.redoStack.push(command);
      return true;
    } catch (error) {
      this.undoStack.push(command);
      LoggingService.error(
        `Failed to undo command: ${command.constructor.name}`,
        error,
      );
      return false;
    }
  }

  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    const command = this.redoStack.pop()!;

    try {
      command.execute();
      this.undoStack.push(command);
      return true;
    } catch (error) {
      LoggingService.error(
        `Failed to redo command: ${command.constructor.name}`,
        error,
      );

      return false;
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getHistorySize(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }
}
