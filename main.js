import {
  CHALLENGE_MODES,
  DEFAULT_AUDIO_PACKS,
  DEFAULT_SKIN_DEFS,
  LIQUID_TYPES,
  MISSION_POOL,
  TOOL_DEFS,
  TOOL_EFFECT_AUDIT
} from "./js/content.js";
import { createAssetPackController } from "./js/asset-packs.js";
import { createChallengeController } from "./js/challenges.js";
import { FeedbackEngine } from "./js/feedback.js";
import { createProgressionController } from "./js/progression.js";
import { readJson, writeJson } from "./js/storage.js";
import { isPrimaryPointerButton, isResetKey, isTouchPointerType } from "./src/input/InputManager.ts";
import { getAssetPackImportToast, getAssetPackOption, getAssetPackSelectedToast, getAudioPackOption, getAudioPackSelectedToast, getSelectedAssetPackId, getSelectedAudioPackId, parseImportedAssetPackText, resolveAssetPack, resolveAudioPack } from "./src/runtime/assetPackRuntime.ts";
import { getChallengeModeId, getChallengeModeOption } from "./src/runtime/challengeState.ts";
import { getClampedOverlayPosition, getOverlayCssPosition, screenPointToWorld } from "./src/runtime/coordinates.ts";
import { advanceTimedEffectLife, decayShakeAmount, getBoltMidpoint, getBurstParticle, getConfettiBurstParticle, getExplosionArmScore, getExplosionBaseForce, getExplosionBurstCount, getExplosionFalloff, getExplosionForceMagnitude, getExplosionRadius, getExplosionScore, getExplosionScoreBase, getExplosionTriggerTime, getImpactBurstCount, getMoneySparkleParticle, getMusicNoteParticle, getParticleAlpha, getParticlePositionAfterDelta, getParticleVelocityYAfterGravity, getShakeOffset, getShakeTransform, getTreatCrumbParticle, increaseShakeAmount, shouldKeepDecal, shouldKeepTimedEffect } from "./src/runtime/effectsMath.ts";
import { getGiftCost } from "./src/runtime/economyMath.ts";
import { canUseHaptics, getFeedbackPlayback, getFeedbackPulsePattern } from "./src/runtime/feedbackMapping.ts";
import { getFpsCounterPresentation, getFpsSamplePresentation, getHudActionToast, getHudCorePresentation, getPowerControlPresentation, getPowerWheelPresentation, getToastHiddenPresentation, getToastPresentation } from "./src/runtime/hudPresentation.ts";
import { getCanvasFitStyles } from "./src/runtime/layout.ts";
import { getClampedLiquidLevel, getLiquidAngularDampingFactor, getLiquidBuoyancyForce, getLiquidDragForce, getLiquidDrainScore, getLiquidDrainToast, getLiquidFillScore, getLiquidFillToast, getLiquidFriction, getLiquidScore, getLiquidScoreCooldown, getLiquidSelectedToast, getLiquidSubmersion, getLiquidWaveY, getSelectedLiquidTypeId, resolveLiquidType, shouldDrainLiquid } from "./src/runtime/liquidMath.ts";
import { getBooleanModeButtonStates, getCeilingToggleToast, getCeilingY, getFpsCounterToggleToast, getGravityModeButtonState, getGravityModeConfig, getGravityModeToast, getRopeAnchorX, getRopeAnchorY, getRopeLength, getRopeStiffness, getSlowMoTimeScale, getSlowMoToggleToast, normalizeGravityMode, shouldPruneRopes } from "./src/runtime/modeSettings.ts";
import { getMoodBubbleText, getMoodHudPresentation, getReactionBubblePresentation } from "./src/runtime/moodPresentation.ts";
import { clampImpactScore, clampVector, getClampedLaunchDistance, getCombinedBounds, getDampedAngularVelocity, getDirectionOrFallback, getDistanceWithMinimum, getEquivalentMass, getFiniteMass, getFrameScale, getGrabCorrectionMagnitude, getGrabFrictionAir, getHandDragElapsed, getHandDragFlickScale, getHandFlickAngularVelocity, getHorizontalSpinSign, getImpactScore, getLaunchSpeed, getNextWallRecoveryCooldown, getPoweredRadius, getProjectileImpulseMagnitude, getRecoveredVelocityComponent, getScaledVelocity, getSelfRightingAngularVelocity, getSelfRightingForce, getSignedAngularVelocity, getSpinAngularVelocity, getThrowScale, getVectorAngle, getVelocityAfterDirectionalImpulse, getWallRecoveryOffset, isNearFloor, scaleStaticImpactScore, shouldApplySelfRighting, shouldReplaceNearest, shouldSkipWallRecovery, shouldUseLaunchDirection, shouldUseStepFlick } from "./src/runtime/physicsMath.ts";
import {
  advanceAirborneBank,
  calculateReward,
  calculateXpGain,
  decayToolHeat,
  getChallengeRecordAmount,
  getAirborneScore,
  getComboMultiplier,
  getFeedbackIntensity,
  getScoreAntiGrind,
  incrementToolHeat,
  shouldAwardAirborne,
  shouldSkipAirborneForSpawnGrace
} from "./src/runtime/scoringMath.ts";
import { getRoomApplyPresentation, getRoomBrowserButtonPresentation, getRoomPreviewShellPresentation, getRoomSwatchPresentation, getRoomSwatches, getRoomThumbnailPresentation } from "./src/runtime/roomPresentation.ts";
import { createRuntimeSavePayload, createScenePreset, getProgressResetToast, getScenePresetLoadToast, getScenePresetSaveToast, migrateRuntimeSave, parseStoredScenePreset } from "./src/runtime/saveState.ts";
import { getAppliedSkinPhysics, getClassicFaceRenderGeometry, getClassicPartRenderGeometry, getRuntimeSkin, getRuntimeSkinPhysics, getSkinBodyRender } from "./src/runtime/skinRuntime.ts";
import {
  getRuntimeTool,
  getRuntimeToolCategories,
  getRuntimeToolsByCategory,
  getToolIdForNumberKey
} from "./src/runtime/toolCatalog.ts";
import { advanceConveyorPhase, getAnvilThrowScore, getBallThrowScore, getBeachBallThrowScore, getBlackHoleCooldown, getBlackHoleOrbitForceMagnitude, getBlackHolePullForceMagnitude, getBlackHoleRadius, getBlackHoleScore, getBoomboxAngularVelocity, getBoomboxBeatInterval, getBoomboxFalloff, getBoomboxInitialBeat, getBoomboxLife, getBoomboxNoteCount, getBoomboxPlacementScore, getBoomboxPulseForce, getBoomboxRange, getBoomboxScore, getBoomboxSide, getBowlingBallThrowScore, getBoxingGloveThrowScore, getBrickThrowScore, getBumperPlacementScore, getCannonballFireScore, getConeFalloff, getConfettiForceMagnitude, getConfettiLiftVector, getConfettiPopperRange, getConfettiScore, getConveyorCooldown, getConveyorDirection, getConveyorForce, getConveyorPlacementScore, getConveyorScore, getCorkPopperFireScore, getCorkPopperHitScore, getCrateThrowScore, getFanForceMagnitude, getFanRadius, getFanScore, getFanScoreCooldown, getFoamDartFireScore, getFoamDartHitScore, getFrostAngularVelocityScale, getFrostEffectDuration, getFrostPuffCooldown, getFrostPuffForce, getFrostPuffParticle, getFrostPuffRadius, getFrostPuffScore, getFrostVelocityScale, getGiftScore, getGooAngularVelocity, getGooEffectDuration, getGooFriction, getGooFrictionAir, getGooMistCooldown, getGooMistForce, getGooMistParticle, getGooMistRadius, getGooMistScore, getHandFlickScore, getHeatConeCooldown, getHeatConeForce, getHeatConeParticle, getHeatConeRadius, getHeatConeScore, getMagnetAngularVelocity, getMagnetCooldown, getMagnetForceMagnitude, getMagnetRadius, getMagnetRingEffect, getMagnetScore, getMoneyDropScore, getNudgeFalloff, getNudgeForce, getNudgeSide, getPaintballFireScore, getPaintballHitScore, getPlatformPlacementScore, getPlungerShotFireScore, getPlungerShotHitScore, getPlungerSuctionDuration, getPokeImpulseMagnitude, getPokeScore, getPulseAngularVelocity, getPulseBeamCooldown, getPulseBeamFalloff, getPulseBeamForce, getPulseBeamParticle, getPulseBeamRadius, getPulseBeamScore, getPulseBeamSideDistance, getPulseEffectDuration, getRandomTossVelocity, getRepulsorAngularVelocity, getRepulsorCooldown, getRepulsorForceMagnitude, getRepulsorRadius, getRepulsorRingEffect, getRepulsorScore, getRopeAttachScore, getRubberCooldown, getRubberPelletSpeed, getRubberScore, getSlapImpulseMagnitude, getSlapScore, getSparkWandAngularVelocity, getSparkWandCooldown, getSparkWandForceMagnitude, getSparkWandJitter, getSparkWandRange, getSparkWandScore, getStarShotFireScore, getStarShotHitScore, getTeslaForceMagnitude, getTeslaPlacementScore, getTeslaPulseInterval, getTeslaRange, getTeslaScore, getTeslaTargetLimit, getTickleImpulseMagnitude, getTickleScore, getTrampolinePlacementScore, getTreatScore, getVacuumCooldown, getVacuumForceMagnitude, getVacuumRadius, getVacuumRingEffect, getVacuumScore, incrementRubberBurstShots, isMagneticBodyLabel, shouldConveyorAffectBody, shouldSpawnSparkWandIdleBurst } from "./src/runtime/toolActionMath.ts";
import { getCanvasCursorPresentation, getCircularCosmeticArc, getCosmeticPolarPoint, getCosmeticPolarSegment, getExplosiveArmedToast, getLockedToolToast, getMenuCategoryPresentation, getMouseConstraintConfig, getRadialToolButtonPresentation, getRadialToolButtonState, getRadialWheelCenterLabel, getRadialWheelVisibilityPresentation, getRuntimeToolMetaLabel, getShopMenuButtonPresentation, getToolButtonState, getToolRailButtonPresentation, getToolSelectionPanel, getToolUseToast } from "./src/runtime/toolPresentation.ts";
import { decrementTimer, extendTimer, isTimerExpired } from "./src/runtime/timerMath.ts";
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
const PRIVATE_ASSET_PACK_MANIFEST_URL = "assets/private/manifest.json";
const SAVE_VERSION = 2;
const STORAGE_KEY = "buddyLab2026.save.v1";
const SCENE_PRESET_KEY = "buddyLab2026.scene";
const DEFAULT_CASH = 75;
const DEFAULT_TOOL = "hand";
const DEFAULT_SKIN = "classic";
const DEFAULT_UNLOCKED_TOOLS = ["hand", "poke", "slap", "tickle", "ball", "rope", "water"];
const DEFAULT_UNLOCKED_SKINS = ["classic"];
const DEFAULT_SETTINGS = {
  reducedFlash: false,
  slapstick: true,
  audio: true,
  volume: 1,
  cameraShake: true,
  particles: true,
  haptics: true,
  assetPack: "base",
  audioPack: "classic",
  liquidType: "water",
  slowMo: false,
  ceilingOpen: false,
  gravityMode: "normal",
  fpsCounter: false,
  debugPhysics: false
};
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
    background: "#9aa59d",
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
  getPack: () => resolveAudioPack(AUDIO_PACKS, state.settings.audioPack),
  hasUserActivation: () =>
    Boolean(navigator.userActivation ? navigator.userActivation.hasBeenActive : userActivationFallback)
});

let userActivationFallback = false;
window.addEventListener("pointerdown", () => {
  userActivationFallback = true;
}, { once: true });

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
  boomboxes: [],
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
      name: "Classic Plain",
      description: "Built-in plain gray boxed room for classic sandbox sessions.",
      room: {
        background: "#9aa59d",
        grid: "#a7b0a9",
        floor: "#5f6962",
        accent: "#d8d2b8",
        motif: "plain"
      }
    }
  ],
  customAssetPacks: [],
  cash: DEFAULT_CASH,
  xp: 0,
  sessionCash: 0,
  comboCount: 0,
  comboTimer: 0,
  mood: "Calm",
  moodTimer: 0,
  moodBubble: "",
  power: getPowerControlPresentation(hud.power.value).power,
  tool: DEFAULT_TOOL,
  unlockedTools: new Set(DEFAULT_UNLOCKED_TOOLS),
  unlockedSkins: new Set(DEFAULT_UNLOCKED_SKINS),
  selectedSkin: DEFAULT_SKIN,
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
  vacuumCooldown: 0,
  repulsorCooldown: 0,
  magnetCooldown: 0,
  conveyorCooldown: 0,
  teslaCooldown: 0,
  rubberCooldown: 0,
  rubberBurstShots: 0,
  rubberBurstWindow: 0,
  heatConeCooldown: 0,
  sparkWandCooldown: 0,
  frostPuffCooldown: 0,
  gooMistCooldown: 0,
  pulseBeamCooldown: 0,
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
  settings: { ...DEFAULT_SETTINGS },
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
  manifests: [
    { url: ASSET_PACK_MANIFEST_URL },
    { url: PRIVATE_ASSET_PACK_MANIFEST_URL, optional: true }
  ]
});
const toolTextureImageCache = new Map();
const UI_THEME_VARIABLES = [
  "--bg",
  "--room",
  "--room-dark",
  "--panel",
  "--panel-text",
  "--ink",
  "--muted",
  "--line",
  "--accent",
  "--accent-2",
  "--warn",
  "--danger",
  "--menu-bg",
  "--menu-border",
  "--menu-panel-bg",
  "--menu-panel-border",
  "--menu-hover",
  "--menu-hover-outline",
  "--menu-active",
  "--menu-active-edge",
  "--brand-bg"
];

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
window.__buddyLabDebug = { engine, render, state, toolEffectAudit: TOOL_EFFECT_AUDIT };

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
  state.unlockedTools = new Set(migrated.unlockedTools || ["hand", "poke", "slap", "tickle", "ball", "rope", "water"]);
  state.unlockedTools.add("poke");
  state.unlockedTools.add("slap");
  state.unlockedTools.add("tickle");
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
  state.settings.volume = normalizeAudioVolume(state.settings.volume);
  state.settings.assetPack = getSelectedAssetPackId(state.assetPacks, state.settings.assetPack);
  state.settings.audioPack = getSelectedAudioPackId(AUDIO_PACKS, state.settings.audioPack);
  state.settings.liquidType = getSelectedLiquidTypeId(LIQUID_TYPES, state.settings.liquidType);
  state.liquid.type = state.settings.liquidType;
  state.challenge.bests = save.challengeBests || {};
  state.challenge.bests = migrated.challengeBests || {};
  state.challenge.mode = getChallengeModeId(CHALLENGE_MODES, migrated.challengeMode);
  state.tool = state.unlockedTools.has(migrated.tool) ? migrated.tool : "hand";
  if (migrated.version !== save.version) {
    saveGame();
  }
}

function migrateSave(save) {
  return migrateRuntimeSave(save, SAVE_VERSION);
}

function saveGame() {
  writeJson(STORAGE_KEY, createSavePayload());
}

function createSavePayload() {
  return createRuntimeSavePayload({
    cash: state.cash,
    xp: state.xp,
    unlockedTools: state.unlockedTools,
    unlockedSkins: state.unlockedSkins,
    selectedSkin: state.selectedSkin,
    settings: state.settings,
    customAssetPacks: state.customAssetPacks,
    challengeMode: state.challenge.mode,
    challengeBests: state.challenge.bests,
    tool: state.tool
  }, SAVE_VERSION);
}

