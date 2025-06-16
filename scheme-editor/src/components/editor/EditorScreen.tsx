import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCubes,
  FaCheckCircle,
  FaCog,
  FaChartBar,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import CanvasView from "./CanvasView";
import type { BaseShape } from "../../models/BaseShape";
import type { Line } from "../../models/Line";
import Palette from "./Palette";
import Toolbar from "./Toolbar/Toolbar";
import PropertiesPanel from "./PropertiesPanel/PropertiesPanel";
import appController from "../../Controllers/AppController";
import { Scheme } from "../../models/Scheme";
import React from "react";
import { useContextMenu } from "../../hooks/useContextManager";
import ContextMenu from "./ContextMenu";
import type { UID } from "../../types/common";
import type { ConnectionPoint } from "../../models/BaseShape";

function EditorScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shapes, setShapes] = useState<BaseShape[]>(
    appController.getCurrentShapes(),
  );
  const [lines, setLines] = useState<Line[]>(appController.getCurrentLines());

  const [schemeName, setSchemeName] = useState("New Scheme");

  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  } | null>(null);

  const [, forceUpdateOnSelectionChange] = useState(0);

  const { contextMenuState, showContextMenu, closeContextMenu } =
    useContextMenu();

  const handleShapeContextMenu = useCallback(
    (shapeId: UID, event: unknown) => {
      appController.logInfo("Context menu requested for shape:", shapeId);
      showContextMenu(shapeId, event as MouseEvent);
    },
    [showContextMenu],
  );

  const handleConnectionPointClick = useCallback(
    (shapeId: UID, pointId: string, point: ConnectionPoint) => {
      appController.logInfo(
        "EditorScreen: Connection point clicked:",
        shapeId,
        pointId,
        point,
      );

      const shapeIdString =
        typeof shapeId === "string" ? shapeId : String(shapeId);

      if (appController.isInDrawingLineMode()) {
        appController.logInfo(
          "EditorScreen: Already in drawing mode, finishing line",
        );

        appController.finishLineToConnectionPoint(shapeIdString, pointId);
      } else {
        appController.logInfo(
          "EditorScreen: Starting new line from connection point",
        );

        appController.startDrawingLineFromConnectionPoint(
          shapeIdString,
          pointId,
        );
      }
    },
    [],
  );

  const handleContextMenuDelete = useCallback((shapeId: UID) => {
    appController.logInfo("Delete shape:", shapeId);
    appController.deleteShape(
      typeof shapeId === "string" ? shapeId : String(shapeId),
    );
  }, []);

  const handleContextMenuBringToFront = useCallback((shapeId: UID) => {
    appController.logInfo("Bring to front:", shapeId);
    appController.bringToFront(
      typeof shapeId === "string" ? shapeId : String(shapeId),
    );
  }, []);

  const handleContextMenuSendToBack = useCallback((shapeId: UID) => {
    appController.logInfo("Send to back:", shapeId);
    appController.sendToBack(
      typeof shapeId === "string" ? shapeId : String(shapeId),
    );
  }, []);

  const handleModelUpdate = useCallback(() => {
    setShapes([...appController.getCurrentShapes()]);
    setLines([...appController.getCurrentLines()]);
  }, []);

  const handleSelectionUpdate = useCallback(() => {
    forceUpdateOnSelectionChange((prev) => prev + 1);
  }, []);

  const updateSelectionBox = useCallback(() => {
    const box = appController.getSelectionBox();
    setSelectionBox(box);
  }, []);

  useEffect(() => {
    const initializeScheme = async () => {
      const schemeId = searchParams.get("id");
      const newSchemeName = searchParams.get("name");
      const isNew = searchParams.get("new") === "true";

      if (schemeId && !isNew) {
        try {
          const loadedScheme =
            await appController.loadSchemeFromStorage(schemeId);
          if (loadedScheme) {
            appController.setScheme(loadedScheme);
            setSchemeName(loadedScheme.name);

            handleModelUpdate();
            handleSelectionUpdate();
          }
        } catch (error) {
          appController.logError("Failed to load scheme:", error);
        }
      } else if (schemeId && isNew && newSchemeName) {
        const newScheme = new Scheme({
          id: schemeId,
          name: newSchemeName,
          shapes: [],
          lines: [],
          lastModified: Date.now(),
        });
        appController.setScheme(newScheme);
        setSchemeName(newSchemeName);
        handleModelUpdate();
      }
    };

    initializeScheme();
  }, [searchParams, handleModelUpdate, handleSelectionUpdate]);

  useEffect(() => {
    const selectionListener = () => {
      handleSelectionUpdate();
    };

    appController.onSelectionChanged(selectionListener);

    const schemeObserver = {
      update: () => {
        appController.logInfo(
          "EditorScreen: Scheme updated, refreshing shapes and lines",
        );
        handleModelUpdate();
      },
    };

    const currentScheme = appController.getScheme();
    currentScheme.registerObserver(schemeObserver);

    let animationFrameId: number;

    const animationLoop = () => {
      updateSelectionBox();

      animationFrameId = requestAnimationFrame(animationLoop);
    };

    animationFrameId = requestAnimationFrame(animationLoop);

    return () => {
      appController.offSelectionChanged(selectionListener);

      currentScheme.unregisterObserver(schemeObserver);

      cancelAnimationFrame(animationFrameId);
    };
  }, [
    handleModelUpdate,
    handleSelectionUpdate,
    updateSelectionBox,
    schemeName,
  ]);

  useEffect(() => {
    let lastActionTime = 0;
    const DEBOUNCE_DELAY = 150;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isInputElement =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable);

      if (isInputElement) {
        return;
      }

      const now = Date.now();

      if (event.ctrlKey && !event.shiftKey && event.code === "KeyZ") {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const success = appController.undo();
        if (success) {
          appController.logInfo("EditorScreen: Undo executed");
        }
        return;
      }

      if (event.ctrlKey && event.shiftKey && event.code === "KeyZ") {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const success = appController.redo();
        if (success) {
          appController.logInfo("EditorScreen: Redo executed");
        }
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.code === "KeyY") {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const success = appController.redo();
        if (success) {
          appController.logInfo("EditorScreen: Redo executed");
        }
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.code === "KeyS") {
        event.preventDefault();
        event.stopPropagation();
        appController.saveScheme();
        appController.logInfo("EditorScreen: Save executed");
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.code === "KeyA") {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const canvasEvent = appController.convertKeyboardEvent(event);
        appController.handleKeyDown(canvasEvent);
        appController.logInfo("EditorScreen: Select All executed");
        return;
      }

      if (event.code === "Delete" || event.code === "Backspace") {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const canvasEvent = appController.convertKeyboardEvent(event);
        appController.handleKeyDown(canvasEvent);
        appController.logInfo("EditorScreen: Delete executed");
        return;
      }

      if (
        event.code === "ArrowUp" ||
        event.code === "ArrowDown" ||
        event.code === "ArrowLeft" ||
        event.code === "ArrowRight"
      ) {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const canvasEvent = appController.convertKeyboardEvent(event);
        appController.handleKeyDown(canvasEvent);
        appController.logInfo("EditorScreen: Arrow key movement executed");
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        if (now - lastActionTime < DEBOUNCE_DELAY) {
          return;
        }
        lastActionTime = now;

        const canvasEvent = appController.convertKeyboardEvent(event);
        appController.handleKeyDown(canvasEvent);
        appController.logInfo("EditorScreen: Escape executed");
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, []);

  const handleSelectShapeInPalette = (type: string) => {
    appController.startAddingShape(type);
    appController.logInfo("EditorScreen: Shape selected in palette - ", type);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const shapeType = e.dataTransfer.getData("application/shape-type");

    if (!shapeType) {
      appController.logWarn("No shape type found in drop data");
      return;
    }

    const canvasContainer = e.currentTarget;
    const rect = canvasContainer.getBoundingClientRect();

    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;

    const shapeFactory = appController.getShapeFactory();
    const defaultProperties = shapeFactory.getDefaultProperties(shapeType);

    const konvaStage = appController.getKonvaStage();
    if (konvaStage) {
      const stageBox = konvaStage.container().getBoundingClientRect();
      const stageX = e.clientX - stageBox.left;
      const stageY = e.clientY - stageBox.top;

      appController.requestCreateShape(shapeType, {
        x: stageX,
        y: stageY,
        ...defaultProperties,
      });
      appController.logInfo(
        `Shape ${shapeType} created via drag-and-drop at (${stageX}, ${stageY})`,
      );
    } else {
      appController.requestCreateShape(shapeType, {
        x: containerX,
        y: containerY,
        ...defaultProperties,
      });
      appController.logInfo(
        `Shape ${shapeType} created via drag-and-drop at (${containerX}, ${containerY}) [fallback]`,
      );
    }
  };

  const selectedCount = (() => {
    try {
      const selectedIds = appController.getSelectedElementIds();
      return Array.isArray(selectedIds) ? selectedIds.length : 0;
    } catch (error) {
      appController.logError("Error getting selected element IDs:", error);
      return 0;
    }
  })();

  return (
    <div
      className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100"
      style={{ outline: "none" }}
    >
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Back to Welcome Screen"
          >
            <FaArrowLeft className="size-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaEdit className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Scheme Editor</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">•</span>
                <h2 className="text-lg text-gray-700 font-medium">
                  {schemeName}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 flex flex-col overflow-y-auto shadow-lg">
          <div className="border-b border-gray-200/60">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Shapes & Tools
            </div>
            <div className="p-4">
              <Palette onSelectShape={handleSelectShapeInPalette} />
            </div>
          </div>

          <div className="border-b border-gray-200/60">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Layers
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shapes.map((shape, index) => (
                  <div
                    key={shape.getId()}
                    className={`flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      appController.isElementSelected(shape.getId())
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                    onClick={(e) => {
                      const isMultiSelect = e.ctrlKey || e.metaKey;
                      appController.selectElement(shape.getId(), isMultiSelect);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-3 rounded ${
                          shape.getType() === "circle"
                            ? "bg-blue-500"
                            : shape.getType() === "rectangle"
                              ? "bg-green-500"
                              : shape.getType() === "umlClass"
                                ? "bg-purple-500"
                                : "bg-orange-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {shape.getType()} {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
                {shapes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="flex justify-center text-6xl text-gray-300 mb-3">
                      <FaChartBar />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      No shapes yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add shapes from the palette above
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center p-8">
          <div
            className="bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden backdrop-blur-sm"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CanvasView
              shapes={shapes}
              lines={lines}
              selectionBox={selectionBox}
              onShapeContextMenu={handleShapeContextMenu}
              onConnectionPointClick={handleConnectionPointClick}
            />
          </div>
        </main>

        <aside className="w-80 bg-white/90 backdrop-blur-xl border-l border-gray-200/50 flex flex-col overflow-y-auto shadow-lg">
          <div className="px-4 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-gray-100/50">
            <div className="flex items-center gap-2">
              <FaCog className="text-lg" />
              <h3 className="text-sm font-semibold text-gray-900">
                Properties
              </h3>
            </div>
          </div>
          <div className="p-4 flex-1">
            <React.Suspense
              fallback={
                <div className="p-4 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">
                      Loading properties...
                    </span>
                  </div>
                </div>
              }
            >
              <PropertiesPanel />
            </React.Suspense>
          </div>
        </aside>
      </div>

      <footer className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-6 py-2 flex items-center justify-between text-xs text-gray-500 shadow-lg">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <FaCubes /> Objects: {shapes.length}
          </span>
          <span className="flex items-center gap-2">
            <FaCheckCircle /> Selected: {selectedCount}
          </span>
          <span className="text-blue-600">Ctrl+Z/Y for Undo/Redo</span>
        </div>
      </footer>

      <ContextMenu
        visible={contextMenuState.visible}
        x={contextMenuState.x}
        y={contextMenuState.y}
        shapeId={contextMenuState.shapeId}
        onClose={closeContextMenu}
        onDelete={handleContextMenuDelete}
        onBringToFront={handleContextMenuBringToFront}
        onSendToBack={handleContextMenuSendToBack}
      />
    </div>
  );
}

export default EditorScreen;
