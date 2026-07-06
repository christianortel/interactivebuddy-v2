// Menu panels, windows, and stores for the parity runtime.
// Measured facts: menu bar labels and x-extents (M-REF-026), static menu entries
// per top-level menu (M-REF-022), window titles and pixel sizes (M-REF-021),
// rosters/prices/unlocks (EV-0007), v2 hover fill #e6ffdb (EV-0017).
// PROVISIONAL (flagged, pending Flash-projector captures — GAP-15): dropdown
// panel metrics, static-vs-owned entry ordering, store window content layout,
// window placement, Settings menu quality/sound entries.

import { ITEMS, SKINS, MODES } from "./catalog.ts";
import type { CatalogEntry } from "./catalog.ts";
import type { SaveData } from "./save.ts";
import { MENU_LABELS, MENU_BAR_TOP } from "./render.ts";

export interface MenuItemSpec {
  label: string;
  action?: string;
  separatorAfter?: boolean;
  checked?: boolean;
  submenu?: MenuItemSpec[];
}

export interface OpenWindow {
  id: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

// M-REF-021 exact window sizes.
export const WINDOW_SIZES: Record<string, { title: string; width: number; height: number }> = {
  stats: { title: "Stats", width: 300, height: 250 },
  customSkin: { title: "Custom Skin Creator", width: 350, height: 400 },
  skinStore: { title: "Skin Store", width: 335, height: 250 },
  itemStore: { title: "Item Store", width: 335, height: 250 },
  customFace: { title: "Custom Face", width: 298, height: 406 },
  script: { title: "ShockScript Scripting Engine", width: 354, height: 506 },
  modeStore: { title: "Mode Store", width: 315, height: 250 },
  physicsTweek: { title: "Physics Tweek", width: 133, height: 225 },
  help: { title: "Help", width: 350, height: 350 },
  updates: { title: "What's New?", width: 350, height: 350 },
  about: { title: "About", width: 200, height: 250 },
  clearWarning: { title: "Warning", width: 220, height: 110 } // PROVISIONAL size
};

const ROW_HEIGHT = 20; // PROVISIONAL v2 menu row metric
const PANEL_PAD = 2;

export function buildMenuTree(save: SaveData): Record<string, MenuItemSpec[]> {
  const ownedItems = ITEMS.filter((entry) => save.owned.items.includes(entry.name));
  const categories = [...new Set(ownedItems.map((entry) => entry.group))];
  return {
    // M-REF-022 static entries. Ordering of static vs dynamic entries is PROVISIONAL.
    File: [
      { label: "Stats...", action: "open:stats" },
      { label: "Clear File...", action: "open:clearWarning" }
    ],
    Skins: [
      ...SKINS.filter((entry) => save.owned.skins.includes(entry.name)).map((entry) => ({
        label: entry.name,
        action: `equipSkin:${entry.name}`,
        checked: save.skin === entry.group
      })),
      { label: "Buy New Skins...", action: "open:skinStore" },
      { label: "Create Custom Skins...", action: "open:customSkin" }
    ],
    Items: [
      ...categories.map((category) => ({
        label: category,
        submenu: ownedItems
          .filter((entry) => entry.group === category)
          .map((entry) => ({
            label: entry.name,
            action: `equipItem:${entry.name}`,
            checked: save.item === entry.name
          }))
      })),
      { label: "Buy New Items...", action: "open:itemStore" }
    ],
    Modes: [
      ...MODES.filter((entry) => save.owned.modes.includes(entry.name)).map((entry) => ({
        label: entry.name,
        action: `toggleMode:${entry.name}`,
        checked: save.activeModes.includes(entry.group)
      })),
      { label: "Buy New Modes...", action: "open:modeStore" }
    ],
    Settings: [
      // PROVISIONAL: quality/sound entries likely exist (save keys aaQuality,
      // gQuality, physicsQuality, soundOn) but are unconfirmed; only evidenced
      // entries are listed until projector captures resolve them.
      { label: "Custom Face...", action: "open:customFace" },
      { label: "Physics...", action: "open:physicsTweek" }
    ],
    Help: [
      { label: "Help....", action: "open:help" },
      { label: "What's New?....", action: "open:updates" },
      { label: "About...", action: "open:about" }
    ]
  };
}

export interface MenuHit {
  kind: "item" | "submenuParent" | "none";
  action?: string;
  submenuIndex?: number;
}

export class MenuUi {
  openMenu: string | null = null;
  openSubmenuIndex: number | null = null;
  hoverIndex: number | null = null;
  hoverSubIndex: number | null = null;
  tree: Record<string, MenuItemSpec[]> = {};

