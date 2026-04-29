import {
  CHALLENGE_MODES,
  DEFAULT_AUDIO_PACKS,
  DEFAULT_SKIN_DEFS,
  LIQUID_TYPES,
  MISSION_POOL,
  TOOL_DEFS
} from "./js/content.js";
import { createAssetPackController } from "./js/asset-packs.js";
import { createChallengeController } from "./js/challenges.js";
import { FeedbackEngine } from "./js/feedback.js";
import { createProgressionController } from "./js/progression.js";
import { readJson, writeJson } from "./js/storage.js";
import {
  createAnvilBody,
  createBallBody,
  createBeachBallBody,
  createBowlingBallBody,
  createBoxingGloveBody,
  createBrickBody,
  createCorkBody,
  createFoamDartBody,
  createGiftBody,
  createGrenadeBody,
  createPaintballBody,
  createRubberPelletBody,
  createTeslaBody,
  createTrampolineBody,
  isInstantPlacementTool
} from "./js/tool-behaviors.js";
import { createTransferController } from "./js/transfer.js";
import { getControlBindings, getHudBindings } from "./js/ui-bindings.js";
const {
  Bodies,
  Body,
  Composite,
  Constraint,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Query,
  Render,
  Runner,
  Vector,
  World
} = Matter;

const STAGE_WIDTH = 960;
const STAGE_HEIGHT = 640;
const FLOOR_Y = STAGE_HEIGHT - 18;
const COMBO_WINDOW_MS = 4200;
const MAX_PROPS = 85;
const REPLAY_BUFFER_MS = 20000;
const ASSET_PACK_MANIFEST_URL = "assets/packs/manifest.json";
const SAVE_VERSION = 2;
const STORAGE_KEY = "buddyLab2026.save.v1";
const CLASSIC_BUDDY_SCALE = 0.78;
const CLASSIC_BUDDY_SPAWN = {
  x: 96,
  y: FLOOR_Y - 162 * CLASSIC_BUDDY_SCALE - 10
};
const CLASSIC_PART_ORDER = {
  buddy_upperArmL: 1,
  buddy_lowerArmL: 2,
  buddy_handL: 3,
  buddy_upperArmR: 1,
  buddy_lowerArmR: 2,
  buddy_handR: 3,
  buddy_upperLegL: 4,
  buddy_lowerLegL: 5,
  buddy_footL: 6,
  buddy_upperLegR: 4,
  buddy_lowerLegR: 5,
  buddy_footR: 6,
  buddy_pelvis: 7,
  buddy_torso: 8,
  buddy_head: 9
};
const GRAVITY_MODES = {
  normal: { label: "Normal", value: 1 },
  low: { label: "Low Gravity", value: 0.45 },
  heavy: { label: "Heavy Gravity", value: 1.55 }
};
const SKIN_PHYSICS = {
  classic: { density: 1, frictionAir: 1, restitution: 1, label: "standard" },
  robot: { density: 1.45, frictionAir: 1.35, restitution: 0.72, label: "robot-heavy" },
  gelatin: { density: 0.82, frictionAir: 0.72, restitution: 1.75, label: "gelatin-bouncy" }
};

let SKIN_DEFS = [...DEFAULT_SKIN_DEFS];
const AUDIO_PACKS = { ...DEFAULT_AUDIO_PACKS };
const canvas = document.getElementById("world");
const engine = Engine.create();
engine.gravity.y = 1;
engine.positionIterations = 9;
engine.velocityIterations = 8;
engine.constraintIterations = 4;

const render = Render.create({
  canvas,
  engine,
  options: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    background: "#87968e",
    pixelRatio: window.devicePixelRatio || 1,
    wireframes: false
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

const hud = getHudBindings();
const controls = getControlBindings();

const feedback = new FeedbackEngine({
  getSettings: () => state.settings,
  getPack: () => AUDIO_PACKS[state.settings.audioPack] || AUDIO_PACKS.classic,
  hasUserActivation
});

const state = {
  buddy: null,
  buddyBodies: new Set(),
  torso: null,
  head: null,
  floorBody: null,
  ceilingBody: null,
  props: [],
  grenades: [],
  coils: [],
  ropes: [],
  liquid: {
    enabled: false,
    level: FLOOR_Y - 120,
    type: "water"
  },
  particles: [],
  decals: [],
  replayLog: [],
  replayRecorder: null,
  replayStream: null,
  replayChunks: [],
  replayMimeType: "",
  replayObjectUrl: "",
  replaySupported: false,
  assetPacks: [
    {
      id: "base",
      name: "Base Lab",
      description: "Built-in prototype assets.",
      room: {
        background: "#87968e",
        grid: "#e8f7f4",
        floor: "#64736b",
        accent: "#98f17f",
        motif: "lab"
      }
    }
  ],
  customAssetPacks: [],
  cash: 75,
  xp: 0,
  sessionCash: 0,
  comboCount: 0,
  comboTimer: 0,
  mood: "Calm",
  moodTimer: 0,
  power: Number(hud.power.value),
  tool: "hand",
  unlockedTools: new Set(["hand", "ball", "rope", "water"]),
  unlockedSkins: new Set(["classic"]),
  selectedSkin: "classic",
  toolHeat: new Map(),
  usedTags: new Set(),
  pointerDown: false,
  pointerStart: { x: 0, y: 0 },
  pointerCurrent: { x: 0, y: 0 },
  pointerPrevious: { x: 0, y: 0 },
  pointerDownTime: 0,
  grabbedBody: null,
  touchWheelTimer: 0,
  touchWheelOrigin: null,
  pendingTouchInstant: null,
  radialOpen: false,
  aimVector: null,
  fanScoreCooldown: 0,
  blackHoleCooldown: 0,
  teslaCooldown: 0,
  rubberCooldown: 0,
  rubberBurstShots: 0,
  rubberBurstWindow: 0,
  heatConeCooldown: 0,
  sparkWandCooldown: 0,
  frostPuffCooldown: 0,
  gooMistCooldown: 0,
  liquidScoreCooldown: 0,
  lastFloorContact: performance.now(),
  airborneBank: 0,
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
  },
  settings: {
    reducedFlash: false,
    slapstick: true,
    audio: true,
    haptics: true,
    assetPack: "base",
    audioPack: "classic",
    liquidType: "water",
    slowMo: false,
    ceilingOpen: false,
    gravityMode: "normal",
    fpsCounter: false
  },
  fpsValue: 0,
  fpsFrames: 0,
  fpsElapsed: 0,
  shake: 0,
  toastTimer: 0,
  spawnGraceUntil: 0,
  wallRecoveryCooldown: 0
};

const assetPackFlow = createAssetPackController({
  state,
  skinDefs: SKIN_DEFS,
  audioPacks: AUDIO_PACKS,
  manifestUrl: ASSET_PACK_MANIFEST_URL
});

const progression = createProgressionController({
  state,
  toolDefs: TOOL_DEFS,
  getSkinDefs: () => SKIN_DEFS,
  shopGrid: hud.shopGrid,
  getTool,
  selectTool,
  buildToolUi,
  buildMenus,
  updateHud,
  saveGame,
  applySkin,
  toast,
  feedback,
  pulse
});

const challengeFlow = createChallengeController({
  state,
  missionPool: MISSION_POOL,
  challengeModes: CHALLENGE_MODES,
  challengeSelect: controls.challengeMode,
  missionList: hud.missionList,
  replayStrip: hud.replayStrip,
  toast,
  saveGame,
  updateHud,
  feedback,
  pulse
});

const transfer = createTransferController({
  state,
  canvas,
  exportReplayButton: controls.exportReplay,
  replayStrip: hud.replayStrip,
  replayBufferMs: REPLAY_BUFFER_MS,
  createSavePayload,
  saveGame,
  migrateSave,
  writeJson,
  storageKey: STORAGE_KEY,
  toast,
  recordMission,
  recordChallenge
});

const mouse = Mouse.create(canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: {
    stiffness: 0.72,
    damping: 0.18,
    length: 0,
    render: { visible: false }
  }
});

World.add(engine.world, mouseConstraint);
window.__buddyLabDebug = { engine, render, state };

await bootGame();

async function bootGame() {
  await loadAssetPacks();
  loadGame();
  createStageBounds();
  applyModeSettings();
  applyRoomPack();
  spawnNewBuddy();
  chooseMissions();
  buildToolUi();
  buildMenus();
  buildAssetPackUi();
  buildAudioPackUi();
  renderShop();
  renderMissions();
  updateHud();
  selectTool(state.tool);
  setupInteractions();
  startChallenge(state.challenge.mode, false);
  setupPhysicsEvents();
  resizeStage();
  startReplayBuffer();
}

async function loadAssetPacks() {
  await assetPackFlow.loadAssetPacks();
}

function loadGame() {
  const save = readJson(STORAGE_KEY);
  if (!save) {
    return;
  }
  const migrated = migrateSave(save);
  state.cash = Number.isFinite(migrated.cash) ? migrated.cash : state.cash;
  state.xp = Number.isFinite(migrated.xp) ? migrated.xp : state.xp;
  state.unlockedTools = new Set(migrated.unlockedTools || ["hand", "ball", "rope", "water"]);
  state.unlockedTools.add("rope");
  state.unlockedTools.add("water");
  state.unlockedSkins = new Set(migrated.unlockedSkins || ["classic"]);
  state.selectedSkin = migrated.selectedSkin || "classic";
  state.customAssetPacks = [];
  (migrated.customAssetPacks || []).forEach((pack) => {
    try {
      const imported = assetPackFlow.importAssetPack(pack, pack);
      if (imported.registered) {
        state.customAssetPacks.push(imported.pack);
      }
    } catch (error) {
      console.warn("Ignoring saved custom asset pack.", error);
    }
  });
  state.settings = { ...state.settings, ...(migrated.settings || {}) };
  if (!state.assetPacks.some((pack) => pack.id === state.settings.assetPack)) {
    state.settings.assetPack = "base";
  }
  if (!AUDIO_PACKS[state.settings.audioPack]) {
    state.settings.audioPack = "classic";
  }
  if (!LIQUID_TYPES[state.settings.liquidType]) {
    state.settings.liquidType = "water";
  }
  state.liquid.type = state.settings.liquidType;
  state.challenge.bests = save.challengeBests || {};
  state.challenge.bests = migrated.challengeBests || {};
  if (CHALLENGE_MODES[migrated.challengeMode]) {
    state.challenge.mode = migrated.challengeMode;
  }
  state.tool = state.unlockedTools.has(migrated.tool) ? migrated.tool : "hand";
  if (migrated.version !== save.version) {
    saveGame();
  }
}

function migrateSave(save) {
  const settings = { ...(save.settings || {}) };
  return {
    version: SAVE_VERSION,
    cash: save.cash,
    xp: save.xp,
    unlockedTools: save.unlockedTools || ["hand", "ball", "rope", "water"],
    unlockedSkins: save.unlockedSkins || ["classic"],
    selectedSkin: save.selectedSkin || "classic",
    settings: {
      reducedFlash: Boolean(settings.reducedFlash),
      slapstick: settings.slapstick !== false,
      audio: settings.audio !== false,
      haptics: settings.haptics !== false,
      assetPack: settings.assetPack || "base",
      audioPack: settings.audioPack || "classic",
      liquidType: settings.liquidType || "water",
      slowMo: Boolean(settings.slowMo),
      ceilingOpen: Boolean(settings.ceilingOpen),
      gravityMode: GRAVITY_MODES[settings.gravityMode] ? settings.gravityMode : "normal",
      fpsCounter: Boolean(settings.fpsCounter)
    },
    customAssetPacks: Array.isArray(save.customAssetPacks) ? save.customAssetPacks : [],
    challengeMode: save.challengeMode || "free",
    challengeBests: save.challengeBests || {},
    tool: save.tool || "hand"
  };
}

function saveGame() {
  writeJson(STORAGE_KEY, createSavePayload());
}

function createSavePayload() {
  return {
    version: SAVE_VERSION,
    cash: state.cash,
    xp: state.xp,
    unlockedTools: [...state.unlockedTools],
    unlockedSkins: [...state.unlockedSkins],
    selectedSkin: state.selectedSkin,
    settings: state.settings,
    customAssetPacks: state.customAssetPacks,
    challengeMode: state.challenge.mode,
    challengeBests: state.challenge.bests,
    tool: state.tool
  };
}

function createStageBounds() {
  const wallOptions = {
    isStatic: true,
    restitution: 0.25,
    friction: 0.82,
    render: { fillStyle: "#64736b" }
  };

  state.floorBody = Bodies.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT + 18, STAGE_WIDTH, 36, {
    ...wallOptions,
    label: "floor"
  });
  state.ceilingBody = Bodies.rectangle(STAGE_WIDTH / 2, -18, STAGE_WIDTH, 36, {
    ...wallOptions,
    label: "ceiling"
  });
  const leftWall = Bodies.rectangle(-18, STAGE_HEIGHT / 2, 36, STAGE_HEIGHT, {
    ...wallOptions,
    label: "wall_left"
  });
  const rightWall = Bodies.rectangle(STAGE_WIDTH + 18, STAGE_HEIGHT / 2, 36, STAGE_HEIGHT, {
    ...wallOptions,
    label: "wall_right"
  });

  World.add(engine.world, [state.floorBody, state.ceilingBody, leftWall, rightWall]);
}

