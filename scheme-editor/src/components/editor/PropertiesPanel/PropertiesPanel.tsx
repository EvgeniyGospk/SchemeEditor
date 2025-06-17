import React, { useState, useEffect, useCallback, useRef } from "react";
import appController from "../../../Controllers/AppController";
import type { BaseShape } from "../../../models/BaseShape";
import type { Line } from "../../../models/Line";

const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder = "#ffffff" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {}
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="color"
              value={value || placeholder}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-600 transition-colors"
              title="Открыть палитру"
            >
              ⋯
            </button>
          </div>
          <input
            type="text"
            value={value || placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm font-mono"
            placeholder={placeholder}
          />
        </div>

        {}
        {isOpen && (
          <div className="absolute z-10 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="grid grid-cols-10 gap-1 w-48"></div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const NumberInput: React.FC<{
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}> = ({ label, value, onChange, min, max, step, defaultValue = 0 }) => {
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (newValue === "") {
      return;
    }

    const numValue = Number(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    if (localValue === "" || isNaN(Number(localValue))) {
      setLocalValue(defaultValue.toString());
      onChange(defaultValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
};

const PropertiesPanel: React.FC = () => {
  const [selectedShapes, setSelectedShapes] = useState<BaseShape[]>([]);
  const [selectedLines, setSelectedLines] = useState<Line[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const debounceTimers = useRef<Map<string, number>>(new Map());
  const isMounted = useRef<boolean>(true);

  const updateSelectedElements = useCallback(() => {
    try {
      const shapes = appController?.getSelectedShapes() || [];
      const lines = appController?.getSelectedLines() || [];

      setSelectedShapes(shapes);
      setSelectedLines(lines);
    } catch (error) {
      appController.logError("Error updating selected elements:", error);
      setSelectedShapes([]);
      setSelectedLines([]);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    let cleanupFunction: (() => void) | null = null;

    const initializeComponent = () => {
      try {
        const tryInitialize = () => {
          if (!isMounted.current) return;

          const selectionListener = () => {
            if (isMounted.current) {
              updateSelectedElements();
            }
          };

          if (
            appController &&
            typeof appController.onSelectionChanged === "function"
          ) {
            appController.onSelectionChanged(selectionListener);
            updateSelectedElements();
            setIsInitialized(true);

            cleanupFunction = () => {
              if (
                appController &&
                typeof appController.offSelectionChanged === "function"
              ) {
                try {
                  appController.offSelectionChanged(selectionListener);
                } catch (error) {
                  appController.logError(
                    "Error removing selection listener:",
                    error
                  );
                }
              }
            };
          } else {
            setTimeout(tryInitialize, 50);
          }
        };

        tryInitialize();
      } catch (error) {
        appController.logError("Error initializing PropertiesPanel:", error);
        setIsInitialized(true);
      }
    };

    initializeComponent();

    return () => {
      isMounted.current = false;
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [updateSelectedElements]);

  const handlePropertyChange = useCallback(
    (
      property: string,
      value: string | number,
      elementType: "shape" | "line" = "shape"
    ) => {
      if (
        (selectedShapes.length > 0 || selectedLines.length > 0) &&
        appController
      ) {
        const existingTimer = debounceTimers.current.get(property);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const delay =
          property === "text" ||
          property === "className" ||
          property === "componentName" ||
          property === "attributes" ||
          property === "methods"
            ? 50
            : 100;

        const newTimer = setTimeout(() => {
          try {
            if (elementType === "shape" && selectedShapes.length > 0) {
              if (selectedShapes.length > 1) {
                const shapeIds = selectedShapes
                  .map((shape) => shape.getId())
                  .filter((id): id is string => typeof id === "string");

                if (shapeIds.length > 0) {
                  appController.executeChangeMultiplePropertiesCommand(
                    shapeIds,
                    { [property]: value },
                    "shape"
                  );
                }
              } else {
                const shapeId = selectedShapes[0].getId();
                if (typeof shapeId === "string") {
                  appController.executeChangePropertyCommand(
                    shapeId,
                    { [property]: value },
                    "shape"
                  );
                }
              }
            } else if (elementType === "line" && selectedLines.length > 0) {
              if (selectedLines.length > 1) {
                const lineIds = selectedLines
                  .map((line) => line.id)
                  .filter((id): id is string => typeof id === "string");

                if (lineIds.length > 0) {
                  appController.executeChangeMultiplePropertiesCommand(
                    lineIds,
                    { [property]: value },
                    "line"
                  );
                }
              } else {
                const lineId = selectedLines[0].id;
                if (typeof lineId === "string") {
                  appController.executeChangePropertyCommand(
                    lineId,
                    { [property]: value },
                    "line"
                  );
                }
              }
            }
          } catch (error) {
            appController.logError("Error changing property:", error);
          }
          debounceTimers.current.delete(property);
        }, delay);

        debounceTimers.current.set(property, newTimer);
      }
    },
    [selectedShapes, selectedLines]
  );

  if (!isInitialized) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading properties...</span>
        </div>
      </div>
    );
  }

  if (selectedShapes.length === 0 && selectedLines.length === 0) {
    return (
      <div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 font-medium">
            No element selected
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Select a shape or line to edit its properties
          </p>
        </div>
      </div>
    );
  }

  if (selectedShapes.length === 0 && selectedLines.length > 0) {
    const selectedLine = selectedLines[0];
    const lineProperties = selectedLine.getProperties();

    return (
      <div className="space-y-4">
        {selectedLines.length > 1 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {selectedLines.length} lines selected
                </p>
                <p className="text-xs text-blue-600">
                  Changes will apply to all selected lines
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <input
              type="text"
              value="Line"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div className="space-y-4">
            <ColorPicker
              label="Stroke Color"
              value={lineProperties.strokeColor || "#000000"}
              onChange={(color) =>
                handlePropertyChange("strokeColor", color, "line")
              }
              placeholder="#000000"
            />

            <NumberInput
              label="Stroke Width"
              value={lineProperties.strokeWidth}
              onChange={(value) =>
                handlePropertyChange("strokeWidth", value, "line")
              }
              min={0.5}
              max={10}
              step={0.5}
              defaultValue={2}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Connection Info
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Shape ID
                </label>
                <input
                  type="text"
                  value={lineProperties.fromShapeId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Shape ID
                </label>
                <input
                  type="text"
                  value={lineProperties.toShapeId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedShape = selectedShapes[0];
  if (!selectedShape || typeof selectedShape.getProperties !== "function") {
    return (
      <div>
        <div className="text-center py-8">
          <p className="text-sm text-red-600 font-medium">Invalid shape</p>
          <p className="text-xs text-gray-400 mt-1">
            The selected shape has an invalid format
          </p>
        </div>
      </div>
    );
  }

  let properties;
  try {
    properties = selectedShape.getProperties();
  } catch (error) {
    appController.logError("Error getting shape properties:", error);
    return (
      <div>
        <div className="text-center py-8">
          <p className="text-sm text-red-600 font-medium">
            Error loading properties
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Unable to load shape properties
          </p>
        </div>
      </div>
    );
  }

  if (!properties || typeof properties !== "object") {
    return (
      <div>
        <div className="text-center py-8">
          <p className="text-sm text-yellow-600 font-medium">
            No properties available
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This shape type has no editable properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedShapes.length > 1 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-medium text-blue-700">
                {selectedShapes.length} shapes selected
              </p>
              <p className="text-xs text-blue-600">
                Changes will apply to all selected shapes
              </p>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <input
            type="text"
            value={
              selectedShapes.length > 1
                ? `Mixed (${[
                    ...new Set(
                      selectedShapes.map((s) => s.getProperties().type)
                    ),
                  ].join(", ")})`
                : properties.type || "unknown"
            }
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text
          </label>
          <input
            type="text"
            value={properties.text || ""}
            onChange={(e) => handlePropertyChange("text", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter text..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="X Position"
            value={Math.round(properties.x || 0)}
            onChange={(value) => handlePropertyChange("x", value)}
            defaultValue={0}
            step={1}
          />
          <NumberInput
            label="Y Position"
            value={Math.round(properties.y || 0)}
            onChange={(value) => handlePropertyChange("y", value)}
            defaultValue={0}
            step={1}
          />
        </div>

        {}
        {(properties.type === "rectangle" ||
          properties.type === "umlClass" ||
          properties.type === "umlComponent") && (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Width"
              value={(properties as { width?: number }).width}
              onChange={(value) => handlePropertyChange("width", value)}
              min={1}
              defaultValue={100}
            />
            <NumberInput
              label="Height"
              value={(properties as { height?: number }).height}
              onChange={(value) => handlePropertyChange("height", value)}
              min={1}
              defaultValue={60}
            />
          </div>
        )}

        {properties.type === "circle" && (
          <NumberInput
            label="Radius"
            value={(properties as { radius?: number }).radius}
            onChange={(value) => handlePropertyChange("radius", value)}
            min={1}
            defaultValue={40}
          />
        )}

        <div className="space-y-4">
          <ColorPicker
            label="Fill Color"
            value={properties.fillColor || "#ffffff"}
            onChange={(color) => handlePropertyChange("fillColor", color)}
            placeholder="#ffffff"
          />

          <ColorPicker
            label="Stroke Color"
            value={properties.strokeColor || "#000000"}
            onChange={(color) => handlePropertyChange("strokeColor", color)}
            placeholder="#000000"
          />
        </div>

        <NumberInput
          label="Stroke Width"
          value={properties.strokeWidth}
          onChange={(value) => handlePropertyChange("strokeWidth", value)}
          min={0}
          max={10}
          step={0.5}
          defaultValue={1}
        />

        {}
        {properties.type === "umlClass" && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-800">
              UML Class Properties
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <input
                type="text"
                value={(properties as { className?: string }).className || ""}
                onChange={(e) =>
                  handlePropertyChange("className", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter class name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attributes
              </label>
              <textarea
                value={(properties as { attributes?: string }).attributes || ""}
                onChange={(e) =>
                  handlePropertyChange("attributes", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                placeholder="- attribute1: Type&#10;- attribute2: String&#10;+ publicAttribute: Number"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use '-' for private, '+' for public, '#' for protected
                attributes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Methods
              </label>
              <textarea
                value={(properties as { methods?: string }).methods || ""}
                onChange={(e) =>
                  handlePropertyChange("methods", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                placeholder="+ method1(param: Type): ReturnType&#10;+ method2(): void&#10;- privateMethod(): boolean"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use '-' for private, '+' for public, '#' for protected methods
              </p>
            </div>
          </div>
        )}

        {}
        {properties.type === "umlComponent" && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-800">
              UML Component Properties
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Component Name
              </label>
              <input
                type="text"
                value={
                  (properties as { componentName?: string }).componentName || ""
                }
                onChange={(e) =>
                  handlePropertyChange("componentName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter component name..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
