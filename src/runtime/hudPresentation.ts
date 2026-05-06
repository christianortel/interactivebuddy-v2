import { getComboFillPercent, getComboMultiplier } from "./scoringMath.ts";

export interface RuntimeHudCoreInput {
  cash: number;
  xp: number;
  comboCount: number;
  comboTimer: number;
  comboWindowMs: number;
  power: number;
}

export interface RuntimeHudCorePresentation {
  cash: string;
  xp: string;
  combo: string;
  comboFillPercent: number;
  power: string;
}

export interface PowerControlPresentation {
  power: number;
  label: string;
}

export interface FpsCounterPresentation {
  visible: boolean;
  label: string;
}

export interface FpsSamplePresentation {
  frames: number;
  elapsed: number;
  value?: number;
  label?: string;
}

export interface ToastPresentation {
  message: string;
  visibleClass: string;
  timerMs: number;
}

export interface ToastHiddenPresentation {
  visibleClass: string;
}

export function formatHudCash(cash: number): string {
  return `$${Math.round(cash)}`;
}

export function formatHudXp(xp: number): string {
  return String(Math.round(xp));
}

export function formatComboLabel(comboCount: number): string {
  return comboCount > 0 ? `x${getComboMultiplier(comboCount).toFixed(2)}` : "x1.00";
}

export function calculateFps(frames: number, elapsedMs: number): number {
  return Math.max(1, Math.round((frames * 1000) / elapsedMs));
}

export function formatFpsLabel(enabled: boolean, fpsValue: number): string {
  return enabled ? `FPS ${fpsValue}` : "FPS 0";
}

export function getFpsCounterPresentation(enabled: boolean, fpsValue: number): FpsCounterPresentation {
  return {
    visible: enabled,
    label: formatFpsLabel(enabled, fpsValue)
  };
}

export function getFpsSamplePresentation(frames: number, elapsedMs: number, deltaMs: number, sampleWindowMs = 250): FpsSamplePresentation {
  const nextFrames = frames + 1;
  const nextElapsed = elapsedMs + deltaMs;
  if (nextElapsed < sampleWindowMs) {
    return {
      frames: nextFrames,
      elapsed: nextElapsed
    };
  }

  const value = calculateFps(nextFrames, nextElapsed);
  return {
    frames: 0,
    elapsed: 0,
    value,
    label: formatFpsLabel(true, value)
  };
}

export function formatPowerLabel(power: number): string {
  return String(Math.round(power));
}

export function getPowerControlPresentation(value: string | number): PowerControlPresentation {
  const power = Number(value);
  return {
    power,
    label: formatPowerLabel(power)
  };
}

export function getHudCorePresentation(input: RuntimeHudCoreInput): RuntimeHudCorePresentation {
  return {
    cash: formatHudCash(input.cash),
    xp: formatHudXp(input.xp),
    combo: formatComboLabel(input.comboCount),
    comboFillPercent: getComboFillPercent(input.comboTimer, input.comboWindowMs),
    power: formatPowerLabel(input.power)
  };
}

export function getToastPresentation(message: string, timerMs = 2600): ToastPresentation {
  return {
    message,
    visibleClass: "toast--visible",
    timerMs
  };
}

export function getToastHiddenPresentation(): ToastHiddenPresentation {
  return {
    visibleClass: "toast--visible"
  };
}

const hudActionToasts: Record<string, string> = {
  newBuddy: "New buddy spawned.",
  sceneReset: "Scene reset."
};

export function getHudActionToast(actionId: string): string {
  return hudActionToasts[actionId] || "Ready.";
}