function createStageBounds() {
  const wallOptions = {
    isStatic: true,
    restitution: 0.25,
    friction: 0.82,
    render: { fillStyle: "#5f6962" }
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
  setupMenuInteractions();

  hud.radialWheel.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  hud.power.addEventListener("input", (event) => {
    const powerView = getPowerControlPresentation(event.target.value);
    applyPowerControl(powerView);
  });

  canvas.addEventListener("wheel", (event) => {
    const tool = getTool(state.tool);
    if (tool.hasPower === false) {
      return;
    }
    event.preventDefault();
    const powerView = getPowerWheelPresentation(
      state.power,
      event.deltaY,
      Number(hud.power.min),
      Number(hud.power.max),
      Number(hud.power.step)
    );
    applyPowerControl(powerView);
  }, { passive: false });

  controls.reset.addEventListener("click", resetScene);
  controls.resetMenu.addEventListener("click", resetScene);
  controls.resetBuddy.addEventListener("click", resetBuddy);
  controls.clearObjects.addEventListener("click", clearObjects);
  controls.clearObjectsFooter.addEventListener("click", clearObjects);
  controls.exportReplay.addEventListener("click", exportReplayVideo);
  controls.newBuddy.addEventListener("click", () => {
    spawnNewBuddy();
    toast(getHudActionToast("newBuddy"));
  });
  controls.replay.addEventListener("click", showReplay);
  controls.saveScene.addEventListener("click", savePreset);
  controls.loadScene.addEventListener("click", loadPreset);
  controls.exportSave.addEventListener("click", exportSaveSnapshot);
  controls.importSave.addEventListener("click", () => controls.saveImportInput.click());
  controls.saveImportInput.addEventListener("change", importSaveSnapshot);
  controls.importSkinPack.addEventListener("click", () => controls.skinPackImportInput.click());
  controls.skinPackImportInput.addEventListener("change", importSkinPackFile);
  controls.resetProgress.addEventListener("click", resetProgress);
  controls.ceiling.addEventListener("click", toggleCeiling);
  controls.slowMo.addEventListener("click", toggleSlowMo);
  controls.gravityModes.forEach((button) => {
    button.addEventListener("click", () => setGravityMode(button.dataset.gravityMode));
  });
  controls.fpsCounter.addEventListener("click", toggleFpsCounter);
  controls.debugPhysics.addEventListener("click", toggleDebugPhysics);
  controls.missionMenu.addEventListener("click", chooseMissions);
  controls.refreshMissions.addEventListener("click", chooseMissions);
  controls.challengeMode.addEventListener("change", () => {
    startChallenge(controls.challengeMode.value, true);
  });
  controls.shopButton.addEventListener("click", () => hud.shopGrid.scrollIntoView({ behavior: "smooth", block: "nearest" }));

  syncSettingsControls();
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
  controls.audioVolume.addEventListener("input", () => {
    state.settings.volume = normalizeAudioVolume(controls.audioVolume.value);
    controls.audioVolumeValue.textContent = getAudioVolumeLabel(state.settings.volume);
    feedback.updateMasterGain();
    saveGame();
  });
  controls.cameraShakeToggle.addEventListener("change", () => {
    state.settings.cameraShake = controls.cameraShakeToggle.checked;
    if (!state.settings.cameraShake) {
      state.shake = 0;
      canvas.style.transform = "";
    }
    saveGame();
  });
  controls.particlesToggle.addEventListener("change", () => {
    state.settings.particles = controls.particlesToggle.checked;
    if (!state.settings.particles) {
      state.particles = [];
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
    state.settings.audioPack = getSelectedAudioPackId(AUDIO_PACKS, controls.audioPack.value);
    feedback.resume();
    feedback.play("unlock", 0.75);
    toast(getAudioPackSelectedToast(feedback.pack().name));
    saveGame();
  });
  controls.liquidType.addEventListener("change", () => {
    state.settings.liquidType = getSelectedLiquidTypeId(LIQUID_TYPES, controls.liquidType.value);
    state.liquid.type = state.settings.liquidType;
    toast(getLiquidSelectedToast(getLiquidType().name));
    saveGame();
  });

  window.addEventListener("keydown", (event) => {
    const toolId = getToolIdForNumberKey(TOOL_DEFS, event.key);
    if (toolId) {
      feedback.resume();
      trySelectTool(toolId);
    }
    if (isResetKey(event.key)) {
      resetScene();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!isPrimaryPointerButton(event.button)) {
      return;
    }
    feedback.resume();
    hideRadialWheel();
    const worldPoint = screenToWorld(event);
    if (isTouchPointerType(event.pointerType)) {
      scheduleTouchWheel(event, worldPoint);
    }
    state.pointerDown = true;
    state.pointerStart = { ...worldPoint };
    state.pointerCurrent = { ...worldPoint };
    state.pointerPrevious = { ...worldPoint };
    state.pointerDownTime = performance.now();
    state.aimVector = null;

    if (isTouchPointerType(event.pointerType) && isInstantPlacementTool(state.tool)) {
      state.pendingTouchInstant = { tool: state.tool, point: worldPoint };
      return;
    }

    if (state.tool === "firecracker") {
      spawnFirecracker(worldPoint);
    } else if (state.tool === "grenade") {
      spawnGrenade(worldPoint);
    } else if (state.tool === "mine") {
      spawnMine(worldPoint);
    } else if (state.tool === "stickybomb") {
      spawnStickyBomb(worldPoint);
    } else if (state.tool === "largebomb") {
      spawnLargeBomb(worldPoint);
    } else if (state.tool === "poke") {
      pokeAt(worldPoint);
    } else if (state.tool === "tickle") {
      tickleAt(worldPoint);
    } else if (state.tool === "slap") {
      state.aimVector = { start: worldPoint, end: worldPoint };
      setMood("Afraid", 600);
    } else if (state.tool === "paintball" || state.tool === "foamdart" || state.tool === "corkpopper" || state.tool === "plunger" || state.tool === "starshot" || state.tool === "cannonball") {
      state.aimVector = { start: worldPoint, end: worldPoint };
    } else if (state.tool === "ball" || state.tool === "beachball" || state.tool === "bowling" || state.tool === "brick" || state.tool === "crate" || state.tool === "glove" || state.tool === "anvil") {
      state.aimVector = { start: worldPoint, end: worldPoint };
    } else if (state.tool === "trampoline") {
      placeTrampoline(worldPoint);
    } else if (state.tool === "platform") {
      placePlatform(worldPoint);
    } else if (state.tool === "bumper") {
      placeBumper(worldPoint);
    } else if (state.tool === "conveyor") {
      placeConveyor(worldPoint);
    } else if (state.tool === "gift") {
      placeGift(worldPoint);
    } else if (state.tool === "moneydrop") {
      placeMoneyDrop(worldPoint);
    } else if (state.tool === "treat") {
      placeTreat(worldPoint);
    } else if (state.tool === "confetti") {
      placeConfettiPopper(worldPoint);
    } else if (state.tool === "boombox") {
      placeBoombox(worldPoint);
    } else if (state.tool === "tesla") {
      placeTesla(worldPoint);
    } else if (state.tool === "rope") {
      attachRope(worldPoint);
    } else if (state.tool === "water") {
      setLiquidLevel(worldPoint);
    } else if (state.tool === "blackhole") {
      setMood("Afraid", 900);
    } else if (state.tool === "vacuum") {
      setMood("Surprised", 900);
    } else if (state.tool === "repulsor") {
      setMood("Afraid", 900);
    } else if (state.tool === "magnet") {
      setMood("Curious", 900);
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
    } else if (state.tool === "pulsebeam") {
      setMood("Afraid", 900);
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
    updateCanvasCursor(state.pointerCurrent);
  });

  window.addEventListener("pointerup", (event) => {
    if (!isPrimaryPointerButton(event.button) || !state.pointerDown) {
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
    } else if (state.tool === "crate") {
      spawnCrate(state.pointerStart, endPoint);
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
    } else if (state.tool === "plunger") {
      firePlungerShot(state.pointerStart, endPoint);
    } else if (state.tool === "starshot") {
      fireStarShot(state.pointerStart, endPoint);
    } else if (state.tool === "cannonball") {
      fireCannonball(state.pointerStart, endPoint);
    } else if (state.tool === "slap") {
      slapAt(state.pointerStart, endPoint);
    } else if (state.tool === "hand" && elapsed < 210 && distance < 12) {
      tickleAt(endPoint);
    }
    state.aimVector = null;
    feedback.stopWind();
    clearBuddyHighlight();
    updateCanvasCursor(endPoint);
  });

  canvas.addEventListener("pointerleave", () => {
    clearTouchWheelTimer();
    state.pointerDown = false;
    state.pendingTouchInstant = null;
    state.aimVector = null;
    feedback.stopWind();
    canvas.style.cursor = "default";
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

function applyPowerControl(powerView) {
  state.power = powerView.power;
  hud.power.value = String(powerView.power);
  hud.powerReadout.textContent = powerView.label;
}

function updateCanvasCursor(worldPoint) {
  canvas.style.cursor = getCanvasCursorPresentation({
    toolId: state.tool,
    pointerDown: state.pointerDown,
    overBuddy: Boolean(getBuddyAt(worldPoint)),
    draggingBuddy: Boolean(mouseConstraint.body || state.grabbedBody)
  });
}

function syncSettingsControls() {
  controls.reducedFlash.checked = state.settings.reducedFlash;
  controls.goreToggle.checked = state.settings.slapstick;
  controls.audioToggle.checked = state.settings.audio;
  controls.audioVolume.value = String(normalizeAudioVolume(state.settings.volume));
  controls.audioVolumeValue.textContent = getAudioVolumeLabel(state.settings.volume);
  controls.cameraShakeToggle.checked = state.settings.cameraShake;
  controls.particlesToggle.checked = state.settings.particles;
  controls.hapticsToggle.checked = state.settings.haptics;
  controls.assetPack.value = getSelectedAssetPackId(state.assetPacks, state.settings.assetPack);
  controls.audioPack.value = getSelectedAudioPackId(AUDIO_PACKS, state.settings.audioPack);
  controls.liquidType.value = getSelectedLiquidTypeId(LIQUID_TYPES, state.settings.liquidType);
  controls.challengeMode.value = getChallengeModeId(CHALLENGE_MODES, state.challenge.mode);
}

function normalizeAudioVolume(value) {
  const volume = Number(value);
  return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1;
}

function getAudioVolumeLabel(value) {
  return `${Math.round(normalizeAudioVolume(value) * 100)}%`;
}

function setupMenuInteractions() {
  const menus = [...document.querySelectorAll(".menu")];
  const closeMenus = (except = null) => {
    menus.forEach((menu) => {
      if (menu !== except) {
        menu.classList.remove("is-open");
      }
    });
  };

  menus.forEach((menu) => {
    const trigger = menu.querySelector(":scope > button");
    if (!trigger) {
      return;
    }
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = menu.classList.contains("is-open");
      closeMenus(menu);
      menu.classList.toggle("is-open", !isOpen);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest?.(".menu")) {
      closeMenus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
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
      const equivalentMass = getEquivalentMass(massA, massB);
      const impactScore = scaleStaticImpactScore(getImpactScore(speed, equivalentMass), other.isStatic, other.label);
      if (impactScore < 1) {
        continue;
      }
      const clamped = clampImpactScore(impactScore);
      if (performance.now() >= state.spawnGraceUntil) {
        addScore(clamped, "impact", ["blunt"]);
      }
      spawnBurst(pair.collision.supports[0] || (buddyA ? bodyA.position : bodyB.position), getSkin().accent, getImpactBurstCount(speed));

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
    if (state.tool === "vacuum" && state.pointerDown) {
      applyVacuum(delta);
    }
    if (state.tool === "repulsor" && state.pointerDown) {
      applyRepulsor(delta);
    }
    if (state.tool === "magnet" && state.pointerDown) {
      applyMagnet(delta);
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
    if (state.tool === "pulsebeam" && state.pointerDown) {
      applyPulseBeam(delta);
    }
    updateGrenades();
    updateTesla(delta);
    updateBoomboxes(delta);
    updateConveyors(delta);
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
    event.body.frictionAir = getGrabFrictionAir(event.body.frictionAir);
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
    const elapsed = getHandDragElapsed(performance.now() - state.pointerDownTime);
    const totalFlick = Vector.mult(drag, getHandDragFlickScale(elapsed));
    const flickSource = shouldUseStepFlick(Vector.magnitude(stepFlick), Vector.magnitude(totalFlick)) ? stepFlick : totalFlick;
    const flick = clampVector(flickSource, 32);
    if (Vector.magnitude(flick) > 2.5) {
      Body.setVelocity(body, Vector.add(body.velocity, Vector.mult(flick, 0.28)));
      Body.setAngularVelocity(body, getHandFlickAngularVelocity(body.angularVelocity, flick.x));
      addScore(getHandFlickScore(Vector.magnitude(flick)), "throw", ["blunt", "hand"]);
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
  const frameScale = getFrameScale(delta);
  Body.setAngularVelocity(body, body.angularVelocity * Math.pow(0.82, frameScale));
  const offset = Vector.sub(state.pointerCurrent, body.position);
  const distance = Vector.magnitude(offset);
  if (distance > 42) {
    const correction = Vector.mult(Vector.normalise(offset), getGrabCorrectionMagnitude(distance, body.mass));
    Body.applyForce(body, body.position, correction);
  }
}

function tickTimers(delta) {
  if (state.comboTimer > 0) {
    state.comboTimer = decrementTimer(state.comboTimer, delta);
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
  if (state.vacuumCooldown > 0) {
    state.vacuumCooldown -= delta;
  }
  if (state.repulsorCooldown > 0) {
    state.repulsorCooldown -= delta;
  }
  if (state.magnetCooldown > 0) {
    state.magnetCooldown -= delta;
  }
  if (state.conveyorCooldown > 0) {
    state.conveyorCooldown -= delta;
  }
  if (state.teslaCooldown > 0) {
    state.teslaCooldown -= delta;
  }
  if (state.rubberCooldown > 0) {
    state.rubberCooldown -= delta;
  }
  if (state.rubberBurstWindow > 0) {
    state.rubberBurstWindow = decrementTimer(state.rubberBurstWindow, delta);
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
  if (state.pulseBeamCooldown > 0) {
    state.pulseBeamCooldown -= delta;
  }
  if (state.liquidScoreCooldown > 0) {
    state.liquidScoreCooldown -= delta;
  }
  if (state.shake > 0) {
    state.shake = decayShakeAmount(state.shake, delta);
  }
  if (state.toastTimer > 0) {
    state.toastTimer -= delta;
    if (isTimerExpired(state.toastTimer)) {
      hud.toast.classList.remove(getToastHiddenPresentation().visibleClass);
    }
  }

  updateChallengeTimer(delta);
  updateFrostedBodies(delta);
  updateGooedBodies(delta);
  updatePulseBodies(delta);
  updateSuctionBodies(delta);
  updateStarredBodies(delta);

  for (const [tool, heat] of state.toolHeat.entries()) {
    const next = decayToolHeat(heat, delta);
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
    const buttonView = getToolRailButtonPresentation(tool, index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = buttonView.className;
    button.dataset.tool = buttonView.toolId;
    button.title = buttonView.title;
    button.innerHTML = buttonView.markup;
    button.addEventListener("click", () => trySelectTool(tool.id));
    hud.toolRail.appendChild(button);
  });
  buildRadialWheel();
}

function buildRadialWheel() {
  hud.radialWheel.innerHTML = `<div class="radial-wheel__center">${getRadialWheelCenterLabel()}</div>`;
  TOOL_DEFS.forEach((tool, index) => {
    const buttonView = getRadialToolButtonPresentation(tool, index, TOOL_DEFS.length);
    const button = document.createElement("button");
    button.type = "button";
    button.className = buttonView.className;
    button.dataset.tool = buttonView.toolId;
    button.style.transform = buttonView.transform;
    button.textContent = buttonView.icon;
    button.title = buttonView.title;
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
  const categories = getRuntimeToolCategories(TOOL_DEFS);
  categories.forEach((category) => {
    const categoryView = getMenuCategoryPresentation(category);
    const label = document.createElement("span");
    label.className = categoryView.className;
    label.textContent = categoryView.label;
    hud.itemMenu.appendChild(label);
    getRuntimeToolsByCategory(TOOL_DEFS, category).forEach((tool) => {
      const buttonView = getShopMenuButtonPresentation(tool, state.unlockedTools.has(tool.id));
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = buttonView.text;
      button.addEventListener("click", () => trySelectTool(tool.id));
      hud.itemMenu.appendChild(button);
    });
  });

  hud.skinMenu.innerHTML = "";
  SKIN_DEFS.forEach((skin) => {
    const buttonView = getShopMenuButtonPresentation(skin, state.unlockedSkins.has(skin.id));
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = buttonView.text;
    button.addEventListener("click", () => buyOrSelectSkin(skin.id));
    hud.skinMenu.appendChild(button);
  });

  controls.challengeMode.innerHTML = "";
  Object.entries(CHALLENGE_MODES).forEach(([id, mode]) => {
    const optionView = getChallengeModeOption(id, mode);
    const option = document.createElement("option");
    option.value = optionView.value;
    option.textContent = optionView.label;
    controls.challengeMode.appendChild(option);
  });
  controls.challengeMode.value = getChallengeModeId(CHALLENGE_MODES, state.challenge.mode);
}

function buildAssetPackUi() {
  controls.assetPack.innerHTML = "";
  state.assetPacks.forEach((pack) => {
    const optionView = getAssetPackOption(pack);
    const option = document.createElement("option");
    option.value = optionView.value;
    option.textContent = optionView.label;
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
  const preview = getRoomPreviewShellPresentation(pack);
  controls.roomPreview.innerHTML = "";
  controls.roomPreview.dataset.roomPack = preview.packId;

  const name = document.createElement("strong");
  name.className = preview.nameClassName;
  name.textContent = preview.name;
  controls.roomPreview.appendChild(name);

  controls.roomPreview.appendChild(createRoomThumbnail(pack, "room-thumbnail--large"));

  const swatches = document.createElement("div");
  swatches.className = preview.swatchesClassName;
  getRoomSwatches(room).forEach((roomSwatch) => {
    const swatchView = getRoomSwatchPresentation(roomSwatch);
    const swatch = document.createElement("span");
    swatch.className = swatchView.className;
    swatch.style.background = swatchView.background;
    swatch.title = swatchView.title;
    swatch.setAttribute("aria-label", swatchView.ariaLabel);
    swatches.appendChild(swatch);
  });
  controls.roomPreview.appendChild(swatches);

  const browser = document.createElement("div");
  browser.className = preview.browserClassName;
  state.assetPacks.forEach((roomPack) => {
    const buttonView = getRoomBrowserButtonPresentation(roomPack, pack.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = buttonView.className;
    button.dataset.roomPack = buttonView.packId;
    button.classList.toggle("is-active", buttonView.active);
    button.setAttribute("aria-pressed", buttonView.ariaPressed);
    const label = document.createElement("span");
    label.className = buttonView.labelClassName;
    label.textContent = buttonView.label;
    button.appendChild(label);
    button.appendChild(createRoomThumbnail(roomPack, "room-thumbnail--mini"));
    button.addEventListener("click", () => selectRoomPack(roomPack.id));
    browser.appendChild(button);
  });
  controls.roomPreview.appendChild(browser);
}

function createRoomThumbnail(pack, sizeClass) {
  const thumbnailView = getRoomThumbnailPresentation(pack, sizeClass);
  const thumbnail = document.createElement("span");
  thumbnail.className = thumbnailView.className;
  thumbnail.dataset.motif = thumbnailView.motif;
  thumbnail.setAttribute("aria-label", thumbnailView.ariaLabel);
  Object.entries(thumbnailView.styles).forEach(([property, value]) => {
    thumbnail.style.setProperty(property, value);
  });

  thumbnailView.layerClassNames.forEach((className) => {
    const layer = document.createElement("i");
    layer.className = className;
    thumbnail.appendChild(layer);
  });
  return thumbnail;
}

function selectRoomPack(packId) {
  state.settings.assetPack = getAssetPack(packId).id;
  controls.assetPack.value = state.settings.assetPack;
  renderRoomPreview();
  applyRoomPack();
  toast(getAssetPackSelectedToast(getAssetPack().name));
  saveGame();
}

function buildAudioPackUi() {
  controls.audioPack.innerHTML = "";
  Object.entries(AUDIO_PACKS).forEach(([id, pack]) => {
    const optionView = getAudioPackOption(id, pack, pack.assetPack ? getAssetPack(pack.assetPack) : undefined);
    const option = document.createElement("option");
    option.value = optionView.value;
    option.textContent = optionView.label;
    controls.audioPack.appendChild(option);
  });
  controls.audioPack.value = getSelectedAudioPackId(AUDIO_PACKS, state.settings.audioPack);
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
    toast(getLockedToolToast(tool));
    return;
  }
  selectTool(toolId);
}

function selectTool(toolId) {
  const tool = getTool(toolId);
  state.tool = tool.id;
  document.querySelectorAll(".tool-button").forEach((button) => {
    const id = button.dataset.tool;
    const buttonState = getToolButtonState(id, toolId, state.unlockedTools.has(id));
    button.classList.toggle("tool-button--active", buttonState.active);
    button.classList.toggle("tool-button--locked", buttonState.locked);
  });
  const toolPanel = getToolSelectionPanel(tool);
  hud.toolName.textContent = toolPanel.name;
  hud.toolDescription.textContent = toolPanel.description;
  updateUnlockButtons();

  const mouseConfig = getMouseConstraintConfig(toolId);
  if (mouseConfig.stopWind) {
    feedback.stopWind();
  }
  if (mouseConfig.clearBody) {
    mouseConstraint.constraint.bodyB = null;
  }
  mouseConstraint.collisionFilter.mask = mouseConfig.mask;
  mouseConstraint.constraint.stiffness = mouseConfig.stiffness;
  if (mouseConfig.damping !== undefined) {
    mouseConstraint.constraint.damping = mouseConfig.damping;
  }
  updateCanvasCursor(state.pointerCurrent);
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
  const position = getClampedOverlayPosition(stage, { clientX, clientY }, 250);
  const cssPosition = getOverlayCssPosition(position);
  const wheelVisibility = getRadialWheelVisibilityPresentation(true);
  hud.radialWheel.style.left = cssPosition.left;
  hud.radialWheel.style.top = cssPosition.top;
  hud.radialWheel.classList.add(wheelVisibility.openClass);
  state.radialOpen = wheelVisibility.radialOpen;
  updateUnlockButtons();
  recordMission("radialWheel", 1);
  feedback.play("select", 0.7);
}

function hideRadialWheel() {
  if (!state.radialOpen) {
    return;
  }
  const wheelVisibility = getRadialWheelVisibilityPresentation(false);
  hud.radialWheel.classList.remove(wheelVisibility.openClass);
  state.radialOpen = wheelVisibility.radialOpen;
}

function executeInstantTool(toolId, point) {
  if (toolId === "firecracker") {
    spawnFirecracker(point);
  } else if (toolId === "grenade") {
    spawnGrenade(point);
  } else if (toolId === "mine") {
    spawnMine(point);
  } else if (toolId === "stickybomb") {
    spawnStickyBomb(point);
  } else if (toolId === "largebomb") {
    spawnLargeBomb(point);
  } else if (toolId === "trampoline") {
    placeTrampoline(point);
  } else if (toolId === "platform") {
    placePlatform(point);
  } else if (toolId === "bumper") {
    placeBumper(point);
  } else if (toolId === "conveyor") {
    placeConveyor(point);
  } else if (toolId === "gift") {
    placeGift(point);
  } else if (toolId === "moneydrop") {
    placeMoneyDrop(point);
  } else if (toolId === "treat") {
    placeTreat(point);
  } else if (toolId === "confetti") {
    placeConfettiPopper(point);
  } else if (toolId === "boombox") {
    placeBoombox(point);
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
  return screenPointToWorld(rect, event, { width: STAGE_WIDTH, height: STAGE_HEIGHT });
}

function resizeStage() {
  const card = canvas.parentElement;
  const bounds = card.getBoundingClientRect();
  const styles = getCanvasFitStyles(bounds, { width: STAGE_WIDTH, height: STAGE_HEIGHT });
  canvas.style.width = styles.width;
  canvas.style.height = styles.height;
  canvas.style.marginLeft = styles.marginLeft;
  canvas.style.marginTop = styles.marginTop;
}

function spawnBall(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 280);
  const radius = getPoweredRadius(state.power, 18, 14);
  const ball = createBallBody(Bodies, start, radius);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 0, y: -1 };
  const scale = getThrowScale(distance, 280, 0.55, state.power, 70);
  Body.setVelocity(ball, Vector.mult(launch, 10 * scale));
  registerProp(ball);
  addScore(getBallThrowScore(state.power), "throw", ["blunt", "toy"]);
  setMood("Happy", 1300);
}

function spawnBeachBall(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 280);
  const beachBall = createBeachBallBody(Bodies, start);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 1, y: -0.25 };
  const scale = getThrowScale(distance, 280, 0.74, state.power, 82);
  Body.setVelocity(beachBall, Vector.mult(launch, 11.4 * scale));
  Body.setAngularVelocity(beachBall, getSignedAngularVelocity(launch.x, 0.22));
  registerProp(beachBall);
  addScore(getBeachBallThrowScore(state.power), "beachball", ["blunt", "toy", "bounce", "propVariant"]);
  setMood("Happy", 1300);
}

function spawnBowlingBall(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 260);
  const bowling = createBowlingBallBody(Bodies, start);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 1, y: -0.15 };
  const scale = getThrowScale(distance, 260, 0.36, state.power, 95);
  Body.setVelocity(bowling, Vector.mult(launch, 9.4 * scale));
  Body.setAngularVelocity(bowling, getSignedAngularVelocity(launch.x, 0.18));
  registerProp(bowling);
  addScore(getBowlingBallThrowScore(state.power), "bowling", ["blunt", "heavy", "toy", "propVariant"]);
  setMood("Surprised", 1300);
}

function spawnBrick(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 260);
  const brick = createBrickBody(Bodies, start);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 1, y: -0.35 };
  const scale = getThrowScale(distance, 260, 0.42, state.power, 82);
  Body.setVelocity(brick, Vector.mult(launch, 10.5 * scale));
  Body.setAngularVelocity(brick, getSignedAngularVelocity(launch.x, 0.08));
  registerProp(brick);
  addScore(getBrickThrowScore(state.power), "throw", ["blunt", "object"]);
  setMood("Surprised", 1200);
}

function spawnCrate(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 250);
  const crate = createCrateBody(Bodies, start);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 1, y: -0.22 };
  const scale = getThrowScale(distance, 250, 0.38, state.power, 88);
  Body.setVelocity(crate, Vector.mult(launch, 9.2 * scale));
  Body.setAngularVelocity(crate, getSignedAngularVelocity(launch.x, 0.07));
  registerProp(crate);
  addScore(getCrateThrowScore(state.power), "crate", ["blunt", "object", "propVariant"]);
  setMood("Surprised", 1200);
}

function spawnBoxingGlove(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 250);
  const glove = createBoxingGloveBody(Bodies, start);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 1, y: -0.1 };
  const scale = getThrowScale(distance, 250, 0.62, state.power, 80);
  Body.setVelocity(glove, Vector.mult(launch, 12 * scale));
  Body.setAngularVelocity(glove, getSignedAngularVelocity(launch.x, 0.12));
  registerProp(glove);
  addScore(getBoxingGloveThrowScore(state.power), "punch", ["blunt", "punch", "toy", "propVariant"]);
  setMood("Excited", 1000);
}

function spawnAnvil(start, end) {
  const direction = Vector.sub(end, start);
  const distance = getClampedLaunchDistance(Vector.magnitude(direction), 220);
  const anvil = createAnvilBody(Bodies, start);
  const launch = shouldUseLaunchDirection(distance, 2) ? Vector.normalise(direction) : { x: 0.2, y: 1 };
  const scale = getThrowScale(distance, 220, 0.28, state.power, 105);
  Body.setVelocity(anvil, Vector.mult(launch, 8.2 * scale));
  Body.setAngularVelocity(anvil, getSignedAngularVelocity(launch.x, 0.025));
  registerProp(anvil);
  addScore(getAnvilThrowScore(state.power), "throw", ["blunt", "heavy", "object"]);
  setMood("Afraid", 1300);
}

function firePaintball(start, end) {
  const direction = Vector.sub(end, start);
  const launch = shouldUseLaunchDirection(Vector.magnitude(direction)) ? Vector.normalise(direction) : { x: 1, y: 0 };
  const paint = createPaintballBody(Bodies, start);
  paint.plugin = { projectile: "paintball", color: paint.render.fillStyle, born: performance.now() };
  Body.setVelocity(paint, Vector.mult(launch, getLaunchSpeed(state.power, 16, 0.11)));
  registerProp(paint);
  addScore(getPaintballFireScore(), "paintball", ["projectile"]);
}

function fireFoamDart(start, end) {
  const direction = Vector.sub(end, start);
  const launch = shouldUseLaunchDirection(Vector.magnitude(direction)) ? Vector.normalise(direction) : { x: 1, y: 0 };
  const dart = createFoamDartBody(Bodies, start);
  dart.plugin = { ...dart.plugin, projectile: "foamdart", born: performance.now() };
  Body.setAngle(dart, getVectorAngle(launch));
  Body.setVelocity(dart, Vector.mult(launch, getLaunchSpeed(state.power, 17, 0.1)));
  registerProp(dart);
  addScore(getFoamDartFireScore(), "dart", ["projectile", "foamDart"]);
}

function fireCorkPopper(start, end) {
  const direction = Vector.sub(end, start);
  const launch = shouldUseLaunchDirection(Vector.magnitude(direction)) ? Vector.normalise(direction) : { x: 1, y: 0 };
  const cork = createCorkBody(Bodies, start);
  cork.plugin = { ...cork.plugin, projectile: "corkpopper", born: performance.now() };
  Body.setAngle(cork, getVectorAngle(launch));
  Body.setVelocity(cork, Vector.mult(launch, getLaunchSpeed(state.power, 14.5, 0.085)));
  Body.setAngularVelocity(cork, getSignedAngularVelocity(launch.x, 0.22));
  registerProp(cork);
  addScore(getCorkPopperFireScore(), "cork", ["projectile", "corkPopper"]);
}

function firePlungerShot(start, end) {
  const direction = Vector.sub(end, start);
  const launch = shouldUseLaunchDirection(Vector.magnitude(direction)) ? Vector.normalise(direction) : { x: 1, y: 0 };
  const plunger = createPlungerBody(Bodies, start);
  plunger.plugin = { ...plunger.plugin, projectile: "plunger", born: performance.now() };
  Body.setAngle(plunger, getVectorAngle(launch));
  Body.setVelocity(plunger, Vector.mult(launch, getLaunchSpeed(state.power, 15.5, 0.09)));
  Body.setAngularVelocity(plunger, getSignedAngularVelocity(launch.x, 0.14));
  registerProp(plunger);
  addScore(getPlungerShotFireScore(), "plunger", ["projectile", "plungerShot"]);
}

function fireStarShot(start, end) {
  const direction = Vector.sub(end, start);
  const launch = shouldUseLaunchDirection(Vector.magnitude(direction)) ? Vector.normalise(direction) : { x: 1, y: 0 };
  const star = createStarBody(Bodies, start);
  star.plugin = { ...star.plugin, projectile: "starshot", born: performance.now() };
  Body.setAngle(star, getVectorAngle(launch));
  Body.setVelocity(star, Vector.mult(launch, getLaunchSpeed(state.power, 16.5, 0.1)));
  Body.setAngularVelocity(star, getSignedAngularVelocity(launch.x, 0.32));
  registerProp(star);
  addScore(getStarShotFireScore(), "star", ["projectile", "starShot"]);
}

function fireCannonball(start, end) {
  const direction = Vector.sub(end, start);
  const launch = shouldUseLaunchDirection(Vector.magnitude(direction)) ? Vector.normalise(direction) : { x: 1, y: 0 };
  const cannonball = createCannonballBody(Bodies, start);
  cannonball.plugin = { ...cannonball.plugin, projectile: "cannonball", born: performance.now() };
  Body.setVelocity(cannonball, Vector.mult(launch, getLaunchSpeed(state.power, 12.5, 0.075)));
  Body.setAngularVelocity(cannonball, getSignedAngularVelocity(launch.x, 0.11));
  registerProp(cannonball);
  addScore(getCannonballFireScore(), "cannonball", ["projectile", "heavy", "blunt"]);
  setMood("Afraid", 900);
}

function spawnFirecracker(position) {
  const firecracker = createFirecrackerBody(Bodies, position);
  Body.setAngularVelocity(firecracker, 0.08);
  registerExplosive(firecracker, {
    delay: 850,
    radius: 115,
    baseForce: 0.00078,
    scoreBase: 7,
    armedReason: "firecracker",
    armedTags: ["explosive", "firecracker"],
    color: "#ffc857",
    shake: 7,
    toastText: getExplosiveArmedToast("firecracker")
  });
}

function spawnGrenade(position) {
  const grenade = createGrenadeBody(Bodies, position);
  registerExplosive(grenade, {
    delay: 1700,
    radius: getExplosionRadius(undefined, state.power),
    baseForce: getExplosionBaseForce(undefined, state.power),
    scoreBase: 13,
    armedReason: "armed",
    armedTags: ["explosive"],
    color: "#ffc857",
    shake: 18,
    toastText: getExplosiveArmedToast("grenade")
  });
}

function spawnMine(position) {
  const mine = createMineBody(Bodies, position);
  registerExplosive(mine, {
    delay: 2400,
    radius: getExplosionRadius(undefined, state.power, 175, 1.55),
    baseForce: getExplosionBaseForce(undefined, state.power, 0.00125, 0.8, 84),
    scoreBase: 11,
    armedReason: "mine",
    armedTags: ["explosive", "mine"],
    color: "#ff7161",
    shake: 14,
    toastText: getExplosiveArmedToast("mine")
  });
}

function spawnStickyBomb(position) {
  const stickyBomb = createStickyBombBody(Bodies, position);
  const target = getNearestDynamicBody(position, 64);
  let tether = null;
  if (target) {
    Body.setPosition(stickyBomb, {
      x: target.position.x + 18,
      y: target.position.y - 8
    });
    tether = Constraint.create({
      bodyA: stickyBomb,
      bodyB: target,
      length: 8,
      stiffness: 0.92,
      damping: 0.18,
      label: "sticky_bomb_tether",
      render: {
        visible: false
      }
    });
    World.add(engine.world, tether);
  }
  registerExplosive(stickyBomb, {
    delay: 1900,
    radius: getExplosionRadius(undefined, state.power, 170, 1.65),
    baseForce: getExplosionBaseForce(undefined, state.power, 0.00125, 0.8, 80),
    scoreBase: 12,
    armedReason: "stickybomb",
    armedTags: ["explosive", "stickybomb"],
    color: "#98f17f",
    shake: 14,
    toastText: getExplosiveArmedToast("stickybomb", Boolean(target)),
    tether
  });
}

function spawnLargeBomb(position) {
  const largeBomb = createLargeBombBody(Bodies, position);
  registerExplosive(largeBomb, {
    delay: 2300,
    radius: getExplosionRadius(undefined, state.power, 260, 2.8),
    baseForce: getExplosionBaseForce(undefined, state.power, 0.00185, 0.8, 68),
    scoreBase: 18,
    armedReason: "largebomb",
    armedTags: ["explosive", "largebomb"],
    color: "#ffd06a",
    shake: 24,
    toastText: getExplosiveArmedToast("largebomb")
  });
}

function registerExplosive(body, options) {
  registerProp(body);
  state.grenades.push({
    body,
    explodeAt: getExplosionTriggerTime(performance.now(), options.delay),
    exploded: false,
    ...options
  });
  addScore(getExplosionArmScore(), options.armedReason, options.armedTags);
  toast(options.toastText);
}

function getNearestDynamicBody(position, maxDistance) {
  let best = null;
  let bestDistance = maxDistance;
  Composite.allBodies(engine.world).forEach((body) => {
    if (body.isStatic || body.label?.startsWith("prop_stickybomb")) {
      return;
    }
    const distance = Vector.magnitude(Vector.sub(body.position, position));
    if (shouldReplaceNearest(distance, bestDistance)) {
      bestDistance = distance;
      best = body;
    }
  });
  return best;
}

function placeTrampoline(position) {
  const pad = createTrampolineBody(Bodies, position);
  registerProp(pad);
  addScore(getTrampolinePlacementScore(), "build", ["builder"]);
}

function placePlatform(position) {
  const platform = createPlatformBody(Bodies, position);
  registerProp(platform);
  addScore(getPlatformPlacementScore(), "platform", ["builder", "platform"]);
  toast(getToolUseToast("platformPlaced"));
}

function placeBumper(position) {
  const bumper = createBumperBody(Bodies, position);
  registerProp(bumper);
  addScore(getBumperPlacementScore(), "bumper", ["builder", "bounce", "bumper"]);
  toast(getToolUseToast("bumperPlaced"));
}

function placeConveyor(position) {
  const conveyor = createConveyorBody(Bodies, position);
  conveyor.plugin.conveyorDirection = getConveyorDirection(state.power);
  registerProp(conveyor);
  addScore(getConveyorPlacementScore(), "conveyor", ["builder", "force", "conveyor"]);
  toast(getToolUseToast("conveyorPlaced"));
}

function placeGift(position) {
  const cost = getGiftCost(state.cash);
  if (state.cash < cost) {
    toast(getToolUseToast("giftNeedCash"));
    return;
  }
  state.cash -= cost;
  const gift = createGiftBody(Bodies, position);
  registerProp(gift);
  setMood("Happy", 2600, "yay!");
  addScore(getGiftScore(), "gift", ["gift", "happy"]);
  recordMission("happy", 1);
}

function placeMoneyDrop(position) {
  const money = createMoneyDropBody(Bodies, position);
  registerProp(money);
  Body.setVelocity(money, getRandomTossVelocity(Math.random(), 2.5, -3.2));
  spawnMoneySparkles(position, 16);
  nudgeBuddy(position, 165, 0.00048, -0.00028);
  setMood("Happy", 2200, "$");
  addScore(getMoneyDropScore(), "moneydrop", ["moneydrop", "cash", "happy", "nice"]);
  recordMission("happy", 1);
  toast(getToolUseToast("moneyDrop"));
}

function placeTreat(position) {
  const treat = createTreatBody(Bodies, position);
  registerProp(treat);
  Body.setVelocity(treat, getRandomTossVelocity(Math.random(), 3, -2.4));
  spawnTreatCrumbs(position, 14);
  nudgeBuddy(position, 150, 0.00032, -0.00048);
  setMood("Happy", 2400, "yum!");
  addScore(getTreatScore(), "treat", ["treat", "happy", "nice"]);
  recordMission("happy", 1);
  toast(getToolUseToast("treatTossed"));
}

function nudgeBuddy(position, radius, horizontalForce, liftForce) {
  if (!state.buddy) {
    return false;
  }
  let touched = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, position);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 12);
    if (distance > radius) {
      return;
    }
    const falloff = getNudgeFalloff(distance, radius);
    const side = getNudgeSide(delta.x);
    Body.applyForce(body, body.position, getNudgeForce(side, horizontalForce, liftForce, falloff, body.mass));
    touched = true;
  });
  return touched;
}

function placeConfettiPopper(position) {
  const popper = createConfettiPopperBody(Bodies, position);
  registerProp(popper);
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, position);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 12);
    if (distance > getConfettiPopperRange()) {
      return;
    }
    const away = Vector.normalise(delta);
    const lift = getConfettiLiftVector(away);
    Body.applyForce(body, body.position, Vector.mult(Vector.normalise(lift), getConfettiForceMagnitude(body.mass, distance)));
    touchedBuddy = true;
  });
  spawnConfettiBurst(position, 34);
  setMood("Excited", 2300, "pop!");
  addScore(getConfettiScore(touchedBuddy), "confetti", ["confetti", "happy", "nice"]);
  toast(getToolUseToast("confettiFired"));
}

