import assert from "node:assert/strict";

import { createAssetPackController, finiteOr, sanitizeAssetPack, sanitizeAudioSamples, sanitizeToolTextures, sanitizeUiTheme } from "../js/asset-packs.js";
import { createChallengeController, formatProgress } from "../js/challenges.js";
import { FeedbackEngine } from "../js/feedback.js";
import { createProgressionController } from "../js/progression.js";
import { readJson, writeJson } from "../js/storage.js";
import { TOOL_DEFS, TOOL_EFFECT_AUDIT } from "../js/content.js";
import {
  createAnvilBody,
  createBallBody,
  createBeachBallBody,
  createBoomboxBody,
  createBowlingBallBody,
  createBoxingGloveBody,
  createBrickBody,
  createCannonballBody,
  createConfettiPopperBody,
  createCorkBody,
  createCrateBody,
  createFirecrackerBody,
  createFoamDartBody,
  createGiftBody,
  createGrenadeBody,
  createLargeBombBody,
  createMineBody,
  createMoneyDropBody,
  createPaintballBody,
  createBumperBody,
  createConveyorBody,
  createPlungerBody,
  createPlatformBody,
  createRubberPelletBody,
  createStarBody,
  createStickyBombBody,
  createTeslaBody,
  createTreatBody,
  createTrampolineBody,
  getRubberPelletVariant,
  isInstantPlacementTool,
  randomPaintColor
} from "../js/tool-behaviors.js";
import { createTransferController } from "../js/transfer.js";
import { getControlBindings, getHudBindings } from "../js/ui-bindings.js";

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.listeners = {};
    this.disabled = false;
    this.type = "";
    this.textContent = "";
    this.className = "";
    this.style = {};
    this.attributes = {};
    this._innerHTML = "";
    this.classList = {
      add: () => {},
      remove: () => {}
    };
  }

  set innerHTML(value) {
    this._innerHTML = value;
    if (value === "") {
      this.children = [];
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  click() {
    this.listeners.click?.({ stopPropagation() {} });
  }
}

globalThis.document = {
  createElement(tagName) {
    return new FakeElement(tagName);
  }
};

const fakeBodies = {
  circle(x, y, radius, options) {
    return { shape: "circle", x, y, radius, ...options };
  },
  rectangle(x, y, width, height, options) {
    return { shape: "rectangle", x, y, width, height, ...options };
  },
  polygon(x, y, sides, radius, options) {
    return { shape: "polygon", x, y, sides, radius, ...options };
  }
};

assert.equal(isInstantPlacementTool("grenade"), true);
assert.equal(isInstantPlacementTool("firecracker"), true);
assert.equal(isInstantPlacementTool("mine"), true);
assert.equal(isInstantPlacementTool("stickybomb"), true);
assert.equal(isInstantPlacementTool("largebomb"), true);
assert.equal(isInstantPlacementTool("confetti"), true);
assert.equal(isInstantPlacementTool("boombox"), true);
assert.equal(isInstantPlacementTool("moneydrop"), true);
assert.equal(isInstantPlacementTool("treat"), true);
assert.equal(isInstantPlacementTool("platform"), true);
assert.equal(isInstantPlacementTool("bumper"), true);
assert.equal(isInstantPlacementTool("conveyor"), true);
assert.equal(isInstantPlacementTool("fan"), false);
assert.equal(randomPaintColor(() => 0), "#ff7161");
assert.equal(randomPaintColor(() => 0.999), "#e7a8ff");
assert.deepEqual(Object.keys(TOOL_EFFECT_AUDIT).sort(), TOOL_DEFS.map((tool) => tool.id).sort());
TOOL_DEFS.forEach((tool) => {
  const audit = TOOL_EFFECT_AUDIT[tool.id];
  assert.equal(typeof audit.cosmetic, "string", `${tool.id} should document cosmetic/effect metadata`);
  assert.equal(typeof audit.visual, "string", `${tool.id} should document visible effect hooks`);
  assert.equal(typeof audit.coverage, "string", `${tool.id} should document regression coverage`);
  assert.ok(Array.isArray(audit.scoring) && audit.scoring.length > 0, `${tool.id} should document scoring tags`);
});

assert.equal(createBallBody(fakeBodies, { x: 10, y: 20 }, 18).label, "prop_ball");
assert.equal(createBallBody(fakeBodies, { x: 10, y: 20 }, 18).plugin.cosmetic.type, "ball-basic");
assert.equal(createBeachBallBody(fakeBodies, { x: 10, y: 20 }).label, "prop_beachball");
assert.equal(createBeachBallBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "beach-ball-striped");
assert.equal(createBowlingBallBody(fakeBodies, { x: 10, y: 20 }).label, "prop_bowling");
assert.equal(createBowlingBallBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "bowling-classic");
assert.equal(createBoxingGloveBody(fakeBodies, { x: 10, y: 20 }).label, "prop_glove");
assert.equal(createBoxingGloveBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "glove-laced");
assert.equal(createBrickBody(fakeBodies, { x: 10, y: 20 }).label, "prop_brick");
assert.equal(createBrickBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "foam-brick-lined");
assert.equal(createCrateBody(fakeBodies, { x: 10, y: 20 }).label, "prop_crate");
assert.equal(createCrateBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "crate-cross");
assert.equal(createAnvilBody(fakeBodies, { x: 10, y: 20 }).density, 0.009);
assert.equal(createAnvilBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "stage-weight-anvil");
assert.equal(createPaintballBody(fakeBodies, { x: 10, y: 20 }, "#fff").render.fillStyle, "#fff");
assert.equal(createPaintballBody(fakeBodies, { x: 10, y: 20 }, "#fff").plugin.cosmetic.type, "paintball-splat");
assert.equal(createFoamDartBody(fakeBodies, { x: 10, y: 20 }).label, "prop_foamdart");
assert.equal(createFoamDartBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "foam-dart");
assert.equal(createCorkBody(fakeBodies, { x: 10, y: 20 }).label, "prop_cork");
assert.equal(createCorkBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "cork-popper");
assert.equal(createPlungerBody(fakeBodies, { x: 10, y: 20 }).label, "prop_plunger");
assert.equal(createPlungerBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "plunger-shot");
assert.equal(createStarBody(fakeBodies, { x: 10, y: 20 }).label, "prop_star");
assert.equal(createStarBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "star-shot");
assert.equal(createCannonballBody(fakeBodies, { x: 10, y: 20 }).label, "prop_cannonball");
assert.equal(createCannonballBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "cannonball-iron");
assert.equal(createRubberPelletBody(fakeBodies, { x: 10, y: 20 }).label, "prop_rubber");
assert.equal(createRubberPelletBody(fakeBodies, { x: 10, y: 20 }, 1).plugin.cosmetic.variant, "safety-orange");
assert.equal(getRubberPelletVariant(2).id, "mint-blue");
assert.equal(createGrenadeBody(fakeBodies, { x: 10, y: 20 }).label, "prop_grenade");
assert.equal(createGrenadeBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "grenade-shell");
assert.equal(createFirecrackerBody(fakeBodies, { x: 10, y: 20 }).label, "prop_firecracker");
assert.equal(createFirecrackerBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "firecracker-tube");
assert.equal(createMineBody(fakeBodies, { x: 10, y: 20 }).label, "prop_mine");
assert.equal(createMineBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "mine-button");
assert.equal(createStickyBombBody(fakeBodies, { x: 10, y: 20 }).label, "prop_stickybomb");
assert.equal(createStickyBombBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "sticky-bomb");
assert.equal(createLargeBombBody(fakeBodies, { x: 10, y: 20 }).label, "prop_largebomb");
assert.equal(createLargeBombBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "large-cartoon-bomb");
assert.equal(createTrampolineBody(fakeBodies, { x: 10, y: 20 }).isStatic, true);
assert.equal(createTrampolineBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "trampoline-pad");
assert.equal(createPlatformBody(fakeBodies, { x: 10, y: 20 }).label, "platform");
assert.equal(createPlatformBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "platform-plank");
assert.equal(createBumperBody(fakeBodies, { x: 10, y: 20 }).label, "bumper");
assert.equal(createBumperBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "bumper-ring");
assert.equal(createConveyorBody(fakeBodies, { x: 10, y: 20 }).label, "conveyor");
assert.equal(createConveyorBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "conveyor-belt");
assert.equal(createConveyorBody(fakeBodies, { x: 10, y: 20 }).plugin.conveyorSpeed, 0.0028);
assert.equal(createGiftBody(fakeBodies, { x: 10, y: 20 }).label, "prop_gift");
assert.equal(createGiftBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "gift-box");
assert.equal(createMoneyDropBody(fakeBodies, { x: 10, y: 20 }).label, "prop_moneydrop");
assert.equal(createMoneyDropBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "money-drop");
assert.equal(createTreatBody(fakeBodies, { x: 10, y: 20 }).label, "prop_treat");
assert.equal(createTreatBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "treat-cookie");
assert.equal(createConfettiPopperBody(fakeBodies, { x: 10, y: 20 }).label, "prop_confetti");
assert.equal(createConfettiPopperBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "confetti-popper");
assert.equal(createBoomboxBody(fakeBodies, { x: 10, y: 20 }).label, "prop_boombox");
assert.equal(createBoomboxBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "boombox");
assert.equal(createTeslaBody(fakeBodies, { x: 10, y: 20 }).label, "prop_tesla");
assert.equal(createTeslaBody(fakeBodies, { x: 10, y: 20 }).plugin.cosmetic.type, "tesla-coil");
assert.equal(formatProgress(2), "2");
assert.equal(formatProgress(2.25), "2.3");
assert.equal(finiteOr(4, 1), 4);
assert.equal(finiteOr(Number.NaN, 1), 1);
assert.deepEqual(sanitizeAudioSamples({
  impact: "audio/impact.wav",
  frost: { src: "audio/frost.wav", gain: 0.65, playbackRate: 1.1 },
  moneydrop: { src: "audio/moneydrop.wav" },
  ignored: { gain: 2 },
  empty: ""
}), {
  impact: { src: "audio/impact.wav" },
  frost: { src: "audio/frost.wav", gain: 0.65, playbackRate: 1.1 },
  moneydrop: { src: "audio/moneydrop.wav", gain: 1, playbackRate: 1 }
});
assert.deepEqual(sanitizeToolTextures({
  "money-drop": {
    textureDataUrl: "data:image/svg+xml;base64,PHN2Zy8+",
    scale: 1.2,
    alpha: 0.8,
    rotationOffset: 0.1,
    width: 44,
    height: 24
  },
  "gift-box": { texture: "assets/private/tool-gift.png" },
  ignored: {},
  "": { texture: "bad.png" }
}), {
  "money-drop": {
    src: "data:image/svg+xml;base64,PHN2Zy8+",
    scale: 1.2,
    alpha: 0.8,
    rotationOffset: 0.1,
    width: 44,
    height: 24
  },
  "gift-box": {
    src: "assets/private/tool-gift.png",
    scale: 1,
    alpha: 1,
    rotationOffset: 0,
    width: 0,
    height: 0
  }
});
assert.deepEqual(sanitizeUiTheme({
  variables: {
    "--panel": "rgba(255,255,255,0.95)",
    "--accent": "#ff00aa",
    "--menu-bg": "linear-gradient(#fff, #ddd)",
    "--unknown": "#000",
    color: "red",
    "--ink": ""
  }
}), {
  variables: {
    "--panel": "rgba(255,255,255,0.95)",
    "--accent": "#ff00aa",
    "--menu-bg": "linear-gradient(#fff, #ddd)"
  }
});
assert.deepEqual(sanitizeUiTheme(null), { variables: {} });

const sanitizedPack = sanitizeAssetPack(
  {
    id: "unit-pack",
    name: "Unit Pack",
    room: {
      accent: "#abcdef",
      motif: "office",
      textureDataUrl: "data:image/svg+xml;base64,PHN2Zy8+",
      textureFit: "contain"
    },
    toolTextures: {
      "money-drop": {
        textureDataUrl: "data:image/svg+xml;base64,PHN2Zy8+",
        scale: 1.1,
        alpha: 0.75
      }
    },
    uiTheme: {
      variables: {
        "--panel": "rgba(250,250,244,0.96)",
        "--menu-bg": "linear-gradient(#ffffff, #d7d7d0)",
        "--unknown": "#000"
      }
    },
    skins: [{ id: "unit:skin", name: "Unit Skin", cost: Number.NaN }],
    audioPacks: {
      unitTone: {
        name: "Unit Tone",
        pitch: 1.25,
        samples: {
          impact: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=",
          explosion: { src: "audio/explosion.wav", gain: 0.7, playbackRate: 0.9 },
          frost: { src: "audio/frost.wav", gain: 0.6, playbackRate: 1.05 },
          moneydrop: "audio/moneydrop.wav",
          invalid: { gain: 2 }
        }
      }
    }
  },
  {}
);
assert.equal(sanitizedPack.room.background, "#9aa59d");
assert.equal(sanitizedPack.room.motif, "office");
assert.equal(sanitizedPack.room.textureDataUrl, "data:image/svg+xml;base64,PHN2Zy8+");
assert.equal(sanitizedPack.room.textureFit, "contain");
assert.equal(sanitizedPack.toolTextures["money-drop"].src, "data:image/svg+xml;base64,PHN2Zy8+");
assert.equal(sanitizedPack.toolTextures["money-drop"].scale, 1.1);
assert.equal(sanitizedPack.toolTextures["money-drop"].alpha, 0.75);
assert.deepEqual(sanitizedPack.uiTheme.variables, {
  "--panel": "rgba(250,250,244,0.96)",
  "--menu-bg": "linear-gradient(#ffffff, #d7d7d0)"
});
assert.equal(sanitizedPack.skins[0].cost, 300);
assert.equal(sanitizedPack.skins[0].accent, "#abcdef");
assert.equal(sanitizedPack.audioPacks.unitTone.master, 0.18);
assert.equal(sanitizedPack.audioPacks.unitTone.samples.impact.src.startsWith("data:audio/wav"), true);
assert.equal(sanitizedPack.audioPacks.unitTone.samples.explosion.src, "audio/explosion.wav");
assert.equal(sanitizedPack.audioPacks.unitTone.samples.explosion.gain, 0.7);
assert.equal(sanitizedPack.audioPacks.unitTone.samples.frost.playbackRate, 1.05);
assert.equal(sanitizedPack.audioPacks.unitTone.samples.moneydrop.src, "audio/moneydrop.wav");
assert.equal("invalid" in sanitizedPack.audioPacks.unitTone.samples, false);

const assetPackState = { assetPacks: [{ id: "base" }] };
const assetSkinDefs = [{ id: "classic" }];
const assetAudioPacks = { classic: { name: "Classic" } };
const assetFetches = new Map([
  ["manifest.json", { packs: [{ id: "unit-pack", name: "Unit Pack", path: "unit-pack.json" }] }],
  ["unit-pack.json", sanitizedPack]
]);
const assetPackController = createAssetPackController({
  state: assetPackState,
  skinDefs: assetSkinDefs,
  audioPacks: assetAudioPacks,
  manifestUrl: "manifest.json",
  fetchRef: async (url) => ({
    ok: assetFetches.has(url),
    status: assetFetches.has(url) ? 200 : 404,
    json: async () => assetFetches.get(url)
  }),
  logger: { warn: () => {} }
});
await assetPackController.loadAssetPacks();
assert.equal(assetPackState.assetPacks.length, 2);
assert.equal(assetSkinDefs.some((skin) => skin.id === "unit:skin"), true);
assert.equal(assetAudioPacks.unitTone.assetPack, "unit-pack");
assert.equal(assetPackController.registerAssetPack(sanitizedPack), false);
const optionalState = { assetPacks: [] };
const optionalWarnings = [];
const optionalController = createAssetPackController({
  state: optionalState,
  skinDefs: [],
  audioPacks: {},
  manifests: [{ url: "missing-private.json", optional: true }],
  fetchRef: async () => ({ ok: false, status: 404 }),
  logger: { warn: (message) => optionalWarnings.push(message) }
});
await optionalController.loadAssetPacks();
assert.equal(optionalWarnings.length, 0);
const embeddedTexturePack = assetPackController.importAssetPack({
  id: "embedded-pack",
  name: "Embedded Pack",
  skins: [{ id: "embedded:skin", name: "Embedded Skin", textureDataUrl: "data:image/svg+xml;base64,PHN2Zy8+" }]
});
assert.equal(embeddedTexturePack.registered, true);
assert.equal(embeddedTexturePack.pack.skins[0].texture.startsWith("data:image/svg+xml"), true);

const requestedIds = [];
const fakeDocument = {
  getElementById(id) {
    requestedIds.push(id);
    return { id };
  }
};
assert.equal(getHudBindings(fakeDocument).cash.id, "cash");
assert.equal(getControlBindings(fakeDocument).assetPack.id, "assetPack");
assert.ok(requestedIds.includes("shopGrid"));
assert.ok(requestedIds.includes("toolMeta"));
assert.ok(requestedIds.includes("fpsCounter"));
assert.ok(requestedIds.includes("fpsCounterButton"));
assert.ok(requestedIds.includes("resetBuddyButton"));
assert.ok(requestedIds.includes("clearObjectsButton"));
assert.ok(requestedIds.includes("clearObjectsFooterButton"));
assert.ok(requestedIds.includes("debugPhysicsButton"));
assert.ok(requestedIds.includes("roomPreview"));
assert.ok(requestedIds.includes("saveImportInput"));
assert.ok(requestedIds.includes("skinPackImportInput"));
assert.ok(requestedIds.includes("resetProgressButton"));
assert.ok(requestedIds.includes("audioVolume"));
assert.ok(requestedIds.includes("audioVolumeValue"));
assert.ok(requestedIds.includes("cameraShakeToggle"));
assert.ok(requestedIds.includes("particlesToggle"));

const storage = new Map();
globalThis.localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, value);
  },
  removeItem(key) {
    storage.delete(key);
  }
};
writeJson("unit.save", { cash: 12 });
assert.deepEqual(readJson("unit.save"), { cash: 12 });
storage.set("unit.invalid", "{bad");
assert.equal(readJson("unit.invalid"), null);
assert.equal(storage.has("unit.invalid"), false);

