import { shapePluginRegistry } from "./ShapePluginRegistry";
import { rectanglePlugin } from "./definitions/rectangle.plugin";
import { circlePlugin } from "./definitions/circle.plugin";
import { umlClassPlugin } from "./definitions/umlClass.plugin";
import { umlComponentPlugin } from "./definitions/umlComponent.plugin";
import { LoggingService } from "../core/services/LoggingService";

export function initializeShapePlugins(): void {
  shapePluginRegistry.register(rectanglePlugin);
  shapePluginRegistry.register(circlePlugin);
  shapePluginRegistry.register(umlClassPlugin);
  shapePluginRegistry.register(umlComponentPlugin);

  LoggingService.info(
    "Shape plugins initialized:",
    shapePluginRegistry.getAllPluginDefinitions().map((p) => p.type),
  );
}