function spawnNewBuddy() {
  if (state.buddy) {
    Composite.remove(engine.world, state.buddy, true);
  }
  const buddy = createBuddy(CLASSIC_BUDDY_SPAWN.x, CLASSIC_BUDDY_SPAWN.y, CLASSIC_BUDDY_SCALE);
  Composite.add(engine.world, buddy);
  state.buddy = buddy;
  const allBodies = Composite.allBodies(buddy);
  state.buddyBodies = new Set(allBodies.map((body) => body.id));
  state.torso = allBodies.find((body) => body.label === "buddy_torso");
  state.head = allBodies.find((body) => body.label === "buddy_head");
  applySkin();
  state.spawnGraceUntil = performance.now() + 1150;
  setMood("Calm", 0);
}

function createBuddy(x, y, scale = 1) {
  const group = Body.nextGroup(true);
  const skin = getSkin();
  const defaultColor = skin.color;

  const rectOptions = (label, density = 0.0016) => ({
    collisionFilter: { group },
    chamfer: { radius: scale * 10 },
    friction: 0.62,
    frictionStatic: 0.5,
    frictionAir: 0.012,
    restitution: 0.27,
    density,
    label,
    render: { fillStyle: defaultColor, strokeStyle: "rgba(20,30,25,0.18)", lineWidth: 1 }
  });

  const circleOptions = (label, density = 0.0013) => ({
    collisionFilter: { group },
    friction: 0.6,
    frictionAir: 0.012,
    restitution: 0.28,
    density,
    label,
    render: { fillStyle: defaultColor, strokeStyle: "rgba(20,30,25,0.18)", lineWidth: 1 }
  });

  const head = Bodies.circle(x, y - 72 * scale, 25 * scale, circleOptions("buddy_head"));
  const torso = Bodies.rectangle(x, y - 12 * scale, 50 * scale, 72 * scale, rectOptions("buddy_torso", 0.0021));
  const pelvis = Bodies.rectangle(x, y + 51 * scale, 45 * scale, 40 * scale, rectOptions("buddy_pelvis", 0.0019));
  const upperArmL = Bodies.rectangle(x - 42 * scale, y - 22 * scale, 38 * scale, 15 * scale, rectOptions("buddy_upperArmL"));
  const lowerArmL = Bodies.rectangle(x - 47 * scale, y + 12 * scale, 34 * scale, 13 * scale, rectOptions("buddy_lowerArmL"));
  const handL = Bodies.circle(x - 48 * scale, y + 36 * scale, 12 * scale, circleOptions("buddy_handL"));
  const upperArmR = Bodies.rectangle(x + 42 * scale, y - 22 * scale, 38 * scale, 15 * scale, rectOptions("buddy_upperArmR"));
  const lowerArmR = Bodies.rectangle(x + 47 * scale, y + 12 * scale, 34 * scale, 13 * scale, rectOptions("buddy_lowerArmR"));
  const handR = Bodies.circle(x + 48 * scale, y + 36 * scale, 12 * scale, circleOptions("buddy_handR"));
  const upperLegL = Bodies.rectangle(x - 16 * scale, y + 89 * scale, 20 * scale, 45 * scale, rectOptions("buddy_upperLegL"));
  const lowerLegL = Bodies.rectangle(x - 16 * scale, y + 131 * scale, 18 * scale, 47 * scale, rectOptions("buddy_lowerLegL"));
  const footL = Bodies.circle(x - 18 * scale, y + 162 * scale, 14 * scale, circleOptions("buddy_footL"));
  const upperLegR = Bodies.rectangle(x + 16 * scale, y + 89 * scale, 20 * scale, 45 * scale, rectOptions("buddy_upperLegR"));
  const lowerLegR = Bodies.rectangle(x + 16 * scale, y + 131 * scale, 18 * scale, 47 * scale, rectOptions("buddy_lowerLegR"));
  const footR = Bodies.circle(x + 18 * scale, y + 162 * scale, 14 * scale, circleOptions("buddy_footR"));

  [
    [head, "circle", 50 * scale, 50 * scale, 25 * scale],
    [torso, "capsule", 50 * scale, 72 * scale, 14 * scale],
    [pelvis, "capsule", 45 * scale, 40 * scale, 12 * scale],
    [upperArmL, "capsule", 38 * scale, 15 * scale, 8 * scale],
    [lowerArmL, "capsule", 34 * scale, 13 * scale, 7 * scale],
    [handL, "circle", 24 * scale, 24 * scale, 12 * scale],
    [upperArmR, "capsule", 38 * scale, 15 * scale, 8 * scale],
    [lowerArmR, "capsule", 34 * scale, 13 * scale, 7 * scale],
    [handR, "circle", 24 * scale, 24 * scale, 12 * scale],
    [upperLegL, "capsule", 20 * scale, 45 * scale, 8 * scale],
    [lowerLegL, "capsule", 18 * scale, 47 * scale, 8 * scale],
    [footL, "circle", 28 * scale, 28 * scale, 14 * scale],
    [upperLegR, "capsule", 20 * scale, 45 * scale, 8 * scale],
    [lowerLegR, "capsule", 18 * scale, 47 * scale, 8 * scale],
    [footR, "circle", 28 * scale, 28 * scale, 14 * scale]
  ].forEach(([body, shape, width, height, radius]) => {
    body.plugin = {
      ...body.plugin,
      visualStyle: "classic-og-inspired",
      classicPart: { shape, width, height, radius }
    };
  });

  const joint = (bodyA, pointA, bodyB, pointB, stiffness, damping) =>
    Constraint.create({ bodyA, pointA, bodyB, pointB, stiffness, damping, render: { visible: false } });

  const constraints = [
    joint(head, { x: 0, y: 24 * scale }, torso, { x: 0, y: -34 * scale }, 0.52, 0.12),
    joint(torso, { x: 0, y: 33 * scale }, pelvis, { x: 0, y: -19 * scale }, 0.62, 0.14),
    joint(torso, { x: -23 * scale, y: -26 * scale }, upperArmL, { x: 12 * scale, y: -6 * scale }, 0.43, 0.13),
    joint(torso, { x: 23 * scale, y: -26 * scale }, upperArmR, { x: -12 * scale, y: -6 * scale }, 0.43, 0.13),
    joint(upperArmL, { x: -13 * scale, y: 5 * scale }, lowerArmL, { x: 12 * scale, y: -5 * scale }, 0.52, 0.14),
    joint(upperArmR, { x: 13 * scale, y: 5 * scale }, lowerArmR, { x: -12 * scale, y: -5 * scale }, 0.52, 0.14),
    joint(lowerArmL, { x: -13 * scale, y: 5 * scale }, handL, { x: 0, y: 0 }, 0.68, 0.16),
    joint(lowerArmR, { x: 13 * scale, y: 5 * scale }, handR, { x: 0, y: 0 }, 0.68, 0.16),
    joint(pelvis, { x: -14 * scale, y: 18 * scale }, upperLegL, { x: 0, y: -21 * scale }, 0.5, 0.16),
    joint(pelvis, { x: 14 * scale, y: 18 * scale }, upperLegR, { x: 0, y: -21 * scale }, 0.5, 0.16),
    joint(upperLegL, { x: 0, y: 21 * scale }, lowerLegL, { x: 0, y: -21 * scale }, 0.58, 0.15),
    joint(upperLegR, { x: 0, y: 21 * scale }, lowerLegR, { x: 0, y: -21 * scale }, 0.58, 0.15),
    joint(lowerLegL, { x: 0, y: 22 * scale }, footL, { x: 0, y: 0 }, 0.72, 0.17),
    joint(lowerLegR, { x: 0, y: 22 * scale }, footR, { x: 0, y: 0 }, 0.72, 0.17)
  ];

  const buddy = Composite.create({ label: "buddy" });
  Composite.add(buddy, [
    head,
    torso,
    pelvis,
    upperArmL,
    lowerArmL,
    handL,
    upperArmR,
    lowerArmR,
    handR,
    upperLegL,
    lowerLegL,
    footL,
    upperLegR,
    lowerLegR,
    footR,
    ...constraints
  ]);
  return buddy;
}