const settings = { audio: false, volume: 0.35 };
const feedback = new FeedbackEngine({
  getSettings: () => settings,
  getPack: () => ({ master: 0.2, pitch: 1, toneWave: "sine", impactWave: "sine", zapWave: "square", noiseFilter: 1, decay: 1 }),
  hasUserActivation: () => true
});
feedback.play("impact", 1);
feedback.startWind();
feedback.stopWind();
feedback.updateMasterGain();

const shopGrid = new FakeElement("div");
const state = {
  cash: 200,
  unlockedTools: new Set(["hand"]),
  unlockedSkins: new Set(["classic"]),
  selectedSkin: "classic"
};
const calls = [];
const progression = createProgressionController({
  state,
  toolDefs: [
    { id: "hand", name: "Hand", cost: 0, description: "Grab" },
    { id: "fan", name: "Fan", category: "Force", cost: 120, description: "Wind" },
    { id: "paintball", name: "Paintball", category: "Projectiles", cost: 260, description: "Paint" }
  ],
  getSkinDefs: () => [
    { id: "classic", name: "Classic", cost: 0, description: "Base" },
    { id: "neon", name: "Neon", cost: 50, color: "#99f17f", accent: "#55d9cf", texture: "skins/neon.svg", description: "Glow" }
  ],
  shopGrid,
  getTool: (toolId) => ({ id: toolId, name: toolId === "fan" ? "Fan" : "Hand", cost: toolId === "fan" ? 120 : 0 }),
  selectTool: (toolId) => calls.push(["selectTool", toolId]),
  buildToolUi: () => calls.push(["buildToolUi"]),
  buildMenus: () => calls.push(["buildMenus"]),
  updateHud: () => calls.push(["updateHud"]),
  saveGame: () => calls.push(["saveGame"]),
  applySkin: () => calls.push(["applySkin"]),
  toast: (message) => calls.push(["toast", message]),
  feedback: { play: (eventName) => calls.push(["feedback", eventName]) },
  pulse: (pattern) => calls.push(["pulse", pattern])
});
progression.renderShop();
assert.equal(shopGrid.children[0].className, "shop-tabs");
assert.equal(shopGrid.children[0].children.map((child) => child.dataset.category).join(","), "all,force,projectiles,skins");
assert.equal(shopGrid.children[0].children[0].textContent, "All 3");
assert.equal(shopGrid.children.filter((child) => child.className.includes("shop-item")).length, 3);
assert.equal(shopGrid.children.find((child) => child.className.includes("shop-item")).dataset.category, "force");
progression.setActiveCategory("skins");
assert.equal(progression.getActiveCategory(), "skins");
assert.equal(shopGrid.children.filter((child) => child.className.includes("shop-item")).length, 1);
const skinShopItem = shopGrid.children.find((child) => child.className.includes("shop-item"));
assert.equal(skinShopItem.dataset.category, "skins");
assert.equal(skinShopItem.dataset.owned, "false");
assert.equal(skinShopItem.dataset.active, "false");
assert.equal(skinShopItem.children[0].className, "shop-skin-preview");
assert.equal(skinShopItem.children[0].children[0].className, "shop-skin-preview__swatch shop-skin-preview__swatch--textured");
assert.equal(skinShopItem.children[0].children[0].style.backgroundColor, "#99f17f");
assert.equal(skinShopItem.children[0].children[0].style.backgroundImage, 'url("skins/neon.svg")');
progression.setActiveCategory("all");
progression.buyTool("fan");
assert.equal(state.cash, 80);
assert.equal(state.unlockedTools.has("fan"), true);
assert.ok(calls.some(([name, value]) => name === "selectTool" && value === "fan"));
progression.buyOrSelectSkin("neon");
assert.equal(state.cash, 30);
assert.equal(state.unlockedSkins.has("neon"), true);
assert.equal(state.selectedSkin, "neon");
const activeSkinShopItem = shopGrid.children.find((child) => child.dataset?.active === "true");
assert.equal(activeSkinShopItem.dataset.category, "skins");
assert.match(activeSkinShopItem.className, /shop-item--owned/);
assert.match(activeSkinShopItem.className, /shop-item--active/);
assert.equal(activeSkinShopItem.getAttribute("aria-current"), "true");
assert.ok(calls.some(([name]) => name === "applySkin"));

