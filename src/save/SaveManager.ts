export interface SaveData {
  version: number;
  money: number;
  unlockedTools: string[];
  selectedTool: string;
  unlockedSkins: string[];
  equippedSkin: string;
  settings: Record<string, unknown>;
  bestCombo: number;
  totalLifetimeEarnings: number;
}

export class SaveManager {
  readonly key = "buddyLab2026.save.v1";

  load(): SaveData | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SaveData;
  }

  save(data: SaveData): void {
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}
