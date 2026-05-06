export interface RuntimeToolDefinition {
  id: string;
  name: string;
  icon: string;
  category: string;
  cost: number;
  description: string;
}

export function getRuntimeTool(tools: RuntimeToolDefinition[], toolId: string | undefined): RuntimeToolDefinition {
  const fallback = tools[0];
  const match = tools.find((tool) => tool.id === toolId);
  if (!match && !fallback) {
    throw new Error("Runtime tool catalog is empty.");
  }
  return match ?? fallback;
}

export function getRuntimeToolCategories(tools: RuntimeToolDefinition[]): string[] {
  return [...new Set(tools.map((tool) => tool.category))];
}

export function getRuntimeToolsByCategory(tools: RuntimeToolDefinition[], category: string): RuntimeToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolIdForNumberKey(tools: RuntimeToolDefinition[], key: string): string | undefined {
  const number = Number(key);
  if (!Number.isInteger(number) || number < 1 || number > tools.length) {
    return undefined;
  }
  return tools[number - 1]?.id;
}
