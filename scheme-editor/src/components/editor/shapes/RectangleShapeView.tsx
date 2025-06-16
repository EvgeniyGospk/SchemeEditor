import React from "react";
import { Rect } from "react-konva";
import type { RectangleShape } from "../../../models/shapes";

interface RectangleShapeViewProps {
  shape: RectangleShape;
  isSelected: boolean;
}

const RectangleShapeView: React.FC<RectangleShapeViewProps> = ({
  shape,
  isSelected,
}) => {
  const shapeId = shape.getId();
  const shapeIdString = typeof shapeId === "string" ? shapeId : String(shapeId);

  return (
    <Rect
      key={shapeIdString}
      name={shapeIdString}
      id={shapeIdString}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fillColor || "lightblue"}
      stroke={isSelected ? "red" : shape.strokeColor || "black"}
      strokeWidth={isSelected ? 3 : shape.strokeWidth || 1}
      draggable={false}
    />
  );
};

export default RectangleShapeView;
