import React, { useCallback, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";
import type { UID } from "../../types/common";

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  shapeId: UID | null;
  onClose: () => void;
  onDelete: (shapeId: UID) => void;
  onBringToFront: (shapeId: UID) => void;
  onSendToBack: (shapeId: UID) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  shapeId,
  onClose,
  onDelete,
  onBringToFront,
  onSendToBack,
}) => {
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".context-menu")) {
        onClose();
      }
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [visible, handleOutsideClick, handleKeyDown]);

  if (!visible || !shapeId) return null;

  const handleDelete = () => {
    onDelete(shapeId);
    onClose();
  };

  const handleBringToFront = () => {
    onBringToFront(shapeId);
    onClose();
  };

  const handleSendToBack = () => {
    onSendToBack(shapeId);
    onClose();
  };

  return (
    <div
      className="context-menu fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48"
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
        onClick={handleBringToFront}
      >
        <FaArrowUp className="text-gray-400" />
        На передний план
      </button>

      <button
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
        onClick={handleSendToBack}
      >
        <FaArrowDown className="text-gray-400" />
        На задний план
      </button>

      <hr className="my-1 border-gray-200" />

      <button
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
        onClick={handleDelete}
      >
        <FaTrash className="text-red-400" />
        Удалить
      </button>
    </div>
  );
};

export default ContextMenu;