let timeoutCount = 0;
let revokedUrl = "";
let reloadCalled = false;
const transferState = {
  replayLog: [],
  replayChunks: [],
  replaySupported: false,
  replayRecorder: null,
  replayStream: null,
  replayMimeType: "",
  replayObjectUrl: ""
};
const transferStrip = new FakeElement("div");
const transferButton = new FakeElement("button");
const transferCalls = [];
const transfer = createTransferController({
  state: transferState,
  canvas: {},
  exportReplayButton: transferButton,
  replayStrip: transferStrip,
  replayBufferMs: 20000,
  createSavePayload: () => ({ cash: 321 }),
  saveGame: () => transferCalls.push(["saveGame"]),
  migrateSave: (save) => ({ ...save, migrated: true }),
  writeJson: (key, value) => transferCalls.push(["writeJson", key, value]),
  storageKey: "unit.transfer",
  toast: (message) => transferCalls.push(["toast", message]),
  recordMission: (eventName) => transferCalls.push(["mission", eventName]),
  recordChallenge: (eventName) => transferCalls.push(["challenge", eventName]),
  documentRef: globalThis.document,
  windowRef: {
    setTimeout(callback) {
      timeoutCount += 1;
      callback();
    },
    location: {
      reload() {
        reloadCalled = true;
      }
    }
  },
  urlRef: {
    createObjectURL: () => "blob:unit",
    revokeObjectURL: (url) => {
      revokedUrl = url;
    }
  },
  BlobCtor: Blob,
  now: () => 30000,
  dateNow: () => 123
});
transfer.startReplayBuffer();
assert.equal(transferState.replaySupported, false);
assert.equal(transferButton.disabled, true);
transfer.exportSaveSnapshot();
assert.equal(transferStrip.children.length, 1);
assert.equal(transferStrip.children[0].download, "buddy-lab-save-123.json");
assert.equal(revokedUrl, "blob:unit");
assert.equal(timeoutCount, 1);
assert.ok(transferCalls.some(([name]) => name === "saveGame"));
await transfer.importSaveSnapshot({
  target: {
    value: "unit",
    files: [{ text: async () => JSON.stringify({ save: { cash: 654 } }) }]
  }
});
assert.equal(reloadCalled, true);
assert.ok(transferCalls.some(([name, key, value]) => name === "writeJson" && key === "unit.transfer" && value.migrated));