function placeBoombox(position) {
  const boombox = createBoomboxBody(Bodies, position);
  registerProp(boombox);
  state.boomboxes.push({ body: boombox, beat: getBoomboxInitialBeat(), life: getBoomboxLife() });
  spawnMusicNotes(position, 7);
  setMood("Happy", 2400, "la!");
  addScore(getBoomboxPlacementScore(), "boombox", ["boombox", "music", "happy", "nice"]);
  toast(getToolUseToast("boomboxPlaying"));
}

function placeTesla(position) {
  const coil = createTeslaBody(Bodies, position);
  registerProp(coil);
  state.coils.push({ body: coil, pulse: 0 });
  addScore(getTeslaPlacementScore(), "build", ["shock"]);
}

function attachRope(position) {
  const target = getNearestBuddyBody(position, 240);
  if (!target) {
    toast(getToolUseToast("ropeNeedsBuddy"));
    return;
  }
  const anchor = {
    x: getRopeAnchorX(target.position.x, STAGE_WIDTH),
    y: getRopeAnchorY(state.settings.ceilingOpen)
  };
  const length = getRopeLength(Vector.magnitude(Vector.sub(target.position, anchor)));
  const rope = Constraint.create({
    pointA: anchor,
    bodyB: target,
    pointB: { x: 0, y: 0 },
    length,
    stiffness: getRopeStiffness(state.power),
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
  if (shouldPruneRopes(state.ropes.length)) {
    const oldest = state.ropes.shift();
    World.remove(engine.world, oldest);
  }
  addScore(getRopeAttachScore(), "tether", ["builder", "force"]);
  toast(getToolUseToast("ropeAttached"));
}

function setLiquidLevel(position) {
  if (shouldDrainLiquid(position.y, FLOOR_Y, state.liquid.enabled)) {
    state.liquid.enabled = false;
    addScore(getLiquidDrainScore(), "liquid", [state.liquid.type]);
    toast(getLiquidDrainToast(getLiquidType().name));
    return;
  }
  state.liquid.enabled = true;
  state.liquid.type = state.settings.liquidType;
  state.liquid.level = getClampedLiquidLevel(position.y, FLOOR_Y);
  addScore(getLiquidFillScore(), "liquid", [state.liquid.type, "builder"]);
  toast(getLiquidFillToast(getLiquidType().name));
}

function applyFanForce() {
  feedback.startWind();
  const bodies = Composite.allBodies(engine.world);
  const radius = getFanRadius();
  let touchedBuddy = false;
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 2 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };

  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 5);
    if (distance > radius) {
      continue;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.12) {
      continue;
    }
    Body.applyForce(body, body.position, Vector.mult(dir, getFanForceMagnitude(state.power, body.mass, distance, radius, cone)));
    if (isBuddyBody(body)) {
      touchedBuddy = true;
    }
  }

  if (touchedBuddy && state.fanScoreCooldown <= 0) {
    addScore(getFanScore(state.power), "wind", ["wind", "force"]);
    state.fanScoreCooldown = getFanScoreCooldown();
    setMood("Curious", 900);
  }
}

