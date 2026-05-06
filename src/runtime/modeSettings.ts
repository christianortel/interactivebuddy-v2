export interface GravityModeConfig {
  label: string;
  value: number;
}

export const gravityModes: Record<string, GravityModeConfig> = {
  normal: { label: "Normal", value: 1 },
  low: { label: "Low Gravity", value: 0.45 },
  heavy: { label: "Heavy Gravity", value: 1.55 }
};

export function normalizeGravityMode(modeId: string | undefined): string {
  return modeId && gravityModes[modeId] ? modeId : "normal";
}

export function getGravityModeConfig(modeId: string | undefined): GravityModeConfig {
  return gravityModes[normalizeGravityMode(modeId)];
}

export function getSlowMoTimeScale(enabled: boolean): number {
  return enabled ? 0.55 : 1;
}

export function getCeilingY(open: boolean): number {
  return open ? -120 : -18;
}

export function getCeilingToggleToast(open: boolean): string {
  return open ? "Ceiling opened." : "Ceiling closed.";
}

export function getSlowMoToggleToast(enabled: boolean): string {
  return enabled ? "Slow motion enabled." : "Slow motion disabled.";
}

export function getGravityModeToast(modeId: string | undefined): string {
  return `${getGravityModeConfig(modeId).label} enabled.`;
}

export function getFpsCounterToggleToast(enabled: boolean): string {
  return enabled ? "FPS counter enabled." : "FPS counter disabled.";
}

export function getBooleanModeButtonState(enabled: boolean): { ariaPressed: string } {
  return { ariaPressed: String(enabled) };
}

export function getBooleanModeButtonStates(settings: { ceilingOpen: boolean; slowMo: boolean }): {
  ceiling: { ariaPressed: string };
  slowMo: { ariaPressed: string };
} {
  return {
    ceiling: getBooleanModeButtonState(settings.ceilingOpen),
    slowMo: getBooleanModeButtonState(settings.slowMo)
  };
}

export function getGravityModeButtonState(buttonModeId: string | undefined, selectedModeId: string | undefined): { ariaPressed: string; active: boolean } {
  const active = Boolean(buttonModeId && gravityModes[buttonModeId] && buttonModeId === normalizeGravityMode(selectedModeId));
  return {
    ariaPressed: String(active),
    active
  };
}

export function getRopeAnchorX(targetX: number, stageWidth: number, margin = 42): number {
  return Math.max(margin, Math.min(stageWidth - margin, targetX));
}

export function getRopeAnchorY(ceilingOpen: boolean): number {
  return ceilingOpen ? 28 : 8;
}

export function getRopeLength(distance: number, slack = 0.78, minimum = 70): number {
  return Math.max(minimum, distance * slack);
}

export function getRopeStiffness(power: number, base = 0.018, powerDivisor = 9000): number {
  return base + power / powerDivisor;
}

export function shouldPruneRopes(count: number, maximum = 6): boolean {
  return count > maximum;
}