function setupInteractions() {
  window.addEventListener("resize", resizeStage);

  hud.radialWheel.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  hud.power.addEventListener("input", (event) => {
    state.power = Number(event.target.value);
    hud.powerReadout.textContent = String(state.power);
  });

  controls.reset.addEventListener("click", resetScene);
  controls.resetMenu.addEventListener("click", resetScene);
  controls.exportReplay.addEventListener("click", exportReplayVideo);
  controls.newBuddy.addEventListener("click", () => {
    spawnNewBuddy();
    toast("New buddy spawned.");
  });
  controls.replay.addEventListener("click", showReplay);
  controls.saveScene.addEventListener("click", savePreset);
  controls.loadScene.addEventListener("click", loadPreset);
  controls.exportSave.addEventListener("click", exportSaveSnapshot);
  controls.importSave.addEventListener("click", () => controls.saveImportInput.click());
  controls.saveImportInput.addEventListener("change", importSaveSnapshot);
  controls.importSkinPack.addEventListener("click", () => controls.skinPackImportInput.click());
  controls.skinPackImportInput.addEventListener("change", importSkinPackFile);
  controls.ceiling.addEventListener("click", toggleCeiling);
  controls.slowMo.addEventListener("click", toggleSlowMo);
  controls.gravityModes.forEach((button) => {
    button.addEventListener("click", () => setGravityMode(button.dataset.gravityMode));
  });
  controls.fpsCounter.addEventListener("click", toggleFpsCounter);
  controls.missionMenu.addEventListener("click", chooseMissions);
  controls.refreshMissions.addEventListener("click", chooseMissions);
  controls.challengeMode.addEventListener("change", () => {
    startChallenge(controls.challengeMode.value, true);
  });
  controls.shopButton.addEventListener("click", () => hud.shopGrid.scrollIntoView({ behavior: "smooth", block: "nearest" }));

  controls.reducedFlash.checked = state.settings.reducedFlash;
  controls.goreToggle.checked = state.settings.slapstick;
  controls.audioToggle.checked = state.settings.audio;
  controls.hapticsToggle.checked = state.settings.haptics;
  controls.assetPack.value = state.settings.assetPack;
  controls.audioPack.value = AUDIO_PACKS[state.settings.audioPack] ? state.settings.audioPack : "classic";
  controls.liquidType.value = LIQUID_TYPES[state.settings.liquidType] ? state.settings.liquidType : "water";
  controls.challengeMode.value = CHALLENGE_MODES[state.challenge.mode] ? state.challenge.mode : "free";
  updateFpsCounterVisibility();
  updateModeButtonStates();
  controls.reducedFlash.addEventListener("change", () => {
    state.settings.reducedFlash = controls.reducedFlash.checked;
    saveGame();
  });
  controls.goreToggle.addEventListener("change", () => {
    state.settings.slapstick = controls.goreToggle.checked;
    saveGame();
  });
  controls.audioToggle.addEventListener("change", () => {
    state.settings.audio = controls.audioToggle.checked;
    if (!state.settings.audio) {
      feedback.stopWind();
    } else {
      feedback.resume();
      feedback.play("select", 0.5);
    }
    saveGame();
  });
  controls.hapticsToggle.addEventListener("change", () => {
    state.settings.haptics = controls.hapticsToggle.checked;
    pulse(18);
    saveGame();
  });
  controls.assetPack.addEventListener("change", () => {
    selectRoomPack(controls.assetPack.value);
  });
  controls.audioPack.addEventListener("change", () => {
    state.settings.audioPack = AUDIO_PACKS[controls.audioPack.value] ? controls.audioPack.value : "classic";
    feedback.resume();
    feedback.play("unlock", 0.75);
    toast(`${feedback.pack().name} audio pack selected.`);
    saveGame();
  });
  controls.liquidType.addEventListener("change", () => {
    state.settings.liquidType = LIQUID_TYPES[controls.liquidType.value] ? controls.liquidType.value : "water";
    state.liquid.type = state.settings.liquidType;
    toast(`${getLiquidType().name} selected.`);
    saveGame();
  });

  window.addEventListener("keydown", (event) => {
    const number = Number(event.key);
    if (number >= 1 && number <= TOOL_DEFS.length) {
      feedback.resume();
      const tool = TOOL_DEFS[number - 1];
      if (tool) {
        trySelectTool(tool.id);
      }
    }
    if (event.key === "r" || event.key === "R") {
      resetScene();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }
    feedback.resume();
    hideRadialWheel();
    const worldPoint = screenToWorld(event);
    if (event.pointerType === "touch") {
      scheduleTouchWheel(event, worldPoint);
    }
    state.pointerDown = true;
    state.pointerStart = { ...worldPoint };
    state.pointerCurrent = { ...worldPoint };
    state.pointerPrevious = { ...worldPoint };
    state.pointerDownTime = performance.now();
    state.aimVector = null;

    if (event.pointerType === "touch" && isInstantPlacementTool(state.tool)) {
      state.pendingTouchInstant = { tool: state.tool, point: worldPoint };
      return;
    }

    if (state.tool === "grenade") {
      spawnGrenade(worldPoint);
    } else if (state.tool === "paintball" || state.tool === "foamdart" || state.tool === "corkpopper") {
      state.aimVector = { start: worldPoint, end: worldPoint };
    } else if (state.tool === "ball" || state.tool === "beachball" || state.tool === "bowling" || state.tool === "brick" || state.tool === "glove" || state.tool === "anvil") {
      state.aimVector = { start: worldPoint, end: worldPoint };
    } else if (state.tool === "trampoline") {
      placeTrampoline(worldPoint);
    } else if (state.tool === "gift") {
      placeGift(worldPoint);
    } else if (state.tool === "tesla") {
      placeTesla(worldPoint);
    } else if (state.tool === "rope") {
      attachRope(worldPoint);
    } else if (state.tool === "water") {
      setLiquidLevel(worldPoint);
    } else if (state.tool === "blackhole") {
      setMood("Afraid", 900);
    } else if (state.tool === "fan") {
      setMood("Curious", 900);
    } else if (state.tool === "rubber") {
      setMood("Surprised", 900);
    } else if (state.tool === "heatcone") {
      setMood("Afraid", 900);
    } else if (state.tool === "sparkwand") {
      setMood("Stunned", 900);
    } else if (state.tool === "frostpuff") {
      setMood("Surprised", 900);
    } else if (state.tool === "goomist") {
      setMood("Curious", 900);
    } else if (state.tool === "hand") {
      const target = getBuddyAt(worldPoint);
      if (target) {
        target.render.strokeStyle = getSkin().accent;
        target.render.lineWidth = 2;
      }
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    state.pointerPrevious = state.pointerCurrent;
    state.pointerCurrent = screenToWorld(event);
    if (state.touchWheelOrigin) {
      const moved = Vector.magnitude(Vector.sub(state.pointerCurrent, state.touchWheelOrigin));
      if (moved > 18) {
        clearTouchWheelTimer();
      }
    }
    if (state.aimVector) {
      state.aimVector.end = { ...state.pointerCurrent };
    }
  });

  window.addEventListener("pointerup", (event) => {
    if (event.button !== 0 || !state.pointerDown) {
      return;
    }
    clearTouchWheelTimer();
    if (state.radialOpen) {
      state.pointerDown = false;
      state.pendingTouchInstant = null;
      return;
    }
    const endPoint = screenToWorld(event);
    state.pointerDown = false;
    const elapsed = performance.now() - state.pointerDownTime;
    const drag = Vector.sub(endPoint, state.pointerStart);
    const distance = Vector.magnitude(drag);

    if (state.pendingTouchInstant) {
      executeInstantTool(state.pendingTouchInstant.tool, endPoint);
      state.pendingTouchInstant = null;
    } else if (state.tool === "ball") {
      spawnBall(state.pointerStart, endPoint);
    } else if (state.tool === "beachball") {
      spawnBeachBall(state.pointerStart, endPoint);
    } else if (state.tool === "bowling") {
      spawnBowlingBall(state.pointerStart, endPoint);
    } else if (state.tool === "brick") {
      spawnBrick(state.pointerStart, endPoint);
    } else if (state.tool === "glove") {
      spawnBoxingGlove(state.pointerStart, endPoint);
    } else if (state.tool === "anvil") {
      spawnAnvil(state.pointerStart, endPoint);
    } else if (state.tool === "paintball") {
      firePaintball(state.pointerStart, endPoint);
    } else if (state.tool === "foamdart") {
      fireFoamDart(state.pointerStart, endPoint);
    } else if (state.tool === "corkpopper") {
      fireCorkPopper(state.pointerStart, endPoint);
    } else if (state.tool === "hand" && elapsed < 210 && distance < 12) {
      tickleAt(endPoint);
    }
    state.aimVector = null;
    feedback.stopWind();
    clearBuddyHighlight();
  });

  canvas.addEventListener("pointerleave", () => {
    clearTouchWheelTimer();
    state.pointerDown = false;
    state.pendingTouchInstant = null;
    state.aimVector = null;
    feedback.stopWind();
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    feedback.resume();
    const worldPoint = screenToWorld(event);
    showRadialWheel(event.clientX, event.clientY, worldPoint);
  });

  window.addEventListener("pointerdown", (event) => {
    if (!hud.radialWheel.contains(event.target) && event.target !== canvas) {
      hideRadialWheel();
    }
  });
}

function setupPhysicsEvents() {
  Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;
      const buddyA = isBuddyBody(bodyA);
      const buddyB = isBuddyBody(bodyB);

      if ((buddyA && bodyB === state.floorBody) || (buddyB && bodyA === state.floorBody)) {
        state.lastFloorContact = performance.now();
      }

      if (!buddyA && !buddyB) {
        continue;
      }

      const other = buddyA ? bodyB : bodyA;
      const relativeVelocity = Vector.sub(bodyA.velocity, bodyB.velocity);
      const speed = Vector.magnitude(relativeVelocity);
      if (speed < 1.2) {
        continue;
      }
      const massA = getFiniteMass(bodyA);
      const massB = getFiniteMass(bodyB);
      const equivalentMass = (massA * massB) / Math.max(massA + massB, 0.01);
      let impactScore = speed * equivalentMass * 1.9;
      if (other.isStatic) {
        impactScore *= other.label === "trampoline" ? 1.15 : 0.38;
      }
      if (impactScore < 1) {
        continue;
      }
      const clamped = Math.min(impactScore, 46);
      if (performance.now() >= state.spawnGraceUntil) {
        addScore(clamped, "impact", ["blunt"]);
      }
      spawnBurst(pair.collision.supports[0] || (buddyA ? bodyA.position : bodyB.position), getSkin().accent, Math.min(10, Math.round(speed)));

      if (state.tool === "blackhole" && state.pointerDown) {
        setMood("Afraid", 1100);
      } else if (clamped > 22) {
        setMood("Stunned", 2400);
        addShake(10);
      } else if (clamped > 9) {
        setMood("Excited", 1700);
      }
    }
  });

  Events.on(engine, "afterUpdate", (event) => {
    const delta = event.source.timing.lastDelta || 16.67;
    tickTimers(delta);

    updateGrabAssist(delta);
    if (state.tool === "fan" && state.pointerDown) {
      applyFanForce(delta);
    }
    if (state.tool === "blackhole" && state.pointerDown) {
      applyBlackHole(delta);
    }
    if (state.tool === "rubber" && state.pointerDown) {
      updateRubberBlaster(delta);
    }
    if (state.tool === "heatcone" && state.pointerDown) {
      applyHeatCone(delta);
    }
    if (state.tool === "sparkwand" && state.pointerDown) {
      applySparkWand(delta);
    }
    if (state.tool === "frostpuff" && state.pointerDown) {
      applyFrostPuff(delta);
    }
    if (state.tool === "goomist" && state.pointerDown) {
      applyGooMist(delta);
    }
    updateGrenades();
    updateTesla(delta);
    updateLiquid(delta);
    updateParticles(delta);
    updateAirborne(delta);
    updateSelfRighting(delta);
    updateFpsCounter(delta);
    updateHud();
  });

  Events.on(render, "afterRender", drawOverlayEffects);

  Events.on(mouseConstraint, "startdrag", (event) => {
    if (state.tool !== "hand" || !event.body || !isBuddyBody(event.body)) {
      return;
    }
    state.grabbedBody = event.body;
    event.body.plugin = event.body.plugin || {};
    event.body.plugin.grabFrictionAir = event.body.frictionAir;
    event.body.frictionAir = Math.max(event.body.frictionAir || 0, 0.045);
    setMood("Curious", 700);
  });

  Events.on(mouseConstraint, "enddrag", (event) => {
    const body = event.body || state.grabbedBody;
    if (!body || !isBuddyBody(body)) {
      state.grabbedBody = null;
      return;
    }
    if (body.plugin && Number.isFinite(body.plugin.grabFrictionAir)) {
      body.frictionAir = body.plugin.grabFrictionAir;
      delete body.plugin.grabFrictionAir;
    }
    const stepFlick = Vector.sub(state.pointerCurrent, state.pointerPrevious);
    const drag = Vector.sub(state.pointerCurrent, state.pointerStart);
    const elapsed = Math.max(16, performance.now() - state.pointerDownTime);
    const totalFlick = Vector.mult(drag, Math.min(1, 140 / elapsed));
    const flickSource = Vector.magnitude(stepFlick) > Vector.magnitude(totalFlick) ? stepFlick : totalFlick;
    const flick = clampVector(flickSource, 32);
    if (Vector.magnitude(flick) > 2.5) {
      Body.setVelocity(body, Vector.add(body.velocity, Vector.mult(flick, 0.28)));
      Body.setAngularVelocity(body, body.angularVelocity + Math.max(-0.35, Math.min(0.35, flick.x * 0.012)));
      addScore(3 + Vector.magnitude(flick) * 0.08, "throw", ["blunt", "hand"]);
      setMood("Excited", 1100);
    }
    state.grabbedBody = null;
  });
}

function updateGrabAssist(delta) {
  const body = mouseConstraint.body || state.grabbedBody;
  if (state.tool !== "hand" || !body || !isBuddyBody(body)) {
    return;
  }
  const frameScale = Math.max(0.5, Math.min(1.6, delta / 16.67));
  Body.setAngularVelocity(body, body.angularVelocity * Math.pow(0.82, frameScale));
  const offset = Vector.sub(state.pointerCurrent, body.position);
  const distance = Vector.magnitude(offset);
  if (distance > 42) {
    const correction = Vector.mult(Vector.normalise(offset), Math.min(0.0014, distance * 0.000012) * body.mass);
    Body.applyForce(body, body.position, correction);
  }
}

function clampVector(vector, maxMagnitude) {
  const magnitude = Vector.magnitude(vector);
  if (!Number.isFinite(magnitude) || magnitude <= maxMagnitude) {
    return vector;
  }
  return Vector.mult(Vector.normalise(vector), maxMagnitude);
}

function tickTimers(delta) {
  if (state.comboTimer > 0) {
    state.comboTimer = Math.max(0, state.comboTimer - delta);
    if (state.comboTimer === 0) {
      state.comboCount = 0;
    }
  }

  if (state.moodTimer > 0) {
    state.moodTimer -= delta;
    if (state.moodTimer <= 0) {
      setMood("Calm", 0);
    }
  }

  if (state.fanScoreCooldown > 0) {
    state.fanScoreCooldown -= delta;
  }
  if (state.blackHoleCooldown > 0) {
    state.blackHoleCooldown -= delta;
  }
  if (state.teslaCooldown > 0) {
    state.teslaCooldown -= delta;
  }
  if (state.rubberCooldown > 0) {
    state.rubberCooldown -= delta;
  }
  if (state.rubberBurstWindow > 0) {
    state.rubberBurstWindow = Math.max(0, state.rubberBurstWindow - delta);
    if (state.rubberBurstWindow === 0) {
      state.rubberBurstShots = 0;
    }
  }
  if (state.heatConeCooldown > 0) {
    state.heatConeCooldown -= delta;
  }
  if (state.sparkWandCooldown > 0) {
    state.sparkWandCooldown -= delta;
  }
  if (state.frostPuffCooldown > 0) {
    state.frostPuffCooldown -= delta;
  }
  if (state.gooMistCooldown > 0) {
    state.gooMistCooldown -= delta;
  }
  if (state.liquidScoreCooldown > 0) {
    state.liquidScoreCooldown -= delta;
  }
  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - delta * 0.03);
  }
  if (state.toastTimer > 0) {
    state.toastTimer -= delta;
    if (state.toastTimer <= 0) {
      hud.toast.classList.remove("toast--visible");
    }
  }

  updateChallengeTimer(delta);
  updateFrostedBodies(delta);
  updateGooedBodies(delta);

  for (const [tool, heat] of state.toolHeat.entries()) {
    const next = Math.max(0, heat - delta / 8500);
    if (next <= 0.01) {
      state.toolHeat.delete(tool);
    } else {
      state.toolHeat.set(tool, next);
    }
  }
}

function buildToolUi() {
  hud.toolRail.innerHTML = "";
  TOOL_DEFS.forEach((tool, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tool-button";
    button.dataset.tool = tool.id;
    button.title = `${index + 1}. ${tool.description}`;
    button.innerHTML = `
      <span class="tool-button__icon">${tool.icon}</span>
      <span class="tool-button__copy">
        <strong>${tool.name}</strong>
        <span>${tool.category}</span>
      </span>
    `;
    button.addEventListener("click", () => trySelectTool(tool.id));
    hud.toolRail.appendChild(button);
  });
  buildRadialWheel();
}

