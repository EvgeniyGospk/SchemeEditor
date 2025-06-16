import { useCallback, useState } from "react";
import type { UID } from "../types/common";

export interface ContextMenuHookState {
  visible: boolean;
  x: number;
  y: number;
  shapeId: UID | null;
}

const initialContextMenuState: ContextMenuHookState = {
  visible: false,
  x: 0,
  y: 0,
  shapeId: null,
};

export interface ContextMenuControls {
  contextMenuState: ContextMenuHookState;
  showContextMenu: (shapeId: UID, event: MouseEvent | React.MouseEvent) => void;
  closeContextMenu: () => void;
}

export const useContextMenu = (): ContextMenuControls => {
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuHookState>(initialContextMenuState);

  const showContextMenu = useCallback(
    (shapeId: UID, event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();

      setContextMenuState({
        visible: true,
        x: event.pageX,
        y: event.pageY,
        shapeId,
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenuState((prev) => ({ ...prev, visible: false, shapeId: null }));
  }, []);

  return {
    contextMenuState,
    showContextMenu,
    closeContextMenu,
  };
};
