// Interactive Buddy v1.02 parity runtime — slice 1: native shell.
// Target lock: reference/TARGET_BUILD.md. Status: docs/PARITY_MATRIX.md.

import { STAGE_WIDTH, STAGE_HEIGHT, computeTransform, displayToStage } from "./stage.ts";
import type { StageTransform } from "./stage.ts";
import { startLoop } from "./loop.ts";
import { loadSave, persistSave, cleanSave, clearSaveFile } from "./save.ts";
import { drawShell, drawStatusLine, labelHitTest } from "./render.ts";
import type { ShellState } from "./render.ts";
import { Buddy } from "./buddy.ts";
import { MenuUi, WindowUi, buildMenuTree } from "./ui.ts";
import { ITEMS, SKINS, MODES } from "./catalog.ts";
import { AudioSystem } from "./audio.ts";
import { Economy } from "./economy.ts";
import { BubbleSystem } from "./bubble.ts";
import { GunSystem, isGun } from "./guns.ts";
import { ObjectSystem } from "./objects.ts";
import { HeldTools } from "./heldTools.ts";
import { physicsState } from "./physicsState.ts";
import { SayingsStore } from "./sayings.ts";

const container = document.getElementById("stage") as HTMLDivElement;
const canvas = document.getElementById("world") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Canvas 2D context unavailable");
}

const save = loadSave();
const shell: ShellState = {
  cash: save.cash,
  itemName: save.item,
  hoveredMenu: null,
  openMenu: null
};
const buddy = new Buddy();
let pointer = { x: 0, y: 0 };
const menus = new MenuUi();
const windows = new WindowUi();
const audio = new AudioSystem();
const economy = new Economy();
const bubble = new BubbleSystem(audio);
const guns = new GunSystem();
const objects = new ObjectSystem();
const heldTools = new HeldTools();
const sayings = new SayingsStore();
let lastCommentAt = -10000;

/** say(event, time): sayings lookup gated like timeSinceComment (1500 ms exact). */
function sayReaction(event: string, time = 80): void {
  const now = performance.now();
  if (now - lastCommentAt < 1500) return;
  const pick = sayings.pick(event, save.skin);
  if (!pick) return;
  lastCommentAt = now;
  if (pick.useImage === "sound") {
    // Voice-skin entries: flag "sound" routes lines to speak(line, 100) (EV-0030).
    bubble.say("sound", pick.text);
  } else if (pick.useImage === true || typeof pick.useImage === "string") {
    bubble.say("text", "?", time); // PROVISIONAL image-bubble stand-in (questionMark art pending)
  } else {
    bubble.say("text", pick.text, time);
  }
}

function awardCash(amount: number, x: number, y: number): void {
  save.cash = economy.addCash(save.cash, amount, x, y);
  shell.cash = save.cash;
  save.emotion = buddy.emotion;
}

let fpsValue = 0;
let fpsFrames = 0;
let fpsWindowStart = performance.now();
let earthquakeCounter = 0;

function applyModes(): void {
  physicsState.openCeiling = save.activeModes.includes("openCeil");
  // Low Gravity multiplier PROVISIONAL pending mode-effect decode.
  physicsState.gravityScale = save.activeModes.includes("lowGrav") ? 0.5 : 1;
  physicsState.pyroMode = save.activeModes.includes("pyroMode");
}
let mouseDown = false;
let ctrlDown = false;
let pointerPrev = { x: 0, y: 0 };
let pointerVel = { x: 0, y: 0 };
window.addEventListener("keydown", (event) => {
  if (event.key === "Control") ctrlDown = true;
});
window.addEventListener("keyup", (event) => {
  if (event.key === "Control") ctrlDown = false;
});
menus.tree = buildMenuTree(save);
applyModes();
buddy.skin = save.skin;
objects.onReaction = (event, time) => sayReaction(event, time);

function dispatch(action: string): void {
  const [verb, ...rest] = action.split(":");
  const argument = rest.join(":");
  if (verb === "open") {
    windows.openWindow(argument);
  } else if (verb === "equipItem") {
    save.item = argument;
    shell.itemName = argument;
  } else if (verb === "equipSkin") {
    const skin = SKINS.find((entry) => entry.name === argument);
    if (skin) {
      save.skin = skin.group;
      buddy.skin = skin.group; // setSkin -> per-part frame labels (EV-0028)
    }
  } else if (verb === "toggleMode") {
    const mode = MODES.find((entry) => entry.name === argument);
    if (mode) {
      const index = save.activeModes.indexOf(mode.group);
      if (index === -1) save.activeModes.push(mode.group);
      else save.activeModes.splice(index, 1);
      applyModes();
    }
  } else if (verb === "buy") {
    const [menuKind, name] = [rest[0], rest.slice(1).join(":")];
    const pool = menuKind === "Items" ? ITEMS : menuKind === "Skins" ? SKINS : MODES;
    const entry = pool.find((candidate) => candidate.name === name);
    if (entry && save.cash >= entry.price) {
      save.cash -= entry.price;
      shell.cash = save.cash;
      if (menuKind === "Items") save.owned.items.push(entry.name);
      else if (menuKind === "Skins") save.owned.skins.push(entry.name);
      else save.owned.modes.push(entry.name);
      // Exact purchase side-effect (EV-0021): register sound at volume 100.
      audio.play("register", 100);
      persistSave(save);
    }
  } else if (verb === "confirmClear") {
    clearSaveFile();
    Object.assign(save, cleanSave());
    shell.cash = save.cash;
    shell.itemName = save.item;
    windows.close();
  } else if (verb === "close" || verb === "outside") {
    windows.close();
  }
  menus.tree = buildMenuTree(save);
  persistSave(save);
}

