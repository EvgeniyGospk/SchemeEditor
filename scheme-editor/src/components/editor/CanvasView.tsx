import React, { useRef, useEffect } from "react";
import type { BaseShape } from "../../models/BaseShape";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import appController from "../../Controllers/AppController";
import BaseShapeView from "./shapes/BaseShapeView";
import LineView from "./shapes/LineView";
import type { UID } from "../../types/common";
import type { ConnectionPoint } from "../../models/BaseShape";

interface CanvasViewProps {
  shapes: BaseShape[];
  lines?: import("../../models/Line").Line[];
  selectionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  } | null;
  onShapeContextMenu?: (shapeId: UID, event: unknown) => void;
  onConnectionPointClick?: (
    shapeId: UID,
    pointId: string,
    point: ConnectionPoint,
  ) => void;
}

const CanvasView: React.FC<CanvasViewProps> = ({
  shapes,
  lines = [],
  selectionBox,
  onShapeContextMenu,
  onConnectionPointClick,
}) => {
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    if (stageRef.current) {
      appController.setKonvaStage(stageRef.current);
    }
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const canvasEvent = appController.convertKonvaMouseEvent(e);
    appController.handleCanvasMouseDown(canvasEvent);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const canvasEvent = appController.convertKonvaMouseEvent(e);
    appController.handleCanvasMouseMove(canvasEvent);
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const canvasEvent = appController.convertKonvaMouseEvent(e);
    appController.handleCanvasMouseUp(canvasEvent);
  };

  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const canvasEvent = appController.convertKonvaMouseEvent(e);
    appController.handleCanvasDoubleClick(canvasEvent);
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        outline: "none",
      }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth * 0.6}
        height={window.innerHeight * 0.7}
        style={{ border: "1px solid #ccc", backgroundColor: "#f0f0f0" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
      >
        <Layer>
          {}
          {lines.map((line) => {
            const isSelected = appController.isElementSelected(line.id);
            return (
              <LineView
                key={line.id}
                line={line}
                shapes={shapes}
                isSelected={isSelected}
              />
            );
          })}

          {}
          {shapes
            .sort((a, b) => a.getZIndex() - b.getZIndex())
            .map((shape) => {
              try {
                const shapeId = shape.getId();
                const shapeIdString =
                  typeof shapeId === "string" ? shapeId : String(shapeId);
                const isSelected =
                  appController.isElementSelected(shapeIdString);
                return (
                  <BaseShapeView
                    key={shapeIdString}
                    shape={shape}
                    isSelected={isSelected}
                    onContextMenu={onShapeContextMenu}
                    onConnectionPointClick={onConnectionPointClick}
                  />
                );
              } catch (error) {
                appController.logError("Error rendering shape:", error, shape);
                return null;
              }
            })
            .filter(Boolean)}

          {}

          {}
          {selectionBox &&
            selectionBox.visible &&
            selectionBox.width > 0 &&
            selectionBox.height > 0 && (
              <Rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
                fill="rgba(0, 123, 255, 0.15)"
                stroke="#007bff"
                strokeWidth={2}
                dash={[8, 4]}
                listening={false}
              />
            )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasView;