  panelRect(menuName: string, items: MenuItemSpec[]): { x: number; y: number; w: number; h: number } {
    const label = MENU_LABELS.find((entry) => entry.name === menuName);
    const x = label ? label.textFrom - 6 : 20;
    const w = Math.max(120, 12 + Math.max(...items.map((item) => item.label.length * 6)));
    return { x, y: MENU_BAR_TOP + 20, w, h: items.length * ROW_HEIGHT + PANEL_PAD * 2 };
  }

  submenuRect(
    parentRect: { x: number; y: number; w: number; h: number },
    parentIndex: number,
    items: MenuItemSpec[]
  ): { x: number; y: number; w: number; h: number } {
    const w = Math.max(120, 12 + Math.max(...items.map((item) => item.label.length * 6)));
    return {
      x: parentRect.x + parentRect.w - 2,
      y: parentRect.y + parentIndex * ROW_HEIGHT,
      w,
      h: items.length * ROW_HEIGHT + PANEL_PAD * 2
    };
  }

  hitTest(x: number, y: number): MenuHit {
    if (!this.openMenu) return { kind: "none" };
    const items = this.tree[this.openMenu] ?? [];
    const rect = this.panelRect(this.openMenu, items);
    if (this.openSubmenuIndex !== null && items[this.openSubmenuIndex]?.submenu) {
      const sub = items[this.openSubmenuIndex].submenu!;
      const subRect = this.submenuRect(rect, this.openSubmenuIndex, sub);
      if (x >= subRect.x && x <= subRect.x + subRect.w && y >= subRect.y && y <= subRect.y + subRect.h) {
        const index = Math.floor((y - subRect.y - PANEL_PAD) / ROW_HEIGHT);
        const item = sub[index];
        if (item) return { kind: "item", action: item.action };
        return { kind: "none" };
      }
    }
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      const index = Math.floor((y - rect.y - PANEL_PAD) / ROW_HEIGHT);
      const item = items[index];
      if (!item) return { kind: "none" };
      if (item.submenu) return { kind: "submenuParent", submenuIndex: index };
      return { kind: "item", action: item.action };
    }
    return { kind: "none" };
  }

  updateHover(x: number, y: number): void {
    if (!this.openMenu) {
      this.hoverIndex = null;
      this.hoverSubIndex = null;
      return;
    }
    const items = this.tree[this.openMenu] ?? [];
    const rect = this.panelRect(this.openMenu, items);
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      this.hoverIndex = Math.floor((y - rect.y - PANEL_PAD) / ROW_HEIGHT);
      if (items[this.hoverIndex]?.submenu) {
        this.openSubmenuIndex = this.hoverIndex;
      }
    } else {
      this.hoverIndex = null;
    }
    if (this.openSubmenuIndex !== null && items[this.openSubmenuIndex]?.submenu) {
      const sub = items[this.openSubmenuIndex].submenu!;
      const subRect = this.submenuRect(rect, this.openSubmenuIndex, sub);
      if (x >= subRect.x && x <= subRect.x + subRect.w && y >= subRect.y && y <= subRect.y + subRect.h) {
        this.hoverSubIndex = Math.floor((y - subRect.y - PANEL_PAD) / ROW_HEIGHT);
      } else {
        this.hoverSubIndex = null;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.openMenu) return;
    const items = this.tree[this.openMenu] ?? [];
    const rect = this.panelRect(this.openMenu, items);
    this.drawPanel(ctx, rect, items, this.hoverIndex, true);
    if (this.openSubmenuIndex !== null && items[this.openSubmenuIndex]?.submenu) {
      const sub = items[this.openSubmenuIndex].submenu!;
      const subRect = this.submenuRect(rect, this.openSubmenuIndex, sub);
      this.drawPanel(ctx, subRect, sub, this.hoverSubIndex, false);
    }
  }