let transform: StageTransform = computeTransform(window.innerWidth, window.innerHeight);

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  transform = computeTransform(window.innerWidth, window.innerHeight);
  const cssWidth = STAGE_WIDTH * transform.scale;
  const cssHeight = STAGE_HEIGHT * transform.scale;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  container.style.left = `${transform.offsetX}px`;
  container.style.top = `${transform.offsetY}px`;
}

window.addEventListener("resize", resize);
resize();

function stagePoint(event: PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return displayToStage(
    { scale: transform.scale, offsetX: rect.left, offsetY: rect.top },
    event.clientX,
    event.clientY
  );
}

canvas.addEventListener("pointermove", (event) => {
  pointer = stagePoint(event);
  shell.hoveredMenu = labelHitTest(pointer.x, pointer.y);
  if (menus.openMenu && shell.hoveredMenu && shell.hoveredMenu !== menus.openMenu) {
    // v2 MenuBar behavior: an open bar switches menus on hover.
    menus.openMenu = shell.hoveredMenu;
    menus.openSubmenuIndex = null;
    shell.openMenu = shell.hoveredMenu;
  }
  menus.updateHover(pointer.x, pointer.y);
});

canvas.addEventListener("pointerdown", (event) => {
  pointer = stagePoint(event);
  // Windows take priority over the stage.
  if (windows.open) {
    const action = windows.hitTest(pointer.x, pointer.y, save);
    if (action) {
      dispatch(action);
      return;
    }
    return; // modal window swallows stage clicks (PROVISIONAL modality rule)
  }
  const barHit = labelHitTest(pointer.x, pointer.y);
  if (barHit) {
    const toggledOff = menus.openMenu === barHit;
    menus.openMenu = toggledOff ? null : barHit;
    menus.openSubmenuIndex = null;
    shell.openMenu = menus.openMenu;
    return;
  }
  if (menus.openMenu) {
    const hit = menus.hitTest(pointer.x, pointer.y);
    if (hit.kind === "item" && hit.action) {
      dispatch(hit.action);
      menus.openMenu = null;
      shell.openMenu = null;
      return;
    }
    if (hit.kind === "submenuParent") {
      menus.openSubmenuIndex = hit.submenuIndex ?? null;
      return;
    }
    // Click-away closes the menu without acting.
    menus.openMenu = null;
    shell.openMenu = null;
    return;
  }
  if (shell.itemName === "Open Hand") {
    buddy.grabAt(pointer.x, pointer.y);
  }
  if (shell.itemName === "Tickle") {
    // Tickle: emotion lift PROVISIONAL; 'happy' reaction line from sayings.
    for (const part of buddy.parts) {
      if (Math.hypot(pointer.x - part.x, pointer.y - part.y) <= part.radius + 4) {
        buddy.addEmotion(2);
        part.xv += (Math.random() - 0.5) * 4;
        part.yv -= 2;
        sayReaction("happy", 80);
        break;
      }
    }
  }
  // Item name -> spawned objectType (create() API names, EV-0005/0026).
  const THROWABLES: Record<string, string> = {
    "Grenades": "grenade",
    "Molotov Cocktails": "molotov",
    "Mines": "mine",
    "Baseballs": "baseball",
    "Rubber Balls": "bouncyball",
    "Bowling Balls": "bowlball",
    "Infants": "baby",
    "Fireballs": "fireball",
    "Weak Gravity Vortex": "vortex",
    "Strong Gravity Vortex": "vortexStrong",
    "Radio": "radio"
  };
  const spawnType = THROWABLES[shell.itemName];
  if (spawnType) {
    // Throw velocity from pointer motion (mapping PROVISIONAL).
    objects.spawn(spawnType, pointer.x, pointer.y, pointerVel.x, pointerVel.y);
    if (spawnType === "grenade") sayReaction("grenade", 80); // say('grenade', 80) evidenced at grab site
  } else if (shell.itemName === "Explode At Mouse") {
    // explode() is exact; Explode At Mouse power PROVISIONAL p=1.
    objects.explode(1, pointer.x, pointer.y, buddy, audio, awardCash);
  } else if (shell.itemName === "Missiles") {
    // EXACT spawn (EV-0032): missile from above the stage homing to the click.
    objects.spawn("missile", pointer.x, pointer.y, 0, 0);
  }
  mouseDown = true;
});

