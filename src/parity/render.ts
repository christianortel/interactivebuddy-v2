// Canvas renderer for the native 550x400 shell. Every color and coordinate is a
// measured value (M-REF-025..029) or is flagged PROVISIONAL pending overlay tuning.

import { STAGE_WIDTH, STAGE_HEIGHT } from "./stage.ts";
import { spriteAtlas } from "./sprites.ts";

// M-REF-025 stage colors.
export const COLOR_PLAY_AREA = "#959f95";
export const COLOR_FRAME_TOP = "#556058";
export const COLOR_FRAME_LEFT = "#69766d";
export const COLOR_FRAME_RIGHT = "#47514a";
export const COLOR_FRAME_BOTTOM = "#454e47";
export const COLOR_OUTER_EDGE = "#999999";
export const COLOR_MENU_BAR = "#ffffff";

// M-REF-025 geometry: menu bar band y9..28; play area y29..389, x12..541.
export const MENU_BAR_TOP = 9;
export const MENU_BAR_BOTTOM = 28;
export const PLAY_LEFT = 12;
export const PLAY_RIGHT = 541;
export const PLAY_TOP = 29;
export const PLAY_BOTTOM = 389;

// M-REF-026 measured label text extents (x ranges of glyph pixels).
export interface MenuLabel {
  name: string;
  textFrom: number;
  textTo: number;
}
export const MENU_LABELS: readonly MenuLabel[] = [
  { name: "File", textFrom: 35, textTo: 51 },
  { name: "Skins", textFrom: 77, textTo: 104 },
  { name: "Items", textFrom: 134, textTo: 160 },
  { name: "Modes", textFrom: 187, textTo: 222 },
  { name: "Settings", textFrom: 248, textTo: 291 },
  { name: "Help", textFrom: 318, textTo: 341 }
];

// v2 Halo-style hover highlight: fill sampled from reference capture (EV-0017).
const COLOR_HOVER_FILL = "#e6ffdb";
// PROVISIONAL border pending close-pixel sampling of the highlight edge.
const COLOR_HOVER_BORDER = "#7fbf6f";

export interface ShellState {
  cash: number;
  itemName: string;
  hoveredMenu: string | null;
  openMenu: string | null;
}

export function labelHitTest(x: number, y: number): string | null {
  if (y < MENU_BAR_TOP || y > MENU_BAR_BOTTOM) return null;
  for (const label of MENU_LABELS) {
    if (x >= label.textFrom - 6 && x <= label.textTo + 6) return label.name;
  }
  return null;
}

export function drawShell(ctx: CanvasRenderingContext2D, state: ShellState): void {
  // Frame + beveled outer edge (M-REF-025: top/left edge #999999, bottom/right white).
  ctx.fillStyle = COLOR_OUTER_EDGE;
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, STAGE_HEIGHT - 1, STAGE_WIDTH, 1);
  ctx.fillRect(STAGE_WIDTH - 1, 0, 1, STAGE_HEIGHT);
  ctx.fillStyle = COLOR_FRAME_TOP;
  ctx.fillRect(1, 1, STAGE_WIDTH - 2, 7);
  ctx.fillStyle = COLOR_FRAME_BOTTOM;
  ctx.fillRect(1, 390, STAGE_WIDTH - 2, 9);
  ctx.fillStyle = COLOR_FRAME_LEFT;
  ctx.fillRect(1, 1, 11, STAGE_HEIGHT - 2);
  ctx.fillStyle = COLOR_FRAME_RIGHT;
  ctx.fillRect(542, 1, 7, STAGE_HEIGHT - 2);

  // Menu bar.
  ctx.fillStyle = COLOR_MENU_BAR;
  ctx.fillRect(1, MENU_BAR_TOP, STAGE_WIDTH - 2, MENU_BAR_BOTTOM - MENU_BAR_TOP + 1);

  // Play area.
  ctx.fillStyle = COLOR_PLAY_AREA;
  ctx.fillRect(PLAY_LEFT, PLAY_TOP, PLAY_RIGHT - PLAY_LEFT + 1, PLAY_BOTTOM - PLAY_TOP + 1);

  // Menu labels. Font: device sans (Arial) per reference font usage; size tuned
  // to the measured 15px text band (PROVISIONAL until overlay diff).
  ctx.textBaseline = "alphabetic";
  ctx.font = "11px Arial";
  for (const label of MENU_LABELS) {
    const active = state.openMenu === label.name || state.hoveredMenu === label.name;
    if (active) {
      ctx.fillStyle = COLOR_HOVER_FILL;
      ctx.fillRect(label.textFrom - 6, MENU_BAR_TOP + 1, label.textTo - label.textFrom + 13, 18);
      ctx.strokeStyle = COLOR_HOVER_BORDER;
      ctx.lineWidth = 1;
      ctx.strokeRect(label.textFrom - 5.5, MENU_BAR_TOP + 1.5, label.textTo - label.textFrom + 12, 17);
    }
    ctx.fillStyle = "#000000";
    ctx.fillText(label.name, label.textFrom, 24);
  }

  // Version label (M-REF-013/029; color sampled #3c403c, EV-0017).
  ctx.font = "10px Arial";
  ctx.fillStyle = "#3c403c";
  ctx.textAlign = "right";
  ctx.fillText("1.02", 545, 44);
  ctx.textAlign = "left";

  // Face icon button (M-REF-028/M-REF-032: faceClip at (30, 49) scale 1.833).
  if (!spriteAtlas.draw(ctx, "faceClip", 30, 49, { scale: 1.8333282470703125 })) {
    drawFaceIcon(ctx, 24, 49, 16);
  }

}

/** Status line (M-REF-009/029) — drawn above stage contents like the original HUD. */
export function drawStatusLine(ctx: CanvasRenderingContext2D, state: ShellState): void {
  ctx.font = "13px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${formatCash(state.cash)}  -  ${state.itemName}`, 17, 386);
}

function drawFaceIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const gradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
  gradient.addColorStop(0, "#e8ece8");
  gradient.addColorStop(1, "#b3bab3");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7c857c";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#3a403a";
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 4, 1.8, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy - 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 5, cy + 4, 10, 1.6);
}

export function formatCash(cash: number): string {
  return `$${cash.toFixed(2)}`;
}

// Buddy rest pose (M-REF-027, coarse): sphere composition inside box
// x248..313, y305..388, head center x~280.5. PROVISIONAL part layout until the
// dedicated buddy-geometry measurement pass; physics arrives in slice 2.
export function drawBuddyRest(ctx: CanvasRenderingContext2D): void {
  const centerX = 280.5;
  const floorY = 388;
  sphere(ctx, centerX, floorY - 66, 13.5); // head (top ~305, width ~24-27)
  sphere(ctx, centerX - 22, floorY - 44, 9); // left hand
  sphere(ctx, centerX + 22, floorY - 44, 9); // right hand
  sphere(ctx, centerX, floorY - 34, 20); // torso
  sphere(ctx, centerX - 12, floorY - 7, 8); // left foot
  sphere(ctx, centerX + 12, floorY - 7, 8); // right foot
}

function sphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const gradient = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.15, cx, cy, r);
  gradient.addColorStop(0, "#e2e6e0");
  gradient.addColorStop(0.7, "#a9b1a8");
  gradient.addColorStop(1, "#7e877e");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}
