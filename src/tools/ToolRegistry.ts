import { toolDefinitions } from "../data/tools";
import type { ToolDefinition, ToolImplementation } from "./Tool";

export class ToolRegistry {
  private readonly implementations = new Map<string, ToolImplementation>();

  constructor(definitions: ToolDefinition[] = toolDefinitions) {
    definitions.forEach((definition) => {
      this.implementations.set(definition.id, {
        definition,
        use: () => undefined
      });
    });
  }

  get(id: string): ToolImplementation | undefined {
    return this.implementations.get(id);
  }

  all(): ToolImplementation[] {
    return [...this.implementations.values()];
  }
}
