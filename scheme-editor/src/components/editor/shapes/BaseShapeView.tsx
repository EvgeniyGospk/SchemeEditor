import React, { useState, useCallback, useRef, useEffect } from "react";
import { Rect, Circle, Text } from "react-konva";
import type { BaseShape } from "../../../models/BaseShape";
import appController from "../../../Controllers/AppController";
import type { UID } from "../../../types/common";
import { DragStateService } from "../../../core/services/DragStateService";

import ConnectionPoints from "./ConnectionPoints";
import type { ConnectionPoint } from "../../../models/BaseShape";
import UmlClassShapeView from "./UmlClassShapeView";
import UmlComponentShapeView from "./UmlComponentShapeView";
import SelectionOutline from "./SelectionOutline";
import type { UmlClassShape, UmlComponentShape } from "../../../models/shapes";

interface BaseShapeViewProps {
  shape: BaseShape;
  isSelected: boolean;
  onContextMenu?: (shapeId: UID, event: unknown) => void;
  onConnectionPointClick?: (
    shapeId: UID,
    pointId: string,
    point: ConnectionPoint,
  ) => void;
}

const BaseShapeView: React.FC<BaseShapeViewProps> = ({
  shape,
  isSelected,
  onContextMenu,
  onConnectionPointClick,
}) => {
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const isDragRef = useRef(false);

  const bounds = shape.getBounds();
  const properties = shape.getProperties();
  const shapeId = shape.getId();

  const shapeIdString = typeof shapeId === "string" ? shapeId : String(shapeId);

  const isDraggable = false;
  const isInDrawingMode = appController.isInDrawingLineMode();
  const dragStateService = DragStateService.getInstance();

  const fillColor = properties.fillColor || "#ffffff";
  const strokeColor = properties.strokeColor || "#000000";
  const strokeWidth = properties.strokeWidth || 2;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleClick = (e: unknown) => {
    if (isDragRef.current) {
      return;
    }

    const konvaEvent = e as {
      cancelBubble?: boolean;
      evt?: { ctrlKey?: boolean };
    };
    konvaEvent.cancelBubble = true;
    const ctrlKey = konvaEvent.evt?.ctrlKey || false;
    appController.selectElement(shapeIdString, ctrlKey);
  };

  const handleContextMenu = (e: unknown) => {
    const konvaEvent = e as { evt?: { preventDefault?: () => void } };
    konvaEvent.evt?.preventDefault?.();

    if (onContextMenu) {
      onContextMenu(shapeIdString, konvaEvent.evt);
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (isDragRef.current || dragStateService.isDragging(shapeIdString)) {
      return;
    }

    clearHideTimeout();
    setShowConnectionPoints(true);
  }, [clearHideTimeout, shapeIdString, dragStateService]);

  const handleMouseLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowConnectionPoints(false);
      hideTimeoutRef.current = null;
    }, 150);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragRef.current = true;

    clearHideTimeout();
    setShowConnectionPoints(false);
  }, [clearHideTimeout]);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      isDragRef.current = false;
    }, 100);
  }, []);

  const handleConnectionPointClick = (
    pointId: string,
    point: ConnectionPoint,
  ) => {
    if (onConnectionPointClick) {
      onConnectionPointClick(shapeIdString, pointId, point);
    }
  };

  const handleConnectionPointMouseEnter = useCallback(() => {
    clearHideTimeout();
    setShowConnectionPoints(true);
  }, [clearHideTimeout]);

  const commonProps = {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    draggable: isDraggable,
    onClick: handleClick,
    onTap: handleClick,
    onContextMenu: handleContextMenu,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,

    id: shapeIdString,
    name: shapeIdString,
  };

  const renderShape = () => {
    switch (shape.type) {
      case "rectangle": {
        return (
          <>
            <Rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              {...commonProps}
            />
            {shape.text && (
              <Text
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                text={shape.text}
                fontSize={14}
                fontFamily="Arial"
                fill="#333333"
                align="center"
                verticalAlign="middle"
                wrap="word"
                ellipsis={true}
                listening={false}
              />
            )}
          </>
        );
      }

      case "circle": {
        const shapeProps = properties as { radius?: number };
        const radius = shapeProps.radius || bounds.width / 2;
        return (
          <>
            <Circle x={shape.x} y={shape.y} radius={radius} {...commonProps} />
            {shape.text && (
              <Text
                x={shape.x - radius * 0.7}
                y={shape.y}
                width={radius * 1.4}
                text={shape.text}
                fontSize={14}
                fontFamily="Arial"
                fill="#333333"
                align="center"
                verticalAlign="middle"
                wrap="word"
                ellipsis={true}
                listening={false}
              />
            )}
          </>
        );
      }

      case "umlClass": {
        return (
          <UmlClassShapeView
            shape={shape as UmlClassShape}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />
        );
      }

      case "umlComponent": {
        return (
          <UmlComponentShapeView
            shape={shape as UmlComponentShape}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />
        );
      }

      default: {
        return (
          <>
            <Rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              {...commonProps}
            />
            {shape.text && (
              <Text
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                text={shape.text}
                fontSize={14}
                fontFamily="Arial"
                fill="#333333"
                align="center"
                verticalAlign="middle"
                wrap="word"
                ellipsis={true}
                listening={false}
              />
            )}
          </>
        );
      }
    }
  };

  const getConnectionPointsForRender = () => {
    return shape.getConnectionPoints();
  };

  return (
    <>
      {renderShape()}
      {isSelected && <SelectionOutline shape={shape} />}
      <ConnectionPoints
        connectionPoints={getConnectionPointsForRender()}
        visible={showConnectionPoints || isInDrawingMode}
        onConnectionPointClick={handleConnectionPointClick}
        onConnectionPointMouseEnter={handleConnectionPointMouseEnter}
        isInDrawingMode={isInDrawingMode}
      />
    </>
  );
};

export default BaseShapeView;
