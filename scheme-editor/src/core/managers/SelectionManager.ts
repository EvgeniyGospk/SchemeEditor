import type { BaseShape } from "../../models/BaseShape";
import type { Line } from "../../models/Line";
import type { Scheme } from "../../models/Scheme";
import { LoggingService } from "../services/LoggingService";

export type SelectableElement = BaseShape | Line;

export interface SelectionChangedEvent {
  selectedIds: string[];
  selectedElements: SelectableElement[];
}

export class SelectionManager {
  private selectedElementIds: Set<string> = new Set();
  private listeners: ((event: SelectionChangedEvent) => void)[] = [];

  selectElement(id: string, multiSelect: boolean = false): void {
    if (!multiSelect) {
      this.selectedElementIds.clear();
    }

    this.selectedElementIds.add(id);

    this.notifySelectionChanged();
  }

  selectElements(ids: string[], multiSelect: boolean = false): void {
    const validIds = ids.slice();

    if (validIds.length === 0) {
      return;
    }

    if (!multiSelect) {
      this.selectedElementIds.clear();
    }

    validIds.forEach((id) => this.selectedElementIds.add(id));
    this.notifySelectionChanged();
  }

  deselectElement(id: string): void {
    if (this.selectedElementIds.has(id)) {
      this.selectedElementIds.delete(id);
      this.notifySelectionChanged();
    }
  }

  toggleElement(id: string): void {
    if (this.selectedElementIds.has(id)) {
      this.deselectElement(id);
    } else {
      this.selectElement(id, true);
    }
  }

  clearSelection(): void {
    if (this.selectedElementIds.size > 0) {
      this.selectedElementIds.clear();
      this.notifySelectionChanged();
    }
  }

  isSelected(id: string): boolean {
    return this.selectedElementIds.has(id);
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedElementIds);
  }

  getSelectedElements(scheme: Scheme): SelectableElement[] {
    const elements: SelectableElement[] = [];

    for (const id of this.selectedElementIds) {
      const shape = scheme.shapes.find((s) => s.getId() === id);
      if (shape) {
        elements.push(shape);
        continue;
      }

      const line = scheme.lines.find((l) => l.id === id);
      if (line) {
        elements.push(line);
      }
    }

    return elements;
  }

  getSelectedShapes(scheme: Scheme): BaseShape[] {
    const shapes: BaseShape[] = [];

    for (const id of this.selectedElementIds) {
      const shape = scheme.shapes.find((s) => s.getId() === id);
      if (shape) {
        shapes.push(shape);
      }
    }

    return shapes;
  }

  getSelectedLines(scheme: Scheme): Line[] {
    const lines: Line[] = [];

    for (const id of this.selectedElementIds) {
      const line = scheme.lines.find((l) => l.id === id);
      if (line) {
        lines.push(line);
      }
    }

    return lines;
  }

  getSelectionCount(): number {
    return this.selectedElementIds.size;
  }

  hasSelection(): boolean {
    return this.selectedElementIds.size > 0;
  }

  selectAll(scheme: Scheme): void {
    this.selectedElementIds.clear();

    scheme.shapes.forEach((shape) => {
      this.selectedElementIds.add(shape.getId());
    });

    scheme.lines.forEach((line) => {
      this.selectedElementIds.add(line.id);
    });

    this.notifySelectionChanged();
  }

  selectInArea(
    scheme: Scheme,
    area: { x: number; y: number; width: number; height: number },
    multiSelect: boolean = false,
  ): void {
    if (!multiSelect) {
      this.selectedElementIds.clear();
    }

    scheme.shapes.forEach((shape) => {
      const bounds = shape.getBounds();

      if (this.isRectIntersecting(bounds, area)) {
        this.selectedElementIds.add(shape.getId());
      }
    });

    this.notifySelectionChanged();
  }

  onSelectionChanged(listener: (event: SelectionChangedEvent) => void): void {
    this.listeners.push(listener);
  }

  offSelectionChanged(listener: (event: SelectionChangedEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifySelectionChanged(): void {
    const selectedIds = this.getSelectedIds();

    const event: SelectionChangedEvent = {
      selectedIds,
      selectedElements: [],
    };

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        LoggingService.error("Error in selection change listener:", error);
      }
    });
  }

  private isRectIntersecting(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }
}
