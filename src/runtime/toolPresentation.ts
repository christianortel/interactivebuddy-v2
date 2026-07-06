export interface RuntimeToolMetaState {
  toolId: string;
  toolCategory?: string;
  pointerDown: boolean;
  rubberCooldown: number;
  rubberBurstShots: number;
}

export interface CanvasCursorInput {
  toolId: string;
  pointerDown: boolean;
  overBuddy: boolean;
  draggingBuddy: boolean;
}

export function getRuntimeToolMetaLabel(state: RuntimeToolMetaState): string {
  if (state.toolId !== "rubber") {
    return state.toolCategory || "Ready";
  }

  const cooldown = Math.max(0, Math.ceil(state.rubberCooldown));
  if (state.pointerDown) {
    return cooldown > 0 ? `Burst ${state.rubberBurstShots} | ${cooldown}ms` : `Burst ${state.rubberBurstShots} | Ready`;
  }
  return state.rubberBurstShots > 0 ? `Burst ${state.rubberBurstShots}/6` : "Ready";
}

export interface RuntimeToolLabelItem {
  name: string;
  cost: number;
}

export interface RuntimeToolTitleItem {
  name: string;
  description: string;
}

export interface RuntimeToolSelectionPanel {
  name: string;
  description: string;
}

export interface RuntimeToolRailItem {
  id: string;
  icon: string;
  name: string;
  category: string;
  description: string;
}

export interface RuntimeMenuCategoryPresentation {
  className: string;
  label: string;
}

export interface ShopMenuButtonPresentation {
  text: string;
}

export interface RadialWheelVisibilityPresentation {
  openClass: string;
  radialOpen: boolean;
}

export interface ToolRailButtonPresentation {
  className: string;
  toolId: string;
  title: string;
  markup: string;
}

export interface RadialToolButtonPresentation {
  className: string;
  toolId: string;
  transform: string;
  icon: string;
  title: string;
}

export function getLockedToolToast(tool: RuntimeToolLabelItem): string {
  return `${tool.name} is locked. Buy it for $${tool.cost}.`;
}

export function getToolRailButtonTitle(tool: RuntimeToolTitleItem, index: number): string {
  return `${index + 1}. ${tool.description}`;
}

export function getRadialToolButtonTitle(tool: RuntimeToolTitleItem): string {
  return `${tool.name}: ${tool.description}`;
}

