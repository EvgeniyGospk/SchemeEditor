import type { AnyShapeProperties } from "../models/shapes/index.ts";
import type { ShapePluginDefinition } from "../types/plugins.interface.ts";

export class ShapePluginRegistry {
  private plugins: Map<string, ShapePluginDefinition<AnyShapeProperties>> =
    new Map();

  public register<T extends AnyShapeProperties>(
    pluginDef: ShapePluginDefinition<T>,
  ): void {
    this.plugins.set(
      pluginDef.type,
      pluginDef as ShapePluginDefinition<AnyShapeProperties>,
    );
  }

  public getPluginDefinition(
    type: string,
  ): ShapePluginDefinition<AnyShapeProperties> | undefined {
    return this.plugins.get(type);
  }

  public getAllPluginDefinitions(): ShapePluginDefinition<AnyShapeProperties>[] {
    return Array.from(this.plugins.values());
  }
}

export const shapePluginRegistry = new ShapePluginRegistry();