  private drawPanel(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; w: number; h: number },
    items: MenuItemSpec[],
    hover: number | null,
    withArrows: boolean
  ): void {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
    ctx.font = "11px Arial";
    items.forEach((item, index) => {
      const rowY = rect.y + PANEL_PAD + index * ROW_HEIGHT;
      if (index === hover) {
        ctx.fillStyle = "#e6ffdb";
        ctx.fillRect(rect.x + 1, rowY, rect.w - 2, ROW_HEIGHT);
        ctx.strokeStyle = "#7fbf6f";
        ctx.strokeRect(rect.x + 1.5, rowY + 0.5, rect.w - 3, ROW_HEIGHT - 1);
      }
      ctx.fillStyle = "#000000";
      ctx.fillText(item.label, rect.x + (item.checked !== undefined ? 18 : 8), rowY + 14);
      if (item.checked) {
        ctx.fillText("✓", rect.x + 5, rowY + 14);
      }
      if (withArrows && item.submenu) {
        ctx.fillText("▶", rect.x + rect.w - 12, rowY + 14);
      }
    });
  }
}

export class WindowUi {
  open: OpenWindow | null = null;
  storeScroll = 0;

  openWindow(id: string): void {
    const spec = WINDOW_SIZES[id];
    if (!spec) return;
    this.open = {
      id,
      title: spec.title,
      width: spec.width,
      height: spec.height,
      // PROVISIONAL placement: centered in play area pending capture evidence.
      x: Math.round((550 - spec.width) / 2),
      y: Math.max(32, Math.round((400 - spec.height) / 2))
    };
    this.storeScroll = 0;
  }

  close(): void {
    this.open = null;
  }

  storeEntries(save: SaveData): CatalogEntry[] {
    if (!this.open) return [];
    if (this.open.id === "itemStore") return ITEMS.filter((entry) => entry.price > 0);
    if (this.open.id === "skinStore") return SKINS.filter((entry) => entry.price > 0);
    if (this.open.id === "modeStore") return MODES.filter((entry) => entry.price > 0);
    return [];
  }

  /** Returns an action string when a click lands on an interactive element. */
  hitTest(x: number, y: number, save: SaveData): string | null {
    const win = this.open;
    if (!win) return null;
    const inside = x >= win.x && x <= win.x + win.width && y >= win.y && y <= win.y + win.height;
    // Close button (PROVISIONAL geometry: right end of title bar).
    if (x >= win.x + win.width - 18 && x <= win.x + win.width - 4 && y >= win.y + 3 && y <= win.y + 17) {
      return "close";
    }
    if (!inside) return "outside";
    const entries = this.storeEntries(save);
    if (entries.length > 0) {
      const listTop = win.y + 24;
      const index = Math.floor((y - listTop) / ROW_HEIGHT) + this.storeScroll;
      const entry = entries[index];
      if (entry && y >= listTop) {
        const owned = this.isOwned(entry, save);
        if (!owned && x >= win.x + win.width - 60) return `buy:${entry.menu}:${entry.name}`;
      }
    }
    if (win.id === "clearWarning") {
      const buttonY = win.y + win.height - 30;
      if (y >= buttonY && y <= buttonY + 20) {
        if (x >= win.x + 20 && x <= win.x + 90) return "confirmClear";
        if (x >= win.x + win.width - 90 && x <= win.x + win.width - 20) return "close";
      }
    }
    return null;
  }

  isOwned(entry: CatalogEntry, save: SaveData): boolean {
    if (entry.menu === "Items") return save.owned.items.includes(entry.name);
    if (entry.menu === "Skins") return save.owned.skins.includes(entry.name);
    return save.owned.modes.includes(entry.name);
  }

  wheel(delta: number, save: SaveData): void {
    if (!this.open) return;
    const entries = this.storeEntries(save);
    const visible = Math.floor((this.open.height - 30) / ROW_HEIGHT);
    const max = Math.max(0, entries.length - visible);
    this.storeScroll = Math.min(max, Math.max(0, this.storeScroll + (delta > 0 ? 1 : -1)));
  }

