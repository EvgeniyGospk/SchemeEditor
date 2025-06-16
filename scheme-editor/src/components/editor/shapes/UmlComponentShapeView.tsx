import React from "react";
import { Group, Rect, Text } from "react-konva";
import type { UmlComponentShape } from "../../../models/shapes";

interface UmlComponentShapeViewProps {
  shape: UmlComponentShape;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e: unknown) => void;
  onContextMenu?: (e: unknown) => void;
  onMouseDown?: (e: unknown) => void;
  onMouseUp?: (e: unknown) => void;
}

const UmlComponentShapeView: React.FC<UmlComponentShapeViewProps> = ({
  shape,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseUp,
}) => {
  const {
    id,
    x,
    y,
    width,
    height,
    componentName,
    fillColor,
    strokeColor,
    strokeWidth,
  } = shape;

  const currentStrokeColor = strokeColor || "black";
  const currentStrokeWidth = strokeWidth || 1;

  const padding = 8;
  const interfaceRectSize = 12;

  return (
    <Group
      key={id}
      name={id}
      id={id}
      x={x}
      y={y}
      draggable={false}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onTap={onClick}
      onContextMenu={onContextMenu}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {}
      <Rect
        id={id}
        name={id}
        width={width}
        height={height}
        fill={fillColor || "#E6F3FF"}
        stroke={currentStrokeColor}
        strokeWidth={currentStrokeWidth}
      />

      {}
      <Text
        text="«component»"
        x={padding}
        y={padding}
        width={width - padding * 2}
        fontSize={10}
        align="center"
        fill="gray"
        fontStyle="italic"
        listening={false}
      />

      <Text
        text={componentName || "Component"}
        x={padding}
        y={padding + 15}
        width={width - padding * 2}
        fontSize={13}
        fontStyle="bold"
        align="center"
        fill="black"
        wrap="word"
        ellipsis={true}
        listening={false}
      />

      {}
      <Rect
        x={-interfaceRectSize / 2}
        y={height * 0.25 - interfaceRectSize / 2}
        width={interfaceRectSize}
        height={interfaceRectSize}
        fill={fillColor || "#E6F3FF"}
        stroke={currentStrokeColor}
        strokeWidth={1}
        listening={false}
      />

      <Rect
        x={-interfaceRectSize / 2}
        y={height * 0.75 - interfaceRectSize / 2}
        width={interfaceRectSize}
        height={interfaceRectSize}
        fill={fillColor || "#E6F3FF"}
        stroke={currentStrokeColor}
        strokeWidth={1}
        listening={false}
      />
    </Group>
  );
};

export default UmlComponentShapeView;