function applyBlackHole() {
  const bodies = Composite.allBodies(engine.world);
  const radius = getBlackHoleRadius(state.power);
  let touchedBuddy = false;
  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    const delta = Vector.sub(state.pointerCurrent, body.position);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 24);
    if (distance > radius) {
      continue;
    }
    const tangent = { x: -delta.y, y: delta.x };
    const pull = Vector.mult(Vector.normalise(delta), getBlackHolePullForceMagnitude(state.power, body.mass, distance, radius));
    const orbit = Vector.mult(Vector.normalise(tangent), getBlackHoleOrbitForceMagnitude(state.power, body.mass));
    Body.applyForce(body, body.position, Vector.add(pull, orbit));
    if (isBuddyBody(body)) {
      touchedBuddy = true;
    }
  }
  if (touchedBuddy && state.blackHoleCooldown <= 0) {
    addScore(getBlackHoleScore(state.power), "gravity", ["force", "fear"]);
    feedback.play("shock", 0.35);
    state.blackHoleCooldown = getBlackHoleCooldown();
    setMood("Afraid", 1100);
  }
}

function applyVacuum() {
  feedback.startWind();
  const bodies = Composite.allBodies(engine.world);
  const radius = getVacuumRadius(state.power);
  let touchedBuddy = false;
  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    const delta = Vector.sub(state.pointerCurrent, body.position);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 18);
    if (distance > radius) {
      continue;
    }
    const pull = Vector.mult(Vector.normalise(delta), getVacuumForceMagnitude(state.power, body.mass, distance, radius));
    Body.applyForce(body, body.position, pull);
    touchedBuddy = touchedBuddy || isBuddyBody(body);
  }
  if (touchedBuddy && state.vacuumCooldown <= 0) {
    addScore(getVacuumScore(state.power), "vacuum", ["force", "vacuum"]);
    state.vacuumCooldown = getVacuumCooldown();
    setMood("Surprised", 1000);
  }
  addParticle({ type: "ring", kind: "vacuum", x: state.pointerCurrent.x, y: state.pointerCurrent.y, ...getVacuumRingEffect(radius), color: "#55d9cf" });
}

function applyRepulsor() {
  const bodies = Composite.allBodies(engine.world);
  const radius = getRepulsorRadius(state.power);
  let touchedBuddy = false;
  for (const body of bodies) {
    if (body.isStatic) {
      continue;
    }
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 18);
    if (distance > radius) {
      continue;
    }
    const push = Vector.normalise(delta);
    const force = getRepulsorForceMagnitude(state.power, body.mass, distance, radius);
    Body.applyForce(body, body.position, Vector.mult(push, force));
    Body.setAngularVelocity(body, getRepulsorAngularVelocity(body.angularVelocity, push.x));
    touchedBuddy = touchedBuddy || isBuddyBody(body);
  }
  if (touchedBuddy && state.repulsorCooldown <= 0) {
    addScore(getRepulsorScore(state.power), "repulsor", ["force", "repulsor"]);
    state.repulsorCooldown = getRepulsorCooldown();
    setMood("Afraid", 1000, "hot!");
  }
  addParticle({ type: "ring", kind: "repulsor", x: state.pointerCurrent.x, y: state.pointerCurrent.y, ...getRepulsorRingEffect(radius), color: "#f1ff8b" });
}