let replayNow = 1000;
const replayState = {
  replayLog: [{ text: "Impact", value: 9 }],
  replayChunks: [],
  replaySupported: false,
  replayRecorder: null,
  replayStream: null,
  replayMimeType: "",
  replayObjectUrl: "blob:old"
};
class FakeMediaRecorder {
  static isTypeSupported(type) {
    return type === "video/webm;codecs=vp9";
  }

  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.state = "inactive";
    this.listeners = {};
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  start() {
    this.state = "recording";
    this.listeners.dataavailable({ data: new Blob(["frame"], { type: "video/webm" }) });
  }

  requestData() {
    replayNow += 1000;
    this.listeners.dataavailable({ data: new Blob(["frame2"], { type: "video/webm" }) });
  }
}
const replayCalls = [];
const replayStrip = new FakeElement("div");
const replayButton = new FakeElement("button");
const replay = createTransferController({
  state: replayState,
  canvas: { captureStream: () => ({ id: "stream" }) },
  exportReplayButton: replayButton,
  replayStrip,
  replayBufferMs: 20000,
  createSavePayload: () => ({}),
  saveGame: () => {},
  migrateSave: (save) => save,
  writeJson: () => {},
  storageKey: "unit.replay",
  toast: (message) => replayCalls.push(["toast", message]),
  recordMission: (eventName) => replayCalls.push(["mission", eventName]),
  recordChallenge: (eventName) => replayCalls.push(["challenge", eventName]),
  documentRef: globalThis.document,
  windowRef: {
    MediaRecorder: FakeMediaRecorder,
    setTimeout(callback) {
      callback();
    },
    location: { reload() {} }
  },
  urlRef: {
    createObjectURL: () => "blob:replay",
    revokeObjectURL: (url) => replayCalls.push(["revoke", url])
  },
  BlobCtor: Blob,
  now: () => replayNow,
  dateNow: () => 456
});
replay.startReplayBuffer();
assert.equal(replayState.replaySupported, true);
assert.equal(replayState.replayMimeType, "video/webm;codecs=vp9");
assert.equal(replayState.replayChunks.length, 1);
replay.exportReplayVideo();
assert.equal(replayState.replayObjectUrl, "blob:replay");
assert.equal(replayStrip.children[0].download, "buddy-lab-replay-456.webm");
assert.ok(replayCalls.some(([name, value]) => name === "revoke" && value === "blob:old"));
assert.ok(replayCalls.some(([name, value]) => name === "mission" && value === "replayExport"));
assert.ok(replayCalls.some(([name, value]) => name === "challenge" && value === "replayExport"));

