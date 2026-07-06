import { normalizeGravityMode } from "./modeSettings.ts";

export interface RuntimeSaveSettings {
  reducedFlash: boolean;
  slapstick: boolean;
  audio: boolean;
  volume: number;
  cameraShake: boolean;
  particles: boolean;
  haptics: boolean;
  assetPack: string;
  audioPack: string;
  liquidType: string;
  slowMo: boolean;
  ceilingOpen: boolean;
  gravityMode: string;
  fpsCounter: boolean;
  debugPhysics: boolean;
}

export interface RuntimeSaveData {
  version: number;
  cash: unknown;
  xp: unknown;
  unlockedTools: string[];
  unlockedSkins: string[];
  selectedSkin: string;
  settings: RuntimeSaveSettings;
  customAssetPacks: unknown[];
  challengeMode: string;
  challengeBests: Record<string, unknown>;
  tool: string;
}

export interface RuntimeSaveSource {
  version?: number;
  cash?: unknown;
  xp?: unknown;
  unlockedTools?: unknown;
  unlockedSkins?: unknown;
  selectedSkin?: unknown;
  settings?: Partial<RuntimeSaveSettings>;
  customAssetPacks?: unknown;
  challengeMode?: unknown;
  challengeBests?: unknown;
  tool?: unknown;
}

export interface RuntimeSavePayloadSource {
  cash: unknown;
  xp: unknown;
  unlockedTools: Iterable<string>;
  unlockedSkins: Iterable<string>;
  selectedSkin: string;
  settings: RuntimeSaveSettings;
  customAssetPacks: unknown[];
  challengeMode: string;
  challengeBests: Record<string, unknown>;
  tool: string;
}

export interface ScenePresetBodySource {
  label?: unknown;
  position?: {
    x?: unknown;
    y?: unknown;
  };
  angle?: unknown;
}

export interface ScenePresetProp {
  label: string;
  x: number;
  y: number;
  angle: number;
}

export interface ScenePresetData {
  liquid: Record<string, unknown>;
  props: ScenePresetProp[];
}

export type StoredScenePresetResult =
  | { status: "missing"; preset: null }
  | { status: "invalid"; preset: null }
  | { status: "ready"; preset: ScenePresetData };

export function migrateRuntimeSave(save: RuntimeSaveSource | null | undefined, version: number): RuntimeSaveData {
  const source = save || {};
  const settings = source.settings || {};
  return {
    version,
    cash: source.cash,
    xp: source.xp,
    unlockedTools: toStringArray(source.unlockedTools, ["hand", "poke", "slap", "tickle", "ball", "rope", "water"]),
    unlockedSkins: toStringArray(source.unlockedSkins, ["classic"]),
    selectedSkin: typeof source.selectedSkin === "string" ? source.selectedSkin : "classic",
    settings: {
      reducedFlash: Boolean(settings.reducedFlash),
      slapstick: settings.slapstick !== false,
      audio: settings.audio !== false,
      volume: toUnitNumber(settings.volume, 1),
      cameraShake: settings.cameraShake !== false,
      particles: settings.particles !== false,
      haptics: settings.haptics !== false,
      assetPack: typeof settings.assetPack === "string" ? settings.assetPack : "base",
      audioPack: typeof settings.audioPack === "string" ? settings.audioPack : "classic",
      liquidType: typeof settings.liquidType === "string" ? settings.liquidType : "water",
      slowMo: Boolean(settings.slowMo),
      ceilingOpen: Boolean(settings.ceilingOpen),
      gravityMode: normalizeGravityMode(settings.gravityMode),
      fpsCounter: Boolean(settings.fpsCounter),
      debugPhysics: Boolean(settings.debugPhysics)
    },
    customAssetPacks: Array.isArray(source.customAssetPacks) ? source.customAssetPacks : [],
    challengeMode: typeof source.challengeMode === "string" ? source.challengeMode : "free",
    challengeBests: isRecord(source.challengeBests) ? source.challengeBests : {},
    tool: typeof source.tool === "string" ? source.tool : "hand"
  };
}

export function createRuntimeSavePayload(source: RuntimeSavePayloadSource, version: number): RuntimeSaveData {
  return {
    version,
    cash: source.cash,
    xp: source.xp,
    unlockedTools: [...source.unlockedTools],
    unlockedSkins: [...source.unlockedSkins],
    selectedSkin: source.selectedSkin,
    settings: source.settings,
    customAssetPacks: source.customAssetPacks,
    challengeMode: source.challengeMode,
    challengeBests: source.challengeBests,
    tool: source.tool
  };
}

export function createScenePreset(liquid: Record<string, unknown>, props: ScenePresetBodySource[], maximumProps = 35): ScenePresetData {
  return {
    liquid: { ...liquid },
    props: props
      .filter((body) => typeof body.label === "string" && !body.label.startsWith("buddy"))
      .slice(-maximumProps)
      .map((body) => ({
        label: body.label as string,
        x: toFiniteNumber(body.position?.x, 0),
        y: toFiniteNumber(body.position?.y, 0),
        angle: toFiniteNumber(body.angle, 0)
      }))
  };
}

export function parseStoredScenePreset(raw: string | null | undefined): StoredScenePresetResult {
  if (!raw) {
    return { status: "missing", preset: null };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return { status: "invalid", preset: null };
    }

    return {
      status: "ready",
      preset: {
        liquid: isRecord(parsed.liquid) ? parsed.liquid : {},
        props: Array.isArray(parsed.props) ? parsed.props.map(toScenePresetProp).filter(Boolean) as ScenePresetProp[] : []
      }
    };
  } catch {
    return { status: "invalid", preset: null };
  }
}

export function getScenePresetLoadToast(status: StoredScenePresetResult["status"]): string {
  if (status === "missing") {
    return "No saved preset found.";
  }
  if (status === "invalid") {
    return "Scene preset could not be loaded.";
  }
  return "Scene preset loaded.";
}

export function getScenePresetSaveToast(): string {
  return "Scene preset saved.";
}

export function getProgressResetToast(): string {
  return "Progress reset.";
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toScenePresetProp(value: unknown): ScenePresetProp | null {
  if (!isRecord(value) || typeof value.label !== "string") {
    return null;
  }
  return {
    label: value.label,
    x: toFiniteNumber(value.x, 0),
    y: toFiniteNumber(value.y, 0),
    angle: toFiniteNumber(value.angle, 0)
  };
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toUnitNumber(value: unknown, fallback: number): number {
  const number = toFiniteNumber(value, fallback);
  return Math.max(0, Math.min(1, number));
}