function applyMagnet() {
  const radius = getMagnetRadius(state.power);
  let movedProp = false;
  state.props.forEach((body) => {
    if (body.isStatic || !isMagneticBodyLabel(body.label)) {
      return;
    }
    const delta = Vector.sub(state.pointerCurrent, body.position);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 20);
    if (distance > radius) {
      return;
    }
    const pull = Vector.normalise(delta);
    const force = getMagnetForceMagnitude(state.power, body.mass, distance, radius);
    Body.applyForce(body, body.position, Vector.mult(pull, force));
    Body.setAngularVelocity(body, getMagnetAngularVelocity(body.angularVelocity, pull.x));
    movedProp = true;
  });
  if (movedProp && state.magnetCooldown <= 0) {
    addScore(getMagnetScore(state.power), "magnet", ["force", "magnet"]);
    state.magnetCooldown = getMagnetCooldown();
    setMood("Curious", 900);
  }
  addParticle({ type: "ring", kind: "magnet", x: state.pointerCurrent.x, y: state.pointerCurrent.y, ...getMagnetRingEffect(radius), color: "#e7a8ff" });
}

function updateRubberBlaster() {
  if (state.rubberCooldown > 0) {
    return;
  }
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = shouldUseLaunchDirection(Vector.magnitude(cursorVelocity), 1.4) ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  const pellet = createRubberPelletBody(Bodies, state.pointerCurrent, state.rubberBurstShots);
  pellet.plugin = { ...pellet.plugin, projectile: "rubber", born: performance.now() };
  Body.setVelocity(pellet, Vector.mult(aim, getRubberPelletSpeed(state.power)));
  registerProp(pellet);
  state.rubberBurstShots = incrementRubberBurstShots(state.rubberBurstShots);
  state.rubberBurstWindow = 1800;
  addScore(getRubberScore(state.power), "rubber", ["projectile", "blunt", "beadCannon"]);
  spawnBurst(state.pointerCurrent, "#f1ff8b", 3);
  state.rubberCooldown = getRubberCooldown(state.power);
}

function applyHeatCone() {
  const radius = getHeatConeRadius();
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.18) {
      return;
    }
    const falloff = getConeFalloff(distance, radius, cone);
    Body.applyForce(body, body.position, getHeatConeForce(dir, state.power, body.mass, falloff));
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    addParticle(getHeatConeParticle(state.pointerCurrent, aim, Math.random(), Math.random(), Math.random(), Math.random()));
  }

  if (touchedBuddy && state.heatConeCooldown <= 0) {
    addScore(getHeatConeScore(state.power), "heat", ["heat", "elemental", "fear"]);
    setMood("Afraid", 1000);
    state.heatConeCooldown = getHeatConeCooldown();
  }
}

function applySparkWand() {
  const target = getNearestBuddyBody(state.pointerCurrent, getSparkWandRange());
  if (!target) {
    if (shouldSpawnSparkWandIdleBurst(Math.random())) {
      spawnBurst(state.pointerCurrent, "#f1ff8b", 1);
    }
    return;
  }

  const away = Vector.normalise(Vector.sub(target.position, state.pointerCurrent));
  const jitter = getSparkWandJitter(away, Math.random(), Math.random());
  Body.applyForce(target, target.position, Vector.mult(Vector.normalise(jitter), getSparkWandForceMagnitude(target.mass)));
  Body.setAngularVelocity(target, getSparkWandAngularVelocity(target.angularVelocity, Math.random()));

  addParticle({
    type: "bolt",
    a: { ...state.pointerCurrent },
    b: { ...target.position },
    life: 120,
    maxLife: 120,
    color: "#f1ff8b"
  });

  if (state.sparkWandCooldown <= 0) {
    addScore(getSparkWandScore(state.power), "spark", ["shock", "elemental", "sparkWand", "stun"]);
    setMood("Stunned", 850, "zap!");
    state.sparkWandCooldown = getSparkWandCooldown();
  }
}

function applyFrostPuff() {
  const radius = getFrostPuffRadius();
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.12) {
      return;
    }
    const falloff = getConeFalloff(distance, radius, cone);
    Body.setVelocity(body, Vector.mult(body.velocity, getFrostVelocityScale(falloff)));
    Body.setAngularVelocity(body, body.angularVelocity * getFrostAngularVelocityScale(falloff));
    Body.applyForce(body, body.position, getFrostPuffForce(dir, state.power, body.mass, falloff));
    body.plugin = body.plugin || {};
    body.plugin.frostTime = extendTimer(body.plugin.frostTime, getFrostEffectDuration());
    if (!body.plugin.frostRestoreFill) {
      body.plugin.frostRestoreFill = body.render.fillStyle;
      body.plugin.frostRestoreStroke = body.render.strokeStyle;
    }
    body.render.fillStyle = "#dff8ff";
    body.render.strokeStyle = "#8edff0";
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    addParticle(getFrostPuffParticle(state.pointerCurrent, aim, Math.random(), Math.random(), Math.random(), Math.random()));
  }

  if (touchedBuddy && state.frostPuffCooldown <= 0) {
    addScore(getFrostPuffScore(state.power), "frost", ["cold", "elemental", "frostPuff", "stun"]);
    setMood("Surprised", 900, "brr!");
    state.frostPuffCooldown = getFrostPuffCooldown();
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
    body.plugin.frostTime = decrementTimer(body.plugin.frostTime, delta);
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
  const radius = getGooMistRadius();
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;
  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const cone = Vector.dot(dir, aim);
    if (cone < 0.1) {
      return;
    }
    const falloff = getConeFalloff(distance, radius, cone);
    const tangent = { x: -dir.y, y: dir.x };
    Body.applyForce(body, body.position, getGooMistForce(dir, tangent, state.power, body.mass, falloff));
    Body.setAngularVelocity(body, getGooAngularVelocity(body.angularVelocity, falloff));
    body.plugin = body.plugin || {};
    body.plugin.gooTime = extendTimer(body.plugin.gooTime, getGooEffectDuration());
    if (!body.plugin.gooRestoreFill) {
      body.plugin.gooRestoreFill = body.render.fillStyle;
      body.plugin.gooRestoreStroke = body.render.strokeStyle;
      body.plugin.gooRestoreFriction = body.friction;
      body.plugin.gooRestoreFrictionAir = body.frictionAir;
    }
    body.friction = getGooFriction(body.friction);
    body.frictionAir = getGooFrictionAir(body.frictionAir);
    body.render.fillStyle = "#d8ffd1";
    body.render.strokeStyle = "#67c66b";
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    addParticle(getGooMistParticle(state.pointerCurrent, aim, Math.random(), Math.random(), Math.random(), Math.random()));
  }

  if (touchedBuddy && state.gooMistCooldown <= 0) {
    addScore(getGooMistScore(state.power), "goo", ["goo", "slippery", "elemental", "gooMist"]);
    setMood("Curious", 950, "goo?");
    state.gooMistCooldown = getGooMistCooldown();
  }
}

function applyPulseBeam() {
  const radius = getPulseBeamRadius();
  const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
  const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
  let touchedBuddy = false;

  Composite.allBodies(state.buddy).forEach((body) => {
    const delta = Vector.sub(body.position, state.pointerCurrent);
    const distance = getDistanceWithMinimum(Vector.magnitude(delta), 8);
    if (distance > radius) {
      return;
    }
    const dir = Vector.normalise(delta);
    const alignment = Vector.dot(dir, aim);
    if (alignment < 0.72) {
      return;
    }
    const sideDistance = getPulseBeamSideDistance(delta, aim);
    if (sideDistance > 58) {
      return;
    }
    const falloff = getPulseBeamFalloff(distance, radius, alignment, sideDistance);
    Body.applyForce(body, body.position, getPulseBeamForce(aim, state.power, body.mass, falloff));
    Body.setAngularVelocity(body, getPulseAngularVelocity(body.angularVelocity, falloff));
    body.plugin = body.plugin || {};
    body.plugin.pulseTime = extendTimer(body.plugin.pulseTime, getPulseEffectDuration());
    if (!body.plugin.pulseRestoreFill) {
      body.plugin.pulseRestoreFill = body.render.fillStyle;
      body.plugin.pulseRestoreStroke = body.render.strokeStyle;
    }
    body.render.fillStyle = "#fff6b8";
    body.render.strokeStyle = "#f1ff8b";
    touchedBuddy = true;
  });

  for (let i = 0; i < 2; i += 1) {
    addParticle(getPulseBeamParticle(state.pointerCurrent, aim, Math.random(), Math.random(), Math.random(), Math.random()));
  }

  if (touchedBuddy && state.pulseBeamCooldown <= 0) {
    addScore(getPulseBeamScore(state.power), "pulse", ["light", "elemental", "pulseBeam", "force"]);
    setMood("Afraid", 850, "!");
    state.pulseBeamCooldown = getPulseBeamCooldown();
  }
}

function updatePulseBodies(delta) {
  if (!state.buddy) {
    return;
  }
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!body.plugin?.pulseTime) {
      return;
    }
    body.plugin.pulseTime = decrementTimer(body.plugin.pulseTime, delta);
    if (body.plugin.pulseTime > 0) {
      return;
    }
    if (body.plugin.pulseRestoreFill) {
      body.render.fillStyle = body.plugin.pulseRestoreFill;
    }
    if (body.plugin.pulseRestoreStroke) {
      body.render.strokeStyle = body.plugin.pulseRestoreStroke;
    }
    delete body.plugin.pulseTime;
    delete body.plugin.pulseRestoreFill;
    delete body.plugin.pulseRestoreStroke;
  });
}

function updateGooedBodies(delta) {
  if (!state.buddy) {
    return;
  }
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!body.plugin?.gooTime) {
      return;
    }
    body.plugin.gooTime = decrementTimer(body.plugin.gooTime, delta);
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

function updateSuctionBodies(delta) {
  if (!state.buddy) {
    return;
  }
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!body.plugin?.suctionTime) {
      return;
    }
    body.plugin.suctionTime = decrementTimer(body.plugin.suctionTime, delta);
    if (body.plugin.suctionTime === 0) {
      delete body.plugin.suctionTime;
    }
  });
}