let challengeNow = 1000;
const challengeState = {
  cash: 0,
  xp: 0,
  missions: [],
  missionCycle: 0,
  challenge: {
    mode: "free",
    progress: 0,
    timeLeft: 0,
    completed: false,
    startedAt: 0,
    lastResult: null,
    bests: {}
  }
};
const challengeCalls = [];
const challengeSelect = { value: "free" };
const missionList = new FakeElement("div");
const challengeStrip = new FakeElement("div");
const challengeFlow = createChallengeController({
  state: challengeState,
  missionPool: [
    { id: "rope2", title: "Rope", description: "Use rope.", target: 2, event: "tether", reward: 10 },
    { id: "liquid2", title: "Liquid", description: "Use liquid.", target: 2, event: "liquid", reward: 20 },
    { id: "wheel3", title: "Wheel", description: "Open wheel.", target: 3, event: "radialWheel", reward: 30 },
    { id: "export1", title: "Export", description: "Export.", target: 1, event: "replayExport", reward: 40 },
    { id: "impact10", title: "Impact", description: "Impact.", target: 10, event: "impact", reward: 50 }
  ],
  challengeModes: {
    free: { name: "Free", event: "", target: 0, duration: 0, reward: 0 },
    liquid: { name: "Liquid Control", event: "liquid", target: 2, duration: 50, reward: 210 }
  },
  challengeSelect,
  missionList,
  replayStrip: challengeStrip,
  toast: (message) => challengeCalls.push(["toast", message]),
  saveGame: () => challengeCalls.push(["saveGame"]),
  updateHud: () => challengeCalls.push(["updateHud"]),
  feedback: { play: (eventName) => challengeCalls.push(["feedback", eventName]) },
  pulse: (pattern) => challengeCalls.push(["pulse", pattern]),
  documentRef: globalThis.document,
  random: () => 0.8,
  now: () => challengeNow,
  dateNow: () => 999
});
challengeFlow.chooseMissions();
assert.equal(challengeState.missions.length, 3);
assert.equal(challengeState.missions[0].id, "rope2");
assert.equal(missionList.children.length, 3);
challengeFlow.recordMission("tether", 2);
assert.equal(challengeState.missions[0].completed, true);
assert.equal(challengeState.cash, 10);
assert.equal(challengeState.xp, 5);
challengeFlow.startChallenge("liquid", true);
assert.equal(challengeState.challenge.mode, "liquid");
assert.equal(challengeSelect.value, "liquid");
challengeNow = 3500;
challengeFlow.recordChallenge("liquid", 2);
assert.equal(challengeState.challenge.completed, true);
assert.equal(challengeState.cash, 220);
assert.equal(challengeState.challenge.bests.liquid.completedAt, 999);
assert.equal(challengeFlow.getChallengeLabel(), "Liquid Control 2.5s");
assert.equal(challengeStrip.children.length, 1);

console.log(JSON.stringify({ ok: true, modules: ["asset-packs", "challenges", "feedback", "progression", "storage", "tool-behaviors", "transfer", "ui-bindings"] }, null, 2));
