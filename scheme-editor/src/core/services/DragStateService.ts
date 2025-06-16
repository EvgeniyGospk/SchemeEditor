export class DragStateService {
  private static instance: DragStateService;
  private draggedShapes: Map<string, { x: number; y: number }> = new Map();
  private listeners: Array<() => void> = [];

  private constructor() {}

  static getInstance(): DragStateService {
    if (!DragStateService.instance) {
      DragStateService.instance = new DragStateService();
    }
    return DragStateService.instance;
  }

  setDragPosition(shapeId: string, x: number, y: number): void {
    this.draggedShapes.set(shapeId, { x, y });
    this.notifyListeners();
  }

  getDragPosition(shapeId: string): { x: number; y: number } | null {
    return this.draggedShapes.get(shapeId) || null;
  }

  endDrag(shapeId: string): void {
    this.draggedShapes.delete(shapeId);
    this.notifyListeners();
  }

  isDragging(shapeId: string): boolean {
    return this.draggedShapes.has(shapeId);
  }

  clearAll(): void {
    this.draggedShapes.clear();
    this.notifyListeners();
  }

  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}
