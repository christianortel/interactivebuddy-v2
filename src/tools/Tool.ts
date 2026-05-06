export type ToolCategory =
  | "basic"
  | "thrown"
  | "projectile"
  | "explosive"
  | "elemental"
  | "force"
  | "environment"
  | "nice"
  | "skin";

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  icon: string;
  price: number;
  cooldownMs?: number;
  hasPower?: boolean;
  description: string;
}

export interface ToolContext {
  x: number;
  y: number;
  power: number;
}

export interface ToolImplementation {
  definition: ToolDefinition;
  use(context: ToolContext): void;
}
