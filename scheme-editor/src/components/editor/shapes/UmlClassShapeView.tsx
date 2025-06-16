import React from "react";
import { Group, Rect, Text, Line } from "react-konva";
import type { UmlClassShape } from "../../../models/shapes";

interface UmlClassShapeViewProps {
  shape: UmlClassShape;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e: unknown) => void;
  onContextMenu?: (e: unknown) => void;
  onMouseDown?: (e: unknown) => void;
  onMouseUp?: (e: unknown) => void;
}

const UmlClassShapeView: React.FC<UmlClassShapeViewProps> = ({
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
    className,
    attributes,
    methods,
    fillColor,
    strokeColor,
    strokeWidth,
  } = shape;

  const currentStrokeColor = strokeColor || "black";
  const currentStrokeWidth = strokeWidth || 1;

  const minHeaderHeight = 25;
  const lineHeight = 16;
  const padding = 8;

  const attributeLines = attributes
    ? attributes.split("\n").filter((line) => line.trim())
    : [];
  const methodLines = methods
    ? methods.split("\n").filter((line) => line.trim())
    : [];

  const attributeMinHeight = Math.max(
    20,
    attributeLines.length * lineHeight + padding * 2,
  );
  const methodMinHeight = Math.max(
    20,
    methodLines.length * lineHeight + padding * 2,
  );
  const totalMinHeight = minHeaderHeight + attributeMinHeight + methodMinHeight;

  let headerHeight = minHeaderHeight;
  let attributeHeight, methodHeight;

  if (height >= totalMinHeight) {
    const extraSpace = height - totalMinHeight;
    attributeHeight = attributeMinHeight + extraSpace * 0.4;
    methodHeight = methodMinHeight + extraSpace * 0.6;
  } else {
    const compressionRatio = height / totalMinHeight;
    headerHeight = Math.max(20, minHeaderHeight * compressionRatio);
    attributeHeight = Math.max(15, attributeMinHeight * compressionRatio);
    methodHeight = Math.max(15, methodMinHeight * compressionRatio);
  }

  const attributeY = headerHeight;
  const methodY = headerHeight + attributeHeight;

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
        fill={fillColor || "#FFFFE0"}
        stroke={currentStrokeColor}
        strokeWidth={currentStrokeWidth}
      />

      {}
      <Text
        text={className || "ClassName"}
        x={padding}
        y={padding}
        width={width - padding * 2}
        height={headerHeight - padding}
        fontSize={14}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        fill="black"
        wrap="none"
        ellipsis={true}
        listening={false}
      />

      {}
      <Line
        points={[0, headerHeight, width, headerHeight]}
        stroke={currentStrokeColor}
        strokeWidth={1}
        listening={false}
      />

      {}
      <Text
        text={attributeLines.join("\n") || ""}
        x={padding}
        y={attributeY + 4}
        width={width - padding * 2}
        height={attributeHeight - 8}
        fontSize={11}
        align="left"
        verticalAlign="top"
        fill="black"
        wrap="none"
        ellipsis={false}
        listening={false}
      />

      {}
      <Line
        points={[0, methodY, width, methodY]}
        stroke={currentStrokeColor}
        strokeWidth={1}
        listening={false}
      />

      {}
      <Text
        text={methodLines.join("\n") || ""}
        x={padding}
        y={methodY + 4}
        width={width - padding * 2}
        height={methodHeight - 8}
        fontSize={11}
        align="left"
        verticalAlign="top"
        fill="black"
        wrap="none"
        ellipsis={false}
        listening={false}
      />
    </Group>
  );
};

export default UmlClassShapeView;