function updateStarredBodies(delta) {
  if (!state.buddy) {
    return;
  }
  Composite.allBodies(state.buddy).forEach((body) => {
    if (!body.plugin?.starSpinTime) {
      return;
    }
    body.plugin.starSpinTime = decrementTimer(body.plugin.starSpinTime, delta);
    if (body.plugin.starSpinTime === 0) {
      if (body.plugin.starRestoreStroke) {
        body.render.strokeStyle = body.plugin.starRestoreStroke;
      }
      if (Number.isFinite(body.plugin.starRestoreLineWidth)) {
        body.render.lineWidth = body.plugin.starRestoreLineWidth;
      }
      delete body.plugin.starSpinTime;
      delete body.plugin.starRestoreStroke;
      delete body.plugin.starRestoreLineWidth;
    }
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
  const radius = getExplosionRadius(grenade.radius, state.power);
  const baseForce = getExplosionBaseForce(grenade.baseForce, state.power);
  const scoreBase = getExplosionScoreBase(grenade.scoreBase);
  const bodies = Composite.allBodies(engine.world);
  let hitBuddy = false;

  bodies.forEach((body) => {
    if (body === grenade.body || body.isStatic) {
      return;
    }
    const offset = Vector.sub(body.position, origin);
    const distance = getDistanceWithMinimum(Vector.magnitude(offset), 12);
    if (distance > radius) {
      return;
    }
    const falloff = getExplosionFalloff(distance, radius);
    const direction = Vector.normalise(offset);
    Body.applyForce(body, body.position, Vector.mult(direction, getExplosionForceMagnitude(baseForce, falloff, body.mass)));
    if (isBuddyBody(body)) {
      hitBuddy = true;
      addScore(getExplosionScore(scoreBase, falloff, state.power), "explosion", ["explosive", "heat", "loud"]);
    }
  });

  spawnBurst(origin, grenade.color || "#ffc857", getExplosionBurstCount(radius));
  if (!state.settings.reducedFlash) {
    addShake(grenade.shake || 18);
  }
  if (hitBuddy) {
    setMood("Afraid", 2400, "boom!");
  }
  recordMission("explosion", 1);
  if (grenade.tether) {
    World.remove(engine.world, grenade.tether);
  }
  removeProp(grenade.body);
}

function updateTesla(delta) {
  for (const coil of state.coils) {
    coil.pulse -= delta;
    if (coil.pulse > 0) {
      continue;
    }
    coil.pulse = getTeslaPulseInterval();
    const targets = Composite.allBodies(engine.world)
      .filter((body) => isBuddyBody(body) && Vector.magnitude(Vector.sub(body.position, coil.body.position)) < getTeslaRange())
      .slice(0, getTeslaTargetLimit());
    targets.forEach((body) => {
      const dir = Vector.normalise(Vector.sub(body.position, coil.body.position));
      Body.applyForce(body, body.position, Vector.mult(dir, getTeslaForceMagnitude(body.mass)));
      addScore(getTeslaScore(), "shock", ["shock", "stun"]);
      addParticle({
        type: "bolt",
        a: { ...coil.body.position },
        b: { ...body.position },
        life: 260,
        maxLife: 260,
        color: "#74f7ff"
      });
    });
    if (targets.length) {
      setMood("Stunned", 900, "zap!");
    }
  }
}

function updateBoomboxes(delta) {
  for (const boombox of state.boomboxes) {
    boombox.life -= delta;
    boombox.beat -= delta;
    if (boombox.life <= 0 || !state.props.includes(boombox.body)) {
      continue;
    }
    if (boombox.beat > 0) {
      continue;
    }
    boombox.beat = getBoomboxBeatInterval();
    let touchedBuddy = false;
    Composite.allBodies(state.buddy).forEach((body) => {
      const offset = Vector.sub(body.position, boombox.body.position);
      const distance = getDistanceWithMinimum(Vector.magnitude(offset), 16);
      const range = getBoomboxRange();
      if (distance > range) {
        return;
      }
      const falloff = getBoomboxFalloff(distance, range);
      const side = getBoomboxSide(body.position.x, boombox.body.position.x);
      const pulse = getBoomboxPulseForce(side, falloff, body.mass);
      Body.applyForce(body, body.position, pulse);
      Body.setAngularVelocity(body, getBoomboxAngularVelocity(body.angularVelocity, side, falloff));
      touchedBuddy = true;
    });
    spawnMusicNotes(boombox.body.position, getBoomboxNoteCount(touchedBuddy));
    addScore(getBoomboxScore(touchedBuddy), "boombox", ["boombox", "music", "happy", "nice"]);
    if (touchedBuddy) {
      setMood("Happy", 1100);
    }
  }
  state.boomboxes = state.boomboxes.filter((boombox) => boombox.life > 0 && state.props.includes(boombox.body));
}

function updateConveyors(delta) {
  const conveyors = state.props.filter((body) => body.label === "conveyor");
  if (!conveyors.length) {
    return;
  }
  let touchedBuddy = false;
  conveyors.forEach((conveyor) => {
    const direction = conveyor.plugin?.conveyorDirection || 1;
    const halfWidth = 98;
    Composite.allBodies(engine.world).forEach((body) => {
      if (body === conveyor || body.isStatic) {
        return;
      }
      const dx = body.position.x - conveyor.position.x;
      const dy = body.position.y - conveyor.position.y;
      if (!shouldConveyorAffectBody(dx, dy, halfWidth)) {
        return;
      }
      Body.applyForce(body, body.position, getConveyorForce(direction, state.power, body.mass));
      touchedBuddy = touchedBuddy || isBuddyBody(body);
    });
    conveyor.plugin.conveyorPhase = advanceConveyorPhase(conveyor.plugin.conveyorPhase || 0, delta, direction);
  });
  if (touchedBuddy && state.conveyorCooldown <= 0) {
    addScore(getConveyorScore(), "conveyor", ["force", "conveyor"]);
    state.conveyorCooldown = getConveyorCooldown();
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
    const submersion = getLiquidSubmersion(depth);
    const buoyancy = getLiquidBuoyancyForce(liquid.buoyancy, body.mass, submersion, state.power);
    const dragX = getLiquidDragForce(body.velocity.x, liquid.dragX, body.mass, submersion, 0.000035);
    const dragY = getLiquidDragForce(body.velocity.y, liquid.dragY, body.mass, submersion, 0.000018);
    Body.applyForce(body, body.position, { x: dragX, y: buoyancy + dragY });
    Body.setAngularVelocity(body, body.angularVelocity * getLiquidAngularDampingFactor(delta, liquid.angularDamping, submersion));
    body.friction = getLiquidFriction(state.liquid.type, body.friction, body.plugin.baseFriction);
    if (isBuddyBody(body)) {
      touchedBuddy = true;
    }
  }
  if (touchedBuddy && state.liquidScoreCooldown <= 0) {
    addScore(getLiquidScore(), "liquid", [state.liquid.type, "force"]);
    state.liquidScoreCooldown = getLiquidScoreCooldown();
    setMood(liquid.mood, 900);
  }
}

function updateParticles(delta) {
  if (!state.settings.particles) {
    state.particles = [];
    return;
  }
  state.particles.forEach((particle) => {
    particle.life = advanceTimedEffectLife(particle.life, delta);
    if (particle.type === "spark" || particle.type === "music") {
      const position = getParticlePositionAfterDelta(particle, particle, delta);
      particle.x = position.x;
      particle.y = position.y;
      particle.vy = getParticleVelocityYAfterGravity(particle.vy, particle.type, delta);
    }
  });
  state.particles = state.particles.filter((particle) => shouldKeepTimedEffect(particle.life));
  const now = performance.now();
  state.decals = state.decals.filter((decal) => shouldKeepDecal(now, decal.time));
}

function updateAirborne(delta) {
  const now = performance.now();
  if (shouldSkipAirborneForSpawnGrace(now, state.spawnGraceUntil)) {
    return;
  }
  const sinceFloor = now - state.lastFloorContact;
  if (shouldAwardAirborne(sinceFloor, state.torso?.position.y, FLOOR_Y)) {
    const airborne = advanceAirborneBank(state.airborneBank, delta);
    state.airborneBank = airborne.bank;
    if (airborne.seconds > 0) {
      const seconds = airborne.seconds;
      addScore(getAirborneScore(seconds), "airborne", ["juggle", "force"]);
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
  const nearFloor = isNearFloor(state.torso.position.y, FLOOR_Y);
  if (shouldApplySelfRighting(tilt, state.torso.angularVelocity)) {
    Body.setAngularVelocity(state.torso, getSelfRightingAngularVelocity(state.torso.angularVelocity, tilt, delta));
    if (nearFloor) {
      Body.applyForce(state.torso, state.torso.position, getSelfRightingForce(tilt, state.torso.mass));
    }
  }
}

function recoverBuddyFromWalls() {
  const now = performance.now();
  if (!state.buddy || shouldSkipWallRecovery(now, state.wallRecoveryCooldown)) {
    return;
  }
  const bodies = Composite.allBodies(state.buddy);
  if (!bodies.length) {
    return;
  }
  const offset = getWallRecoveryOffset(
    getCombinedBounds(bodies),
    { width: STAGE_WIDTH, height: STAGE_HEIGHT }
  );
  if (!offset.x && !offset.y) {
    return;
  }
  Composite.translate(state.buddy, offset);
  bodies.forEach((body) => {
    Body.setVelocity(body, {
      x: getRecoveredVelocityComponent(body.velocity.x),
      y: getRecoveredVelocityComponent(body.velocity.y)
    });
  });
  state.wallRecoveryCooldown = getNextWallRecoveryCooldown(now);
}

function tickleAt(position) {
  const target = getBuddyAt(position);
  if (!target) {
    return;
  }
  const impulse = Vector.mult(Vector.normalise(Vector.sub(target.position, position)), getTickleImpulseMagnitude(target.mass));
  Body.applyForce(target, target.position, impulse);
  addScore(getTickleScore(), "tickle", ["tickle", "happy"]);
  recordMission("happy", 1);
  setMood("Happy", 1800, "ha!");
  spawnBurst(position, "#f1ff8b", 8);
}

function pokeAt(position) {
  const target = getBuddyAt(position);
  if (!target) {
    return;
  }
  const offset = Vector.sub(target.position, position);
  const direction = getDirectionOrFallback(offset, { x: 0, y: -1 });
  Body.applyForce(target, target.position, Vector.mult(direction, getPokeImpulseMagnitude(target.mass)));
  Body.setAngularVelocity(target, getSpinAngularVelocity(target.angularVelocity, getHorizontalSpinSign(direction), 0.08));
  addScore(getPokeScore(), "poke", ["poke", "hand", "basic"]);
  recordMission("impact", 1);
  setMood("Surprised", 900, "?");
  spawnBurst(position, "#ffc857", 5);
}

function slapAt(start, end) {
  const target = getBuddyAt(end);
  if (!target) {
    return;
  }
  const drag = Vector.sub(end, start);
  const fallback = Vector.sub(target.position, start);
  const direction = getDirectionOrFallback(Vector.magnitude(drag) > 2 ? drag : fallback, { x: 1, y: 0 });
  Body.applyForce(target, target.position, Vector.mult(direction, getSlapImpulseMagnitude(target.mass)));
  Body.setAngularVelocity(target, getSpinAngularVelocity(target.angularVelocity, getHorizontalSpinSign(direction), 0.22));
  addScore(getSlapScore(), "slap", ["slap", "hand", "basic", "blunt"]);
  recordMission("impact", 1);
  setMood("Angry", 1200, "hey!");
  spawnBurst(end, "#ff8d66", 9);
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
    if (shouldReplaceNearest(distance, bestDistance)) {
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
    if (shouldReplaceNearest(distance, bestDistance)) {
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
  const antiGrind = getScoreAntiGrind(heat);
  state.toolHeat.set(heatKey, incrementToolHeat(heat));
  const multiplier = getComboMultiplier(state.comboCount);
  const reward = calculateReward(baseValue, multiplier, antiGrind);
  const xpGain = calculateXpGain(reward);

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
  recordChallenge(reason, getChallengeRecordAmount(reason, baseValue));

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

function playScoreFeedback(reason, reward, tags = []) {
  const intensity = getFeedbackIntensity(reward);
  const playback = getFeedbackPlayback(reason);
  if (playback) {
    feedback.play(playback.sound, playback.useSelectIntensity ? 0.5 : intensity);
  }

  const pattern = getFeedbackPulsePattern(reason, reward, tags);
  if (pattern) {
    pulse(pattern);
  }
}

function pulse(pattern) {
  if (!canUseHaptics(state.settings.haptics, Boolean(navigator.vibrate), navigator.userActivation)) {
    return;
  }
  navigator.vibrate(pattern);
}

function recordMission(event, amount) {
  challengeFlow.recordMission(event, amount);
}

function updateHud() {
  const hudCore = getHudCorePresentation({
    cash: state.cash,
    xp: state.xp,
    comboCount: state.comboCount,
    comboTimer: state.comboTimer,
    comboWindowMs: COMBO_WINDOW_MS,
    power: state.power
  });
  const moodView = getMoodHudPresentation(state.mood);
  hud.cash.textContent = hudCore.cash;
  hud.xp.textContent = hudCore.xp;
  hud.combo.textContent = hudCore.combo;
  hud.mood.textContent = moodView.mood;
  hud.challenge.textContent = getChallengeLabel();
  hud.face.textContent = moodView.face;
  hud.powerReadout.textContent = hudCore.power;
  if (hud.toolMeta) {
    hud.toolMeta.textContent = getToolMetaLabel();
  }
  hud.comboFill.style.width = `${hudCore.comboFillPercent}%`;
}

function getToolMetaLabel() {
  const tool = getTool(state.tool);
  return getRuntimeToolMetaLabel({
    toolId: state.tool,
    toolCategory: tool?.category,
    pointerDown: state.pointerDown,
    rubberCooldown: state.rubberCooldown,
    rubberBurstShots: state.rubberBurstShots
  });
}

function getChallengeLabel() {
  return challengeFlow.getChallengeLabel();
}

function setMood(nextMood, duration = 1500, bubble = "") {
  state.mood = nextMood;
  state.moodTimer = duration;
  state.moodBubble = duration > 0 ? getMoodBubbleText(nextMood, bubble) : "";
  updateHud();
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
    const parsed = parseImportedAssetPackText(text);
    if (parsed.status !== "ready") {
      toast(getAssetPackImportToast("failed"));
      return;
    }
    const imported = assetPackFlow.importAssetPack(parsed.pack, parsed.pack);
    if (!imported.registered) {
      toast(getAssetPackImportToast("duplicate", imported.pack.name));
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
    toast(getAssetPackImportToast("imported", imported.pack.name));
  } catch {
    toast(getAssetPackImportToast("failed"));
  }
}

function toast(message) {
  const toastView = getToastPresentation(message);
  hud.toast.textContent = toastView.message;
  hud.toast.classList.add(toastView.visibleClass);
  state.toastTimer = toastView.timerMs;
}

function applySkin() {
  if (!state.buddy) {
    return;
  }
  const skin = getSkin();
  const physics = getSkinPhysics(skin.id);
  Composite.allBodies(state.buddy).forEach((body) => {
    const render = getSkinBodyRender(skin, body.label);
    body.render.fillStyle = render.fillStyle;
    body.render.strokeStyle = render.strokeStyle;
    body.render.lineWidth = render.lineWidth;
    body.render.sprite = render.sprite;
    applySkinPhysics(body, physics);
  });
}

function getSkinPhysics(skinId) {
  return getRuntimeSkinPhysics(skinId);
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
  const applied = getAppliedSkinPhysics(base, physics);
  Body.setDensity(body, applied.density);
  body.frictionAir = applied.frictionAir;
  body.restitution = applied.restitution;
  body.plugin.physicsVariant = applied.label;
}

function clearBuddyHighlight() {
  if (!state.buddy) {
    return;
  }
  const skin = getSkin();
  Composite.allBodies(state.buddy).forEach((body) => {
    const render = getSkinBodyRender(skin, body.label);
    if (!skin.texture) {
      body.render.fillStyle = render.fillStyle;
    }
    body.render.strokeStyle = render.strokeStyle;
    body.render.lineWidth = render.lineWidth;
  });
}

function getSkin() {
  return getRuntimeSkin(SKIN_DEFS, state.selectedSkin);
}

function getTool(toolId) {
  return getRuntimeTool(TOOL_DEFS, toolId);
}

function getAssetPack(packId = state.settings.assetPack) {
  return resolveAssetPack(state.assetPacks, packId);
}

function applyRoomPack() {
  const pack = getAssetPack();
  applyUiTheme(pack.uiTheme);
  const room = getRoomApplyPresentation(pack.room);
  render.options.background = room.background;
  canvas.style.background = room.background;
  canvas.style.backgroundSize = room.backgroundSize;
  canvas.style.backgroundPosition = "center";
  canvas.style.backgroundRepeat = "no-repeat";
  canvas.parentElement.style.background = room.background;
  canvas.parentElement.style.backgroundSize = room.backgroundSize;
  canvas.parentElement.style.backgroundPosition = "center";
  canvas.parentElement.style.backgroundRepeat = "no-repeat";
  if (state.floorBody) {
    state.floorBody.render.fillStyle = room.floor;
  }
  if (state.ceilingBody) {
    state.ceilingBody.render.fillStyle = room.floor;
  }
}

function applyUiTheme(uiTheme = {}) {
  const variables = uiTheme.variables || {};
  UI_THEME_VARIABLES.forEach((variableName) => {
    document.documentElement.style.removeProperty(variableName);
  });
  Object.entries(variables).forEach(([variableName, value]) => {
    if (UI_THEME_VARIABLES.includes(variableName) && typeof value === "string") {
      document.documentElement.style.setProperty(variableName, value);
    }
  });
}

function applyModeSettings() {
  engine.timing.timeScale = getSlowMoTimeScale(state.settings.slowMo);
  engine.gravity.y = getGravityMode().value;
  if (state.ceilingBody) {
    Body.setPosition(state.ceilingBody, {
      x: STAGE_WIDTH / 2,
      y: getCeilingY(state.settings.ceilingOpen)
    });
  }
}

function getGravityMode() {
  return getGravityModeConfig(state.settings.gravityMode);
}

function getLiquidType() {
  return resolveLiquidType(LIQUID_TYPES, state.liquid.type);
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

function clearObjects(showToast = true) {
  state.grenades.forEach((grenade) => {
    if (grenade.tether) {
      World.remove(engine.world, grenade.tether);
    }
  });
  state.props.forEach((body) => World.remove(engine.world, body));
  state.props = [];
  state.grenades = [];
  state.coils = [];
  state.boomboxes = [];
  state.ropes.forEach((rope) => World.remove(engine.world, rope));
  state.ropes = [];
  state.particles = [];
  state.decals = [];
  state.aimVector = null;
  feedback.stopWind();
  mouseConstraint.constraint.bodyB = null;
  if (showToast) {
    toast(getHudActionToast("objectsCleared"));
    updateHud();
  }
}

function resetBuddy() {
  feedback.stopWind();
  mouseConstraint.constraint.bodyB = null;
  state.grabbedBody = null;
  state.aimVector = null;
  spawnNewBuddy();
  toast(getHudActionToast("buddyReset"));
  updateHud();
}

function resetScene() {
  clearObjects(false);
  state.liquid.enabled = false;
  state.liquid.level = FLOOR_Y - 120;
  state.liquid.type = state.settings.liquidType;
  state.replayLog = [];
  state.comboCount = 0;
  state.comboTimer = 0;
  state.toolHeat.clear();
  state.usedTags.clear();
  state.sessionCash = 0;
  spawnNewBuddy();
  toast(getHudActionToast("sceneReset"));
  updateHud();
}

function savePreset() {
  const preset = createScenePreset(state.liquid, state.props);
  localStorage.setItem(SCENE_PRESET_KEY, JSON.stringify(preset));
  toast(getScenePresetSaveToast());
}

function loadPreset() {
  const stored = parseStoredScenePreset(localStorage.getItem(SCENE_PRESET_KEY));
  if (stored.status !== "ready") {
    toast(getScenePresetLoadToast(stored.status));
    return;
  }
  resetScene();
  const preset = stored.preset;
  state.liquid = { ...state.liquid, ...(preset.liquid || {}) };
  state.liquid.type = getSelectedLiquidTypeId(LIQUID_TYPES, state.liquid.type, state.settings.liquidType);
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
  toast(getScenePresetLoadToast(stored.status));
}

function resetProgress() {
  const confirmed = window.confirm("Reset all local progress, unlocks, settings, and saved scene preset?");
  if (!confirmed) {
    return;
  }

  const customPackIds = new Set(state.customAssetPacks.map((pack) => pack.id));
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SCENE_PRESET_KEY);

  state.cash = DEFAULT_CASH;
  state.xp = 0;
  state.sessionCash = 0;
  state.comboCount = 0;
  state.comboTimer = 0;
  state.unlockedTools = new Set(DEFAULT_UNLOCKED_TOOLS);
  state.unlockedSkins = new Set(DEFAULT_UNLOCKED_SKINS);
  state.selectedSkin = DEFAULT_SKIN;
  state.tool = DEFAULT_TOOL;
  state.mood = "Calm";
  state.moodTimer = 0;
  state.moodBubble = "";
  state.toolHeat.clear();
  state.usedTags.clear();
  state.challenge.bests = {};
  state.challenge.lastResult = null;
  state.customAssetPacks = [];
  state.assetPacks = state.assetPacks.filter((pack) => !customPackIds.has(pack.id));
  for (let index = SKIN_DEFS.length - 1; index >= 0; index -= 1) {
    if (customPackIds.has(SKIN_DEFS[index].assetPack)) {
      SKIN_DEFS.splice(index, 1);
    }
  }
  Object.entries(AUDIO_PACKS).forEach(([audioId, pack]) => {
    if (customPackIds.has(pack.assetPack)) {
      delete AUDIO_PACKS[audioId];
    }
  });

  state.settings = { ...DEFAULT_SETTINGS };
  state.liquid.type = state.settings.liquidType;
  feedback.stopWind();
  mouseConstraint.constraint.bodyB = null;
  mouseConstraint.collisionFilter.mask = getMouseConstraintConfig(DEFAULT_TOOL).mask;
  mouseConstraint.constraint.stiffness = getMouseConstraintConfig(DEFAULT_TOOL).stiffness;

  buildAssetPackUi();
  buildAudioPackUi();
  buildMenus();
  buildToolUi();
  renderShop();
  renderRoomPreview();
  syncSettingsControls();
  applyRoomPack();
  applyModeSettings();
  resetScene();
  applySkin();
  chooseMissions();
  startChallenge("free", false);
  selectTool(DEFAULT_TOOL);
  updateModeButtonStates();
  updateFpsCounterVisibility();
  saveGame();
  toast(getProgressResetToast());
}

function toggleCeiling() {
  state.settings.ceilingOpen = !state.settings.ceilingOpen;
  Body.setPosition(state.ceilingBody, {
    x: STAGE_WIDTH / 2,
    y: getCeilingY(state.settings.ceilingOpen)
  });
  toast(getCeilingToggleToast(state.settings.ceilingOpen));
  updateModeButtonStates();
  saveGame();
}

function toggleSlowMo() {
  state.settings.slowMo = !state.settings.slowMo;
  engine.timing.timeScale = getSlowMoTimeScale(state.settings.slowMo);
  toast(getSlowMoToggleToast(state.settings.slowMo));
  updateModeButtonStates();
  saveGame();
}

function setGravityMode(modeId) {
  state.settings.gravityMode = normalizeGravityMode(modeId);
  engine.gravity.y = getGravityMode().value;
  updateModeButtonStates();
  toast(getGravityModeToast(state.settings.gravityMode));
  saveGame();
}

function toggleFpsCounter() {
  state.settings.fpsCounter = !state.settings.fpsCounter;
  state.fpsValue = 0;
  state.fpsFrames = 0;
  state.fpsElapsed = 0;
  updateFpsCounterVisibility();
  toast(getFpsCounterToggleToast(state.settings.fpsCounter));
  saveGame();
}

function updateFpsCounter(delta) {
  if (!state.settings.fpsCounter || !hud.fpsCounter) {
    return;
  }
  const fpsSample = getFpsSamplePresentation(state.fpsFrames, state.fpsElapsed, delta);
  state.fpsFrames = fpsSample.frames;
  state.fpsElapsed = fpsSample.elapsed;
  if (fpsSample.value !== undefined && fpsSample.label !== undefined) {
    state.fpsValue = fpsSample.value;
    hud.fpsCounter.textContent = fpsSample.label;
  }
}

function updateFpsCounterVisibility() {
  if (!hud.fpsCounter) {
    return;
  }
  const fpsCounter = getFpsCounterPresentation(state.settings.fpsCounter, state.fpsValue);
  hud.fpsCounter.classList.toggle("fps-counter--visible", fpsCounter.visible);
  hud.fpsCounter.textContent = fpsCounter.label;
}

function toggleDebugPhysics() {
  state.settings.debugPhysics = !state.settings.debugPhysics;
  updateModeButtonStates();
  toast(state.settings.debugPhysics ? "Physics debug on." : "Physics debug off.");
  saveGame();
}

function updateModeButtonStates() {
  const modeButtons = getBooleanModeButtonStates(state.settings);
  controls.ceiling?.setAttribute("aria-pressed", modeButtons.ceiling.ariaPressed);
  controls.slowMo?.setAttribute("aria-pressed", modeButtons.slowMo.ariaPressed);
  controls.debugPhysics?.setAttribute("aria-pressed", state.settings.debugPhysics ? "true" : "false");
  controls.debugPhysics?.classList.toggle("is-active", state.settings.debugPhysics);
  controls.gravityModes.forEach((button) => {
    const buttonState = getGravityModeButtonState(button.dataset.gravityMode, state.settings.gravityMode);
    button.setAttribute("aria-pressed", buttonState.ariaPressed);
    button.classList.toggle("is-active", buttonState.active);
  });
}

function addParticle(particle) {
  if (state.settings.particles) {
    state.particles.push(particle);
  }
}

function spawnBurst(position, color, count) {
  for (let i = 0; i < count; i += 1) {
    addParticle(getBurstParticle(position, color, Math.random(), Math.random(), Math.random(), Math.random()));
  }
}

function spawnConfettiBurst(position, count) {
  const colors = ["#ffd06a", "#55d9cf", "#e46e5f", "#98f17f", "#e7a8ff"];
  for (let i = 0; i < count; i += 1) {
    addParticle(getConfettiBurstParticle(position, colors[i % colors.length], Math.random(), Math.random(), Math.random(), Math.random()));
  }
}

function spawnMusicNotes(position, count) {
  const colors = ["#ffc857", "#55d9cf", "#f6f1d0"];
  for (let i = 0; i < count; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    addParticle(getMusicNoteParticle(position, colors[i % colors.length], side, Math.random(), Math.random(), Math.random(), Math.random(), Math.random()));
  }
}

function spawnMoneySparkles(position, count) {
  const colors = ["#98f17f", "#f1ff8b", "#d8ffd1"];
  for (let i = 0; i < count; i += 1) {
    addParticle(getMoneySparkleParticle(position, colors[i % colors.length], Math.random(), Math.random(), Math.random(), Math.random(), Math.random()));
  }
}

function spawnTreatCrumbs(position, count) {
  const colors = ["#d89b5f", "#fff4d7", "#7a4a2e"];
  for (let i = 0; i < count; i += 1) {
    addParticle(getTreatCrumbParticle(position, colors[i % colors.length], Math.random(), Math.random(), Math.random(), Math.random()));
  }
}

function addShake(amount) {
  if (!state.settings.cameraShake) {
    return;
  }
  state.shake = increaseShakeAmount(state.shake, amount);
}

function drawOverlayEffects() {
  const ctx = render.context;
  ctx.save();

  if (state.shake > 0 && state.settings.cameraShake && !state.settings.reducedFlash) {
    const offset = getShakeOffset(Math.random(), Math.random(), state.shake);
    canvas.style.transform = getShakeTransform(offset);
  } else {
    canvas.style.transform = "";
  }

  drawRoomDetails(ctx);
  drawLiquid(ctx);
  drawClassicBuddyOverlay(ctx);
  drawReactionBubble(ctx);
  drawAim(ctx);
  drawToolFields(ctx);
  drawPropCosmetics(ctx);
  drawParticles(ctx);
  drawPhysicsDebug(ctx);
  ctx.restore();
}

function drawReactionBubble(ctx) {
  if (!state.buddy || state.mood === "Calm") {
    return;
  }
  const head = Composite.allBodies(state.buddy).find((body) => body.label === "buddy_head");
  if (!head) {
    return;
  }
  const bubble = getReactionBubblePresentation({
    mood: state.mood,
    timerMs: state.moodTimer,
    anchorX: head.position.x,
    anchorY: head.position.y,
    stageWidth: STAGE_WIDTH,
    stageHeight: STAGE_HEIGHT,
    text: state.moodBubble
  });
  if (!bubble.visible) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = bubble.alpha;
  ctx.fillStyle = "#fbfbf2";
  ctx.strokeStyle = "#48534c";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, bubble.radius);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bubble.x + bubble.pointerX - 6, bubble.y + bubble.height - 1);
  ctx.lineTo(bubble.x + bubble.pointerX + 5, bubble.y + bubble.height - 1);
  ctx.lineTo(head.position.x, bubble.y + bubble.height + 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2f3933";
  ctx.font = "bold 13px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(bubble.text, bubble.x + bubble.width / 2, bubble.y + bubble.height / 2 + 0.5);
  ctx.restore();
}

function drawRoomDetails(ctx) {
  const room = getAssetPack().room;
  const isPlainRoom = room?.motif === "plain";
  ctx.globalAlpha = isPlainRoom ? 0.055 : 0.16;
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
  ctx.globalAlpha = isPlainRoom ? 0.06 : 0.08;
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
    const y = getLiquidWaveY(state.liquid.level, time, x);
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
    const y = getLiquidWaveY(state.liquid.level, time, x);
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

  const geometry = getClassicPartRenderGeometry(part, isHead);
  const fill = ctx.createRadialGradient(
    geometry.gradientFocusX,
    geometry.gradientFocusY,
    geometry.gradientInnerRadius,
    0,
    0,
    geometry.gradientOuterRadius
  );
  fill.addColorStop(0, "#f7fbf7");
  fill.addColorStop(0.38, "#d4ddd7");
  fill.addColorStop(0.78, "#8c9991");
  fill.addColorStop(1, "#57635d");
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#3d4842";
  ctx.lineWidth = geometry.lineWidth;

  if (part.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, geometry.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.roundRect(-part.width / 2, -part.height / 2, part.width, part.height, geometry.radius);
    ctx.fill();
    ctx.stroke();
  }

  ctx.globalAlpha = 0.42;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(geometry.highlightX, geometry.highlightY, geometry.highlightRadiusX, geometry.highlightRadiusY, -0.55, 0, Math.PI * 2);
  ctx.fill();

  if (isHead) {
    drawClassicBuddyFace(ctx, geometry.radius);
  }
  ctx.restore();
}

function drawClassicBuddyFace(ctx, radius) {
  const face = getMoodFace(state.mood);
  const geometry = getClassicFaceRenderGeometry(radius, state.mood, face);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#5e6962";
  ctx.fillStyle = "#5e6962";
  ctx.lineWidth = 1.7;

  if (geometry.useXEyes) {
    drawXEye(ctx, geometry.eyeLeftX, geometry.eyeY, geometry.xEyeSize);
    drawXEye(ctx, geometry.eyeRightX, geometry.eyeY, geometry.xEyeSize);
  } else {
    ctx.beginPath();
    ctx.arc(geometry.eyeLeftX, geometry.eyeY, geometry.dotEyeRadius, 0, Math.PI * 2);
    ctx.arc(geometry.eyeRightX, geometry.eyeY, geometry.dotEyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(geometry.mouthX, geometry.mouthY, geometry.mouthRadius, geometry.mouthStartAngle, geometry.mouthEndAngle);
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
  ctx.strokeStyle = state.tool === "paintball" || state.tool === "foamdart" || state.tool === "corkpopper" || state.tool === "plunger" || state.tool === "starshot" || state.tool === "cannonball" ? "#ffc857" : "#e8f7f4";
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
  if ((state.tool === "vacuum" || state.tool === "repulsor" || state.tool === "magnet") && state.pointerDown) {
    const color = state.tool === "vacuum" ? "#55d9cf" : state.tool === "repulsor" ? "#f1ff8b" : "#e7a8ff";
    const phase = performance.now() / 120;
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = color;
    ctx.lineWidth = state.tool === "repulsor" ? 5 : 3;
    for (let index = 0; index < 3; index += 1) {
      const radius = 38 + index * 42 + Math.sin(phase + index) * 5;
      ctx.beginPath();
      ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (state.tool === "vacuum") {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(state.pointerCurrent.x, state.pointerCurrent.y, 165, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (state.tool === "heatcone" && state.pointerDown) {
    const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
    const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
    const angle = getVectorAngle(aim);
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
    const angle = getVectorAngle(aim);
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
    const angle = getVectorAngle(aim);
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
  if (state.tool === "pulsebeam" && state.pointerDown) {
    const cursorVelocity = Vector.sub(state.pointerCurrent, state.pointerPrevious);
    const aim = Vector.magnitude(cursorVelocity) > 1.5 ? Vector.normalise(cursorVelocity) : { x: 1, y: 0 };
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#fff27a";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(state.pointerCurrent.x, state.pointerCurrent.y);
    ctx.lineTo(state.pointerCurrent.x + aim.x * 240, state.pointerCurrent.y + aim.y * 240);
    ctx.stroke();
    ctx.globalAlpha = 0.48;
    ctx.strokeStyle = "#f1ff8b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(state.pointerCurrent.x, state.pointerCurrent.y);
    ctx.lineTo(state.pointerCurrent.x + aim.x * 285, state.pointerCurrent.y + aim.y * 285);
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
    if (drawPrivateToolTexture(ctx, body, cosmetic)) {
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
    } else if (cosmetic.type === "crate-cross") {
      drawCrateCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "stage-weight-anvil") {
      drawAnvilCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "foam-dart") {
      drawFoamDartCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "cork-popper") {
      drawCorkCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "plunger-shot") {
      drawPlungerCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "star-shot") {
      drawStarCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "cannonball-iron") {
      drawCannonballCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "ball-basic") {
      drawBallCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "trampoline-pad") {
      drawTrampolineCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "platform-plank") {
      drawPlatformCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "bumper-ring") {
      drawBumperCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "conveyor-belt") {
      drawConveyorCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "gift-box") {
      drawGiftCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "money-drop") {
      drawMoneyDropCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "treat-cookie") {
      drawTreatCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "confetti-popper") {
      drawConfettiPopperCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "boombox") {
      drawBoomboxCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "tesla-coil") {
      drawTeslaCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "grenade-shell") {
      drawGrenadeCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "firecracker-tube") {
      drawFirecrackerCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "mine-button") {
      drawMineCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "sticky-bomb") {
      drawStickyBombCosmetic(ctx, body, cosmetic);
    } else if (cosmetic.type === "large-cartoon-bomb") {
      drawLargeBombCosmetic(ctx, body, cosmetic);
    }
  }
}

function drawPrivateToolTexture(ctx, body, cosmetic) {
  const texture = getPrivateToolTexture(body, cosmetic);
  if (!texture) {
    return false;
  }
  const image = getToolTextureImage(texture.src);
  if (!image || !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    return false;
  }
  const bounds = body.bounds || {
    min: { x: body.position.x - 20, y: body.position.y - 20 },
    max: { x: body.position.x + 20, y: body.position.y + 20 }
  };
  const boundsWidth = Math.max(1, bounds.max.x - bounds.min.x);
  const boundsHeight = Math.max(1, bounds.max.y - bounds.min.y);
  const scale = texture.scale || 1;
  const width = (texture.width > 0 ? texture.width : boundsWidth) * scale;
  const height = (texture.height > 0 ? texture.height : boundsHeight) * scale;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle + (texture.rotationOffset || 0));
  ctx.globalAlpha *= Math.max(0, Math.min(1, texture.alpha ?? 1));
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}

function getPrivateToolTexture(body, cosmetic) {
  const textures = getAssetPack().toolTextures || {};
  return textures[cosmetic.type] || textures[body.label] || null;
}

function getToolTextureImage(src) {
  if (!src || typeof Image === "undefined") {
    return null;
  }
  const cached = toolTextureImageCache.get(src);
  if (cached) {
    return cached;
  }
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  toolTextureImageCache.set(src, image);
  return image;
}

function drawBallCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 18;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.shine;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  const shine = getCircularCosmeticArc(radius, -0.35, -0.42, 0.18);
  ctx.arc(shine.x, shine.y, shine.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = cosmetic.rim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.78, 0.25, Math.PI * 1.1);
  ctx.stroke();
  ctx.restore();
}

function drawTrampolineCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.stripe;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-62, -3);
  ctx.lineTo(62, -3);
  ctx.stroke();
  ctx.strokeStyle = cosmetic.spring;
  ctx.lineWidth = 1.5;
  for (let x = -56; x <= 56; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x - 6, 7);
    ctx.lineTo(x + 6, 7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlatformCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.stripe;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-76, -3);
  ctx.lineTo(76, -3);
  ctx.moveTo(-76, 4);
  ctx.lineTo(76, 4);
  ctx.stroke();
  ctx.fillStyle = cosmetic.rivet;
  for (let x = -68; x <= 68; x += 34) {
    ctx.beginPath();
    ctx.arc(x, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBumperCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.ring;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = cosmetic.core;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cosmetic.bolt;
  for (let i = 0; i < 4; i += 1) {
    const bolt = getCosmeticPolarPoint((Math.PI / 2) * i + Math.PI / 4, 16);
    ctx.beginPath();
    ctx.arc(bolt.x, bolt.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawConveyorCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.belt;
  ctx.fillRect(-84, -7, 168, 14);
  ctx.strokeStyle = cosmetic.roller;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-78, 0, 7, 0, Math.PI * 2);
  ctx.arc(78, 0, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = cosmetic.arrow;
  const direction = body.plugin?.conveyorDirection || 1;
  const phase = body.plugin?.conveyorPhase || 0;
  for (let x = -54; x <= 54; x += 36) {
    const shifted = ((x + phase + 90) % 180) - 90;
    ctx.beginPath();
    ctx.moveTo(shifted + 8 * direction, 0);
    ctx.lineTo(shifted - 4 * direction, -5);
    ctx.lineTo(shifted - 4 * direction, 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGiftCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.ribbon;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-17, 0);
  ctx.lineTo(17, 0);
  ctx.moveTo(0, -17);
  ctx.lineTo(0, 17);
  ctx.stroke();
  ctx.fillStyle = cosmetic.bow;
  ctx.beginPath();
  ctx.ellipse(-6, -20, 6, 4, -0.35, 0, Math.PI * 2);
  ctx.ellipse(6, -20, 6, 4, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMoneyDropCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.bill;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(-17, -9, 34, 18);
  ctx.strokeStyle = cosmetic.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-17, -9, 34, 18);
  ctx.strokeStyle = cosmetic.band;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 12);
  ctx.stroke();
  ctx.fillStyle = cosmetic.ink;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 8, 0);
  ctx.restore();
}

function drawTreatCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 17;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.icing;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  const icing = getCircularCosmeticArc(radius, -0.2, -0.18, 0.45);
  ctx.arc(icing.x, icing.y, icing.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = cosmetic.chip;
  for (let index = 0; index < 5; index += 1) {
    const chip = getCosmeticPolarPoint(index * 1.7, radius * 0.45, radius * 0.42);
    ctx.beginPath();
    ctx.arc(chip.x, chip.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = cosmetic.crumb;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0.2, Math.PI * 1.3);
  ctx.stroke();
  ctx.restore();
}

function drawConfettiPopperCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.rim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -10);
  ctx.lineTo(18, -10);
  ctx.stroke();
  ctx.fillStyle = cosmetic.stripe;
  ctx.fillRect(-14, -4, 28, 6);
  ctx.fillStyle = cosmetic.cap;
  ctx.beginPath();
  ctx.moveTo(16, -13);
  ctx.lineTo(28, -4);
  ctx.lineTo(16, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBoomboxCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.handle;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -18, 15, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = cosmetic.trim;
  ctx.fillRect(-22, -11, 44, 5);
  ctx.fillStyle = cosmetic.speaker;
  [-16, 16].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 7, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cosmetic.cone;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, 7, 4, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.fillStyle = cosmetic.cone;
  ctx.fillRect(-5, -1, 10, 5);
  ctx.restore();
}

function drawTeslaCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.coil;
  ctx.lineWidth = 2;
  for (let y = -18; y <= 18; y += 9) {
    ctx.beginPath();
    ctx.moveTo(-13, y);
    ctx.lineTo(13, y);
    ctx.stroke();
  }
  ctx.fillStyle = cosmetic.core;
  ctx.beginPath();
  ctx.arc(0, -25, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGrenadeCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.band;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 9, Math.PI * 0.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.strokeStyle = cosmetic.pin;
  ctx.beginPath();
  ctx.moveTo(-3, -14);
  ctx.lineTo(8, -19);
  ctx.stroke();
  ctx.restore();
}

function drawFirecrackerCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.stripe;
  ctx.lineWidth = 2;
  for (let y = -12; y <= 12; y += 12) {
    ctx.beginPath();
    ctx.moveTo(-8, y);
    ctx.lineTo(8, y);
    ctx.stroke();
  }
  ctx.strokeStyle = cosmetic.fuse;
  ctx.beginPath();
  ctx.moveTo(0, -21);
  ctx.quadraticCurveTo(7, -30, 14, -24);
  ctx.stroke();
  ctx.fillStyle = cosmetic.spark;
  ctx.beginPath();
  ctx.arc(16, -24, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMineCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 21;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.strokeStyle = cosmetic.tooth;
  ctx.lineWidth = 2;
  for (let index = 0; index < 8; index += 1) {
    const tooth = getCosmeticPolarSegment(index * (Math.PI / 4), radius - 3, radius + 5);
    ctx.beginPath();
    ctx.moveTo(tooth.from.x, tooth.from.y);
    ctx.lineTo(tooth.to.x, tooth.to.y);
    ctx.stroke();
  }
  ctx.fillStyle = cosmetic.button;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStickyBombCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 16;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.pad;
  ctx.beginPath();
  const pad = getCircularCosmeticArc(radius, 0, 0.35, 0.58);
  ctx.arc(pad.x, pad.y, pad.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = cosmetic.fuse;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -radius);
  ctx.quadraticCurveTo(8, -radius - 11, 15, -radius - 4);
  ctx.stroke();
  ctx.restore();
}

function drawLargeBombCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 31;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.shine;
  ctx.globalAlpha = 0.58;
  ctx.beginPath();
  const shine = getCircularCosmeticArc(radius, -0.32, -0.38, 0.18);
  ctx.arc(shine.x, shine.y, shine.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = cosmetic.cap;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -radius + 4, 8, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = cosmetic.fuse;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, -radius - 4);
  ctx.quadraticCurveTo(16, -radius - 20, 27, -radius - 8);
  ctx.stroke();
  ctx.restore();
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
    const seam = getCosmeticPolarPoint(angle, radius);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(seam.x, seam.y);
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

function drawCrateCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = cosmetic.edge;
  ctx.lineWidth = 5;
  ctx.strokeRect(-22, -22, 44, 44);
  ctx.strokeStyle = cosmetic.plank;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-20, -20);
  ctx.lineTo(20, 20);
  ctx.moveTo(20, -20);
  ctx.lineTo(-20, 20);
  ctx.stroke();
  ctx.fillStyle = cosmetic.nail;
  for (const point of [
    [-16, -16],
    [16, -16],
    [-16, 16],
    [16, 16]
  ]) {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
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

function drawPlungerCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = cosmetic.handle;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();
  ctx.fillStyle = cosmetic.cup;
  ctx.beginPath();
  ctx.moveTo(7, -8);
  ctx.quadraticCurveTo(24, -8, 26, 0);
  ctx.quadraticCurveTo(24, 8, 7, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = cosmetic.ring;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(10, -7);
  ctx.quadraticCurveTo(18, 0, 10, 7);
  ctx.stroke();
  ctx.restore();
}

function drawStarCosmetic(ctx, body, cosmetic) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.globalAlpha = 0.96;
  ctx.fillStyle = cosmetic.core;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? 14 : 6;
    const angle = -Math.PI / 2 + i * (Math.PI / 5);
    const point = getCosmeticPolarPoint(angle, radius);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = cosmetic.rim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = cosmetic.stripe;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-7, 1);
  ctx.lineTo(7, 1);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();
}

function drawCannonballCosmetic(ctx, body, cosmetic) {
  const radius = body.circleRadius || 18;
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);
  ctx.fillStyle = cosmetic.shine;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  const shine = getCircularCosmeticArc(radius, -0.3, -0.36, 0.2);
  ctx.arc(shine.x, shine.y, shine.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = cosmetic.scuff;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(2, 1, radius * 0.66, 0.15, Math.PI * 1.15);
  ctx.stroke();
  ctx.restore();
}

function drawParticles(ctx) {
  if (!state.settings.particles) {
    return;
  }
  for (const particle of state.particles) {
    const alpha = getParticleAlpha(particle.life, particle.maxLife);
    ctx.globalAlpha = alpha;
    if (particle.type === "bolt") {
      const midpoint = getBoltMidpoint(particle.a, particle.b, Math.random(), Math.random());
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(particle.a.x, particle.a.y);
      ctx.lineTo(midpoint.x, midpoint.y);
      ctx.lineTo(particle.b.x, particle.b.y);
      ctx.stroke();
    } else if (particle.type === "music") {
      ctx.strokeStyle = particle.color;
      ctx.fillStyle = particle.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y + 7, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(particle.x + particle.radius, particle.y + 7);
      ctx.lineTo(particle.x + particle.radius, particle.y - 10);
      ctx.lineTo(particle.x + particle.radius + 8, particle.y - 8);
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

function drawPhysicsDebug(ctx) {
  if (!state.settings.debugPhysics) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.lineWidth = 1;
  Composite.allConstraints(engine.world).forEach((constraint) => {
    const pointA = getConstraintWorldPoint(constraint.bodyA, constraint.pointA);
    const pointB = getConstraintWorldPoint(constraint.bodyB, constraint.pointB);
    if (!pointA || !pointB) {
      return;
    }
    ctx.strokeStyle = "#74f7ff";
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.stroke();
  });

  Composite.allBodies(engine.world).forEach((body) => {
    ctx.strokeStyle = body.isStatic ? "#f1ff8b" : isBuddyBody(body) ? "#98f17f" : "#ff8d66";
    ctx.beginPath();
    body.vertices.forEach((vertex, index) => {
      if (index === 0) {
        ctx.moveTo(vertex.x, vertex.y);
      } else {
        ctx.lineTo(vertex.x, vertex.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function getConstraintWorldPoint(body, point) {
  if (!point) {
    return null;
  }
  if (!body) {
    return point;
  }
  return {
    x: body.position.x + point.x,
    y: body.position.y + point.y
  };
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
    addScore(getPaintballHitScore(), "paint", ["projectile", "paint"]);
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
    const direction = getDirectionOrFallback(offset, { x: 1, y: 0 });
    const impulse = Vector.mult(direction, getProjectileImpulseMagnitude(target.mass, 0.0034));
    Body.applyForce(target, target.position, impulse);
    if (state.torso && state.torso !== target) {
      Body.applyForce(state.torso, state.torso.position, Vector.mult(direction, getProjectileImpulseMagnitude(state.torso.mass, 0.0014)));
    }
    Body.setAngularVelocity(cork, getDampedAngularVelocity(cork.angularVelocity, 0.55));
    addScore(getCorkPopperHitScore(), "corkHit", ["projectile", "corkPopper", "blunt", "bounce"]);
    recordMission("corkPopper", 1);
    setMood("Surprised", 1100);
    spawnBurst(cork.position, "#c58a55", 6);
  }
});

Events.on(engine, "collisionStart", (event) => {
  for (const pair of event.pairs) {
    const plunger = [pair.bodyA, pair.bodyB].find((body) => body.plugin?.projectile === "plunger" && !body.plugin?.hit);
    const target = pair.bodyA === plunger ? pair.bodyB : pair.bodyA;
    if (!plunger || !isBuddyBody(target)) {
      continue;
    }
    plunger.plugin.hit = true;
    plunger.plugin.suction = true;
    const offset = Vector.sub(plunger.position, target.position);
    const direction = getDirectionOrFallback(offset, { x: -1, y: 0 });
    target.plugin = {
      ...target.plugin,
      suctionTime: getPlungerSuctionDuration()
    };
    Body.applyForce(target, target.position, Vector.mult(direction, getProjectileImpulseMagnitude(target.mass, 0.0032)));
    Body.setVelocity(plunger, getScaledVelocity(target.velocity, 0.35));
    Body.setAngularVelocity(plunger, 0);
    Body.setAngle(plunger, getVectorAngle(direction));
    addScore(getPlungerShotHitScore(), "plungerHit", ["projectile", "plungerShot", "suction", "blunt"]);
    recordMission("plungerShot", 1);
    setMood("Surprised", 1300);
    spawnBurst(plunger.position, "#e46e5f", 7);
  }
});

Events.on(engine, "collisionStart", (event) => {
  for (const pair of event.pairs) {
    const star = [pair.bodyA, pair.bodyB].find((body) => body.plugin?.projectile === "starshot" && !body.plugin?.hit);
    const target = pair.bodyA === star ? pair.bodyB : pair.bodyA;
    if (!star || !isBuddyBody(target)) {
      continue;
    }
    star.plugin.hit = true;
    target.plugin = target.plugin || {};
    target.plugin = {
      ...target.plugin,
      starRestoreStroke: target.plugin.starRestoreStroke || target.render.strokeStyle,
      starRestoreLineWidth: Number.isFinite(target.plugin.starRestoreLineWidth) ? target.plugin.starRestoreLineWidth : target.render.lineWidth,
      starSpinTime: 1450
    };
    target.render.strokeStyle = "#ffd06a";
    target.render.lineWidth = 3;
    const offset = Vector.sub(target.position, star.position);
    const direction = getDirectionOrFallback(offset, { x: 1, y: 0 });
    const spinSign = getHorizontalSpinSign(direction);
    Body.applyForce(target, target.position, Vector.mult(direction, getProjectileImpulseMagnitude(target.mass, 0.0027)));
    if (state.torso && state.torso !== target) {
      Body.applyForce(state.torso, state.torso.position, Vector.mult(direction, getProjectileImpulseMagnitude(state.torso.mass, 0.0011)));
    }
    Body.setAngularVelocity(target, getSpinAngularVelocity(target.angularVelocity, spinSign, 0.16));
    Body.setAngularVelocity(star, getSpinAngularVelocity(star.angularVelocity, spinSign, 0.42));
    Body.setVelocity(star, getVelocityAfterDirectionalImpulse(star.velocity, direction, 2.4, 0.48));
    addScore(getStarShotHitScore(), "starHit", ["projectile", "starShot", "spin", "blunt"]);
    recordMission("starShot", 1);
    setMood("Surprised", 1250);
    spawnBurst(star.position, "#ffd06a", 8);
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
    addScore(getFoamDartHitScore(), "dartHit", ["projectile", "foamDart", "blunt"]);
    recordMission("foamDart", 1);
    setMood("Surprised", 1200);
    spawnBurst(dart.position, "#ffc857", 5);
  }
});

function updateUnlockButtons() {
  document.querySelectorAll(".tool-button").forEach((button) => {
    const buttonState = getToolButtonState(button.dataset.tool, state.tool, state.unlockedTools.has(button.dataset.tool));
    button.classList.toggle("tool-button--locked", buttonState.locked);
  });
  document.querySelectorAll(".radial-wheel__button").forEach((button) => {
    const unlocked = state.unlockedTools.has(button.dataset.tool);
    const buttonState = getRadialToolButtonState(button.dataset.tool, state.tool, getTool(button.dataset.tool), unlocked);
    button.classList.toggle("radial-wheel__button--locked", buttonState.locked);
    button.classList.toggle("radial-wheel__button--active", buttonState.active);
    button.setAttribute("aria-label", buttonState.ariaLabel);
  });
}

updateUnlockButtons();
