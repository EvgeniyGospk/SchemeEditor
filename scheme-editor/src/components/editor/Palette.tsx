import React, { useState, useEffect } from "react";
import {
  FaSquare,
  FaCircle,
  FaCube,
  FaWrench,
  FaQuestion,
  FaBan,
} from "react-icons/fa";
import type { ShapePluginDefinition } from "../../types/plugins.interface";
import appController from "../../Controllers/AppController";

interface PaletteProps {
  onSelectShape: (type: ShapePluginDefinition["type"]) => void;
}

const Palette: React.FC<PaletteProps> = ({ onSelectShape }) => {
  const [shapeDefinitions, setShapeDefinitions] = useState<
    Array<{
      type: string;
      label: string;
      defaultProperties: Record<string, unknown>;
    }>
  >([]);

  useEffect(() => {
    appController.getAvailableShapeTypes().then((definitions) => {
      setShapeDefinitions(definitions);
    });
  }, []);

  const getIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "rectangle":
        return <FaSquare />;
      case "circle":
        return <FaCircle />;
      case "umlClass":
        return <FaCube />;
      case "umlComponent":
        return <FaWrench />;
      default:
        return <FaQuestion />;
    }
  };

  const createDragPreview = (shapeType: string): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 80;
    canvas.height = 80;

    if (!ctx) return canvas;

    const fillColor = "#ffffff";
    const strokeColor = "#000000";
    const strokeWidth = 2;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    switch (shapeType) {
      case "rectangle":
        ctx.fillRect(10, 20, 60, 40);
        ctx.strokeRect(10, 20, 60, 40);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(40, 40, 25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case "umlClass":
        ctx.fillRect(5, 10, 70, 60);
        ctx.strokeRect(5, 10, 70, 60);

        ctx.beginPath();
        ctx.moveTo(5, 30);
        ctx.lineTo(75, 30);
        ctx.moveTo(5, 50);
        ctx.lineTo(75, 50);
        ctx.stroke();
        break;
      case "umlComponent":
        ctx.fillRect(15, 20, 50, 40);
        ctx.strokeRect(15, 20, 50, 40);

        ctx.fillRect(10, 25, 5, 8);
        ctx.strokeRect(10, 25, 5, 8);
        ctx.fillRect(10, 47, 5, 8);
        ctx.strokeRect(10, 47, 5, 8);
        break;
      default:
        ctx.fillRect(20, 20, 40, 40);
        ctx.strokeRect(20, 20, 40, 40);
    }

    return canvas;
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    shapeType: string,
  ) => {
    e.dataTransfer.setData("application/shape-type", shapeType);
    e.dataTransfer.effectAllowed = "copy";

    const dragPreview = createDragPreview(shapeType);
    e.dataTransfer.setDragImage(dragPreview, 40, 40);

    appController.logInfo("Drag started for shape type:", shapeType);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {shapeDefinitions.length > 0 ? (
        shapeDefinitions.map((shape) => (
          <button
            key={shape.type}
            draggable="true"
            onClick={() => onSelectShape(shape.type)}
            onDragStart={(e) => handleDragStart(e, shape.type)}
            title={`Create ${shape.label}`}
            className="flex flex-col items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all duration-200 group"
          >
            <div className="w-8 h-8 mb-2 flex items-center justify-center text-lg text-gray-600 group-hover:text-blue-600 transition-colors">
              {getIcon(shape.type)}
            </div>
            <span className="text-xs text-gray-500 text-center group-hover:text-blue-700 font-medium">
              {shape.label}
            </span>
          </button>
        ))
      ) : (
        <div className="col-span-2 text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">
            <FaBan />
          </div>
          <p className="text-sm text-gray-500">No shapes available</p>
        </div>
      )}
    </div>
  );
};

export default Palette;
