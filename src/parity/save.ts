// Save state mirroring the reference save schema (M-REF-024, EV-0015):
// SharedObject.getLocal("daBud") with the keys below, stored in localStorage.
// Owned-content persistence layout is not yet fully evidenced (open question in
// MEASUREMENT_LOG); the `owned` container is provisional and versioned for migration.

export interface SaveData {
  cash: number;
  item: string;
  skin: string;
  emotion: number;
  faceX: number;
  faceY: number;
  faceZ: number;
  faceR: number;
  faceText: string;
  blurLevel: number;
  aaQuality: string;
  gQuality: string;
  physicsQuality: string;
  soundOn: boolean;
  numberOfObjects: number;
  activeScript: string;
  activeScriptName: string;
  /** PROVISIONAL: owned entry names until the reference layout is confirmed. */
  owned: { items: string[]; skins: string[]; modes: string[] };
  /** Active mode internal ids (maps to the reference modeContainer concept). */
  activeModes: string[];
}

const STORAGE_KEY = "ib-parity.daBud.v1";

import { ITEMS, SKINS, MODES, DEFAULT_ITEM_NAME } from "./catalog.ts";

export function cleanSave(): SaveData {
  return {
    cash: 0, // M-REF-015: clean boot shows $0.00
    item: DEFAULT_ITEM_NAME,
    skin: "default",
    emotion: 0,
    faceX: 0,
    faceY: 0,
    faceZ: 0,
    faceR: 0,
    faceText: "",
    blurLevel: 0,
    aaQuality: "low",
    gQuality: "high",
    physicsQuality: "Full",
    soundOn: true,
    numberOfObjects: 0,
    activeScript: "",
    activeScriptName: "",
    owned: {
      items: ITEMS.filter((entry) => entry.startsOwned).map((entry) => entry.name),
      skins: SKINS.filter((entry) => entry.startsOwned).map((entry) => entry.name),
      modes: MODES.filter((entry) => entry.startsOwned).map((entry) => entry.name)
    },
    activeModes: []
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cleanSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...cleanSave(), ...parsed };
  } catch {
    return cleanSave();
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Storage unavailable (private mode); session continues unpersisted.
  }
}

export function clearSaveFile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