export function getRadialToolButtonPlacement(index: number, total: number, radius = 92): { angle: number; transform: string } {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  return {
    angle,
    transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`
  };
}

export function getToolSelectionPanel(tool: RuntimeToolTitleItem): RuntimeToolSelectionPanel {
  return {
    name: tool.name,
    description: tool.description
  };
}

export function getCanvasCursorPresentation(input: CanvasCursorInput): string {
  if (input.draggingBuddy) {
    return "grabbing";
  }
  if (input.toolId === "hand" && input.overBuddy) {
    return "grab";
  }
  if (["poke", "slap", "tickle"].includes(input.toolId) && input.overBuddy) {
    return "crosshair";
  }
  if (input.pointerDown) {
    return "crosshair";
  }
  return "default";
}

export function getToolRailButtonMarkup(tool: RuntimeToolRailItem): string {
  return `
      <span class="tool-button__icon">${tool.icon}</span>
      <span class="tool-button__copy">
        <strong>${tool.name}</strong>
        <span>${tool.category}</span>
      </span>
    `;
}

export function getToolRailButtonPresentation(tool: RuntimeToolRailItem, index: number): ToolRailButtonPresentation {
  return {
    className: "tool-button",
    toolId: tool.id,
    title: getToolRailButtonTitle(tool, index),
    markup: getToolRailButtonMarkup(tool)
  };
}

export function getRadialWheelCenterLabel(): string {
  return "Tools";
}

export function getRadialToolButtonPresentation(tool: RuntimeToolRailItem, index: number, total: number): RadialToolButtonPresentation {
  return {
    className: "radial-wheel__button",
    toolId: tool.id,
    transform: getRadialToolButtonPlacement(index, total).transform,
    icon: tool.icon,
    title: getRadialToolButtonTitle(tool)
  };
}

export function getRadialWheelVisibilityPresentation(open: boolean): RadialWheelVisibilityPresentation {
  return {
    openClass: "radial-wheel--open",
    radialOpen: open
  };
}

export function getMenuCategoryPresentation(category: string): RuntimeMenuCategoryPresentation {
  return {
    className: "menu__category",
    label: category
  };
}

const toolUseToasts: Record<string, string> = {
  platformPlaced: "Platform placed.",
  bumperPlaced: "Bumper placed.",
  conveyorPlaced: "Conveyor belt placed.",
  giftNeedCash: "Need a little cash for a gift.",
  moneyDrop: "Money drop!",
  treatTossed: "Treat tossed.",
  confettiFired: "Confetti popper fired.",
  boomboxPlaying: "Boombox playing.",
  ropeNeedsBuddy: "Rope needs a buddy limb.",
  ropeAttached: "Elastic rope attached."
};

export function getToolUseToast(toastId: string): string {
  return toolUseToasts[toastId] || "Ready.";
}

export function getExplosiveArmedToast(explosiveId: string, attached = false): string {
  if (explosiveId === "firecracker") {
    return "Firecracker lit.";
  }
  if (explosiveId === "grenade") {
    return "Grenade armed.";
  }
  if (explosiveId === "mine") {
    return "Mine armed.";
  }
  if (explosiveId === "stickybomb") {
    return attached ? "Sticky bomb attached." : "Sticky bomb armed.";
  }
  if (explosiveId === "largebomb") {
    return "Cartoon bomb lit.";
  }
  return "Explosive armed.";
}

export function getShopMenuItemLabel(item: RuntimeToolLabelItem, unlocked: boolean): string {
  return unlocked ? item.name : `${item.name} - $${item.cost}`;
}

export function getShopMenuButtonPresentation(item: RuntimeToolLabelItem, unlocked: boolean): ShopMenuButtonPresentation {
  return {
    text: getShopMenuItemLabel(item, unlocked)
  };
}

export function getRadialToolAriaLabel(item: RuntimeToolLabelItem, unlocked: boolean): string {
  return unlocked ? item.name : `${item.name} locked, costs $${item.cost}`;
}

export function getToolButtonState(buttonToolId: string | undefined, selectedToolId: string, unlocked: boolean): { active: boolean; locked: boolean } {
  return {
    active: buttonToolId === selectedToolId,
    locked: !unlocked
  };
}

export function getRadialToolButtonState(
  buttonToolId: string | undefined,
  selectedToolId: string,
  tool: RuntimeToolLabelItem,
  unlocked: boolean
): { active: boolean; locked: boolean; ariaLabel: string } {
  const buttonState = getToolButtonState(buttonToolId, selectedToolId, unlocked);
  return {
    ...buttonState,
    ariaLabel: getRadialToolAriaLabel(tool, unlocked)
  };
}

export function getMouseConstraintConfig(toolId: string): { mask: number; stiffness: number; damping?: number; clearBody: boolean; stopWind: boolean } {
  if (toolId === "hand") {
    return {
      mask: 0xffffffff,
      stiffness: 0.72,
      damping: 0.18,
      clearBody: false,
      stopWind: true
    };
  }

  return {
    mask: 0x00000000,
    stiffness: 0.001,
    clearBody: true,
    stopWind: toolId !== "fan"
  };
}

export function getCircularCosmeticArc(
  radius: number,
  xScale: number,
  yScale: number,
  radiusScale: number
): { x: number; y: number; radius: number } {
  return {
    x: radius * xScale,
    y: radius * yScale,
    radius: radius * radiusScale
  };
}

export function getCosmeticPolarPoint(
  angle: number,
  radiusX: number,
  radiusY = radiusX
): { x: number; y: number } {
  return {
    x: Math.cos(angle) * radiusX,
    y: Math.sin(angle) * radiusY
  };
}

export function getCosmeticPolarSegment(
  angle: number,
  innerRadius: number,
  outerRadius: number
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  return {
    from: getCosmeticPolarPoint(angle, innerRadius),
    to: getCosmeticPolarPoint(angle, outerRadius)
  };
}