  draw(ctx: CanvasRenderingContext2D, save: SaveData): void {
    const win = this.open;
    if (!win) return;
    // mx Window chrome (metrics PROVISIONAL pending projector captures).
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(win.x, win.y, win.width, win.height);
    ctx.strokeStyle = "#7a7a7a";
    ctx.strokeRect(win.x + 0.5, win.y + 0.5, win.width - 1, win.height - 1);
    const titleGradient = ctx.createLinearGradient(0, win.y, 0, win.y + 20);
    titleGradient.addColorStop(0, "#e8f2e4");
    titleGradient.addColorStop(1, "#c2d6bc");
    ctx.fillStyle = titleGradient;
    ctx.fillRect(win.x + 1, win.y + 1, win.width - 2, 20);
    ctx.font = "bold 11px Arial";
    ctx.fillStyle = "#2c332c";
    ctx.fillText(win.title, win.x + 8, win.y + 15);
    // Close button.
    ctx.strokeStyle = "#5a665a";
    ctx.strokeRect(win.x + win.width - 18.5, win.y + 4.5, 13, 13);
    ctx.beginPath();
    ctx.moveTo(win.x + win.width - 15.5, win.y + 7.5);
    ctx.lineTo(win.x + win.width - 8.5, win.y + 14.5);
    ctx.moveTo(win.x + win.width - 8.5, win.y + 7.5);
    ctx.lineTo(win.x + win.width - 15.5, win.y + 14.5);
    ctx.stroke();

    const entries = this.storeEntries(save);
    if (entries.length > 0) {
      this.drawStoreList(ctx, win, entries, save);
      return;
    }
    ctx.font = "11px Arial";
    ctx.fillStyle = "#444444";
    if (win.id === "clearWarning") {
      ctx.fillText("Erase the save file and start over?", win.x + 16, win.y + 45);
      ctx.strokeStyle = "#7a7a7a";
      ctx.strokeRect(win.x + 20.5, win.y + win.height - 30.5, 70, 20);
      ctx.strokeRect(win.x + win.width - 90.5, win.y + win.height - 30.5, 70, 20);
      ctx.fillText("Yes", win.x + 44, win.y + win.height - 16);
      ctx.fillText("No", win.x + win.width - 62, win.y + win.height - 16);
    } else if (win.id === "stats") {
      ctx.fillText(`Cash earned: ${save.cash.toFixed(2)}`, win.x + 12, win.y + 44);
      ctx.fillText("(Full stat roster pending reference capture)", win.x + 12, win.y + 64);
    } else {
      ctx.fillText("Content pending reference capture (see GAP-15).", win.x + 12, win.y + 44);
    }
  }

  private drawStoreList(
    ctx: CanvasRenderingContext2D,
    win: OpenWindow,
    entries: CatalogEntry[],
    save: SaveData
  ): void {
    const listTop = win.y + 24;
    const visible = Math.floor((win.height - 30) / ROW_HEIGHT);
    ctx.font = "11px Arial";
    entries.slice(this.storeScroll, this.storeScroll + visible).forEach((entry, row) => {
      const y = listTop + row * ROW_HEIGHT;
      const owned = this.isOwned(entry, save);
      ctx.fillStyle = "#000000";
      ctx.fillText(entry.name, win.x + 10, y + 14);
      ctx.fillStyle = "#3c403c";
      ctx.fillText(`$${entry.price.toFixed(2)}`, win.x + win.width - 130, y + 14);
      if (owned) {
        ctx.fillStyle = "#6a6a6a";
        ctx.fillText("Owned", win.x + win.width - 55, y + 14);
      } else {
        const affordable = save.cash >= entry.price;
        ctx.strokeStyle = affordable ? "#5a815a" : "#a0a0a0";
        ctx.strokeRect(win.x + win.width - 58.5, y + 2.5, 44, 16);
        ctx.fillStyle = affordable ? "#2c4a2c" : "#a0a0a0";
        ctx.fillText("Buy", win.x + win.width - 46, y + 14);
      }
    });
  }
}
