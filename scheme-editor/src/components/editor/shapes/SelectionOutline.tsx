import React from "react";
import { Rect, Circle } from "react-konva";
import type { BaseShape } from "../../../models/BaseShape";

interface SelectionOutlineProps {
  shape: BaseShape;
}

const SelectionOutline: React.FC<SelectionOutlineProps> = ({ shape }) => {
  const bounds = shape.getBounds();
  const properties = shape.getProperties();

  const selectionColor = "#007bff";
  const selectionStrokeWidth = 2;
  const padding = 4;

  const renderSelectionForShape = () => {
    switch (shape.type) {
      case "circle": {
        const shapeProps = properties as { radius?: number };
        const radius = shapeProps.radius || bounds.width / 2;
        const selectionRadius = radius + padding;

        return (
          <Circle
            x={shape.x}
            y={shape.y}
            radius={selectionRadius}
            stroke={selectionColor}
            strokeWidth={selectionStrokeWidth}
            fill="transparent"
            dash={[6, 4]}
            listening={false}
          />
        );
      }

      default: {
        const selectionX = bounds.x - padding;
        const selectionY = bounds.y - padding;
        const selectionWidth = bounds.width + padding * 2;
        const selectionHeight = bounds.height + padding * 2;

        return (
          <Rect
            x={selectionX}
            y={selectionY}
            width={selectionWidth}
            height={selectionHeight}
            stroke={selectionColor}
            strokeWidth={2}
            fill="transparent"
            dash={[6, 4]}
            listening={false}
          />
        );
      }
    }
  };

  return renderSelectionForShape();
};

export default SelectionOutline;