canvas.addEventListener("wheel", (event) => {
  if (windows.open) {
    windows.wheel(event.deltaY, save);
    event.preventDefault();
  }
}, { passive: false });

window.addEventListener("pointerup", () => {
  buddy.release();
  mouseDown = false;
});

startLoop({
  tick() {
    if (buddy.grabbed) {
      buddy.dragTo(pointer.x, pointer.y);
    }
    if (save.activeModes.includes("earthquake")) {
      // PROVISIONAL cadence/intensity pending earthquake decode.
      earthquakeCounter += 1;
      if (earthquakeCounter >= 90) {
        earthquakeCounter = 0;
        objects.shake += 10;
        for (const part of buddy.parts) {
          part.xv += (Math.random() - 0.5) * 6;
          part.yv -= Math.random() * 3;
        }
      }
    }
    buddy.tick();
    objects.tick(buddy, audio, awardCash);
    heldTools.tick(
      !menus.openMenu && !windows.open ? shell.itemName : "",
      pointer,
      pointerVel,
      mouseDown,
      buddy,
      audio,
      awardCash
    );
    pointerVel = { x: pointer.x - pointerPrev.x, y: pointer.y - pointerPrev.y };
    pointerPrev = { x: pointer.x, y: pointer.y };
    const gunActive = isGun(shell.itemName) && !menus.openMenu && !windows.open;
    guns.tick(
      gunActive ? shell.itemName : "",
      pointer,
      gunActive && mouseDown,
      ctrlDown,
      buddy,
      audio
    );
    economy.tick();
    const idle =
      !buddy.grabbed &&
      Math.abs(buddy.body.xv) < 0.8 &&
      Math.abs(buddy.body.yv) < 0.8;
    bubble.tick(idle);
    buddy.talking = bubble.active;
  },
  render() {
    fpsFrames += 1;
    const now = performance.now();
    if (now - fpsWindowStart >= 1000) {
      fpsValue = fpsFrames;
      fpsFrames = 0;
      fpsWindowStart = now;
    }
    const dpr = window.devicePixelRatio || 1;
    // Camera shake (shake += 35*p evidenced; decay/offset mapping PROVISIONAL).
    const shakeX = (Math.random() - 0.5) * Math.min(12, objects.shake * 0.1);
    const shakeY = (Math.random() - 0.5) * Math.min(12, objects.shake * 0.1);
    ctx.setTransform(
      transform.scale * dpr, 0, 0, transform.scale * dpr,
      shakeX * transform.scale * dpr, shakeY * transform.scale * dpr
    );
    drawShell(ctx, shell);
    objects.draw(ctx);
    buddy.draw(ctx);
    buddy.drawFlames(ctx);
    bubble.draw(ctx, buddy.head.x, buddy.head.y);
    if (isGun(shell.itemName) && !menus.openMenu && !windows.open) {
      guns.draw(ctx, shell.itemName, pointer, ctrlDown, buddy);
    } else {
      guns.draw(ctx, "", pointer, ctrlDown, buddy);
    }
    if (!menus.openMenu && !windows.open) {
      // Special-item beam lines (evidenced lineTo draws, EV-0032).
      if ((shell.itemName === "Magical Orb" || shell.itemName === "Gravity Shifter") && mouseDown) {
        ctx.strokeStyle = shell.itemName === "Magical Orb" ? "rgba(130, 200, 235, 0.6)" : "rgba(160, 150, 220, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(buddy.body.x, buddy.body.y);
        ctx.stroke();
      }
      heldTools.draw(ctx, shell.itemName, pointer);
    }
    if (save.activeModes.includes("fps")) {
      // fpsText at measured (467.45, 373.05) (M-REF-032).
      ctx.font = "11px Arial";
      ctx.fillStyle = "#3c403c";
      ctx.fillText(`FPS: ${fpsValue}`, 467, 380);
    }
    drawStatusLine(ctx, shell);
    economy.draw(ctx);
    menus.draw(ctx);
    windows.draw(ctx, save);
  }
});

window.addEventListener("beforeunload", () => {
  save.cash = shell.cash;
  save.item = shell.itemName;
  persistSave(save);
});

declare global {
  interface Window {
    __ibParity?: {
      shell: ShellState;
      audio: AudioSystem;
      economy: Economy;
      objects: ObjectSystem;
      buddy: Buddy;
    };
  }
}
window.__ibParity = { shell, audio, economy, objects, buddy };
