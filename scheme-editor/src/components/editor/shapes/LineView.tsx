import React from "react";
import { Line as KonvaLine } from "react-konva";
import type { Line } from "../../../models/Line";
import type { BaseShape } from "../../../models/BaseShape";
import appController from "../../../Controllers/AppController";

interface LineViewProps {
  line: Line;
  shapes: BaseShape[];
  isSelected?: boolean;
}

const LineView: React.FC<LineViewProps> = ({
  line,
  shapes,
  isSelected = false,
}) => {
  const fromShape = shapes.find((shape) => shape.getId() === line.fromShapeId);
  const toShape = shapes.find((shape) => shape.getId() === line.toShapeId);

  if (!fromShape || !toShape) {
    appController.logWarn(
      `LineView: Shape not found for line ${line.id}. From: ${
        line.fromShapeId
      } (${!!fromShape}), To: ${line.toShapeId} (${!!toShape})`,
    );
    return null;
  }

  let fromConnectionPoint = fromShape.getConnectionPoint(
    line.fromConnectionPointId || "center",
  );
  let toConnectionPoint = toShape.getConnectionPoint(
    line.toConnectionPointId || "center",
  );

  if (!fromConnectionPoint) {
    appController.logWarn(
      `LineView: From connection point '${line.fromConnectionPointId}' not found for line ${line.id}, using center`,
    );
    fromConnectionPoint = fromShape.getConnectionPoint("center");

    if (!fromConnectionPoint) {
      const fromBounds = fromShape.getBounds();
      fromConnectionPoint = {
        id: "center",
        x: fromBounds.x + fromBounds.width / 2,
        y: fromBounds.y + fromBounds.height / 2,
      };
    }
  }

  if (!toConnectionPoint) {
    appController.logWarn(
      `LineView: To connection point '${line.toConnectionPointId}' not found for line ${line.id}, using center`,
    );
    toConnectionPoint = toShape.getConnectionPoint("center");

    if (!toConnectionPoint) {
      const toBounds = toShape.getBounds();
      toConnectionPoint = {
        id: "center",
        x: toBounds.x + toBounds.width / 2,
        y: toBounds.y + toBounds.height / 2,
      };
    }
  }

  const startPoint = {
    x: fromConnectionPoint.x,
    y: fromConnectionPoint.y,
  };

  const endPoint = {
    x: toConnectionPoint.x,
    y: toConnectionPoint.y,
  };

  const strokeWidth = line.strokeWidth || 2;

  const handleClick = (e: unknown) => {
    const konvaEvent = e as {
      cancelBubble?: boolean;
      evt?: { ctrlKey?: boolean };
    };
    konvaEvent.cancelBubble = true;
    const ctrlKey = konvaEvent.evt?.ctrlKey || false;
    appController.selectElement(line.id, ctrlKey);
  };

  return (
    <KonvaLine
      points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
      stroke={isSelected ? "#007bff" : line.strokeColor}
      strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
      listening={true}
      lineCap="round"
      lineJoin="round"
      onClick={handleClick}
      onTap={handleClick}
      attrs={{ lineId: line.id }}
    />
  );
};

export default LineView;
