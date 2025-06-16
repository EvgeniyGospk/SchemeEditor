import React, { useState } from "react";
import { Circle, Group } from "react-konva";
import type { ConnectionPoint } from "../../../models/BaseShape";
import appController from "../../../Controllers/AppController";

interface ConnectionPointsProps {
  connectionPoints: ConnectionPoint[];
  visible: boolean;
  onConnectionPointClick?: (pointId: string, point: ConnectionPoint) => void;
  onConnectionPointMouseEnter?: () => void;
  isInDrawingMode?: boolean;
}

const ConnectionPoints: React.FC<ConnectionPointsProps> = ({
  connectionPoints,
  visible,
  onConnectionPointClick,
  onConnectionPointMouseEnter,
  isInDrawingMode = false,
}) => {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  if (!visible) return null;

  const handlePointClick = (point: ConnectionPoint, e: unknown) => {
    const event = e as {
      evt?: Event;
      cancelBubble?: boolean;
      stopPropagation?: () => void;
      preventDefault?: () => void;
    };
    if (event.evt) {
      event.evt.preventDefault();
      event.evt.stopPropagation();
      (
        event.evt as unknown as {
          stopImmediatePropagation?: () => void;
          cancelBubble?: boolean;
        }
      ).stopImmediatePropagation?.();
      (event.evt as unknown as { cancelBubble?: boolean }).cancelBubble = true;
    }
    event.cancelBubble = true;

    event.stopPropagation?.();
    event.preventDefault?.();

    if (onConnectionPointClick) {
      onConnectionPointClick(point.id, point);
    }
  };

  const handlePointMouseDown = (e: unknown) => {
    const event = e as {
      evt?: Event;
      cancelBubble?: boolean;
      stopPropagation?: () => void;
      preventDefault?: () => void;
    };
    if (event.evt) {
      event.evt.preventDefault();
      event.evt.stopPropagation();
      (
        event.evt as unknown as {
          stopImmediatePropagation?: () => void;
          cancelBubble?: boolean;
        }
      ).stopImmediatePropagation?.();
      (event.evt as unknown as { cancelBubble?: boolean }).cancelBubble = true;
    }
    event.cancelBubble = true;
    event.stopPropagation?.();
    event.preventDefault?.();
  };

  const handlePointMouseEnter = (pointId: string, e: unknown) => {
    setHoveredPointId(pointId);

    if (onConnectionPointMouseEnter) {
      onConnectionPointMouseEnter();
    }

    try {
      const event = e as {
        target?: {
          getStage?: () => {
            container?: () => { style?: CSSStyleDeclaration };
          };
        };
      };
      const target = event.target;
      const stage = target?.getStage?.();
      const container = stage?.container?.();
      if (container && typeof container.style !== "undefined") {
        container.style.cursor = "pointer";
      }
    } catch (error) {
      appController.logWarn("Error setting cursor:", error);
    }
  };

  const handlePointMouseLeave = (e: unknown) => {
    setHoveredPointId(null);

    try {
      const event = e as {
        target?: {
          getStage?: () => {
            container?: () => { style?: CSSStyleDeclaration };
          };
        };
      };
      const target = event.target;
      const stage = target?.getStage?.();
      const container = stage?.container?.();
      if (container && typeof container.style !== "undefined") {
        container.style.cursor = isInDrawingMode ? "crosshair" : "default";
      }
    } catch (error) {
      appController.logWarn("Error resetting cursor:", error);
    }
  };

  return (
    <Group>
      {connectionPoints.map((point) => {
        const isHovered = hoveredPointId === point.id;
        const shouldHighlight = isInDrawingMode || isHovered;

        const scale = isInDrawingMode ? 1.2 : 1;
        const opacity = isInDrawingMode ? 0.8 : 0.4;

        return (
          <React.Fragment key={point.id}>
            {}
            {shouldHighlight && (
              <Circle
                x={point.x}
                y={point.y}
                radius={10 * scale}
                fill="transparent"
                stroke={isInDrawingMode ? "#ff6b35" : "#007bff"}
                strokeWidth={2}
                opacity={isHovered ? 0.8 : opacity}
                listening={false}
                dash={isInDrawingMode ? [4, 2] : undefined}
              />
            )}
            {}
            <Circle
              x={point.x}
              y={point.y}
              radius={(shouldHighlight ? 6 : 5) * (isInDrawingMode ? scale : 1)}
              fill={
                isHovered ? "#ff6b35" : isInDrawingMode ? "#28a745" : "#007bff"
              }
              stroke="#ffffff"
              strokeWidth={shouldHighlight ? 3 : 2}
              opacity={isInDrawingMode ? 1 : 0.8}
              listening={true}
              shadowColor={shouldHighlight ? "#000000" : "transparent"}
              shadowBlur={shouldHighlight ? 4 : 0}
              shadowOpacity={shouldHighlight ? 0.4 : 0}
              onMouseDown={handlePointMouseDown}
              onClick={(e) => handlePointClick(point, e)}
              onTap={(e) => handlePointClick(point, e)}
              onMouseEnter={(e) => handlePointMouseEnter(point.id, e)}
              onMouseLeave={handlePointMouseLeave}
              name={`connection-point-${point.id}`}
            />
          </React.Fragment>
        );
      })}
    </Group>
  );
};

export default ConnectionPoints;