function buildRadialWheel() {
  hud.radialWheel.innerHTML = '<div class="radial-wheel__center">Tools</div>';
  const radius = 92;
  TOOL_DEFS.forEach((tool, index) => {
    const angle = -Math.PI / 2 + (index / TOOL_DEFS.length) * Math.PI * 2;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "radial-wheel__button";
    button.dataset.tool = tool.id;
    button.style.transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`;
    button.textContent = tool.icon;
    button.title = `${tool.name}: ${tool.description}`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      trySelectTool(tool.id);
      hideRadialWheel();
    });
    hud.radialWheel.appendChild(button);
  });
  updateUnlockButtons();
}

function buildMenus() {
  hud.itemMenu.innerHTML = "";
  const categories = [...new Set(TOOL_DEFS.map((tool) => tool.category))];
  categories.forEach((category) => {
    const label = document.createElement("span");
    label.className = "menu__category";
    label.textContent = category;
    hud.itemMenu.appendChild(label);
    TOOL_DEFS.filter((tool) => tool.category === category).forEach((tool) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = state.unlockedTools.has(tool.id) ? tool.name : `${tool.name} - $${tool.cost}`;
      button.addEventListener("click", () => trySelectTool(tool.id));
      hud.itemMenu.appendChild(button);
    });
  });

  hud.skinMenu.innerHTML = "";
  SKIN_DEFS.forEach((skin) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = state.unlockedSkins.has(skin.id) ? skin.name : `${skin.name} - $${skin.cost}`;
    button.addEventListener("click", () => buyOrSelectSkin(skin.id));
    hud.skinMenu.appendChild(button);
  });

  controls.challengeMode.innerHTML = "";
  Object.entries(CHALLENGE_MODES).forEach(([id, mode]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = mode.name === "Free" ? "Free Play" : mode.name;
    controls.challengeMode.appendChild(option);
  });
  controls.challengeMode.value = CHALLENGE_MODES[state.challenge.mode] ? state.challenge.mode : "free";
}

function buildAssetPackUi() {
  controls.assetPack.innerHTML = "";
  state.assetPacks.forEach((pack) => {
    const option = document.createElement("option");
    option.value = pack.id;
    option.textContent = pack.name;
    controls.assetPack.appendChild(option);
  });
  controls.assetPack.value = getAssetPack(state.settings.assetPack).id;
  renderRoomPreview();
}

function renderRoomPreview(packId = state.settings.assetPack) {
  if (!controls.roomPreview) {
    return;
  }
  const pack = getAssetPack(packId);
  const room = pack.room || {};
  controls.roomPreview.innerHTML = "";
  controls.roomPreview.dataset.roomPack = pack.id;

  const name = document.createElement("strong");
  name.className = "room-preview__name";
  name.textContent = pack.name;
  controls.roomPreview.appendChild(name);

  controls.roomPreview.appendChild(createRoomThumbnail(pack, "room-thumbnail--large"));

  const swatches = document.createElement("div");
  swatches.className = "room-preview__swatches";
  [
    ["Background", room.background],
    ["Grid", room.grid],
    ["Floor", room.floor],
    ["Accent", room.accent]
  ].forEach(([label, color]) => {
    const swatch = document.createElement("span");
    swatch.className = "room-preview__swatch";
    swatch.style.background = color || "#87968e";
    swatch.title = `${label}: ${color || "#87968e"}`;
    swatch.setAttribute("aria-label", swatch.title);
    swatches.appendChild(swatch);
  });
  controls.roomPreview.appendChild(swatches);

  const browser = document.createElement("div");
  browser.className = "room-browser";
  state.assetPacks.forEach((roomPack) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-browser__button";
    button.dataset.roomPack = roomPack.id;
    const isActive = roomPack.id === pack.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    const label = document.createElement("span");
    label.className = "room-browser__name";
    label.textContent = roomPack.name;
    button.appendChild(label);
    button.appendChild(createRoomThumbnail(roomPack, "room-thumbnail--mini"));
    button.addEventListener("click", () => selectRoomPack(roomPack.id));
    browser.appendChild(button);
  });
  controls.roomPreview.appendChild(browser);
}

function createRoomThumbnail(pack, sizeClass) {
  const room = pack.room || {};
  const thumbnail = document.createElement("span");
  thumbnail.className = `room-thumbnail ${sizeClass}`;
  thumbnail.dataset.motif = getRoomMotif(pack);
  thumbnail.setAttribute("aria-label", `${pack.name} room thumbnail`);
  thumbnail.style.setProperty("--room-bg", room.background || "#87968e");
  thumbnail.style.setProperty("--room-grid", room.grid || "#e8f7f4");
  thumbnail.style.setProperty("--room-floor", room.floor || "#64736b");
  thumbnail.style.setProperty("--room-accent", room.accent || "#98f17f");

  ["grid", "floor", "accent", "buddy"].forEach((part) => {
    const layer = document.createElement("i");
    layer.className = `room-thumbnail__${part}`;
    thumbnail.appendChild(layer);
  });
  return thumbnail;
}

function getRoomMotif(pack) {
  const rawMotif = pack.room?.motif || pack.id || "grid";
  const motif = String(rawMotif).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return motif || "grid";
}

function selectRoomPack(packId) {
  state.settings.assetPack = getAssetPack(packId).id;
  controls.assetPack.value = state.settings.assetPack;
  renderRoomPreview();
  applyRoomPack();
  toast(`${getAssetPack().name} asset pack selected.`);
  saveGame();
}

function buildAudioPackUi() {
  controls.audioPack.innerHTML = "";
  Object.entries(AUDIO_PACKS).forEach(([id, pack]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = pack.assetPack ? `${pack.name} (${getAssetPack(pack.assetPack).name})` : pack.name;
    controls.audioPack.appendChild(option);
  });
  controls.audioPack.value = AUDIO_PACKS[state.settings.audioPack] ? state.settings.audioPack : "classic";
}

function renderShop() {
  progression.renderShop();
}

function chooseMissions() {
  challengeFlow.chooseMissions();
}

function renderMissions() {
  challengeFlow.renderMissions();
}

function startChallenge(modeId, announce = true) {
  challengeFlow.startChallenge(modeId, announce);
}

function updateChallengeTimer(delta) {
  challengeFlow.updateChallengeTimer(delta);
}

function recordChallenge(event, amount = 1) {
  challengeFlow.recordChallenge(event, amount);
}

function finishChallenge(success) {
  challengeFlow.finishChallenge(success);
}

function showChallengeResult(result) {
  challengeFlow.showChallengeResult(result);
}

function getChallengeMode() {
  return challengeFlow.getChallengeMode();
}

function trySelectTool(toolId) {
  if (!state.unlockedTools.has(toolId)) {
    const tool = getTool(toolId);
    toast(`${tool.name} is locked. Buy it for $${tool.cost}.`);
    return;
  }
  selectTool(toolId);
}

function selectTool(toolId) {
  const tool = getTool(toolId);
  state.tool = tool.id;
  document.querySelectorAll(".tool-button").forEach((button) => {
    const id = button.dataset.tool;
    button.classList.toggle("tool-button--active", id === toolId);
    button.classList.toggle("tool-button--locked", !state.unlockedTools.has(id));
  });
  hud.toolName.textContent = tool.name;
  hud.toolDescription.textContent = tool.description;
  updateUnlockButtons();

  if (toolId === "hand") {
    feedback.stopWind();
    mouseConstraint.collisionFilter.mask = 0xffffffff;
    mouseConstraint.constraint.stiffness = 0.72;
    mouseConstraint.constraint.damping = 0.18;
  } else {
    if (toolId !== "fan") {
      feedback.stopWind();
    }
    mouseConstraint.constraint.bodyB = null;
    mouseConstraint.collisionFilter.mask = 0x00000000;
    mouseConstraint.constraint.stiffness = 0.001;
  }
  feedback.play("select", 0.5);
  saveGame();
}

function scheduleTouchWheel(event, worldPoint) {
  clearTouchWheelTimer();
  state.touchWheelOrigin = { ...worldPoint };
  const clientX = event.clientX;
  const clientY = event.clientY;
  state.touchWheelTimer = window.setTimeout(() => {
    state.pointerDown = false;
    state.aimVector = null;
    state.pendingTouchInstant = null;
    mouseConstraint.constraint.bodyB = null;
    feedback.stopWind();
    showRadialWheel(clientX, clientY, worldPoint);
    pulse(22);
  }, 520);
}

function clearTouchWheelTimer() {
  if (state.touchWheelTimer) {
    window.clearTimeout(state.touchWheelTimer);
  }
  state.touchWheelTimer = 0;
  state.touchWheelOrigin = null;
}

function showRadialWheel(clientX, clientY) {
  const stage = canvas.parentElement.getBoundingClientRect();
  const wheelSize = 250;
  const half = wheelSize / 2;
  const localX = Math.max(half + 8, Math.min(stage.width - half - 8, clientX - stage.left));
  const localY = Math.max(half + 8, Math.min(stage.height - half - 8, clientY - stage.top));
  hud.radialWheel.style.left = `${localX}px`;
  hud.radialWheel.style.top = `${localY}px`;
  hud.radialWheel.classList.add("radial-wheel--open");
  state.radialOpen = true;
  updateUnlockButtons();
  recordMission("radialWheel", 1);
  feedback.play("select", 0.7);
}

function hideRadialWheel() {
  if (!state.radialOpen) {
    return;
  }
  hud.radialWheel.classList.remove("radial-wheel--open");
  state.radialOpen = false;
}

function executeInstantTool(toolId, point) {
  if (toolId === "grenade") {
    spawnGrenade(point);
  } else if (toolId === "trampoline") {
    placeTrampoline(point);
  } else if (toolId === "gift") {
    placeGift(point);
  } else if (toolId === "tesla") {
    placeTesla(point);
  } else if (toolId === "rope") {
    attachRope(point);
  } else if (toolId === "water") {
    setLiquidLevel(point);
  }
}

function buyTool(toolId) {
  progression.buyTool(toolId);
}

function buyOrSelectSkin(skinId) {
  progression.buyOrSelectSkin(skinId);
}

function screenToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * STAGE_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * STAGE_HEIGHT
  };
}

function resizeStage() {
  const card = canvas.parentElement;
  const bounds = card.getBoundingClientRect();
  const targetRatio = STAGE_WIDTH / STAGE_HEIGHT;
  const availableRatio = bounds.width / bounds.height;
  if (availableRatio > targetRatio) {
    canvas.style.width = `${Math.floor(bounds.height * targetRatio)}px`;
    canvas.style.height = "100%";
    canvas.style.marginLeft = `${Math.floor((bounds.width - bounds.height * targetRatio) / 2)}px`;
    canvas.style.marginTop = "0";
  } else {
    canvas.style.width = "100%";
    canvas.style.height = `${Math.floor(bounds.width / targetRatio)}px`;
    canvas.style.marginLeft = "0";
    canvas.style.marginTop = `${Math.floor((bounds.height - bounds.width / targetRatio) / 2)}px`;
  }
}

function spawnBall(start, end) {
  const direction = Vector.sub(end, start);
  const distance = Math.min(Vector.magnitude(direction), 280);
  const radius = 18 + (state.power / 100) * 14;
  const ball = createBallBody(Bodies, start, radius);
  const launch = distance > 2 ? Vector.normalise(direction) : { x: 0, y: -1 };
  const scale = (distance / 280) * (0.55 + state.power / 70);
  Body.setVelocity(ball, Vector.mult(launch, 10 * scale));
  registerProp(ball);
  addScore(4 + state.power * 0.04, "throw", ["blunt", "toy"]);
  setMood("Happy", 1300);
}

function spawnBeachBall(start, end) {
  const direction = Vector.sub(end, start);
  const distance = Math.min(Vector.magnitude(direction), 280);
  const beachBall = createBeachBallBody(Bodies, start);
  const launch = distance > 2 ? Vector.normalise(direction) : { x: 1, y: -0.25 };
  const scale = (distance / 280) * (0.74 + state.power / 82);
  Body.setVelocity(beachBall, Vector.mult(launch, 11.4 * scale));
  Body.setAngularVelocity(beachBall, 0.22 * Math.sign(launch.x || 1));
  registerProp(beachBall);
  addScore(5.4 + state.power * 0.04, "beachball", ["blunt", "toy", "bounce", "propVariant"]);
  setMood("Happy", 1300);
}

function spawnBowlingBall(start, end) {
  const direction = Vector.sub(end, start);
  const distance = Math.min(Vector.magnitude(direction), 260);
  const bowling = createBowlingBallBody(Bodies, start);
  const launch = distance > 2 ? Vector.normalise(direction) : { x: 1, y: -0.15 };
  const scale = (distance / 260) * (0.36 + state.power / 95);
  Body.setVelocity(bowling, Vector.mult(launch, 9.4 * scale));
  Body.setAngularVelocity(bowling, 0.18 * Math.sign(launch.x || 1));
  registerProp(bowling);
  addScore(7 + state.power * 0.05, "bowling", ["blunt", "heavy", "toy", "propVariant"]);
  setMood("Surprised", 1300);
}

function spawnBrick(start, end) {
  const direction = Vector.sub(end, start);
  const distance = Math.min(Vector.magnitude(direction), 260);
  const brick = createBrickBody(Bodies, start);
  const launch = distance > 2 ? Vector.normalise(direction) : { x: 1, y: -0.35 };
  const scale = (distance / 260) * (0.42 + state.power / 82);
  Body.setVelocity(brick, Vector.mult(launch, 10.5 * scale));
  Body.setAngularVelocity(brick, 0.08 * Math.sign(launch.x || 1));
  registerProp(brick);
  addScore(6 + state.power * 0.045, "throw", ["blunt", "object"]);
  setMood("Surprised", 1200);
}

function spawnBoxingGlove(start, end) {
  const direction = Vector.sub(end, start);
  const distance = Math.min(Vector.magnitude(direction), 250);
  const glove = createBoxingGloveBody(Bodies, start);
  const launch = distance > 2 ? Vector.normalise(direction) : { x: 1, y: -0.1 };
  const scale = (distance / 250) * (0.62 + state.power / 80);
  Body.setVelocity(glove, Vector.mult(launch, 12 * scale));
  Body.setAngularVelocity(glove, 0.12 * Math.sign(launch.x || 1));
  registerProp(glove);
  addScore(5 + state.power * 0.04, "punch", ["blunt", "punch", "toy", "propVariant"]);
  setMood("Excited", 1000);
}

function spawnAnvil(start, end) {
  const direction = Vector.sub(end, start);
  const distance = Math.min(Vector.magnitude(direction), 220);
  const anvil = createAnvilBody(Bodies, start);
  const launch = distance > 2 ? Vector.normalise(direction) : { x: 0.2, y: 1 };
  const scale = (distance / 220) * (0.28 + state.power / 105);
  Body.setVelocity(anvil, Vector.mult(launch, 8.2 * scale));
  Body.setAngularVelocity(anvil, 0.025 * Math.sign(launch.x || 1));
  registerProp(anvil);
  addScore(9 + state.power * 0.06, "throw", ["blunt", "heavy", "object"]);
  setMood("Afraid", 1300);
}

function firePaintball(start, end) {
  const direction = Vector.sub(end, start);
  const launch = Vector.magnitude(direction) > 4 ? Vector.normalise(direction) : { x: 1, y: 0 };
  const paint = createPaintballBody(Bodies, start);
  paint.plugin = { projectile: "paintball", color: paint.render.fillStyle, born: performance.now() };
  Body.setVelocity(paint, Vector.mult(launch, 16 + state.power * 0.11));
  registerProp(paint);
  addScore(2, "paintball", ["projectile"]);
}

function fireFoamDart(start, end) {
  const direction = Vector.sub(end, start);
  const launch = Vector.magnitude(direction) > 4 ? Vector.normalise(direction) : { x: 1, y: 0 };
  const dart = createFoamDartBody(Bodies, start);
  dart.plugin = { ...dart.plugin, projectile: "foamdart", born: performance.now() };
  Body.setAngle(dart, Math.atan2(launch.y, launch.x));
  Body.setVelocity(dart, Vector.mult(launch, 17 + state.power * 0.1));
  registerProp(dart);
  addScore(2.6, "dart", ["projectile", "foamDart"]);
}

function fireCorkPopper(start, end) {
  const direction = Vector.sub(end, start);
  const launch = Vector.magnitude(direction) > 4 ? Vector.normalise(direction) : { x: 1, y: 0 };
  const cork = createCorkBody(Bodies, start);
  cork.plugin = { ...cork.plugin, projectile: "corkpopper", born: performance.now() };
  Body.setAngle(cork, Math.atan2(launch.y, launch.x));
  Body.setVelocity(cork, Vector.mult(launch, 14.5 + state.power * 0.085));
  Body.setAngularVelocity(cork, 0.22 * Math.sign(launch.x || 1));
  registerProp(cork);
  addScore(2.2, "cork", ["projectile", "corkPopper"]);
}

function spawnGrenade(position) {
  const grenade = createGrenadeBody(Bodies, position);
  registerProp(grenade);
  state.grenades.push({ body: grenade, explodeAt: performance.now() + 1700, exploded: false });
  addScore(2, "armed", ["explosive"]);
  toast("Grenade armed.");
}

function placeTrampoline(position) {
  const pad = createTrampolineBody(Bodies, position);
  registerProp(pad);
  addScore(3, "build", ["builder"]);
}

function placeGift(position) {
  const cost = Math.min(25, Math.max(5, Math.round(state.cash * 0.04)));
  if (state.cash < cost) {
    toast("Need a little cash for a gift.");
    return;
  }
  state.cash -= cost;
  const gift = createGiftBody(Bodies, position);
  registerProp(gift);
  setMood("Happy", 2600);
  addScore(8, "gift", ["gift", "happy"]);
  recordMission("happy", 1);
}

function placeTesla(position) {
  const coil = createTeslaBody(Bodies, position);
  registerProp(coil);
  state.coils.push({ body: coil, pulse: 0 });
  addScore(4, "build", ["shock"]);
}

function attachRope(position) {
  const target = getNearestBuddyBody(position, 240);
  if (!target) {
    toast("Rope needs a buddy limb.");
    return;
  }
  const anchor = {
    x: Math.max(42, Math.min(STAGE_WIDTH - 42, target.position.x)),
    y: state.settings.ceilingOpen ? 28 : 8
  };
  const length = Math.max(70, Vector.magnitude(Vector.sub(target.position, anchor)) * 0.78);
  const rope = Constraint.create({
    pointA: anchor,
    bodyB: target,
    pointB: { x: 0, y: 0 },
    length,
    stiffness: 0.018 + state.power / 9000,
    damping: 0.055,
    label: "elastic_rope",
    render: {
      visible: true,
      strokeStyle: "#f1ff8b",
      lineWidth: 3,
      type: "line"
    }
  });
  World.add(engine.world, rope);
  state.ropes.push(rope);
  if (state.ropes.length > 6) {
    const oldest = state.ropes.shift();
    World.remove(engine.world, oldest);
  }
  addScore(5, "tether", ["builder", "force"]);
  toast("Elastic rope attached.");
}

function setLiquidLevel(position) {
  if (position.y > FLOOR_Y - 48 && state.liquid.enabled) {
    state.liquid.enabled = false;
    addScore(2, "liquid", [state.liquid.type]);
    toast(`${getLiquidType().name} drained.`);
    return;
  }
  state.liquid.enabled = true;
  state.liquid.type = state.settings.liquidType;
  state.liquid.level = Math.max(150, Math.min(FLOOR_Y - 35, position.y));
  addScore(3, "liquid", [state.liquid.type, "builder"]);
  toast(`${getLiquidType().name} level set.`);
}

function applyFanForce() {
  feedback.startWind();
  const bodies = Composite.allBodies(engine.world);
  const radius = 310;
  const baseForce = 0.00011 * state.power;
  let touchedBuddy = false;
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 2 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };

  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = Math.max(Vector.magnitude(delta), 5);
    if (distance > radius) {
      continue;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.12) {
      continue;
    }
    const falloff = (1 - distance / radius) * cone;
    Body.applyForce(body, body.position, Vector.mult(dir, baseForce * falloff * body.mass));
    if (isBuddyBody(body)) {
      touchedBuddy = true;
    }
  }

  if (touchedBuddy && state.fanScoreCooldown <= 0) {
    addScore(3.3 + state.power * 0.035, "wind", ["wind", "force"]);
    state.fanScoreCooldown = 320;
    setMood("Curious", 900);
  }
}

function applyBlackHole() {
  const bodies = Composite.allBodies(engine.world);
  const radius = 360 + state.power * 1.8;
  let touchedBuddy = false;
  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    const delta = Vector.sub(state.pointerCurrent, body.position);
    const distance = Math.max(Vector.magnitude(delta), 24);
    if (distance > radius) {
      continue;
    }
    const tangent = { x: -delta.y, y: delta.x };
    const pull = Vector.mult(Vector.normalise(delta), 0.00013 * state.power * body.mass * (1 - distance / radius));
    const orbit = Vector.mult(Vector.normalise(tangent), 0.000025 * state.power * body.mass);
    Body.applyForce(body, body.position, Vector.add(pull, orbit));
    if (isBuddyBody(body)) {
      touchedBuddy = true;
    }
  }
  if (touchedBuddy && state.blackHoleCooldown <= 0) {
    addScore(6 + state.power * 0.06, "gravity", ["force", "fear"]);
    feedback.play("shock", 0.35);
    state.blackHoleCooldown = 430;
    setMood("Afraid", 1100);
  }
}

function updateRubberBlaster() {
  if (state.rubberCooldown > 0) {
    return;
  }
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.4 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  const pellet = createRubberPelletBody(Bodies, state.pointerCurrent, state.rubberBurstShots);
  pellet.plugin = { ...pellet.plugin, projectile: "rubber", born: performance.now() };
  Body.setVelocity(pellet, Vector.mult(aim, 14 + state.power * 0.08));
  registerProp(pellet);
  state.rubberBurstShots = Math.min(99, state.rubberBurstShots + 1);
  state.rubberBurstWindow = 1800;
  addScore(1.8 + state.power * 0.012, "rubber", ["projectile", "blunt", "beadCannon"]);
  spawnBurst(state.pointerCurrent, "#f1ff8b", 3);
  state.rubberCooldown = Math.max(70, 180 - state.power * 0.75);
}

function applyHeatCone() {
  const radius = 240;
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = Math.max(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.18) {
      return;
    }
    const falloff = (1 - distance / radius) * cone;
    Body.applyForce(body, body.position, {
      x: dir.x * 0.000035 * state.power * body.mass * falloff,
      y: -0.000018 * state.power * body.mass * falloff
    });
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    const spread = (Math.random() - 0.5) * 42;
    state.particles.push({
      type: "spark",
      x: state.pointerCurrent.x + aim.x * 36 - aim.y * spread,
      y: state.pointerCurrent.y + aim.y * 36 + aim.x * spread,
      vx: aim.x * (0.055 + Math.random() * 0.035),
      vy: aim.y * (0.055 + Math.random() * 0.035) - 0.018,
      radius: 2 + Math.random() * 2.5,
      color: "#ff8d66",
      life: 280,
      maxLife: 280
    });
  }

  if (touchedBuddy && state.heatConeCooldown <= 0) {
    addScore(4.2 + state.power * 0.04, "heat", ["heat", "elemental", "fear"]);
    setMood("Afraid", 1000);
    state.heatConeCooldown = 360;
  }
}

function applySparkWand() {
  const target = getNearestBuddyBody(state.pointerCurrent, 280);
  if (!target) {
    if (Math.random() < 0.24) {
      spawnBurst(state.pointerCurrent, "#f1ff8b", 1);
    }
    return;
  }

  const away = Vector.normalise(Vector.sub(target.position, state.pointerCurrent));
  const jitter = {
    x: away.x + (Math.random() - 0.5) * 0.55,
    y: away.y + (Math.random() - 0.5) * 0.55
  };
  Body.applyForce(target, target.position, Vector.mult(Vector.normalise(jitter), 0.0018 * target.mass));
  Body.setAngularVelocity(target, target.angularVelocity + (Math.random() - 0.5) * 0.07);

  state.particles.push({
    type: "bolt",
    a: { ...state.pointerCurrent },
    b: { ...target.position },
    life: 120,
    maxLife: 120,
    color: "#f1ff8b"
  });

  if (state.sparkWandCooldown <= 0) {
    addScore(3.8 + state.power * 0.035, "spark", ["shock", "elemental", "sparkWand", "stun"]);
    setMood("Stunned", 850);
    state.sparkWandCooldown = 240;
  }
}

function applyFrostPuff() {
  const radius = 220;
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = Math.max(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.12) {
      return;
    }
    const falloff = (1 - distance / radius) * cone;
    Body.setVelocity(body, Vector.mult(body.velocity, 0.965 - falloff * 0.05));
    Body.setAngularVelocity(body, body.angularVelocity * (0.93 - falloff * 0.08));
    Body.applyForce(body, body.position, {
      x: dir.x * 0.000018 * state.power * body.mass * falloff,
      y: -0.00001 * state.power * body.mass * falloff
    });
    body.plugin = body.plugin || {};
    body.plugin.frostTime = Math.max(body.plugin.frostTime || 0, 1050);
    if (!body.plugin.frostRestoreFill) {
      body.plugin.frostRestoreFill = body.render.fillStyle;
      body.plugin.frostRestoreStroke = body.render.strokeStyle;
    }
    body.render.fillStyle = "#dff8ff";
    body.render.strokeStyle = "#8edff0";
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    const spread = (Math.random() - 0.5) * 48;
    state.particles.push({
      type: "spark",
      x: state.pointerCurrent.x + aim.x * 34 - aim.y * spread,
      y: state.pointerCurrent.y + aim.y * 34 + aim.x * spread,
      vx: aim.x * (0.035 + Math.random() * 0.025) - aim.y * spread * 0.0004,
      vy: aim.y * (0.035 + Math.random() * 0.025) + aim.x * spread * 0.0004 - 0.026,
      radius: 2 + Math.random() * 2.2,
      color: "#baf7ff",
      life: 340,
      maxLife: 340
    });
  }

  if (touchedBuddy && state.frostPuffCooldown <= 0) {
    addScore(3.9 + state.power * 0.035, "frost", ["cold", "elemental", "frostPuff", "stun"]);
    setMood("Surprised", 900);
    state.frostPuffCooldown = 260;
  }
}

function updateFrostedBodies(delta) {
  if (!state.buddy) {
    return;
  }
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!body.plugin?.frostTime) {
      return;
    }
    body.plugin.frostTime = Math.max(0, body.plugin.frostTime - delta);
    if (body.plugin.frostTime > 0) {
      return;
    }
    if (body.plugin.frostRestoreFill) {
      body.render.fillStyle = body.plugin.frostRestoreFill;
    }
    if (body.plugin.frostRestoreStroke) {
      body.render.strokeStyle = body.plugin.frostRestoreStroke;
    }
    delete body.plugin.frostTime;
    delete body.plugin.frostRestoreFill;
    delete body.plugin.frostRestoreStroke;
  });
}

function applyGooMist() {
  const radius = 225;
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = Math.max(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.1) {
      return;
    }
    const falloff = (1 - distance / radius) * cone;
    const tangent = { x: -dir.y, y: dir.x };
    Body.applyForce(body, body.position, {
      x: (dir.x * 0.000014 + tangent.x * 0.000024) * state.power * body.mass * falloff,
      y: (dir.y * 0.000006 - 0.000008) * state.power * body.mass * falloff
    });
    Body.setAngularVelocity(body, body.angularVelocity + 0.035 * falloff);
    body.plugin = body.plugin || {};
    body.plugin.gooTime = Math.max(body.plugin.gooTime || 0, 1200);
    if (!body.plugin.gooRestoreFill) {
      body.plugin.gooRestoreFill = body.render.fillStyle;
      body.plugin.gooRestoreStroke = body.render.strokeStyle;
      body.plugin.gooRestoreFriction = body.friction;
      body.plugin.gooRestoreFrictionAir = body.frictionAir;
    }
    body.friction = Math.min(body.friction || 0.1, 0.08);
    body.frictionAir = Math.min(body.frictionAir || 0.01, 0.006);
    body.render.fillStyle = "#d8ffd1";
    body.render.strokeStyle = "#67c66b";
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    const spread = (Math.random() - 0.5) * 50;
    state.particles.push({
      type: "spark",
      x: state.pointerCurrent.x + aim.x * 32 - aim.y * spread,
      y: state.pointerCurrent.y + aim.y * 32 + aim.x * spread,
      vx: aim.x * (0.028 + Math.random() * 0.026) - aim.y * spread * 0.0005,
      vy: aim.y * (0.028 + Math.random() * 0.026) + aim.x * spread * 0.0005 + 0.012,
      radius: 2.4 + Math.random() * 2.8,
      color: "#98f17f",
      life: 360,
      maxLife: 360
    });
  }

  if (touchedBuddy && state.gooMistCooldown <= 0) {
    addScore(4.1 + state.power * 0.034, "goo", ["goo", "slippery", "elemental", "gooMist"]);
    setMood("Curious", 950);
    state.gooMistCooldown = 260;
  }
}

function updateGooedBodies(delta) {
  if (!state.buddy) {
    return;
  }
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!body.plugin?.gooTime) {
      return;
    }
    body.plugin.gooTime = Math.max(0, body.plugin.gooTime - delta);
    if (body.plugin.gooTime > 0) {
      return;
    }
    if (body.plugin.gooRestoreFill) {
      body.render.fillStyle = body.plugin.gooRestoreFill;
    }
    if (body.plugin.gooRestoreStroke) {
      body.render.strokeStyle = body.plugin.gooRestoreStroke;
    }
    if (Number.isFinite(body.plugin.gooRestoreFriction)) {
      body.friction = body.plugin.gooRestoreFriction;
    }
    if (Number.isFinite(body.plugin.gooRestoreFrictionAir)) {
      body.frictionAir = body.plugin.gooRestoreFrictionAir;
    }
    delete body.plugin.gooTime;
    delete body.plugin.gooRestoreFill;
    delete body.plugin.gooRestoreStroke;
    delete body.plugin.gooRestoreFriction;
    delete body.plugin.gooRestoreFrictionAir;
  });
}

function updateGrenades() {
  const now = performance.now();
  for (const grenade of state.grenades) {
    if (!grenade.exploded && now >= grenade.explodeAt) {
      explodeGrenade(grenade);
    }
  }
  state.grenades = state.grenades.filter((grenade) => !grenade.exploded);
}

function explodeGrenade(grenade) {
  grenade.exploded = true;
  const origin = grenade.body.position;
  const radius = 190 + state.power * 2.15;
  const baseForce = 0.00145 * (0.8 + state.power / 72);
  const bodies = Composite.allBodies(engine.world);
  let hitBuddy = false;

  bodies.forEach((body) => {
    if (body === grenade.body || body.isStatic) {
      return;
    }
    const offset = Vector.sub(body.position, origin);
    const distance = Math.max(Vector.magnitude(offset), 12);
    if (distance > radius) {
      return;
    }
    const falloff = 1 - distance / radius;
    const direction = Vector.normalise(offset);
    Body.applyForce(body, body.position, Vector.mult(direction, baseForce * falloff * body.mass));
    if (isBuddyBody(body)) {
      hitBuddy = true;
      addScore(13 * falloff * (state.power / 55), "explosion", ["explosive", "heat", "loud"]);
    }
  });

  spawnBurst(origin, "#ffc857", 34);
  if (!state.settings.reducedFlash) {
    addShake(18);
  }
  if (hitBuddy) {
    setMood("Afraid", 2400);
  }
  recordMission("explosion", 1);
  removeProp(grenade.body);
}

function updateTesla(delta) {
  for (const coil of state.coils) {
    coil.pulse -= delta;
    if (coil.pulse > 0) {
      continue;
    }
    coil.pulse = 900;
    const targets = Composite.allBodies(engine.world)
      .filter((body) => isBuddyBody(body) && Vector.magnitude(Vector.sub(body.position, coil.body.position)) < 180)
      .slice(0, 3);
    targets.forEach((body) => {
      const dir = Vector.normalise(Vector.sub(body.position, coil.body.position));
      Body.applyForce(body, body.position, Vector.mult(dir, 0.0012 * body.mass));
      addScore(4.5, "shock", ["shock", "stun"]);
      state.particles.push({
        type: "bolt",
        a: { ...coil.body.position },
        b: { ...body.position },
        life: 260,
        maxLife: 260,
        color: "#74f7ff"
      });
    });
    if (targets.length) {
      setMood("Stunned", 900);
    }
  }
}

function updateLiquid(delta) {
  if (!state.liquid.enabled) {
    return;
  }
  const liquid = getLiquidType();
  let touchedBuddy = false;
  const bodies = Composite.allBodies(engine.world);
  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    body.plugin = body.plugin || {};
    if (!Number.isFinite(body.plugin.baseFriction)) {
      body.plugin.baseFriction = body.friction;
    }
    const depth = body.position.y - state.liquid.level;
    if (depth <= 0) {
      body.friction = body.plugin.baseFriction;
      continue;
    }
    const submersion = Math.min(1, depth / 120);
    const buoyancy = -0.00021 * liquid.buoyancy * body.mass * submersion * (0.9 + state.power / 120);
    const dragX = -body.velocity.x * 0.000035 * liquid.dragX * body.mass * submersion;
    const dragY = -body.velocity.y * 0.000018 * liquid.dragY * body.mass * submersion;
    Body.applyForce(body, body.position, { x: dragX, y: buoyancy + dragY });
    Body.setAngularVelocity(body, body.angularVelocity * (1 - Math.min(0.04, delta * 0.00012 * liquid.angularDamping * submersion)));
    if (state.liquid.type === "oil") {
      body.friction = Math.min(body.friction, 0.18);
    } else if (state.liquid.type === "slime") {
      body.friction = Math.max(body.friction, 0.82);
    } else {
      body.friction = body.plugin.baseFriction;
    }
    if (isBuddyBody(body)) {
      touchedBuddy = true;
    }
  }
  if (touchedBuddy && state.liquidScoreCooldown <= 0) {
    addScore(4.5, "liquid", [state.liquid.type, "force"]);
    state.liquidScoreCooldown = 850;
    setMood(liquid.mood, 900);
  }
}

function updateParticles(delta) {
  state.particles.forEach((particle) => {
    particle.life -= delta;
    if (particle.type === "spark") {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 0.0007 * delta;
    }
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.decals = state.decals.filter((decal) => performance.now() - decal.time < 8500);
}

function updateAirborne(delta) {
  if (performance.now() < state.spawnGraceUntil) {
    return;
  }
  const sinceFloor = performance.now() - state.lastFloorContact;
  const torsoAboveFloor = state.torso && state.torso.position.y < FLOOR_Y - 85;
  if (sinceFloor > 450 && torsoAboveFloor) {
    state.airborneBank += delta / 1000;
    if (state.airborneBank >= 1) {
      const seconds = Math.floor(state.airborneBank);
      state.airborneBank -= seconds;
      addScore(7 * seconds, "airborne", ["juggle", "force"]);
      recordMission("airborneSecond", seconds);
    }
  }
}

function updateSelfRighting(delta) {
  recoverBuddyFromWalls();
  if (!state.torso || state.mood === "Stunned") {
    return;
  }
  const tilt = Math.sin(state.torso.angle);
  const nearFloor = state.torso.position.y > FLOOR_Y - 130;
  if (Math.abs(tilt) > 0.4 && Math.abs(state.torso.angularVelocity) < 0.18) {
    Body.setAngularVelocity(state.torso, state.torso.angularVelocity - tilt * 0.00062 * delta);
    if (nearFloor) {
      Body.applyForce(state.torso, state.torso.position, { x: -tilt * 0.00001 * state.torso.mass, y: -0.000022 * state.torso.mass });
    }
  }
}

function recoverBuddyFromWalls() {
  if (!state.buddy || performance.now() < state.wallRecoveryCooldown) {
    return;
  }
  const bodies = Composite.allBodies(state.buddy);
  if (!bodies.length) {
    return;
  }
  const minX = Math.min(...bodies.map((body) => body.bounds.min.x));
  const maxX = Math.max(...bodies.map((body) => body.bounds.max.x));
  const minY = Math.min(...bodies.map((body) => body.bounds.min.y));
  const maxY = Math.max(...bodies.map((body) => body.bounds.max.y));
  let dx = 0;
  let dy = 0;
  if (minX < 18) {
    dx = 18 - minX;
  } else if (maxX > STAGE_WIDTH - 18) {
    dx = STAGE_WIDTH - 18 - maxX;
  }
  if (minY < -80) {
    dy = -80 - minY;
  } else if (maxY > STAGE_HEIGHT + 70) {
    dy = STAGE_HEIGHT + 70 - maxY;
  }
  if (!dx && !dy) {
    return;
  }
  Composite.translate(state.buddy, { x: dx, y: dy });
  bodies.forEach((body) => {
    Body.setVelocity(body, {
      x: Math.max(-8, Math.min(8, body.velocity.x * 0.45)),
      y: Math.max(-8, Math.min(8, body.velocity.y * 0.45))
    });
  });
  state.wallRecoveryCooldown = performance.now() + 420;
}

function tickleAt(position) {
  const target = getBuddyAt(position);
  if (!target) {
    return;
  }
  const impulse = Vector.mult(Vector.normalise(Vector.sub(target.position, position)), 0.003 * target.mass);
  Body.applyForce(target, target.position, impulse);
  addScore(6, "tickle", ["tickle", "happy"]);
  recordMission("happy", 1);
  setMood("Happy", 1800);
  spawnBurst(position, "#f1ff8b", 8);
}

function getBuddyAt(position) {
  const buddyBodies = Composite.allBodies(state.buddy);
  const hits = Query.point(buddyBodies, position);
  if (hits.length) {
    return hits[0];
  }
  let best = null;
  let bestDistance = 36;
  buddyBodies.forEach((body) => {
    const distance = Vector.magnitude(Vector.sub(body.position, position));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = body;
    }
  });
  return best;
}

function getNearestBuddyBody(position, maxDistance = 48) {
  if (!state.buddy) {
    return null;
  }
  let best = null;
  let bestDistance = maxDistance;
  Composite.allBodies(state.buddy).forEach((body) => {
    const distance = Vector.magnitude(Vector.sub(body.position, position));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = body;
    }
  });
  return best;
}

function addScore(baseValue, reason = "impact", tags = []) {
  if (!Number.isFinite(baseValue) || baseValue <= 0) {
    return;
  }
  if (state.comboTimer > 0) {
    state.comboCount += 1;
  } else {
    state.comboCount = 1;
  }
  state.comboTimer = COMBO_WINDOW_MS;

  const heatKey = `${state.tool}:${reason}`;
  const heat = state.toolHeat.get(heatKey) || 0;
  const antiGrind = Math.max(0.35, 1 - heat * 0.17);
  state.toolHeat.set(heatKey, Math.min(5, heat + 1));
  const multiplier = getComboMultiplier();
  const reward = Math.max(1, Math.round(baseValue * multiplier * antiGrind));
  const xpGain = Math.max(1, Math.round(reward * 0.42));

  state.cash += reward;
  state.xp += xpGain;
  state.sessionCash += reward;

  tags.forEach((tag) => {
    if (!state.usedTags.has(tag)) {
      state.usedTags.add(tag);
      recordMission("uniqueTag", 1);
    }
    recordMission(tag, 1);
    recordChallenge(tag, 1);
  });
  recordMission(reason, 1);
  recordMission("cash", reward);
  recordChallenge(reason, reason === "airborne" ? Math.max(1, Math.round(baseValue / 7)) : 1);

  state.replayLog.push({ text: reason, value: reward, tags, time: Date.now() });
  if (state.replayLog.length > 18) {
    state.replayLog.shift();
  }
  playScoreFeedback(reason, reward, tags);
  if (tags.includes("happy")) {
    recordMission("happy", 1);
  }
  saveGame();
}

function getFiniteMass(body) {
  if (!body || !Number.isFinite(body.mass) || body.mass <= 0) {
    return 18;
  }
  return body.mass;
}

function playScoreFeedback(reason, reward, tags = []) {
  const intensity = Math.min(1.8, Math.max(0.25, reward / 28));
  if (reason === "impact" || reason === "throw" || reason === "bowling" || reason === "punch" || reason === "airborne" || reason === "float") {
    feedback.play("impact", intensity);
  } else if (reason === "explosion") {
    feedback.play("explosion", intensity);
  } else if (reason === "shock" || reason === "spark" || reason === "gravity") {
    feedback.play("shock", intensity);
  } else if (reason === "tickle" || reason === "gift") {
    feedback.play(reason, intensity);
  } else if (reason === "paint" || reason === "paintball" || reason === "rubber" || reason === "cork" || reason === "corkHit" || reason === "heat" || reason === "frost" || reason === "goo") {
    feedback.play("paint", intensity);
  } else if (reason === "armed" || reason === "build" || reason === "tether" || reason === "liquid") {
    feedback.play("select", 0.5);
  }

  if (tags.includes("explosive") || reason === "explosion") {
    pulse([45, 35, 90]);
  } else if (tags.includes("shock")) {
    pulse([16, 24, 16]);
  } else if (tags.includes("cold")) {
    pulse([10, 18]);
  } else if (tags.includes("slippery")) {
    pulse([8, 12]);
  } else if (tags.includes("heat")) {
    pulse(14);
  } else if (tags.includes("happy") || reason === "tickle") {
    pulse(18);
  } else if (reason === "impact" && reward > 4) {
    pulse(Math.min(50, 8 + reward));
  }
}

function pulse(pattern) {
  if (!state.settings.haptics || !navigator.vibrate || !hasUserActivation()) {
    return;
  }
  navigator.vibrate(pattern);
}

function hasUserActivation() {
  if (!navigator.userActivation) {
    return true;
  }
  return navigator.userActivation.isActive || navigator.userActivation.hasBeenActive;
}

function recordMission(event, amount) {
  challengeFlow.recordMission(event, amount);
}

function updateHud() {
  hud.cash.textContent = `$${Math.round(state.cash)}`;
  hud.xp.textContent = String(Math.round(state.xp));
  hud.combo.textContent = state.comboCount > 0 ? `x${getComboMultiplier().toFixed(2)}` : "x1.00";
  hud.mood.textContent = state.mood;
  hud.challenge.textContent = getChallengeLabel();
  hud.face.textContent = moodFace(state.mood);
  hud.powerReadout.textContent = String(state.power);
  if (hud.toolMeta) {
    hud.toolMeta.textContent = getToolMetaLabel();
  }
  const pct = state.comboTimer > 0 ? (state.comboTimer / COMBO_WINDOW_MS) * 100 : 0;
  hud.comboFill.style.width = `${pct}%`;
}

function getToolMetaLabel() {
  if (state.tool === "rubber") {
    const cooldown = Math.max(0, Math.ceil(state.rubberCooldown));
    if (state.pointerDown) {
      return cooldown > 0 ? `Burst ${state.rubberBurstShots} | ${cooldown}ms` : `Burst ${state.rubberBurstShots} | Ready`;
    }
    return state.rubberBurstShots > 0 ? `Burst ${state.rubberBurstShots}/6` : "Ready";
  }
  const tool = getTool(state.tool);
  return tool ? tool.category : "Ready";
}

function getChallengeLabel() {
  return challengeFlow.getChallengeLabel();
}

function getComboMultiplier() {
  return 1 + Math.min(Math.max(state.comboCount - 1, 0), 7) * 0.22;
}

function setMood(nextMood, duration = 1500) {
  state.mood = nextMood;
  state.moodTimer = duration;
  updateHud();
}

function moodFace(mood) {
  return {
    Calm: ":)",
    Curious: ":o",
    Happy: ":D",
    Afraid: ":/",
    Excited: ":>",
    Surprised: ":O",
    Stunned: "x_x",
    Angry: ">:("
  }[mood] || ":)";
}

function showReplay() {
  transfer.showReplay();
}

function startReplayBuffer() {
  transfer.startReplayBuffer();
}

function trimReplayBuffer() {
  transfer.trimReplayBuffer();
}

function getReplayBufferSeconds() {
  return transfer.getReplayBufferSeconds();
}

function exportReplayVideo() {
  transfer.exportReplayVideo();
}

function renderReplayDownload(url, size) {
  transfer.renderReplayDownload(url, size);
}

function exportSaveSnapshot() {
  transfer.exportSaveSnapshot();
}

async function importSaveSnapshot(event) {
  await transfer.importSaveSnapshot(event);
}

async function importSkinPackFile(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) {
    return;
  }
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const rawPack = parsed.pack || parsed;
    const imported = assetPackFlow.importAssetPack(rawPack, rawPack);
    if (!imported.registered) {
      toast(`${imported.pack.name} is already loaded.`);
      return;
    }
    state.customAssetPacks.push(imported.pack);
    state.settings.assetPack = imported.pack.id;
    buildAssetPackUi();
    buildAudioPackUi();
    buildMenus();
    renderShop();
    renderRoomPreview();
    applyRoomPack();
    applySkin();
    saveGame();
    toast(`${imported.pack.name} skin pack imported.`);
  } catch {
    toast("Skin pack import failed. Use a Buddy Lab asset-pack JSON.");
  }
}

function toast(message) {
  hud.toast.textContent = message;
  hud.toast.classList.add("toast--visible");
  state.toastTimer = 2600;
}

function applySkin() {
  if (!state.buddy) {
    return;
  }
  const skin = getSkin();
  const physics = getSkinPhysics(skin.id);
  Composite.allBodies(state.buddy).forEach((body) => {
    body.render.fillStyle = skin.color;
    body.render.strokeStyle = skin.accent;
    body.render.lineWidth = body.label === "buddy_head" ? 2 : 1;
    if (skin.texture) {
      body.render.sprite = {
        texture: skin.texture,
        xScale: skin.textureScale || 0.72,
        yScale: skin.textureScale || 0.72
      };
    } else {
      body.render.sprite = {};
    }
    applySkinPhysics(body, physics);
  });
}

function getSkinPhysics(skinId) {
  return SKIN_PHYSICS[skinId] || SKIN_PHYSICS.classic;
}

function applySkinPhysics(body, physics) {
  body.plugin = body.plugin || {};
  if (!body.plugin.basePhysics) {
    body.plugin.basePhysics = {
      density: body.density,
      frictionAir: body.frictionAir || 0,
      restitution: body.restitution || 0
    };
  }
  const base = body.plugin.basePhysics;
  Body.setDensity(body, base.density * physics.density);
  body.frictionAir = base.frictionAir * physics.frictionAir;
  body.restitution = base.restitution * physics.restitution;
  body.plugin.physicsVariant = physics.label;
}

function clearBuddyHighlight() {
  if (!state.buddy) {
    return;
  }
  const skin = getSkin();
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!skin.texture) {
      body.render.fillStyle = skin.color;
    }
    body.render.strokeStyle = skin.accent;
    body.render.lineWidth = body.label === "buddy_head" ? 2 : 1;
  });
}

function getSkin() {
  return SKIN_DEFS.find((skin) => skin.id === state.selectedSkin) || SKIN_DEFS[0];
}

function getTool(toolId) {
  return TOOL_DEFS.find((tool) => tool.id === toolId) || TOOL_DEFS[0];
}

function getAssetPack(packId = state.settings.assetPack) {
  return state.assetPacks.find((pack) => pack.id === packId) || state.assetPacks[0];
}

function applyRoomPack() {
  const room = getAssetPack().room;
  render.options.background = room.background;
  canvas.style.background = room.background;
  canvas.parentElement.style.background = room.background;
  if (state.floorBody) {
    state.floorBody.render.fillStyle = room.floor;
  }
  if (state.ceilingBody) {
    state.ceilingBody.render.fillStyle = room.floor;
  }
}

function applyModeSettings() {
  engine.timing.timeScale = state.settings.slowMo ? 0.55 : 1;
  engine.gravity.y = getGravityMode().value;
  if (state.ceilingBody) {
    Body.setPosition(state.ceilingBody, {
      x: STAGE_WIDTH / 2,
      y: state.settings.ceilingOpen ? -120 : -18
    });
  }
}

function getGravityMode() {
  return GRAVITY_MODES[state.settings.gravityMode] || GRAVITY_MODES.normal;
}

function getLiquidType() {
  return LIQUID_TYPES[state.liquid.type] || LIQUID_TYPES.water;
}

function isBuddyBody(body) {
  return body && state.buddyBodies.has(body.id);
}

function registerProp(body) {
  state.props.push(body);
  World.add(engine.world, body);
  if (state.props.length > MAX_PROPS) {
    const oldest = state.props.shift();
    if (oldest) {
      World.remove(engine.world, oldest);
    }
  }
}

function removeProp(body) {
  const index = state.props.indexOf(body);
  if (index >= 0) {
    state.props.splice(index, 1);
  }
  World.remove(engine.world, body);
}

function resetScene() {
  state.props.forEach((body) => World.remove(engine.world, body));
  state.props = [];
  state.grenades = [];
  state.coils = [];
  state.ropes.forEach((rope) => World.remove(engine.world, rope));
  state.ropes = [];
  state.liquid.enabled = false;
  state.liquid.level = FLOOR_Y - 120;
  state.liquid.type = state.settings.liquidType;
  state.particles = [];
  state.decals = [];
  state.replayLog = [];
  state.comboCount = 0;
  state.comboTimer = 0;
  state.toolHeat.clear();
  state.usedTags.clear();
  state.sessionCash = 0;
  spawnNewBuddy();
  toast("Scene reset.");
  updateHud();
}

function savePreset() {
  const preset = {
    liquid: { ...state.liquid },
    props: state.props
      .filter((body) => !body.label.startsWith("buddy"))
      .slice(-35)
      .map((body) => ({
        label: body.label,
        x: body.position.x,
        y: body.position.y,
        angle: body.angle
      }))
  };
  localStorage.setItem("buddyLab2026.scene", JSON.stringify(preset));
  toast("Scene preset saved.");
}

function loadPreset() {
  const raw = localStorage.getItem("buddyLab2026.scene");
  if (!raw) {
    toast("No saved preset found.");
    return;
  }
  resetScene();
  const preset = JSON.parse(raw);
  state.liquid = { ...state.liquid, ...(preset.liquid || {}) };
  if (!LIQUID_TYPES[state.liquid.type]) {
    state.liquid.type = state.settings.liquidType;
  }
  controls.liquidType.value = state.liquid.type;
  preset.props.forEach((prop) => {
    if (prop.label === "trampoline") {
      placeTrampoline({ x: prop.x, y: prop.y });
    } else if (prop.label === "prop_tesla") {
      placeTesla({ x: prop.x, y: prop.y });
    } else if (prop.label === "prop_ball") {
      registerProp(Bodies.circle(prop.x, prop.y, 22, {
        restitution: 0.82,
        friction: 0.14,
        density: 0.0015,
        label: "prop_ball",
        render: { fillStyle: "#e8f7f4" }
      }));
    }
  });
  toast("Scene preset loaded.");
}

function toggleCeiling() {
  state.settings.ceilingOpen = !state.settings.ceilingOpen;
  Body.setPosition(state.ceilingBody, {
    x: STAGE_WIDTH / 2,
    y: state.settings.ceilingOpen ? -120 : -18
  });
  toast(state.settings.ceilingOpen ? "Ceiling opened." : "Ceiling closed.");
  updateModeButtonStates();
  saveGame();
}

function toggleSlowMo() {
  state.settings.slowMo = !state.settings.slowMo;
  engine.timing.timeScale = state.settings.slowMo ? 0.55 : 1;
  toast(state.settings.slowMo ? "Slow motion enabled." : "Slow motion disabled.");
  updateModeButtonStates();
  saveGame();
}

function setGravityMode(modeId) {
  state.settings.gravityMode = GRAVITY_MODES[modeId] ? modeId : "normal";
  engine.gravity.y = getGravityMode().value;
  updateModeButtonStates();
  toast(`${getGravityMode().label} enabled.`);
  saveGame();
}

function toggleFpsCounter() {
  state.settings.fpsCounter = !state.settings.fpsCounter;
  state.fpsValue = 0;
  state.fpsFrames = 0;
  state.fpsElapsed = 0;
  updateFpsCounterVisibility();
  toast(state.settings.fpsCounter ? "FPS counter enabled." : "FPS counter disabled.");
  saveGame();
}

function updateFpsCounter(delta) {
  if (!state.settings.fpsCounter || !hud.fpsCounter) {
    return;
  }
  state.fpsFrames += 1;
  state.fpsElapsed += delta;
  if (state.fpsElapsed >= 250) {
    state.fpsValue = Math.max(1, Math.round((state.fpsFrames * 1000) / state.fpsElapsed));
    state.fpsFrames = 0;
    state.fpsElapsed = 0;
    hud.fpsCounter.textContent = `FPS ${state.fpsValue}`;
  }
}

function updateFpsCounterVisibility() {
  if (!hud.fpsCounter) {
    return;
  }
  hud.fpsCounter.classList.toggle("fps-counter--visible", state.settings.fpsCounter);
  hud.fpsCounter.textContent = state.settings.fpsCounter ? `FPS ${state.fpsValue}` : "FPS 0";
}

function updateModeButtonStates() {
  controls.ceiling?.setAttribute("aria-pressed", String(state.settings.ceilingOpen));
  controls.slowMo?.setAttribute("aria-pressed", String(state.settings.slowMo));
  controls.gravityModes.forEach((button) => {
    const isActive = button.dataset.gravityMode === state.settings.gravityMode;
    button.setAttribute("aria-pressed", String(isActive));
    button.classList.toggle("is-active", isActive);
  });
}

function spawnBurst(position, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.035 + Math.random() * 0.09;
    state.particles.push({
      type: "spark",
      x: position.x,
      y: position.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color,
      life: 460 + Math.random() * 380,
      maxLife: 840
    });
  }
}

function addShake(amount) {
  state.shake = Math.min(24, state.shake + amount);
}

function drawOverlayEffects() {
  const ctx = render.context;
  ctx.save();

  if (state.shake > 0 && !state.settings.reducedFlash) {
    const offsetX = (Math.random() - 0.5) * state.shake;
    const offsetY = (Math.random() - 0.5) * state.shake;
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  } else {
    canvas.style.transform = "";
  }

  drawRoomDetails(ctx);
  drawLiquid(ctx);
  drawClassicBuddyOverlay(ctx);
  drawAim(ctx);
  drawToolFields(ctx);
  drawPropCosmetics(ctx);
  drawParticles(ctx);
  ctx.restore();
}

function drawRoomDetails(ctx) {
  const room = getAssetPack().room;
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = room.grid;
  ctx.lineWidth = 1;
  for (let x = 80; x < STAGE_WIDTH; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, STAGE_HEIGHT);
    ctx.stroke();
  }
  for (let y = 80; y < STAGE_HEIGHT; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(STAGE_WIDTH, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = room.accent;
  ctx.fillRect(0, FLOOR_Y - 2, STAGE_WIDTH, 4);
  ctx.globalAlpha = 1;
}

function drawLiquid(ctx) {
  if (!state.liquid.enabled) {
    return;
  }
  const liquid = getLiquidType();
  const time = performance.now() / 520;
  ctx.save();
  ctx.globalAlpha = liquid.alpha;
  ctx.fillStyle = liquid.fill;
  ctx.beginPath();
  ctx.moveTo(0, state.liquid.level);
  for (let x = 0; x <= STAGE_WIDTH; x += 32) {
    const y = state.liquid.level + Math.sin(time + x * 0.025) * 5;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(STAGE_WIDTH, STAGE_HEIGHT);
  ctx.lineTo(0, STAGE_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = liquid.stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= STAGE_WIDTH; x += 32) {
    const y = state.liquid.level + Math.sin(time + x * 0.025) * 5;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.restore();
}

function drawClassicBuddyOverlay(ctx) {
  if (!state.buddy || getSkin().id !== "classic") {
    return;
  }
  const bodies = Composite.allBodies(state.buddy)
    .filter((body) => body.plugin?.classicPart)
    .sort((a, b) => (CLASSIC_PART_ORDER[a.label] || 0) - (CLASSIC_PART_ORDER[b.label] || 0));
  bodies.forEach((body) => drawClassicBuddyPart(ctx, body));
}

function drawClassicBuddyPart(ctx, body) {
  const part = body.plugin.classicPart;
  const isHead = body.label === "buddy_head";
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.98;

  const radius = part.radius || Math.min(part.width, part.height) / 2;
  const fill = ctx.createRadialGradient(
    -part.width * 0.22,
    -part.height * 0.28,
    Math.max(1, radius * 0.08),
    0,
    0,
    Math.max(part.width, part.height) * 0.72
  );
  fill.addColorStop(0, "#f7fbf7");
  fill.addColorStop(0.38, "#d4ddd7");
  fill.addColorStop(0.78, "#8c9991");
  fill.addColorStop(1, "#57635d");
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#3d4842";
  ctx.lineWidth = isHead ? 1.6 : 1.2;

  if (part.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.roundRect(-part.width / 2, -part.height / 2, part.width, part.height, radius);
    ctx.fill();
    ctx.stroke();
  }

  ctx.globalAlpha = 0.42;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-part.width * 0.17, -part.height * 0.23, Math.max(2, radius * 0.28), Math.max(1.6, radius * 0.13), -0.55, 0, Math.PI * 2);
  ctx.fill();

  if (isHead) {
    drawClassicBuddyFace(ctx, radius);
  }
  ctx.restore();
}

function drawClassicBuddyFace(ctx, radius) {
  const face = moodFace(state.mood);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#5e6962";
  ctx.fillStyle = "#5e6962";
  ctx.lineWidth = 1.7;

  if (face === "x_x") {
    drawXEye(ctx, -radius * 0.32, -radius * 0.1, radius * 0.1);
    drawXEye(ctx, radius * 0.32, -radius * 0.1, radius * 0.1);
  } else {
    ctx.beginPath();
    ctx.arc(-radius * 0.32, -radius * 0.1, radius * 0.055, 0, Math.PI * 2);
    ctx.arc(radius * 0.32, -radius * 0.1, radius * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  if (state.mood === "Afraid" || state.mood === "Surprised" || state.mood === "Curious") {
    ctx.arc(0, radius * 0.28, radius * 0.13, 0, Math.PI * 2);
  } else if (state.mood === "Stunned" || state.mood === "Sad") {
    ctx.arc(0, radius * 0.36, radius * 0.28, Math.PI * 1.12, Math.PI * 1.88);
  } else {
    ctx.arc(0, radius * 0.1, radius * 0.34, 0.28, Math.PI - 0.28);
  }
  ctx.stroke();
}

function drawXEye(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.stroke();
}

function drawAim(ctx) {
  if (!state.aimVector) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = state.tool === "paintball" || state.tool === "foamdart" || state.tool === "corkpopper" ? "#ffc857" : "#e8f7f4";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.moveTo(state.aimVector.start.x, state.aimVector.start.y);
  ctx.lineTo(state.aimVector.end.x, state.aimVector.end.y);
  ctx.stroke();
  ctx.restore();
}

function drawToolFields(ctx) {
  if (state.tool === "fan" && state.pointerDown) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#55d9cf";
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 160, -0.5, 0.5);
    ctx.lineTo(state.pointerCurrent.x, state.pointerCurrent.y);
    ctx.fill();
    ctx.restore();
  }
  if (state.tool === "blackhole" && state.pointerDown) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#202622";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 28 + Math.sin(performance.now() / 90) * 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#98f17f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 58, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();
  }
  if (state.tool === "heatcone" && state.pointerDown) {
    const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
    const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
    const angle = Math.atan2(aim.y, aim.x);
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#ff8d66";
    ctx.beginPath();
    ctx.moveTo(state.pointerCurrent.x, state.pointerCurrent.y);
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 190, angle - 0.38, angle + 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.36;
    ctx.strokeStyle = "#ffc857";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 118, angle - 0.34, angle + 0.34);
    ctx.stroke();
    ctx.restore();
  }
  if (state.tool === "sparkwand" && state.pointerDown) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#f1ff8b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 280, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (state.tool === "frostpuff" && state.pointerDown) {
    const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
    const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
    const angle = Math.atan2(aim.y, aim.x);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#baf7ff";
    ctx.beginPath();
    ctx.moveTo(state.pointerCurrent.x, state.pointerCurrent.y);
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 175, angle - 0.42, angle + 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = "#e8f7f4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 104, angle - 0.36, angle + 0.36);
    ctx.stroke();
    ctx.restore();
  }
  if (state.tool === "goomist" && state.pointerDown) {
    const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
    const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
    const angle = Math.atan2(aim.y, aim.x);
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#98f17f";
    ctx.beginPath();
    ctx.moveTo(state.pointerCurrent.x, state.pointerCurrent.y);
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 180, angle - 0.44, angle + 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.44;
    ctx.strokeStyle = "#d8ffd1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 108, angle - 0.38, angle + 0.38);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPropCosmetics(ctx) {
  for (const body of state.props) {
    const cosmetic = body.plugin?.cosmetic;
    if (!cosmetic) {
      continue;
    }
    if (cosmetic.type === "bowling-classic") {
      drawBowlingCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "beach-ball-striped") {
      drawBeachBallCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "glove-laced") {
      drawGloveCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "rubber-pellet") {
      drawRubberPelletCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "foam-brick-lined") {
      drawBrickCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "stage-weight-anvil") {
      drawAnvilCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "foam-dart") {
      drawFoamDartCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "cork-popper") {
      drawCorkCosmetic(ctx, body, cosmetic);
    }
  }
}

function drawBeachBallCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 30;
  const colors = cosmetic.colors || ["#f7fbff", "#ff7161", "#55d9cf", "#ffc857"];
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.94;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
  ctx.clip();
  colors.forEach((color, index) => {
    const start = -Math.PI / 2 + index * (Math.PI * 2 / colors.length);
    const end = start + Math.PI * 2 / colors.length;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius + 1, start, end);
    ctx.closePath();
    ctx.fill();
  });
  ctx.strokeStyle = cosmetic.seam;
  ctx.lineWidth = 2;
  for (let index = 0; index < colors.length; index += 1) {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / colors.length);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.fillStyle = "#f7fbff";
  ctx.beginPath();
  ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = cosmetic.seam;
  ctx.stroke();
  ctx.restore();
}

function drawBowlingCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = cosmetic.highlight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-4, -3, 17, -1.95, 0.55);
  ctx.stroke();
  ctx.fillStyle = cosmetic.hole;
  [
    { x: 6, y: -9, r: 4.2 },
    { x: 14, y: -2, r: 3.7 },
    { x: 5, y: 5, r: 3.4 }
  ].forEach((hole) => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawGloveCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = cosmetic.cuff;
  ctx.strokeStyle = cosmetic.seam;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-27, -12, 14, 24, 5);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = cosmetic.lace;
  ctx.lineWidth = 1.8;
  for (let y = -9; y <= 9; y += 6) {
    ctx.beginPath();
    ctx.moveTo(-7, y);
    ctx.quadraticCurveTo(2, y - 4, 12, y - 1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRubberPelletCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = cosmetic.stripe;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, 4.2, -0.95, 0.95);
  ctx.stroke();
  ctx.fillStyle = cosmetic.dot;
  ctx.beginPath();
  ctx.arc(2.2, -1.8, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBrickCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.88;
  ctx.strokeStyle = cosmetic.mortar;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(20, 0);
  ctx.moveTo(-7, -11);
  ctx.lineTo(-7, 0);
  ctx.moveTo(9, 0);
  ctx.lineTo(9, 11);
  ctx.stroke();
  ctx.fillStyle = cosmetic.chip;
  ctx.beginPath();
  ctx.moveTo(14, -10);
  ctx.lineTo(21, -7);
  ctx.lineTo(17, -2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawAnvilCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = cosmetic.shadow;
  ctx.beginPath();
  ctx.roundRect(-32, 4, 64, 11, 4);
  ctx.fill();
  ctx.strokeStyle = cosmetic.bevel;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-31, -12);
  ctx.lineTo(27, -12);
  ctx.quadraticCurveTo(35, -8, 31, -2);
  ctx.lineTo(-34, -2);
  ctx.quadraticCurveTo(-38, -8, -31, -12);
  ctx.stroke();
  ctx.fillStyle = cosmetic.stamp;
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("W", 0, -2);
  ctx.restore();
}

function drawFoamDartCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = cosmetic.tip;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(9, -4);
  ctx.lineTo(9, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = cosmetic.fin;
  ctx.beginPath();
  ctx.moveTo(-15, -4);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-6, -3);
  ctx.lineTo(-15, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = cosmetic.stripe;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(-4, 4);
  ctx.moveTo(3, -4);
  ctx.lineTo(3, 4);
  ctx.stroke();
  ctx.restore();
}

function drawCorkCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = cosmetic.cap;
  ctx.beginPath();
  ctx.roundRect(-13, -6, 26, 12, 5);
  ctx.fill();
  ctx.strokeStyle = cosmetic.ring;
  ctx.lineWidth = 1.7;
  [-7, 0, 7].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, -5.5);
    ctx.lineTo(x, 5.5);
    ctx.stroke();
  });
  ctx.fillStyle = cosmetic.fleck;
  [
    { x: -9, y: -2 },
    { x: -2, y: 3 },
    { x: 5, y: -3 },
    { x: 10, y: 2 }
  ].forEach((fleck) => {
    ctx.beginPath();
    ctx.arc(fleck.x, fleck.y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawParticles(ctx) {
  for (const particle of state.particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    ctx.globalAlpha = alpha;
    if (particle.type === "bolt") {
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(particle.a.x, particle.a.y);
      ctx.lineTo((particle.a.x + particle.b.x) / 2 + Math.random() * 18 - 9, (particle.a.y + particle.b.y) / 2 + Math.random() * 18 - 9);
      ctx.lineTo(particle.b.x, particle.b.y);
      ctx.stroke();
    } else {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

Events.on(engine, "collisionStart", (event) => {
  for (const pair of event.pairs) {
    const paint = [pair.bodyA, pair.bodyB].find((body) => body.plugin?.projectile === "paintball");
    const target = pair.bodyA === paint ? pair.bodyB : pair.bodyA;
    if (!paint || !isBuddyBody(target)) {
      continue;
    }
    target.render.fillStyle = paint.plugin.color;
    state.decals.push({ bodyId: target.id, color: paint.plugin.color, time: performance.now() });
    addScore(9, "paint", ["projectile", "paint"]);
    setMood("Surprised", 1200);
    spawnBurst(paint.position, paint.plugin.color, 8);
    removeProp(paint);
  }
});

Events.on(engine, "collisionStart", (event) => {
  for (const pair of event.pairs) {
    const cork = [pair.bodyA, pair.bodyB].find((body) => body.plugin?.projectile === "corkpopper" && !body.plugin?.hit);
    const target = pair.bodyA === cork ? pair.bodyB : pair.bodyA;
    if (!cork || !isBuddyBody(target)) {
      continue;
    }
    cork.plugin.hit = true;
    const offset = Vector.sub(target.position, cork.position);
    const direction = Vector.magnitude(offset) > 0.001 ? Vector.normalise(offset) : { x: 1, y: 0 };
    const impulse = Vector.mult(direction, 0.0026 * target.mass);
    Body.applyForce(target, target.position, impulse);
    Body.setAngularVelocity(cork, cork.angularVelocity * 0.55);
    addScore(7.5, "corkHit", ["projectile", "corkPopper", "blunt", "bounce"]);
    recordMission("corkPopper", 1);
    setMood("Surprised", 1100);
    spawnBurst(cork.position, "#c58a55", 6);
  }
});

Events.on(engine, "collisionStart", (event) => {
  for (const pair of event.pairs) {
    const dart = [pair.bodyA, pair.bodyB].find((body) => body.plugin?.projectile === "foamdart" && !body.plugin?.stuck);
    const target = pair.bodyA === dart ? pair.bodyB : pair.bodyA;
    if (!dart || !isBuddyBody(target)) {
      continue;
    }
    dart.plugin.stuck = true;
    Body.setVelocity(dart, { x: 0, y: 0 });
    Body.setAngularVelocity(dart, 0);
    Body.setStatic(dart, true);
    addScore(8.5, "dartHit", ["projectile", "foamDart", "blunt"]);
    recordMission("foamDart", 1);
    setMood("Surprised", 1200);
    spawnBurst(dart.position, "#ffc857", 5);
  }
});

function updateUnlockButtons() {
  document.querySelectorAll(".tool-button").forEach((button) => {
    button.classList.toggle("tool-button--locked", !state.unlockedTools.has(button.dataset.tool));
  });
  document.querySelectorAll(".radial-wheel__button").forEach((button) => {
    const unlocked = state.unlockedTools.has(button.dataset.tool);
    button.classList.toggle("radial-wheel__button--locked", !unlocked);
    button.classList.toggle("radial-wheel__button--active", button.dataset.tool === state.tool);
    const tool = getTool(button.dataset.tool);
    button.setAttribute("aria-label", unlocked ? tool.name : `${tool.name} locked, costs $${tool.cost}`);
  });
}

updateUnlockButtons();
