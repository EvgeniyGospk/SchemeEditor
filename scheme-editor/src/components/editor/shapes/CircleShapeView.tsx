import React from "react";
import { Circle } from "react-konva";
import type { CircleShape } from "../../../models/shapes";

interface CircleShapeViewProps {
  shape: CircleShape;
  isSelected: boolean;
}

const CircleShapeView: React.FC<CircleShapeViewProps> = ({
  shape,
  isSelected,
}) => {
  return (
    <Circle
      key={shape.id}
      name={shape.id}
      x={shape.x}
      y={shape.y}
      radius={shape.radius}
      fill={shape.fillColor || "lightgreen"}
      stroke={isSelected ? "red" : shape.strokeColor || "black"}
      strokeWidth={isSelected ? 3 : shape.strokeWidth || 1}
      draggable={false}
    />
  );
};

export default CircleShapeView;
