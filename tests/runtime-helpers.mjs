import assert from "node:assert/strict";

import { InputManager, isPrimaryPointerButton, isResetKey, isTouchPointerType } from "../src/input/InputManager.ts";
import { getAssetPackImportToast, getAssetPackOption, getAssetPackSelectedToast, getAudioPackOption, getAudioPackOptionLabel, getAudioPackSelectedToast, getSelectedAssetPackId, getSelectedAudioPackId, parseImportedAssetPackText, resolveAssetPack, resolveAudioPack } from "../src/runtime/assetPackRuntime.ts";
import { advanceChallengeProgress, advanceMissionProgress, chooseRuntimeMissions, coverageMissionIds, createChallengeResult, createChallengeStartState, decrementChallengeTime, formatProgress as formatChallengeProgress, getChallengeLabel, getChallengeModeId, getChallengeModeOption, getChallengeModeOptionLabel, getChallengeReward, getMissionProgressPercent, getMissionReward } from "../src/runtime/challengeState.ts";
import {
  getRuntimeTool,
  getRuntimeToolCategories,
  getRuntimeToolsByCategory,
  getToolIdForNumberKey
} from "../src/runtime/toolCatalog.ts";
import { advanceConveyorPhase, getAnvilThrowScore, getBallThrowScore, getBeachBallThrowScore, getBlackHoleCooldown, getBlackHoleOrbitForceMagnitude, getBlackHolePullForceMagnitude, getBlackHoleRadius, getBlackHoleScore, getBoomboxAngularVelocity, getBoomboxBeatInterval, getBoomboxFalloff, getBoomboxInitialBeat, getBoomboxLife, getBoomboxNoteCount, getBoomboxPlacementScore, getBoomboxPulseForce, getBoomboxRange, getBoomboxScore, getBoomboxSide, getBowlingBallThrowScore, getBoxingGloveThrowScore, getBrickThrowScore, getBumperPlacementScore, getCannonballFireScore, getConeFalloff, getConfettiForceMagnitude, getConfettiLiftVector, getConfettiPopperRange, getConfettiScore, getConveyorCooldown, getConveyorDirection, getConveyorForce, getConveyorPlacementScore, getConveyorScore, getCorkPopperFireScore, getCorkPopperHitScore, getCrateThrowScore, getFanForceMagnitude, getFanRadius, getFanScore, getFanScoreCooldown, getFoamDartFireScore, getFoamDartHitScore, getFrostAngularVelocityScale, getFrostEffectDuration, getFrostPuffCooldown, getFrostPuffForce, getFrostPuffParticle, getFrostPuffRadius, getFrostPuffScore, getFrostVelocityScale, getGiftScore, getGooAngularVelocity, getGooEffectDuration, getGooFriction, getGooFrictionAir, getGooMistCooldown, getGooMistForce, getGooMistParticle, getGooMistRadius, getGooMistScore, getHandFlickScore, getHeatConeCooldown, getHeatConeForce, getHeatConeParticle, getHeatConeRadius, getHeatConeScore, getMagnetAngularVelocity, getMagnetCooldown, getMagnetForceMagnitude, getMagnetRadius, getMagnetRingEffect, getMagnetScore, getMoneyDropScore, getNudgeFalloff, getNudgeForce, getNudgeSide, getPaintballFireScore, getPaintballHitScore, getPlatformPlacementScore, getPlungerShotFireScore, getPlungerShotHitScore, getPlungerSuctionDuration, getPulseAngularVelocity, getPulseBeamCooldown, getPulseBeamFalloff, getPulseBeamForce, getPulseBeamParticle, getPulseBeamRadius, getPulseBeamScore, getPulseBeamSideDistance, getPulseEffectDuration, getRandomTossVelocity, getRepulsorAngularVelocity, getRepulsorCooldown, getRepulsorForceMagnitude, getRepulsorRadius, getRepulsorRingEffect, getRepulsorScore, getRopeAttachScore, getRubberCooldown, getRubberPelletSpeed, getRubberScore, getSparkWandAngularVelocity, getSparkWandCooldown, getSparkWandForceMagnitude, getSparkWandJitter, getSparkWandRange, getSparkWandScore, getStarShotFireScore, getStarShotHitScore, getTeslaForceMagnitude, getTeslaPlacementScore, getTeslaPulseInterval, getTeslaRange, getTeslaScore, getTeslaTargetLimit, getTickleImpulseMagnitude, getTickleScore, getTrampolinePlacementScore, getTreatScore, getVacuumCooldown, getVacuumForceMagnitude, getVacuumRadius, getVacuumRingEffect, getVacuumScore, incrementRubberBurstShots, isMagneticBodyLabel, shouldConveyorAffectBody, shouldSpawnSparkWandIdleBurst } from "../src/runtime/toolActionMath.ts";
import { getClampedOverlayPosition, getOverlayCssPosition, screenPointToWorld } from "../src/runtime/coordinates.ts";
import { advanceTimedEffectLife, decayShakeAmount, getBoltMidpoint, getBurstParticle, getConfettiBurstParticle, getExplosionArmScore, getExplosionBaseForce, getExplosionBurstCount, getExplosionFalloff, getExplosionForceMagnitude, getExplosionRadius, getExplosionScore, getExplosionScoreBase, getExplosionTriggerTime, getImpactBurstCount, getMoneySparkleParticle, getMusicNoteParticle, getParticleAlpha, getParticleGravity, getParticlePositionAfterDelta, getParticleVelocityYAfterGravity, getShakeOffset, getShakeTransform, getTreatCrumbParticle, increaseShakeAmount, shouldKeepDecal, shouldKeepTimedEffect } from "../src/runtime/effectsMath.ts";
import { getGiftCost } from "../src/runtime/economyMath.ts";
import { canUseHaptics, getFeedbackPlayback, getFeedbackPulsePattern } from "../src/runtime/feedbackMapping.ts";
import { calculateFps, formatComboLabel, formatFpsLabel, formatHudCash, formatHudXp, formatPowerLabel, getFpsCounterPresentation, getFpsSamplePresentation, getHudActionToast, getHudCorePresentation, getPowerControlPresentation, getToastHiddenPresentation, getToastPresentation } from "../src/runtime/hudPresentation.ts";
import { getCanvasFitStyles } from "../src/runtime/layout.ts";
import { getClampedLiquidLevel, getLiquidAngularDampingFactor, getLiquidBuoyancyForce, getLiquidDragForce, getLiquidDrainScore, getLiquidDrainToast, getLiquidFillScore, getLiquidFillToast, getLiquidFriction, getLiquidScore, getLiquidScoreCooldown, getLiquidSelectedToast, getLiquidSubmersion, getLiquidWaveY, getSelectedLiquidTypeId, resolveLiquidType, shouldDrainLiquid } from "../src/runtime/liquidMath.ts";
import { getBooleanModeButtonState, getBooleanModeButtonStates, getCeilingToggleToast, getCeilingY, getFpsCounterToggleToast, getGravityModeButtonState, getGravityModeConfig, getGravityModeToast, getRopeAnchorX, getRopeAnchorY, getRopeLength, getRopeStiffness, getSlowMoTimeScale, getSlowMoToggleToast, gravityModes, normalizeGravityMode, shouldPruneRopes } from "../src/runtime/modeSettings.ts";
import { getShopItemButtonState, resolveSkinPurchase, resolveToolPurchase } from "../src/runtime/progressionState.ts";
import { clampImpactScore, clampVector, getClampedLaunchDistance, getCombinedBounds, getDampedAngularVelocity, getDirectionOrFallback, getDistanceWithMinimum, getEquivalentMass, getFiniteMass, getFrameScale, getGrabCorrectionMagnitude, getGrabFrictionAir, getHandDragElapsed, getHandDragFlickScale, getHandFlickAngularVelocity, getHorizontalSpinSign, getImpactScore, getLaunchSpeed, getNextWallRecoveryCooldown, getPoweredRadius, getProjectileImpulseMagnitude, getRecoveredVelocityComponent, getScaledVelocity, getSelfRightingAngularVelocity, getSelfRightingForce, getSignedAngularVelocity, getSpinAngularVelocity, getThrowScale, getVectorAngle, getVelocityAfterDirectionalImpulse, getWallRecoveryOffset, isNearFloor, scaleStaticImpactScore, shouldApplySelfRighting, shouldReplaceNearest, shouldSkipWallRecovery, shouldUseLaunchDirection, shouldUseStepFlick } from "../src/runtime/physicsMath.ts";
import { getRoomApplyPresentation, getRoomBrowserButtonPresentation, getRoomBrowserButtonState, getRoomMotif, getRoomPreviewShellPresentation, getRoomPreviewSummary, getRoomSwatchPresentation, getRoomSwatches, getRoomThumbnailAriaLabel, getRoomThumbnailPresentation, getRoomThumbnailStyles } from "../src/runtime/roomPresentation.ts";
import {
  advanceAirborneBank,
  calculateReward,
  calculateXpGain,
  decayToolHeat,
  getAirborneScore,
  getChallengeRecordAmount,
  getComboFillPercent,
  getComboMultiplier,
  getFeedbackIntensity,
  getScoreAntiGrind,
  incrementToolHeat,
  shouldAwardAirborne,
  shouldSkipAirborneForSpawnGrace
} from "../src/runtime/scoringMath.ts";
import { createRuntimeSavePayload, createScenePreset, getScenePresetLoadToast, getScenePresetSaveToast, migrateRuntimeSave, parseStoredScenePreset } from "../src/runtime/saveState.ts";
import { getAppliedSkinPhysics, getClassicFaceRenderGeometry, getClassicPartRenderGeometry, getRuntimeSkin, getRuntimeSkinPhysics, getSkinBodyRender, getSkinSpriteRender } from "../src/runtime/skinRuntime.ts";
import { getMoodFace, getMoodHudPresentation } from "../src/runtime/moodPresentation.ts";
import { getCircularCosmeticArc, getCosmeticPolarPoint, getCosmeticPolarSegment, getExplosiveArmedToast, getLockedToolToast, getMenuCategoryPresentation, getMouseConstraintConfig, getRadialToolAriaLabel, getRadialToolButtonPlacement, getRadialToolButtonPresentation, getRadialToolButtonState, getRadialToolButtonTitle, getRadialWheelCenterLabel, getRadialWheelVisibilityPresentation, getRuntimeToolMetaLabel, getShopMenuButtonPresentation, getShopMenuItemLabel, getToolButtonState, getToolRailButtonMarkup, getToolRailButtonPresentation, getToolRailButtonTitle, getToolSelectionPanel, getToolUseToast } from "../src/runtime/toolPresentation.ts";
import { decrementTimer, extendTimer, isTimerExpired } from "../src/runtime/timerMath.ts";
import {
  createSaveSnapshot,
  extractImportedSave,
  getReplayBufferSeconds as getReplayBufferSecondsFromChunks,
  getReplayDownloadName,
  getReplayDownloadText,
  getReplayReadyToast,
  getReplayStripText,
  getSaveDownloadName,
  getSaveDownloadText,
  trimReplayChunks
} from "../src/runtime/transferState.ts";

const tools = [
  { id: "hand", name: "Open Hand", icon: "H", category: "Utility", cost: 0, description: "Grab." },
  { id: "ball", name: "Ball", icon: "O", category: "Props", cost: 0, description: "Throw." },
  { id: "fan", name: "Fan", icon: ">", category: "Force", cost: 120, description: "Push." },
  { id: "crate", name: "Crate", icon: "#", category: "Props", cost: 620, description: "Box." }
];

assert.equal(isPrimaryPointerButton(0), true);
assert.equal(isPrimaryPointerButton(1), false);
assert.equal(isTouchPointerType("touch"), true);
assert.equal(isTouchPointerType("mouse"), false);
assert.equal(isTouchPointerType(undefined), false);
assert.equal(isResetKey("r"), true);
assert.equal(isResetKey("R"), true);
assert.equal(isResetKey("x"), false);
const inputManager = new InputManager();
inputManager.recordPointer({ x: 0, y: 0, time: 1000 });
inputManager.recordPointer({ x: 12, y: 6, time: 1120 });
assert.deepEqual(inputManager.velocity(), { x: 100, y: 50 });

const runtimeAssetPacks = [
  { id: "base", name: "Base Lab" },
  { id: "retro", name: "Retro Office" }
];
assert.deepEqual(resolveAssetPack(runtimeAssetPacks, "retro"), { id: "retro", name: "Retro Office" });
assert.deepEqual(resolveAssetPack(runtimeAssetPacks, "missing"), { id: "base", name: "Base Lab" });
assert.deepEqual(resolveAssetPack(runtimeAssetPacks, undefined), { id: "base", name: "Base Lab" });
assert.throws(() => resolveAssetPack([], "missing"), /Runtime asset pack list is empty/);
assert.equal(getSelectedAssetPackId(runtimeAssetPacks, "retro"), "retro");
assert.equal(getSelectedAssetPackId(runtimeAssetPacks, "missing"), "base");
assert.equal(getSelectedAssetPackId([{ name: "Nameless" }], "missing"), "");
assert.deepEqual(getAssetPackOption({ id: "retro", name: "Retro Office" }), { value: "retro", label: "Retro Office" });
assert.deepEqual(getAssetPackOption({}), { value: "", label: "Asset Pack" });
assert.equal(getAudioPackOptionLabel({ name: "Classic" }), "Classic");
assert.equal(getAudioPackOptionLabel({ name: "Soft", assetPack: "retro" }, { id: "retro", name: "Retro Office" }), "Soft (Retro Office)");
assert.equal(getAudioPackOptionLabel({ name: "Soft", assetPack: "retro" }), "Soft");
assert.deepEqual(getAudioPackOption("soft", { name: "Soft", assetPack: "retro" }, { id: "retro", name: "Retro Office" }), {
  value: "soft",
  label: "Soft (Retro Office)"
});
assert.equal(getAudioPackSelectedToast("Soft"), "Soft audio pack selected.");
assert.equal(getAssetPackSelectedToast("Retro Office"), "Retro Office asset pack selected.");
assert.equal(getSelectedAudioPackId({ classic: {}, soft: {} }, "soft"), "soft");
assert.equal(getSelectedAudioPackId({ classic: {}, soft: {} }, "missing"), "classic");
assert.equal(getSelectedAudioPackId({ default: {}, soft: {} }, undefined, "default"), "default");
assert.deepEqual(resolveAudioPack({ classic: { name: "Classic" }, soft: { name: "Soft" } }, "soft"), { name: "Soft" });
assert.deepEqual(resolveAudioPack({ classic: { name: "Classic" }, soft: { name: "Soft" } }, "missing"), { name: "Classic" });
assert.throws(() => resolveAudioPack({}, "missing"), /Runtime audio pack catalog is missing its fallback pack/);
assert.deepEqual(parseImportedAssetPackText(JSON.stringify({ id: "pack-1" })), { status: "ready", pack: { id: "pack-1" } });
assert.deepEqual(parseImportedAssetPackText(JSON.stringify({ pack: { id: "pack-2" } })), { status: "ready", pack: { id: "pack-2" } });
assert.deepEqual(parseImportedAssetPackText("{bad"), { status: "invalid", pack: null });
assert.equal(getAssetPackImportToast("imported", "Neon Lab"), "Neon Lab skin pack imported.");
assert.equal(getAssetPackImportToast("duplicate", "Neon Lab"), "Neon Lab is already loaded.");
assert.equal(getAssetPackImportToast("failed"), "Skin pack import failed. Use a Buddy Lab asset-pack JSON.");

assert.equal(getRuntimeTool(tools, "fan").name, "Fan");
assert.equal(getRuntimeTool(tools, "missing").id, "hand");
assert.throws(() => getRuntimeTool([], "missing"), /Runtime tool catalog is empty/);
assert.deepEqual(getRuntimeToolCategories(tools), ["Utility", "Props", "Force"]);
assert.deepEqual(getRuntimeToolsByCategory(tools, "Props").map((tool) => tool.id), ["ball", "crate"]);
assert.deepEqual(getRuntimeToolsByCategory(tools, "Missing"), []);
assert.equal(getToolIdForNumberKey(tools, "1"), "hand");
assert.equal(getToolIdForNumberKey(tools, "4"), "crate");
assert.equal(getToolIdForNumberKey(tools, "0"), undefined);
assert.equal(getToolIdForNumberKey(tools, "5"), undefined);
assert.equal(getToolIdForNumberKey(tools, "1.5"), undefined);
assert.equal(getToolIdForNumberKey(tools, "r"), undefined);
assert.equal(getConveyorDirection(54), -1);
assert.equal(getConveyorDirection(55), 1);
assert.equal(getConveyorDirection(40, 30), 1);
const conveyorForce = getConveyorForce(1, 100, 2);
assert.ok(Math.abs(conveyorForce.x - 0.011) < 0.0000000001);
assert.ok(Math.abs(conveyorForce.y - -0.000024) < 0.0000000001);
const reverseConveyorForce = getConveyorForce(-1, 100, 2);
assert.ok(Math.abs(reverseConveyorForce.x - -0.011) < 0.0000000001);
assert.ok(Math.abs(reverseConveyorForce.y - -0.000024) < 0.0000000001);
assert.deepEqual(getConveyorForce(1, 100, 2, 0.001, 0.002), { x: 0.2, y: -0.004 });
assert.equal(advanceConveyorPhase(0, 1000, 1), 5);
assert.equal(advanceConveyorPhase(23, 1000, 1), 4);
assert.equal(advanceConveyorPhase(1, 1000, -1), -4);
assert.equal(advanceConveyorPhase(1, 1000, -1, 0.002, 12), -1);
assert.equal(shouldConveyorAffectBody(0, 0), true);
assert.equal(shouldConveyorAffectBody(98, 38), true);
assert.equal(shouldConveyorAffectBody(-98, -44), true);
assert.equal(shouldConveyorAffectBody(99, 0), false);
assert.equal(shouldConveyorAffectBody(0, -45), false);
assert.equal(shouldConveyorAffectBody(0, 39), false);
assert.equal(shouldConveyorAffectBody(15, -5, 20, -10, 10), true);
assert.equal(shouldConveyorAffectBody(21, -5, 20, -10, 10), false);
assert.equal(getConveyorScore(), 4.4);
assert.equal(getConveyorScore(8), 8);
assert.equal(getConveyorCooldown(), 450);
assert.equal(getConveyorCooldown(200), 200);
assert.equal(incrementRubberBurstShots(0), 1);
assert.equal(incrementRubberBurstShots(98), 99);
assert.equal(incrementRubberBurstShots(99), 99);
assert.equal(incrementRubberBurstShots(4, 5), 5);
assert.equal(getRubberCooldown(0), 180);
assert.equal(getRubberCooldown(100), 105);
assert.equal(getRubberCooldown(200), 70);
assert.equal(getRubberCooldown(10, 50, 100, 2), 80);
assert.ok(Math.abs(getRubberPelletSpeed(60) - 18.8) < 0.0000000001);
assert.ok(Math.abs(getRubberPelletSpeed(60, 10, 0.1) - 16) < 0.0000000001);
assert.ok(Math.abs(getRubberScore(60) - 2.52) < 0.0000000001);
assert.ok(Math.abs(getRubberScore(60, 2, 0.02) - 3.2) < 0.0000000001);
assert.ok(Math.abs(getTickleImpulseMagnitude(10) - 0.03) < 0.0000000001);
assert.ok(Math.abs(getTickleImpulseMagnitude(10, 0.01) - 0.1) < 0.0000000001);
assert.equal(getTickleScore(), 6);
assert.equal(getTickleScore(8), 8);
assert.equal(getTrampolinePlacementScore(), 3);
assert.equal(getTrampolinePlacementScore(6), 6);
assert.equal(getPlatformPlacementScore(), 3.2);
assert.equal(getPlatformPlacementScore(6.4), 6.4);
assert.equal(getBumperPlacementScore(), 3.8);
assert.equal(getBumperPlacementScore(7.6), 7.6);
assert.equal(getConveyorPlacementScore(), 4.6);
assert.equal(getConveyorPlacementScore(9.2), 9.2);
assert.equal(getGiftScore(), 8);
assert.equal(getGiftScore(12), 12);
assert.equal(getMoneyDropScore(), 10);
assert.equal(getMoneyDropScore(14), 14);
assert.equal(getTreatScore(), 7.2);
assert.equal(getTreatScore(9.4), 9.4);
assert.equal(getBoomboxPlacementScore(), 4.5);
assert.equal(getBoomboxPlacementScore(8.5), 8.5);
assert.equal(getTeslaPlacementScore(), 4);
assert.equal(getTeslaPlacementScore(8), 8);
assert.equal(getRopeAttachScore(), 5);
assert.equal(getRopeAttachScore(10), 10);
assert.equal(getPaintballFireScore(), 2);
assert.equal(getPaintballFireScore(4), 4);
assert.equal(getFoamDartFireScore(), 2.6);
assert.equal(getFoamDartFireScore(5.2), 5.2);
assert.equal(getCorkPopperFireScore(), 2.2);
assert.equal(getCorkPopperFireScore(4.4), 4.4);
assert.equal(getPlungerShotFireScore(), 2.4);
assert.equal(getPlungerShotFireScore(4.8), 4.8);
assert.equal(getStarShotFireScore(), 2.5);
assert.equal(getStarShotFireScore(5), 5);
assert.equal(getCannonballFireScore(), 4.2);
assert.equal(getCannonballFireScore(8.4), 8.4);
assert.equal(getPaintballHitScore(), 9);
assert.equal(getPaintballHitScore(18), 18);
assert.equal(getCorkPopperHitScore(), 7.5);
assert.equal(getCorkPopperHitScore(15), 15);
assert.equal(getPlungerShotHitScore(), 8.2);
assert.equal(getPlungerShotHitScore(16.4), 16.4);
assert.equal(getPlungerSuctionDuration(), 1650);
assert.equal(getPlungerSuctionDuration(825), 825);
assert.equal(getStarShotHitScore(), 8.4);
assert.equal(getStarShotHitScore(16.8), 16.8);
assert.equal(getFoamDartHitScore(), 8.5);
assert.equal(getFoamDartHitScore(17), 17);
assert.equal(getBallThrowScore(50), 6);
assert.equal(getBallThrowScore(50, 2, 0.1), 7);
assert.equal(getBeachBallThrowScore(50), 7.4);
assert.equal(getBeachBallThrowScore(50, 2, 0.1), 7);
assert.equal(getBowlingBallThrowScore(50), 9.5);
assert.equal(getBowlingBallThrowScore(50, 2, 0.1), 7);
assert.equal(getBrickThrowScore(100), 10.5);
assert.equal(getBrickThrowScore(50, 2, 0.1), 7);
assert.equal(getCrateThrowScore(50), 8.4);
assert.equal(getCrateThrowScore(50, 2, 0.1), 7);
assert.equal(getBoxingGloveThrowScore(50), 7);
assert.equal(getBoxingGloveThrowScore(50, 2, 0.1), 7);
assert.equal(getAnvilThrowScore(50), 12);
assert.equal(getAnvilThrowScore(50, 2, 0.1), 7);
assert.equal(getHandFlickScore(25), 5);
assert.equal(getHandFlickScore(25, 1, 0.2), 6);
assert.equal(isMagneticBodyLabel("prop_anvil"), true);
assert.equal(isMagneticBodyLabel("prop_boombox"), true);
assert.equal(isMagneticBodyLabel("prop_ball"), false);
assert.equal(isMagneticBodyLabel(undefined), false);
assert.equal(isMagneticBodyLabel("custom_magnet", ["custom_magnet"]), true);
assert.equal(getMagnetRadius(60), 440);
assert.equal(getMagnetRadius(60, 300), 360);
assert.ok(Math.abs(getMagnetForceMagnitude(60, 2, 220, 440) - 0.0066) < 0.0000000001);
assert.ok(Math.abs(getMagnetForceMagnitude(60, 0.5, 220, 440) - 0.0033) < 0.0000000001);
assert.ok(Math.abs(getMagnetForceMagnitude(60, 2, 0, 440, 0.001, 3) - 0.18) < 0.0000000001);
assert.ok(Math.abs(getMagnetScore(60) - 6.7) < 0.0000000001);
assert.ok(Math.abs(getMagnetScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getMagnetCooldown(), 420);
assert.equal(getMagnetCooldown(200), 200);
assert.deepEqual(getMagnetRingEffect(440), { radius: 18, maxRadius: 149.60000000000002, life: 320 });
assert.deepEqual(getMagnetRingEffect(200, 10, 0.5, 100), { radius: 10, maxRadius: 100, life: 100 });
assert.ok(Math.abs(getMagnetAngularVelocity(0.1, 1) - 0.104) < 0.0000000001);
assert.ok(Math.abs(getMagnetAngularVelocity(0.1, -1) - 0.096) < 0.0000000001);
assert.ok(Math.abs(getMagnetAngularVelocity(0.1, 0, 0.01) - 0.11) < 0.0000000001);
assert.equal(getVacuumRadius(60), 390);
assert.equal(getVacuumRadius(60, 300), 360);
assert.ok(Math.abs(getVacuumForceMagnitude(60, 2, 195, 390) - 0.0054) < 0.0000000001);
assert.ok(Math.abs(getVacuumForceMagnitude(60, 2, 0, 390, 0.001) - 0.12) < 0.0000000001);
assert.ok(Math.abs(getVacuumScore(60) - 7.9) < 0.0000000001);
assert.ok(Math.abs(getVacuumScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getVacuumCooldown(), 360);
assert.equal(getVacuumCooldown(180), 180);
assert.deepEqual(getVacuumRingEffect(390), { radius: 132.60000000000002, maxRadius: 10, life: 280 });
assert.deepEqual(getVacuumRingEffect(200, 0.5, 20, 100), { radius: 100, maxRadius: 20, life: 100 });
assert.equal(getRepulsorRadius(60), 340);
assert.equal(getRepulsorRadius(60, 240), 300);
assert.ok(Math.abs(getRepulsorForceMagnitude(60, 2, 170, 340) - 0.0078) < 0.0000000001);
assert.ok(Math.abs(getRepulsorForceMagnitude(60, 2, 0, 340, 0.001) - 0.12) < 0.0000000001);
assert.ok(Math.abs(getRepulsorAngularVelocity(0.1, 1) - 0.1025) < 0.0000000001);
assert.ok(Math.abs(getRepulsorAngularVelocity(0.1, -1) - 0.0975) < 0.0000000001);
assert.ok(Math.abs(getRepulsorAngularVelocity(0.1, 0, 0.01) - 0.11) < 0.0000000001);
assert.ok(Math.abs(getRepulsorScore(60) - 8.6) < 0.0000000001);
assert.ok(Math.abs(getRepulsorScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getRepulsorCooldown(), 380);
assert.equal(getRepulsorCooldown(200), 200);
assert.deepEqual(getRepulsorRingEffect(340), { radius: 8, maxRadius: 149.6, life: 300 });
assert.deepEqual(getRepulsorRingEffect(200, 10, 0.5, 100), { radius: 10, maxRadius: 100, life: 100 });
assert.equal(getFanRadius(), 310);
assert.equal(getFanRadius(280), 280);
assert.ok(Math.abs(getFanForceMagnitude(60, 2, 155, 310, 0.5) - 0.0033) < 0.0000000001);
assert.ok(Math.abs(getFanForceMagnitude(60, 2, 0, 300, 1, 0.001) - 0.12) < 0.0000000001);
assert.ok(Math.abs(getFanScore(60) - 5.4) < 0.0000000001);
assert.ok(Math.abs(getFanScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getFanScoreCooldown(), 320);
assert.equal(getFanScoreCooldown(200), 200);
assert.equal(getBlackHoleRadius(60), 468);
assert.equal(getBlackHoleRadius(60, 300, 2), 420);
assert.ok(Math.abs(getBlackHolePullForceMagnitude(60, 2, 234, 468) - 0.0078) < 0.0000000001);
assert.ok(Math.abs(getBlackHolePullForceMagnitude(60, 2, 0, 468, 0.001) - 0.12) < 0.0000000001);
assert.ok(Math.abs(getBlackHoleOrbitForceMagnitude(60, 2) - 0.003) < 0.0000000001);
assert.ok(Math.abs(getBlackHoleOrbitForceMagnitude(60, 2, 0.001) - 0.12) < 0.0000000001);
assert.ok(Math.abs(getBlackHoleScore(60) - 9.6) < 0.0000000001);
assert.ok(Math.abs(getBlackHoleScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getBlackHoleCooldown(), 430);
assert.equal(getBlackHoleCooldown(200), 200);
assert.equal(getConeFalloff(120, 240, 0.5), 0.25);
assert.equal(getConeFalloff(0, 240, 0.5), 0.5);
assert.equal(getHeatConeRadius(), 240);
assert.equal(getHeatConeRadius(200), 200);
const heatConeForce = getHeatConeForce({ x: 0.6, y: 0.8 }, 60, 2, 0.25);
assert.ok(Math.abs(heatConeForce.x - 0.00063) < 0.0000000001);
assert.ok(Math.abs(heatConeForce.y - -0.00054) < 0.0000000001);
assert.deepEqual(getHeatConeForce({ x: 1, y: 0 }, 60, 2, 0.25, 0.001, 0.002), { x: 0.03, y: -0.06 });
assert.ok(Math.abs(getHeatConeScore(60) - 6.6) < 0.0000000001);
assert.ok(Math.abs(getHeatConeScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getHeatConeCooldown(), 360);
assert.equal(getHeatConeCooldown(200), 200);
assert.deepEqual(getHeatConeParticle({ x: 10, y: 20 }, { x: 1, y: 0 }, 0.75, 0.5, 0.25, 0.4), {
  type: "spark",
  x: 46,
  y: 30.5,
  vx: 0.07250000000000001,
  vy: -0.018,
  radius: 3,
  color: "#ff8d66",
  life: 280,
  maxLife: 280
});
assert.equal(getFrostPuffRadius(), 220);
assert.equal(getFrostPuffRadius(180), 180);
const frostPuffForce = getFrostPuffForce({ x: 0.6, y: 0.8 }, 60, 2, 0.25);
assert.ok(Math.abs(frostPuffForce.x - 0.000324) < 0.0000000001);
assert.ok(Math.abs(frostPuffForce.y - -0.0003) < 0.0000000001);
assert.deepEqual(getFrostPuffForce({ x: 1, y: 0 }, 60, 2, 0.25, 0.001, 0.002), { x: 0.03, y: -0.06 });
assert.ok(Math.abs(getFrostPuffScore(60) - 6) < 0.0000000001);
assert.ok(Math.abs(getFrostPuffScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getFrostPuffCooldown(), 260);
assert.equal(getFrostPuffCooldown(200), 200);
assert.equal(getFrostEffectDuration(), 1050);
assert.equal(getFrostEffectDuration(525), 525);
assert.ok(Math.abs(getFrostVelocityScale(0.25) - 0.9525) < 0.0000000001);
assert.ok(Math.abs(getFrostVelocityScale(0.25, 1, 0.2) - 0.95) < 0.0000000001);
assert.ok(Math.abs(getFrostAngularVelocityScale(0.25) - 0.91) < 0.0000000001);
assert.ok(Math.abs(getFrostAngularVelocityScale(0.25, 1, 0.2) - 0.95) < 0.0000000001);
assert.deepEqual(getFrostPuffParticle({ x: 10, y: 20 }, { x: 1, y: 0 }, 0.25, 0.2, 0.4, 0.5), {
  type: "spark",
  x: 44,
  y: 8,
  vx: 0.04000000000000001,
  vy: -0.0308,
  radius: 3.1,
  color: "#baf7ff",
  life: 340,
  maxLife: 340
});
assert.equal(getGooMistRadius(), 225);
assert.equal(getGooMistRadius(180), 180);
const gooMistForce = getGooMistForce({ x: 0.6, y: 0.8 }, { x: -0.8, y: 0.6 }, 60, 2, 0.25);
assert.ok(Math.abs(gooMistForce.x - -0.000324) < 0.0000000001);
assert.ok(Math.abs(gooMistForce.y - -0.000096) < 0.0000000001);
assert.deepEqual(getGooMistForce({ x: 1, y: 0 }, { x: 0, y: 1 }, 60, 2, 0.25, 0.001, 0.002, 0.003, 0.004), { x: 0.03, y: -0.12 });
assert.ok(Math.abs(getGooAngularVelocity(0.1, 0.25) - 0.10875) < 0.0000000001);
assert.ok(Math.abs(getGooAngularVelocity(0.1, 0.25, 0.1) - 0.125) < 0.0000000001);
assert.ok(Math.abs(getGooMistScore(60) - 6.14) < 0.0000000001);
assert.ok(Math.abs(getGooMistScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getGooMistCooldown(), 260);
assert.equal(getGooMistCooldown(200), 200);
assert.equal(getGooEffectDuration(), 1200);
assert.equal(getGooEffectDuration(600), 600);
assert.equal(getGooFriction(0.2), 0.08);
assert.equal(getGooFriction(0.04), 0.04);
assert.equal(getGooFriction(0), 0.08);
assert.equal(getGooFriction(undefined, 0.2, 0.12), 0.12);
assert.equal(getGooFrictionAir(0.02), 0.006);
assert.equal(getGooFrictionAir(0.004), 0.004);
assert.equal(getGooFrictionAir(0), 0.006);
assert.equal(getGooFrictionAir(undefined, 0.02, 0.012), 0.012);
assert.deepEqual(getGooMistParticle({ x: 10, y: 20 }, { x: 1, y: 0 }, 0.9, 0.5, 0.25, 0.25), {
  type: "spark",
  x: 42,
  y: 40,
  vx: 0.041,
  vy: 0.022,
  radius: 3.0999999999999996,
  color: "#98f17f",
  life: 360,
  maxLife: 360
});
assert.equal(getPulseBeamRadius(), 315);
assert.equal(getPulseBeamRadius(280), 280);
assert.equal(getPulseBeamSideDistance({ x: 12, y: 30 }, { x: 1, y: 0 }), 30);
assert.equal(getPulseBeamSideDistance({ x: 12, y: 30 }, { x: 0, y: 1 }), 12);
assert.ok(Math.abs(getPulseBeamSideDistance({ x: 12, y: 30 }, { x: 0.6, y: 0.8 }) - 8.4) < 0.0000000001);
assert.ok(Math.abs(getPulseBeamFalloff(105, 315, 0.9, 35) - 0.3) < 0.0000000001);
assert.ok(Math.abs(getPulseBeamFalloff(0, 315, 1, 35, 140) - 0.75) < 0.0000000001);
const pulseBeamForce = getPulseBeamForce({ x: 0.6, y: 0.8 }, 60, 2, 0.3);
assert.ok(Math.abs(pulseBeamForce.x - 0.001296) < 0.0000000001);
assert.ok(Math.abs(pulseBeamForce.y - 0.001368) < 0.0000000001);
const minimumPulseBeamForce = getPulseBeamForce({ x: 1, y: 0 }, 60, 2, 0.05);
assert.ok(Math.abs(minimumPulseBeamForce.x - 0.00072) < 0.0000000001);
assert.ok(Math.abs(minimumPulseBeamForce.y - -0.00006) < 0.0000000001);
assert.deepEqual(getPulseBeamForce({ x: 1, y: 0 }, 60, 2, 0.25, 0.001, 0.2, 0.003), { x: 0.03, y: -0.09 });
assert.ok(Math.abs(getPulseAngularVelocity(0.1, 0.25) - 0.1065) < 0.0000000001);
assert.ok(Math.abs(getPulseAngularVelocity(0.1, 0.25, 0.1) - 0.125) < 0.0000000001);
assert.ok(Math.abs(getPulseBeamScore(60) - 6.56) < 0.0000000001);
assert.ok(Math.abs(getPulseBeamScore(60, 2, 0.1) - 8) < 0.0000000001);
assert.equal(getPulseBeamCooldown(), 250);
assert.equal(getPulseBeamCooldown(200), 200);
assert.equal(getPulseEffectDuration(), 850);
assert.equal(getPulseEffectDuration(425), 425);
assert.deepEqual(getPulseBeamParticle({ x: 10, y: 20 }, { x: 1, y: 0 }, 0.25, 0.5, 0.2, 0.4), {
  type: "spark",
  x: 92,
  y: 12,
  vx: 0.08,
  vy: -0.013600000000000001,
  radius: 2.56,
  color: "#fff27a",
  life: 260,
  maxLife: 260
});
assert.equal(getSparkWandRange(), 280);
assert.equal(getSparkWandRange(120), 120);
assert.equal(shouldSpawnSparkWandIdleBurst(0.23), true);
assert.equal(shouldSpawnSparkWandIdleBurst(0.24), false);
assert.equal(shouldSpawnSparkWandIdleBurst(0.4, 0.5), true);
assert.deepEqual(getSparkWandJitter({ x: 1, y: 0 }, 1, 0), { x: 1.275, y: -0.275 });
assert.deepEqual(getSparkWandJitter({ x: 1, y: 0 }, 0.75, 0.25, 0.2), { x: 1.05, y: -0.05 });
assert.equal(getSparkWandForceMagnitude(10), 0.018);
assert.equal(getSparkWandForceMagnitude(10, 0.01), 0.1);
assert.ok(Math.abs(getSparkWandAngularVelocity(0.1, 1) - 0.135) < 0.0000000001);
assert.ok(Math.abs(getSparkWandAngularVelocity(0.1, 0) - 0.065) < 0.0000000001);
assert.ok(Math.abs(getSparkWandAngularVelocity(0.1, 0.75, 0.2) - 0.15) < 0.0000000001);
assert.ok(Math.abs(getSparkWandScore(60) - 5.9) < 0.0000000001);
assert.ok(Math.abs(getSparkWandScore(60, 1, 0.1) - 7) < 0.0000000001);
assert.equal(getSparkWandCooldown(), 240);
assert.equal(getSparkWandCooldown(120), 120);
assert.equal(getTeslaPulseInterval(), 900);
assert.equal(getTeslaPulseInterval(450), 450);
assert.equal(getTeslaRange(), 180);
assert.equal(getTeslaRange(120), 120);
assert.equal(getTeslaTargetLimit(), 3);
assert.equal(getTeslaTargetLimit(5), 5);
assert.ok(Math.abs(getTeslaForceMagnitude(10) - 0.012) < 0.0000000001);
assert.ok(Math.abs(getTeslaForceMagnitude(10, 0.01) - 0.1) < 0.0000000001);
assert.equal(getTeslaScore(), 4.5);
assert.equal(getTeslaScore(8), 8);
assert.equal(getBoomboxBeatInterval(), 620);
assert.equal(getBoomboxBeatInterval(300), 300);
assert.equal(getBoomboxInitialBeat(), 60);
assert.equal(getBoomboxInitialBeat(30), 30);
assert.equal(getBoomboxLife(), 5600);
assert.equal(getBoomboxLife(2800), 2800);
assert.equal(getBoomboxRange(), 230);
assert.equal(getBoomboxRange(180), 180);
assert.equal(getBoomboxFalloff(115, 230), 0.5);
assert.equal(getBoomboxSide(10, 10), 1);
assert.equal(getBoomboxSide(9, 10), -1);
const boomboxPulse = getBoomboxPulseForce(1, 0.5, 10);
assert.ok(Math.abs(boomboxPulse.x - 0.0021) < 0.0000000001);
assert.ok(Math.abs(boomboxPulse.y - -0.0031) < 0.0000000001);
const reverseBoomboxPulse = getBoomboxPulseForce(-1, 0.5, 10);
assert.ok(Math.abs(reverseBoomboxPulse.x - -0.0021) < 0.0000000001);
assert.ok(Math.abs(reverseBoomboxPulse.y - -0.0031) < 0.0000000001);
assert.deepEqual(getBoomboxPulseForce(1, 0.5, 10, 0.001, 0.002), { x: 0.005, y: -0.01 });
assert.ok(Math.abs(getBoomboxAngularVelocity(0.1, 1, 0.5) - 0.103) < 0.0000000001);
assert.ok(Math.abs(getBoomboxAngularVelocity(0.1, -1, 0.5) - 0.097) < 0.0000000001);
assert.ok(Math.abs(getBoomboxAngularVelocity(0.1, 1, 0.5, 0.02) - 0.11) < 0.0000000001);
assert.equal(getBoomboxNoteCount(true), 9);
assert.equal(getBoomboxNoteCount(false), 5);
assert.equal(getBoomboxNoteCount(true, 7, 3), 7);
assert.equal(getBoomboxScore(true), 4.8);
assert.equal(getBoomboxScore(false), 2.4);
assert.equal(getBoomboxScore(false, 8, 4), 4);
assert.equal(getNudgeFalloff(75, 150), 0.5);
assert.equal(getNudgeSide(0), 1);
assert.equal(getNudgeSide(-1), -1);
const nudgeForce = getNudgeForce(1, 0.00032, -0.00048, 0.5, 10);
assert.ok(Math.abs(nudgeForce.x - 0.0016) < 0.0000000001);
assert.ok(Math.abs(nudgeForce.y - -0.0024) < 0.0000000001);
const reverseNudgeForce = getNudgeForce(-1, 0.00032, -0.00048, 0.5, 10);
assert.ok(Math.abs(reverseNudgeForce.x - -0.0016) < 0.0000000001);
assert.ok(Math.abs(reverseNudgeForce.y - -0.0024) < 0.0000000001);
assert.deepEqual(getRandomTossVelocity(0, 2.5, -3.2), { x: -1.25, y: -3.2 });
assert.deepEqual(getRandomTossVelocity(0.5, 3, -2.4), { x: 0, y: -2.4 });
assert.deepEqual(getRandomTossVelocity(1, 3, -2.4), { x: 1.5, y: -2.4 });
assert.equal(getConfettiPopperRange(), 210);
assert.equal(getConfettiPopperRange(180), 180);
assert.deepEqual(getConfettiLiftVector({ x: 1, y: 0 }), { x: 0.55, y: -0.9 });
assert.deepEqual(getConfettiLiftVector({ x: -1, y: 0.8 }), { x: -0.55, y: -0.65 });
assert.deepEqual(getConfettiLiftVector({ x: 1, y: 0 }, 0.2, 0.4, -0.3), { x: 0.2, y: -0.4 });
assert.ok(Math.abs(getConfettiForceMagnitude(10, 125) - 0.00525) < 0.0000000001);
assert.ok(Math.abs(getConfettiForceMagnitude(10, 0, 200, 0.002) - 0.02) < 0.0000000001);
assert.equal(getConfettiScore(true), 9.5);
assert.equal(getConfettiScore(false), 6.5);
assert.equal(getConfettiScore(false, 12, 4), 4);
assert.equal(decrementTimer(1000, 250), 750);
assert.equal(decrementTimer(1000, 1200), 0);
assert.equal(decrementTimer(1000, 1200, -250), -200);
assert.equal(extendTimer(undefined, 850), 850);
assert.equal(extendTimer(null, 850), 850);
assert.equal(extendTimer(400, 850), 850);
assert.equal(extendTimer(1200, 850), 1200);
assert.equal(isTimerExpired(1), false);
assert.equal(isTimerExpired(0), true);
assert.equal(isTimerExpired(-1), true);
assert.deepEqual(getFeedbackPlayback("impact"), { sound: "impact", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("crate"), { sound: "impact", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("explosion"), { sound: "explosion", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("vacuum"), { sound: "shock", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("confetti"), { sound: "gift", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("treat"), { sound: "treat", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("plungerHit"), { sound: "paint", useSelectIntensity: false });
assert.deepEqual(getFeedbackPlayback("conveyor"), { sound: "select", useSelectIntensity: true });
assert.equal(getFeedbackPlayback("unknown"), null);
assert.deepEqual(getFeedbackPulsePattern("armed", 2, ["explosive"]), [45, 35, 90]);
assert.deepEqual(getFeedbackPulsePattern("spark", 2, ["shock"]), [16, 24, 16]);
assert.deepEqual(getFeedbackPulsePattern("frost", 2, ["cold"]), [10, 18]);
assert.deepEqual(getFeedbackPulsePattern("goo", 2, ["slippery"]), [8, 12]);
assert.equal(getFeedbackPulsePattern("heat", 2, ["heat"]), 14);
assert.equal(getFeedbackPulsePattern("tickle", 2, []), 18);
assert.equal(getFeedbackPulsePattern("impact", 10, []), 18);
assert.equal(getFeedbackPulsePattern("impact", 100, []), 50);
assert.equal(getFeedbackPulsePattern("paint", 2, []), null);
assert.equal(canUseHaptics(true, true, undefined), true);
assert.equal(canUseHaptics(false, true, undefined), false);
assert.equal(canUseHaptics(true, false, undefined), false);
assert.equal(canUseHaptics(true, true, { isActive: true, hasBeenActive: false }), true);
assert.equal(canUseHaptics(true, true, { isActive: false, hasBeenActive: true }), true);
assert.equal(canUseHaptics(true, true, { isActive: false, hasBeenActive: false }), false);

assert.deepEqual(
  screenPointToWorld(
    { left: 100, top: 50, width: 400, height: 300 },
    { clientX: 300, clientY: 200 },
    { width: 960, height: 640 }
  ),
  { x: 480, y: 320 }
);

assert.deepEqual(
  screenPointToWorld(
    { left: 0, top: 0, width: 960, height: 640 },
    { clientX: 960, clientY: 640 },
    { width: 960, height: 640 }
  ),
  { x: 960, y: 640 }
);
assert.deepEqual(
  getClampedOverlayPosition(
    { left: 100, top: 50, width: 500, height: 400 },
    { clientX: 350, clientY: 250 },
    250
  ),
  { x: 250, y: 200 }
);
assert.deepEqual(
  getClampedOverlayPosition(
    { left: 100, top: 50, width: 500, height: 400 },
    { clientX: 90, clientY: 40 },
    250
  ),
  { x: 133, y: 133 }
);
assert.deepEqual(
  getClampedOverlayPosition(
    { left: 100, top: 50, width: 500, height: 400 },
    { clientX: 900, clientY: 900 },
    250
  ),
  { x: 367, y: 267 }
);
assert.deepEqual(
  getClampedOverlayPosition(
    { left: 0, top: 0, width: 120, height: 100 },
    { clientX: 60, clientY: 50 },
    250
  ),
  { x: 133, y: 133 }
);
assert.deepEqual(getOverlayCssPosition({ x: 133, y: 267 }), { left: "133px", top: "267px" });
assert.deepEqual(
  getCanvasFitStyles({ width: 1200, height: 640 }, { width: 960, height: 640 }),
  { width: "960px", height: "100%", marginLeft: "120px", marginTop: "0" }
);
assert.deepEqual(
  getCanvasFitStyles({ width: 960, height: 900 }, { width: 960, height: 640 }),
  { width: "100%", height: "640px", marginLeft: "0", marginTop: "130px" }
);
assert.deepEqual(
  getCanvasFitStyles({ width: 963, height: 641 }, { width: 960, height: 640 }),
  { width: "961px", height: "100%", marginLeft: "0px", marginTop: "0" }
);
assert.equal(decayShakeAmount(10, 100), 7);
assert.equal(decayShakeAmount(2, 100), 0);
assert.equal(decayShakeAmount(10, 100, 0.05), 5);
assert.equal(increaseShakeAmount(5, 10), 15);
assert.equal(increaseShakeAmount(20, 10), 24);
assert.equal(increaseShakeAmount(20, 10, 32), 30);
assert.deepEqual(getShakeOffset(0, 1, 10), { x: -5, y: 5 });
assert.deepEqual(getShakeOffset(0.5, 0.5, 10), { x: 0, y: 0 });
assert.deepEqual(getShakeOffset(0.25, 0.75, 8), { x: -2, y: 2 });
assert.equal(getShakeTransform({ x: -2, y: 2 }), "translate(-2px, 2px)");
assert.equal(getExplosionBurstCount(70), 18);
assert.equal(getExplosionBurstCount(190), 27);
assert.equal(getExplosionBurstCount(400), 46);
assert.equal(getExplosionBurstCount(120, 10, 30, 6), 20);
assert.equal(getExplosionRadius(200, 60), 200);
assert.equal(getExplosionRadius(0, 60), 319);
assert.equal(getExplosionRadius(undefined, 60, 100, 2), 220);
assert.equal(getExplosionBaseForce(0.5, 60), 0.5);
assert.ok(Math.abs(getExplosionBaseForce(0, 72) - 0.00261) < 0.0000000001);
assert.equal(getExplosionBaseForce(undefined, 60, 0.001, 1, 100), 0.0016);
assert.equal(getExplosionScoreBase(8), 8);
assert.equal(getExplosionScoreBase(0), 13);
assert.equal(getExplosionTriggerTime(1000, 850), 1850);
assert.equal(getExplosionTriggerTime(1000, 0), 1000);
assert.equal(getExplosionArmScore(), 2.4);
assert.equal(getExplosionArmScore(4), 4);
assert.equal(getExplosionFalloff(95, 190), 0.5);
assert.equal(getExplosionForceMagnitude(0.002, 0.5, 10), 0.01);
assert.ok(Math.abs(getExplosionScore(13, 0.5, 60) - 8.558333333333334) < 0.0000000001);
assert.equal(getExplosionScore(10, 0.5, 60, 1, 100), 8);
assert.equal(getImpactBurstCount(1.2), 1);
assert.equal(getImpactBurstCount(5.6), 6);
assert.equal(getImpactBurstCount(12.4), 10);
assert.equal(getImpactBurstCount(12.4, 8), 8);
assert.deepEqual(getBurstParticle({ x: 10, y: 20 }, "#abc", 0, 0.5, 0.25, 0.5), {
  type: "spark",
  x: 10,
  y: 20,
  vx: 0.08,
  vy: 0,
  radius: 2.75,
  color: "#abc",
  life: 650,
  maxLife: 840
});
assert.deepEqual(getBurstParticle({ x: -2, y: 4 }, "#fff", 0, 1, 0.5, 0.25, 1, 2, 3, 4, 5, 6, 7), {
  type: "spark",
  x: -2,
  y: 4,
  vx: 3,
  vy: 0,
  radius: 5,
  color: "#fff",
  life: 6.5,
  maxLife: 7
});
assert.deepEqual(getConfettiBurstParticle({ x: 10, y: 20 }, "#fed", 0, 0.5, 0.25, 0.5), {
  type: "spark",
  kind: "confetti",
  x: 10,
  y: 12,
  vx: -0.09986093421099113,
  vy: -0.06744678440936949,
  radius: 2.4,
  color: "#fed",
  life: 920,
  maxLife: 1160
});
assert.deepEqual(getConfettiBurstParticle({ x: -2, y: 4 }, "#123", 0, 1, 0.5, 0.25, 0, 0, 1, 2, -4, -5, 3, 4, 5, 6, 7), {
  type: "spark",
  kind: "confetti",
  x: -2,
  y: 0,
  vx: 3,
  vy: -5,
  radius: 5,
  color: "#123",
  life: 6.5,
  maxLife: 7
});
assert.deepEqual(getMusicNoteParticle({ x: 10, y: 20 }, "#ffc857", -1, 0.5, 0.4, 0.25, 0.2, 0.5), {
  type: "music",
  kind: "music",
  x: -11,
  y: 4,
  vx: -0.025,
  vy: -0.065,
  radius: 3.3,
  color: "#ffc857",
  life: 1030,
  maxLife: 1240
});
assert.deepEqual(getMusicNoteParticle({ x: -2, y: 4 }, "#123", 1, 0.5, 0.25, 0.5, 0.75, 0.25, 1, 2, -3, 4, 5, -6, 7, 8, 9, 10, 11, 12), {
  type: "music",
  kind: "music",
  x: 0,
  y: 1,
  vx: 5.25,
  vy: -9.5,
  radius: 14.75,
  color: "#123",
  life: 12.75,
  maxLife: 12
});
assert.deepEqual(getMoneySparkleParticle({ x: 10, y: 20 }, "#98f17f", 1, 0.2, 0.75, 0.25, 0.5), {
  type: "spark",
  kind: "money",
  x: 14,
  y: 10,
  vx: 0.05,
  vy: -0.045,
  radius: 2.5,
  color: "#98f17f",
  life: 930,
  maxLife: 1140
});
const treatParticle = getTreatCrumbParticle({ x: 10, y: 20 }, "#d89b5f", 0.5, 0.5, 0.25, 0.5);
assert.equal(treatParticle.type, "spark");
assert.equal(treatParticle.kind, "treat");
assert.equal(treatParticle.x, 10);
assert.equal(treatParticle.y, 12);
assert.ok(Math.abs(treatParticle.vx) < 0.0000000001);
assert.ok(Math.abs(treatParticle.vy - -0.08) < 0.0000000001);
assert.equal(treatParticle.radius, 2);
assert.equal(treatParticle.color, "#d89b5f");
assert.equal(treatParticle.life, 800);
assert.equal(treatParticle.maxLife, 980);
assert.deepEqual(getTreatCrumbParticle({ x: -2, y: 4 }, "#123", 0, 1, 0.5, 0.25, 0, 0, 1, 2, -3, 4, 5, 6, 7, 8, 9), {
  type: "spark",
  kind: "treat",
  x: -2,
  y: 1,
  vx: 3,
  vy: 4,
  radius: 8,
  color: "#123",
  life: 9,
  maxLife: 9
});
assert.equal(advanceTimedEffectLife(500, 120), 380);
assert.deepEqual(getParticlePositionAfterDelta({ x: 10, y: 20 }, { x: 0.5, y: -0.25 }, 100), { x: 60, y: -5 });
assert.equal(getParticleGravity("music"), 0.00018);
assert.equal(getParticleGravity("spark"), 0.0007);
assert.equal(getParticleGravity(undefined, 0.1, 0.2), 0.2);
assert.ok(Math.abs(getParticleVelocityYAfterGravity(0.1, "music", 100) - 0.118) < 0.0000000001);
assert.ok(Math.abs(getParticleVelocityYAfterGravity(0.1, "spark", 100) - 0.17) < 0.0000000001);
assert.equal(getParticleAlpha(50, 100), 0.5);
assert.equal(getParticleAlpha(-5, 100), 0);
assert.equal(getParticleAlpha(120, 100), 1.2);
assert.deepEqual(getBoltMidpoint({ x: 0, y: 10 }, { x: 20, y: 30 }, 0.5, 0.5), { x: 10, y: 20 });
assert.deepEqual(getBoltMidpoint({ x: 0, y: 10 }, { x: 20, y: 30 }, 0, 1), { x: 1, y: 29 });
assert.deepEqual(getBoltMidpoint({ x: -10, y: -10 }, { x: 10, y: 10 }, 0.25, 0.75, 8), { x: -2, y: 2 });
assert.equal(shouldKeepTimedEffect(1), true);
assert.equal(shouldKeepTimedEffect(0), false);
assert.equal(shouldKeepDecal(9000, 600), true);
assert.equal(shouldKeepDecal(9000, 500), false);
assert.equal(shouldKeepDecal(9000, 400), false);
assert.equal(shouldKeepDecal(1000, 400, 500), false);
assert.equal(shouldDrainLiquid(590, 600, true), true);
assert.equal(shouldDrainLiquid(552, 600, true), false);
assert.equal(shouldDrainLiquid(590, 600, false), false);
assert.equal(shouldDrainLiquid(580, 600, true, 25), true);
assert.equal(getClampedLiquidLevel(120, 600), 150);
assert.equal(getClampedLiquidLevel(320, 600), 320);
assert.equal(getClampedLiquidLevel(590, 600), 565);
assert.equal(getClampedLiquidLevel(80, 240, 90, 20), 90);
assert.equal(getClampedLiquidLevel(230, 240, 90, 20), 220);
assert.equal(getLiquidWaveY(300, 0, 0), 300);
assert.equal(getLiquidWaveY(300, Math.PI / 2, 0), 305);
assert.ok(Math.abs(getLiquidWaveY(300, 1, 32) - 304.86923815439096) < 0.0000000001);
assert.equal(getLiquidSubmersion(0), 0);
assert.equal(getLiquidSubmersion(60), 0.5);
assert.equal(getLiquidSubmersion(180), 1);
assert.equal(getLiquidSubmersion(40, 80), 0.5);
assert.equal(getLiquidAngularDampingFactor(16, 1, 0.5), 0.99904);
assert.equal(getLiquidAngularDampingFactor(1000, 2, 1), 0.96);
assert.equal(getLiquidAngularDampingFactor(1000, 2, 1, 0.1, 0.00001), 0.98);
assert.equal(getLiquidFriction("oil", 0.4, 0.3), 0.18);
assert.equal(getLiquidFriction("oil", 0.1, 0.3), 0.1);
assert.equal(getLiquidFriction("slime", 0.4, 0.3), 0.82);
assert.equal(getLiquidFriction("slime", 0.9, 0.3), 0.9);
assert.equal(getLiquidFriction("water", 0.9, 0.3), 0.3);
assert.ok(Math.abs(getLiquidBuoyancyForce(1, 10, 0.5, 60) - -0.00147) < 0.0000000001);
assert.ok(Math.abs(getLiquidBuoyancyForce(2, 5, 1, 0) - -0.00189) < 0.0000000001);
assert.ok(Math.abs(getLiquidBuoyancyForce(1, 10, 0.5, 60, 0.001, 1, 100) - -0.008) < 0.0000000001);
assert.ok(Math.abs(getLiquidDragForce(20, 1, 10, 0.5, 0.000035) - -0.0035) < 0.0000000001);
assert.ok(Math.abs(getLiquidDragForce(-20, 2, 5, 1, 0.000018) - 0.0036) < 0.0000000001);
assert.equal(getLiquidScore(), 4.5);
assert.equal(getLiquidScore(8), 8);
assert.equal(getLiquidScoreCooldown(), 850);
assert.equal(getLiquidScoreCooldown(200), 200);
assert.equal(getLiquidDrainScore(), 2);
assert.equal(getLiquidDrainScore(5), 5);
assert.equal(getLiquidFillScore(), 3);
assert.equal(getLiquidFillScore(6), 6);
assert.equal(getLiquidDrainToast("Slime"), "Slime drained.");
assert.equal(getLiquidFillToast("Water"), "Water level set.");
assert.equal(getLiquidSelectedToast("Oil"), "Oil selected.");
const liquidTypes = {
  water: { name: "Water" },
  goo: { name: "Goo" }
};
assert.equal(getSelectedLiquidTypeId(liquidTypes, "goo"), "goo");
assert.equal(getSelectedLiquidTypeId(liquidTypes, "missing"), "water");
assert.equal(getSelectedLiquidTypeId(liquidTypes, undefined, "goo"), "goo");
assert.deepEqual(resolveLiquidType(liquidTypes, "goo"), { name: "Goo" });
assert.deepEqual(resolveLiquidType(liquidTypes, "missing"), { name: "Water" });
assert.throws(() => resolveLiquidType({}, "missing"), /Runtime liquid type catalog is missing its fallback type/);

assert.deepEqual(clampVector({ x: 3, y: 4 }, 10), { x: 3, y: 4 });
assert.deepEqual(clampVector({ x: 6, y: 8 }, 5), { x: 3, y: 4 });
assert.deepEqual(clampVector({ x: Number.NaN, y: 8 }, 5), { x: Number.NaN, y: 8 });
assert.equal(getFiniteMass({ mass: 12 }), 12);
assert.equal(getFiniteMass({ mass: Number.POSITIVE_INFINITY }), 18);
assert.equal(getFiniteMass({ mass: 0 }), 18);
assert.equal(getFiniteMass(null), 18);
assert.equal(getFiniteMass({ mass: -1 }, 22), 22);
assert.equal(getDistanceWithMinimum(3, 8), 8);
assert.equal(getDistanceWithMinimum(8, 8), 8);
assert.equal(getDistanceWithMinimum(12, 8), 12);
assert.equal(getEquivalentMass(10, 20), 6.666666666666667);
assert.equal(getEquivalentMass(0, 20), 0);
assert.ok(Math.abs(getEquivalentMass(0.002, 0.003) - 0.0006) < 0.0000000001);
assert.ok(Math.abs(getEquivalentMass(0.002, 0.003, 0.001) - 0.0012) < 0.0000000001);
assert.equal(getImpactScore(2, 5), 19);
assert.equal(getImpactScore(2, 5, 2.5), 25);
assert.equal(scaleStaticImpactScore(20, false, "floor"), 20);
assert.equal(scaleStaticImpactScore(20, true, "trampoline"), 23);
assert.equal(scaleStaticImpactScore(20, true, "floor"), 7.6);
assert.equal(clampImpactScore(45), 45);
assert.equal(clampImpactScore(47), 46);
assert.equal(clampImpactScore(47, 30), 30);
assert.equal(getFrameScale(4), 0.5);
assert.equal(getFrameScale(16.67), 1);
assert.equal(getFrameScale(40), 1.6);
assert.equal(getFrameScale(10, 20, 0.25, 2), 0.5);
assert.equal(getGrabCorrectionMagnitude(50, 10), 0.006);
assert.equal(getGrabCorrectionMagnitude(200, 10), 0.014);
assert.equal(getGrabCorrectionMagnitude(200, 10, 0.002), 0.02);
assert.equal(getGrabFrictionAir(undefined), 0.045);
assert.equal(getGrabFrictionAir(0.01), 0.045);
assert.equal(getGrabFrictionAir(0.08), 0.08);
assert.equal(getGrabFrictionAir(0.01, 0.02), 0.02);
assert.equal(getHandDragElapsed(8), 16);
assert.equal(getHandDragElapsed(24), 24);
assert.equal(getHandDragElapsed(8, 4), 8);
assert.equal(getHandDragFlickScale(70), 1);
assert.equal(getHandDragFlickScale(280), 0.5);
assert.equal(getHandDragFlickScale(200, 100), 0.5);
assert.equal(shouldUseStepFlick(12, 10), true);
assert.equal(shouldUseStepFlick(10, 10), false);
assert.equal(shouldUseStepFlick(8, 10), false);
assert.equal(getHandFlickAngularVelocity(0.1, 10), 0.22);
assert.equal(getHandFlickAngularVelocity(0.1, 100), 0.44999999999999996);
assert.equal(getHandFlickAngularVelocity(0.1, -100), -0.24999999999999997);
assert.equal(getHandFlickAngularVelocity(0.1, 10, 0.02, -0.1, 0.1), 0.2);
assert.deepEqual(getDirectionOrFallback({ x: 3, y: 4 }, { x: -1, y: 0 }), { x: 0.6, y: 0.8 });
assert.deepEqual(getDirectionOrFallback({ x: 0.0001, y: 0 }, { x: -1, y: 0 }), { x: -1, y: 0 });
assert.deepEqual(getDirectionOrFallback({ x: 0.5, y: 0 }, { x: -1, y: 0 }, 1), { x: -1, y: 0 });
assert.equal(shouldUseLaunchDirection(4.1), true);
assert.equal(shouldUseLaunchDirection(4), false);
assert.equal(shouldUseLaunchDirection(2.1, 2), true);
assert.equal(getClampedLaunchDistance(300, 280), 280);
assert.equal(getClampedLaunchDistance(120, 280), 120);
assert.ok(Math.abs(getThrowScale(140, 280, 0.55, 70, 70) - 0.775) < 0.0000000001);
assert.ok(Math.abs(getThrowScale(125, 250, 0.62, 80, 80) - 0.81) < 0.0000000001);
assert.equal(getPoweredRadius(50, 18, 14), 25);
assert.equal(getPoweredRadius(40, 10, 6, 80), 13);
assert.ok(Math.abs(getLaunchSpeed(60, 16, 0.11) - 22.6) < 0.0000000001);
assert.ok(Math.abs(getLaunchSpeed(60, 12.5, 0.075) - 17) < 0.0000000001);
assert.equal(getSignedAngularVelocity(1, 0.22), 0.22);
assert.equal(getSignedAngularVelocity(-1, 0.22), -0.22);
assert.equal(getSignedAngularVelocity(0, 0.22), 0.22);
assert.equal(getHorizontalSpinSign({ x: 0, y: 1 }), 1);
assert.equal(getHorizontalSpinSign({ x: -0.1, y: 1 }), -1);
assert.equal(getVectorAngle({ x: 1, y: 0 }), 0);
assert.equal(getVectorAngle({ x: 0, y: 1 }), Math.PI / 2);
assert.equal(getVectorAngle({ x: -1, y: 0 }), Math.PI);
assert.equal(getVectorAngle({ x: 0, y: -1 }), -Math.PI / 2);
assert.ok(Math.abs(getProjectileImpulseMagnitude(10, 0.0034) - 0.034) < 0.0000000001);
assert.ok(Math.abs(getProjectileImpulseMagnitude(10, 0.0014) - 0.014) < 0.0000000001);
const scaledVelocity = getScaledVelocity({ x: 10, y: -4 }, 0.35);
assert.ok(Math.abs(scaledVelocity.x - 3.5) < 0.0000000001);
assert.ok(Math.abs(scaledVelocity.y - -1.4) < 0.0000000001);
assert.ok(Math.abs(getDampedAngularVelocity(0.8, 0.55) - 0.44) < 0.0000000001);
assert.ok(Math.abs(getSpinAngularVelocity(0.1, 1, 0.16) - 0.26) < 0.0000000001);
assert.ok(Math.abs(getSpinAngularVelocity(0.1, -1, 0.42) - -0.32) < 0.0000000001);
const directionalVelocity = getVelocityAfterDirectionalImpulse({ x: 2, y: -1 }, { x: 0.6, y: 0.8 }, 2.4, 0.48);
assert.ok(Math.abs(directionalVelocity.x - 1.6512) < 0.0000000001);
assert.ok(Math.abs(directionalVelocity.y - 0.4416) < 0.0000000001);
assert.equal(getRecoveredVelocityComponent(10), 4.5);
assert.equal(getRecoveredVelocityComponent(40), 8);
assert.equal(getRecoveredVelocityComponent(-40), -8);
assert.equal(getRecoveredVelocityComponent(10, 0.2, 3), 2);
assert.equal(shouldReplaceNearest(10, 12), true);
assert.equal(shouldReplaceNearest(12, 12), false);
assert.equal(shouldReplaceNearest(13, 12), false);
assert.equal(isNearFloor(471, 600), true);
assert.equal(isNearFloor(470, 600), false);
assert.equal(isNearFloor(undefined, 600), false);
assert.equal(isNearFloor(51, 100, 50), true);
assert.equal(shouldSkipWallRecovery(999, 1000), true);
assert.equal(shouldSkipWallRecovery(1000, 1000), false);
assert.equal(getNextWallRecoveryCooldown(1000), 1420);
assert.equal(getNextWallRecoveryCooldown(1000, 200), 1200);
assert.deepEqual(getCombinedBounds([
  { bounds: { min: { x: 12, y: -4 }, max: { x: 30, y: 40 } } },
  { bounds: { min: { x: -8, y: 2 }, max: { x: 22, y: 55 } } },
  { bounds: { min: { x: 4, y: -10 }, max: { x: 60, y: 20 } } }
]), { minX: -8, maxX: 60, minY: -10, maxY: 55 });
assert.deepEqual(getWallRecoveryOffset({ minX: 40, maxX: 900, minY: 0, maxY: 620 }, { width: 960, height: 640 }), { x: 0, y: 0 });
assert.deepEqual(getWallRecoveryOffset({ minX: 10, maxX: 900, minY: 0, maxY: 620 }, { width: 960, height: 640 }), { x: 8, y: 0 });
assert.deepEqual(getWallRecoveryOffset({ minX: 40, maxX: 950, minY: 0, maxY: 620 }, { width: 960, height: 640 }), { x: -8, y: 0 });
assert.deepEqual(getWallRecoveryOffset({ minX: 40, maxX: 900, minY: -100, maxY: 620 }, { width: 960, height: 640 }), { x: 0, y: 20 });
assert.deepEqual(getWallRecoveryOffset({ minX: 40, maxX: 900, minY: 0, maxY: 730 }, { width: 960, height: 640 }), { x: 0, y: -20 });
assert.deepEqual(getWallRecoveryOffset({ minX: 45, maxX: 900, minY: -35, maxY: 260 }, { width: 960, height: 640 }, 40, -30, 50), { x: 0, y: 5 });
assert.equal(shouldApplySelfRighting(0.5, 0.1), true);
assert.equal(shouldApplySelfRighting(0.4, 0.1), false);
assert.equal(shouldApplySelfRighting(0.5, 0.18), false);
assert.equal(shouldApplySelfRighting(-0.5, -0.1), true);
assert.equal(shouldApplySelfRighting(0.25, 0.1, 0.2), true);
assert.equal(getSelfRightingAngularVelocity(0.1, 0.5, 100), 0.069);
assert.equal(getSelfRightingAngularVelocity(-0.1, -0.5, 100, 0.001), -0.05);
const selfRightingForce = getSelfRightingForce(0.5, 20);
assert.ok(Math.abs(selfRightingForce.x - -0.0001) < 0.0000000001);
assert.ok(Math.abs(selfRightingForce.y - -0.00044) < 0.0000000001);
const customSelfRightingForce = getSelfRightingForce(-0.5, 20, 0.00002, 0.00004);
assert.ok(Math.abs(customSelfRightingForce.x - 0.0002) < 0.0000000001);
assert.ok(Math.abs(customSelfRightingForce.y - -0.0008) < 0.0000000001);

assert.equal(getComboMultiplier(0), 1);
assert.equal(getComboMultiplier(1), 1);
assert.equal(getComboMultiplier(2), 1.22);
assert.equal(getComboMultiplier(8), 2.54);
assert.equal(getComboMultiplier(99), 2.54);
assert.equal(getScoreAntiGrind(0), 1);
assert.equal(getScoreAntiGrind(2), 0.6599999999999999);
assert.equal(getScoreAntiGrind(8), 0.35);
assert.equal(incrementToolHeat(0), 1);
assert.equal(incrementToolHeat(4.5), 5);
assert.equal(incrementToolHeat(5), 5);
assert.equal(decayToolHeat(3, 850), 2.9);
assert.equal(decayToolHeat(0.05, 850), 0);
assert.equal(decayToolHeat(1, 500, 1000), 0.5);
assert.equal(getFeedbackIntensity(1), 0.25);
assert.equal(getFeedbackIntensity(14), 0.5);
assert.equal(getFeedbackIntensity(999), 1.8);
assert.equal(calculateReward(10, 1.22, 0.66), 8);
assert.equal(calculateReward(0.2, 1, 1), 1);
assert.equal(calculateReward(0.2, 1, 1, 0), 0);
assert.equal(calculateXpGain(10), 4);
assert.equal(calculateXpGain(1), 1);
assert.equal(calculateXpGain(10, 0.5, 0), 5);
assert.equal(getChallengeRecordAmount("impact", 100), 1);
assert.equal(getChallengeRecordAmount("airborne", 6), 1);
assert.equal(getChallengeRecordAmount("airborne", 20), 3);
assert.equal(getChallengeRecordAmount("airborne", 20, 5), 4);
assert.equal(shouldSkipAirborneForSpawnGrace(999, 1000), true);
assert.equal(shouldSkipAirborneForSpawnGrace(1000, 1000), false);
assert.equal(shouldAwardAirborne(451, 500, 600), true);
assert.equal(shouldAwardAirborne(450, 500, 600), false);
assert.equal(shouldAwardAirborne(451, 515, 600), false);
assert.equal(shouldAwardAirborne(451, undefined, 600), false);
assert.equal(shouldAwardAirborne(301, 20, 100, 300, 60), true);
assert.equal(getAirborneScore(3), 21);
assert.equal(getAirborneScore(3, 5), 15);
assert.deepEqual(advanceAirborneBank(0.2, 300), { bank: 0.5, seconds: 0 });
assert.deepEqual(advanceAirborneBank(0.75, 250), { bank: 0, seconds: 1 });
const airborneBank = advanceAirborneBank(0.5, 2600);
assert.equal(airborneBank.seconds, 3);
assert.ok(Math.abs(airborneBank.bank - 0.1) < 0.0000000001);
assert.equal(getComboFillPercent(0, 4200), 0);
assert.equal(getComboFillPercent(-1, 4200), 0);
assert.equal(getComboFillPercent(2100, 4200), 50);
assert.equal(getComboFillPercent(4200, 4200), 100);
assert.equal(getComboFillPercent(5000, 4200), 100);
assert.equal(getComboFillPercent(100, 0), 0);
assert.equal(formatHudCash(10.4), "$10");
assert.equal(formatHudCash(10.5), "$11");
assert.equal(formatHudCash(1234.4), "$1234");
assert.equal(formatHudXp(8.4), "8");
assert.equal(formatHudXp(8.5), "9");
assert.equal(formatPowerLabel(60), "60");
assert.equal(formatPowerLabel(60.4), "60");
assert.equal(formatPowerLabel(60.5), "61");
assert.deepEqual(getPowerControlPresentation("60.5"), { power: 60.5, label: "61" });
assert.deepEqual(getPowerControlPresentation(24.4), { power: 24.4, label: "24" });
assert.equal(formatComboLabel(0), "x1.00");
assert.equal(formatComboLabel(1), "x1.00");
assert.equal(formatComboLabel(2), "x1.22");
assert.equal(formatComboLabel(99), "x2.54");
assert.deepEqual(getHudCorePresentation({
  cash: 10.5,
  xp: 8.5,
  comboCount: 2,
  comboTimer: 2100,
  comboWindowMs: 4200,
  power: 60.5
}), {
  cash: "$11",
  xp: "9",
  combo: "x1.22",
  comboFillPercent: 50,
  power: "61"
});
assert.equal(calculateFps(15, 250), 60);
assert.equal(calculateFps(1, 1000), 1);
assert.equal(calculateFps(0, 250), 1);
assert.equal(formatFpsLabel(true, 59), "FPS 59");
assert.equal(formatFpsLabel(false, 59), "FPS 0");
assert.deepEqual(getFpsCounterPresentation(true, 59), { visible: true, label: "FPS 59" });
assert.deepEqual(getFpsCounterPresentation(false, 59), { visible: false, label: "FPS 0" });
assert.deepEqual(getFpsSamplePresentation(3, 120, 40), { frames: 4, elapsed: 160 });
assert.deepEqual(getFpsSamplePresentation(14, 240, 10), { frames: 0, elapsed: 0, value: 60, label: "FPS 60" });
assert.deepEqual(getFpsSamplePresentation(1, 90, 20, 100), { frames: 0, elapsed: 0, value: 18, label: "FPS 18" });
assert.deepEqual(getToastPresentation("Saved."), { message: "Saved.", visibleClass: "toast--visible", timerMs: 2600 });
assert.deepEqual(getToastPresentation("Saved.", 1200), { message: "Saved.", visibleClass: "toast--visible", timerMs: 1200 });
assert.deepEqual(getToastHiddenPresentation(), { visibleClass: "toast--visible" });
assert.equal(getHudActionToast("newBuddy"), "New buddy spawned.");
assert.equal(getHudActionToast("sceneReset"), "Scene reset.");
assert.equal(getHudActionToast("missing"), "Ready.");
assert.equal(getRoomMotif({ id: "Retro Office", room: { motif: "Desk + Grid!" } }), "desk---grid-");
assert.equal(getRoomMotif({ id: "Retro Office" }), "retro-office");
assert.equal(getRoomMotif({ id: "" }), "grid");
assert.deepEqual(getRoomPreviewSummary({ id: "retro-office", name: "Retro Office" }), { packId: "retro-office", name: "Retro Office" });
assert.deepEqual(getRoomPreviewSummary({}), { packId: undefined, name: "Room" });
assert.deepEqual(getRoomPreviewShellPresentation({ id: "retro-office", name: "Retro Office" }), {
  packId: "retro-office",
  name: "Retro Office",
  nameClassName: "room-preview__name",
  swatchesClassName: "room-preview__swatches",
  browserClassName: "room-browser"
});
assert.deepEqual(getRoomPreviewShellPresentation({}), {
  packId: undefined,
  name: "Room",
  nameClassName: "room-preview__name",
  swatchesClassName: "room-preview__swatches",
  browserClassName: "room-browser"
});
assert.deepEqual(getRoomApplyPresentation({ background: "#111", floor: "#333" }), { background: "#111", floor: "#333" });
assert.deepEqual(getRoomApplyPresentation({}), { background: "#87968e", floor: "#64736b" });
assert.deepEqual(getRoomSwatches({ background: "#111", grid: "#222", floor: "#333", accent: "#444" }), [
  { label: "Background", color: "#111", title: "Background: #111" },
  { label: "Grid", color: "#222", title: "Grid: #222" },
  { label: "Floor", color: "#333", title: "Floor: #333" },
  { label: "Accent", color: "#444", title: "Accent: #444" }
]);
assert.deepEqual(getRoomSwatches({}), [
  { label: "Background", color: "#87968e", title: "Background: #87968e" },
  { label: "Grid", color: "#87968e", title: "Grid: #87968e" },
  { label: "Floor", color: "#87968e", title: "Floor: #87968e" },
  { label: "Accent", color: "#87968e", title: "Accent: #87968e" }
]);
assert.deepEqual(getRoomSwatchPresentation({ color: "#111", title: "Background: #111" }), {
  className: "room-preview__swatch",
  background: "#111",
  title: "Background: #111",
  ariaLabel: "Background: #111"
});
assert.deepEqual(getRoomThumbnailStyles({ background: "#111", grid: "#222", floor: "#333", accent: "#444" }), {
  "--room-bg": "#111",
  "--room-grid": "#222",
  "--room-floor": "#333",
  "--room-accent": "#444"
});
assert.deepEqual(getRoomThumbnailStyles({}), {
  "--room-bg": "#87968e",
  "--room-grid": "#e8f7f4",
  "--room-floor": "#64736b",
  "--room-accent": "#98f17f"
});
assert.equal(getRoomThumbnailAriaLabel({ name: "Retro Office" }), "Retro Office room thumbnail");
assert.equal(getRoomThumbnailAriaLabel({}), "Room room thumbnail");
assert.deepEqual(getRoomThumbnailPresentation({
  id: "Retro Office",
  name: "Retro Office",
  room: { background: "#111", grid: "#222", floor: "#333", accent: "#444", motif: "Desk + Grid!" }
}, "room-thumbnail--mini"), {
  className: "room-thumbnail room-thumbnail--mini",
  motif: "desk---grid-",
  ariaLabel: "Retro Office room thumbnail",
  styles: {
    "--room-bg": "#111",
    "--room-grid": "#222",
    "--room-floor": "#333",
    "--room-accent": "#444"
  },
  layerClassNames: ["room-thumbnail__grid", "room-thumbnail__floor", "room-thumbnail__accent", "room-thumbnail__buddy"]
});
assert.deepEqual(getRoomBrowserButtonState("retro", "retro"), { active: true, ariaPressed: "true" });
assert.deepEqual(getRoomBrowserButtonState("retro", "base"), { active: false, ariaPressed: "false" });
assert.deepEqual(getRoomBrowserButtonState(undefined, "base"), { active: false, ariaPressed: "false" });
assert.deepEqual(getRoomBrowserButtonPresentation({ id: "retro", name: "Retro Office" }, "retro"), {
  className: "room-browser__button",
  packId: "retro",
  labelClassName: "room-browser__name",
  label: "Retro Office",
  active: true,
  ariaPressed: "true"
});
assert.deepEqual(getRoomBrowserButtonPresentation({}, "base"), {
  className: "room-browser__button",
  packId: undefined,
  labelClassName: "room-browser__name",
  label: "Room",
  active: false,
  ariaPressed: "false"
});
assert.equal(getGiftCost(0), 5);
assert.equal(getGiftCost(124), 5);
assert.equal(getGiftCost(125), 5);
assert.equal(getGiftCost(126), 5);
assert.equal(getGiftCost(375), 15);
assert.equal(getGiftCost(624), 25);
assert.equal(getGiftCost(1000), 25);
assert.deepEqual(Object.keys(gravityModes), ["normal", "low", "heavy"]);
assert.equal(normalizeGravityMode("normal"), "normal");
assert.equal(normalizeGravityMode("low"), "low");
assert.equal(normalizeGravityMode("heavy"), "heavy");
assert.equal(normalizeGravityMode("missing"), "normal");
assert.equal(normalizeGravityMode(undefined), "normal");
assert.deepEqual(getGravityModeConfig("normal"), { label: "Normal", value: 1 });
assert.deepEqual(getGravityModeConfig("low"), { label: "Low Gravity", value: 0.45 });
assert.deepEqual(getGravityModeConfig("heavy"), { label: "Heavy Gravity", value: 1.55 });
assert.deepEqual(getGravityModeConfig("missing"), { label: "Normal", value: 1 });
assert.equal(getSlowMoTimeScale(true), 0.55);
assert.equal(getSlowMoTimeScale(false), 1);
assert.equal(getCeilingY(true), -120);
assert.equal(getCeilingY(false), -18);
assert.equal(getCeilingToggleToast(true), "Ceiling opened.");
assert.equal(getCeilingToggleToast(false), "Ceiling closed.");
assert.equal(getSlowMoToggleToast(true), "Slow motion enabled.");
assert.equal(getSlowMoToggleToast(false), "Slow motion disabled.");
assert.equal(getGravityModeToast("low"), "Low Gravity enabled.");
assert.equal(getGravityModeToast("missing"), "Normal enabled.");
assert.equal(getFpsCounterToggleToast(true), "FPS counter enabled.");
assert.equal(getFpsCounterToggleToast(false), "FPS counter disabled.");
assert.deepEqual(getBooleanModeButtonState(true), { ariaPressed: "true" });
assert.deepEqual(getBooleanModeButtonState(false), { ariaPressed: "false" });
assert.deepEqual(getBooleanModeButtonStates({ ceilingOpen: true, slowMo: false }), {
  ceiling: { ariaPressed: "true" },
  slowMo: { ariaPressed: "false" }
});
assert.deepEqual(getGravityModeButtonState("low", "low"), { ariaPressed: "true", active: true });
assert.deepEqual(getGravityModeButtonState("low", "heavy"), { ariaPressed: "false", active: false });
assert.deepEqual(getGravityModeButtonState("normal", "missing"), { ariaPressed: "true", active: true });
assert.deepEqual(getGravityModeButtonState("missing", "missing"), { ariaPressed: "false", active: false });
assert.equal(getRopeAnchorX(100, 960), 100);
assert.equal(getRopeAnchorX(10, 960), 42);
assert.equal(getRopeAnchorX(940, 960), 918);
assert.equal(getRopeAnchorX(12, 100, 20), 20);
assert.equal(getRopeAnchorY(true), 28);
assert.equal(getRopeAnchorY(false), 8);
assert.equal(getRopeLength(20), 70);
assert.equal(getRopeLength(100), 78);
assert.equal(getRopeLength(100, 0.5, 80), 80);
assert.equal(getRopeLength(200, 0.5, 80), 100);
assert.equal(getRopeStiffness(0), 0.018);
assert.ok(Math.abs(getRopeStiffness(90) - 0.028) < 0.0000000001);
assert.equal(getRopeStiffness(50, 0.02, 1000), 0.07);
assert.equal(shouldPruneRopes(6), false);
assert.equal(shouldPruneRopes(7), true);
assert.equal(shouldPruneRopes(3, 2), true);

assert.equal(getMoodFace("Calm"), ":)");
assert.equal(getMoodFace("Curious"), ":o");
assert.equal(getMoodFace("Happy"), ":D");
assert.equal(getMoodFace("Afraid"), ":/");
assert.equal(getMoodFace("Excited"), ":>");
assert.equal(getMoodFace("Surprised"), ":O");
assert.equal(getMoodFace("Stunned"), "x_x");
assert.equal(getMoodFace("Angry"), ">:(");
assert.equal(getMoodFace("Unknown"), ":)");
assert.deepEqual(getMoodHudPresentation("Happy"), { mood: "Happy", face: ":D" });
assert.deepEqual(getMoodHudPresentation("Unknown"), { mood: "Unknown", face: ":)" });

assert.equal(getRuntimeToolMetaLabel({ toolId: "ball", toolCategory: "Props", pointerDown: false, rubberCooldown: 0, rubberBurstShots: 0 }), "Props");
assert.equal(getRuntimeToolMetaLabel({ toolId: "ball", pointerDown: false, rubberCooldown: 0, rubberBurstShots: 0 }), "Ready");
assert.equal(getRuntimeToolMetaLabel({ toolId: "rubber", pointerDown: false, rubberCooldown: 0, rubberBurstShots: 0 }), "Ready");
assert.equal(getRuntimeToolMetaLabel({ toolId: "rubber", pointerDown: false, rubberCooldown: 0, rubberBurstShots: 3 }), "Burst 3/6");
assert.equal(getRuntimeToolMetaLabel({ toolId: "rubber", pointerDown: true, rubberCooldown: 0, rubberBurstShots: 2 }), "Burst 2 | Ready");
assert.equal(getRuntimeToolMetaLabel({ toolId: "rubber", pointerDown: true, rubberCooldown: 12.1, rubberBurstShots: 2 }), "Burst 2 | 13ms");
assert.equal(getRuntimeToolMetaLabel({ toolId: "rubber", pointerDown: true, rubberCooldown: -4, rubberBurstShots: 2 }), "Burst 2 | Ready");
const rubberTool = { name: "Rubber Blaster", cost: 180 };
const fullRubberTool = { id: "rubber", icon: "R", name: "Rubber Blaster", category: "Projectiles", description: "Shoots soft beads." };
assert.equal(getLockedToolToast(rubberTool), "Rubber Blaster is locked. Buy it for $180.");
assert.equal(getToolRailButtonTitle({ name: "Rubber Blaster", description: "Shoots soft beads." }, 2), "3. Shoots soft beads.");
assert.equal(getRadialToolButtonTitle({ name: "Rubber Blaster", description: "Shoots soft beads." }), "Rubber Blaster: Shoots soft beads.");
assert.deepEqual(getRadialToolButtonPlacement(0, 4, 100), {
  angle: -Math.PI / 2,
  transform: "translate(6.123233995736766e-15px, -100px)"
});
assert.deepEqual(getRadialToolButtonPlacement(1, 4, 100), {
  angle: 0,
  transform: "translate(100px, 0px)"
});
assert.deepEqual(getToolSelectionPanel({ name: "Rubber Blaster", description: "Shoots soft beads." }), {
  name: "Rubber Blaster",
  description: "Shoots soft beads."
});
assert.equal(getRadialWheelCenterLabel(), "Tools");
assert.deepEqual(getRadialWheelVisibilityPresentation(true), {
  openClass: "radial-wheel--open",
  radialOpen: true
});
assert.deepEqual(getRadialWheelVisibilityPresentation(false), {
  openClass: "radial-wheel--open",
  radialOpen: false
});
assert.deepEqual(getMenuCategoryPresentation("Projectiles"), { className: "menu__category", label: "Projectiles" });
assert.equal(getToolRailButtonMarkup({ icon: "R", name: "Rubber Blaster", category: "Projectiles" }), `
      <span class="tool-button__icon">R</span>
      <span class="tool-button__copy">
        <strong>Rubber Blaster</strong>
        <span>Projectiles</span>
      </span>
    `);
assert.deepEqual(getToolRailButtonPresentation(fullRubberTool, 2), {
  className: "tool-button",
  toolId: "rubber",
  title: "3. Shoots soft beads.",
  markup: `
      <span class="tool-button__icon">R</span>
      <span class="tool-button__copy">
        <strong>Rubber Blaster</strong>
        <span>Projectiles</span>
      </span>
    `
});
assert.deepEqual(getRadialToolButtonPresentation(fullRubberTool, 1, 4), {
  className: "radial-wheel__button",
  toolId: "rubber",
  transform: "translate(92px, 0px)",
  icon: "R",
  title: "Rubber Blaster: Shoots soft beads."
});
assert.equal(getShopMenuItemLabel(rubberTool, true), "Rubber Blaster");
assert.equal(getShopMenuItemLabel(rubberTool, false), "Rubber Blaster - $180");
assert.deepEqual(getShopMenuButtonPresentation(rubberTool, true), { text: "Rubber Blaster" });
assert.deepEqual(getShopMenuButtonPresentation(rubberTool, false), { text: "Rubber Blaster - $180" });
assert.equal(getRadialToolAriaLabel(rubberTool, true), "Rubber Blaster");
assert.equal(getRadialToolAriaLabel(rubberTool, false), "Rubber Blaster locked, costs $180");
assert.deepEqual(getToolButtonState("rubber", "rubber", true), { active: true, locked: false });
assert.deepEqual(getToolButtonState("rubber", "hand", false), { active: false, locked: true });
assert.deepEqual(getToolButtonState(undefined, "hand", false), { active: false, locked: true });
assert.deepEqual(getRadialToolButtonState("rubber", "rubber", rubberTool, true), {
  active: true,
  locked: false,
  ariaLabel: "Rubber Blaster"
});
assert.deepEqual(getRadialToolButtonState("rubber", "hand", rubberTool, false), {
  active: false,
  locked: true,
  ariaLabel: "Rubber Blaster locked, costs $180"
});
assert.equal(getToolUseToast("platformPlaced"), "Platform placed.");
assert.equal(getToolUseToast("bumperPlaced"), "Bumper placed.");
assert.equal(getToolUseToast("conveyorPlaced"), "Conveyor belt placed.");
assert.equal(getToolUseToast("giftNeedCash"), "Need a little cash for a gift.");
assert.equal(getToolUseToast("moneyDrop"), "Money drop!");
assert.equal(getToolUseToast("treatTossed"), "Treat tossed.");
assert.equal(getToolUseToast("confettiFired"), "Confetti popper fired.");
assert.equal(getToolUseToast("boomboxPlaying"), "Boombox playing.");
assert.equal(getToolUseToast("ropeNeedsBuddy"), "Rope needs a buddy limb.");
assert.equal(getToolUseToast("ropeAttached"), "Elastic rope attached.");
assert.equal(getToolUseToast("missing"), "Ready.");
assert.equal(getExplosiveArmedToast("firecracker"), "Firecracker lit.");
assert.equal(getExplosiveArmedToast("grenade"), "Grenade armed.");
assert.equal(getExplosiveArmedToast("mine"), "Mine armed.");
assert.equal(getExplosiveArmedToast("stickybomb", true), "Sticky bomb attached.");
assert.equal(getExplosiveArmedToast("stickybomb", false), "Sticky bomb armed.");
assert.equal(getExplosiveArmedToast("largebomb"), "Cartoon bomb lit.");
assert.equal(getExplosiveArmedToast("missing"), "Explosive armed.");
assert.deepEqual(getMouseConstraintConfig("hand"), { mask: 0xffffffff, stiffness: 0.72, damping: 0.18, clearBody: false, stopWind: true });
assert.deepEqual(getMouseConstraintConfig("fan"), { mask: 0x00000000, stiffness: 0.001, clearBody: true, stopWind: false });
assert.deepEqual(getMouseConstraintConfig("ball"), { mask: 0x00000000, stiffness: 0.001, clearBody: true, stopWind: true });
assert.deepEqual(getCircularCosmeticArc(31, -0.32, -0.38, 0.18), { x: -9.92, y: -11.78, radius: 5.58 });
assert.deepEqual(getCircularCosmeticArc(18, -0.3, -0.36, 0.2), { x: -5.3999999999999995, y: -6.4799999999999995, radius: 3.6 });
assert.deepEqual(getCircularCosmeticArc(18, -0.35, -0.42, 0.18), { x: -6.3, y: -7.56, radius: 3.2399999999999998 });
const treatArc = getCircularCosmeticArc(17, -0.2, -0.18, 0.45);
assert.ok(Math.abs(treatArc.x - -3.4) < 0.0000000001);
assert.ok(Math.abs(treatArc.y - -3.06) < 0.0000000001);
assert.ok(Math.abs(treatArc.radius - 7.65) < 0.0000000001);
assert.deepEqual(getCircularCosmeticArc(16, 0, 0.35, 0.58), { x: 0, y: 5.6, radius: 9.28 });
assert.deepEqual(getCosmeticPolarPoint(0, 7.65, 7.14), { x: 7.65, y: 0 });
const treatChipPoint = getCosmeticPolarPoint(Math.PI / 2, 7.65, 7.14);
assert.ok(Math.abs(treatChipPoint.x) < 0.0000000001);
assert.ok(Math.abs(treatChipPoint.y - 7.14) < 0.0000000001);
const bumperBoltPoint = getCosmeticPolarPoint(Math.PI / 4, 16);
assert.ok(Math.abs(bumperBoltPoint.x - 11.313708498984761) < 0.0000000001);
assert.ok(Math.abs(bumperBoltPoint.y - 11.31370849898476) < 0.0000000001);
const beachSeamPoint = getCosmeticPolarPoint(-Math.PI / 2, 30);
assert.ok(Math.abs(beachSeamPoint.x) < 0.0000000001);
assert.ok(Math.abs(beachSeamPoint.y - -30) < 0.0000000001);
const starPoint = getCosmeticPolarPoint(-Math.PI / 2 + Math.PI / 5, 6);
assert.ok(Math.abs(starPoint.x - 3.526711513754839) < 0.0000000001);
assert.ok(Math.abs(starPoint.y - -4.854101966249685) < 0.0000000001);
assert.deepEqual(getCosmeticPolarSegment(0, 18, 26), { from: { x: 18, y: 0 }, to: { x: 26, y: 0 } });
const mineToothSegment = getCosmeticPolarSegment(Math.PI / 4, 18, 26);
assert.ok(Math.abs(mineToothSegment.from.x - 12.727922061357857) < 0.0000000001);
assert.ok(Math.abs(mineToothSegment.from.y - 12.727922061357855) < 0.0000000001);
assert.ok(Math.abs(mineToothSegment.to.x - 18.38477631085024) < 0.0000000001);
assert.ok(Math.abs(mineToothSegment.to.y - 18.384776310850235) < 0.0000000001);

const migratedSave = migrateRuntimeSave({
  cash: 123,
  xp: 45,
  unlockedTools: ["hand", "ball", 7, "fan"],
  unlockedSkins: ["classic", false, "grid"],
  selectedSkin: "grid",
  settings: {
    reducedFlash: 1,
    slapstick: false,
    audio: false,
    haptics: false,
    assetPack: "retro-office",
    audioPack: "soft",
    liquidType: "goo",
    slowMo: true,
    ceilingOpen: true,
    gravityMode: "low",
    fpsCounter: true
  },
  customAssetPacks: [{ id: "private-pack" }],
  challengeMode: "juggle",
  challengeBests: { juggle: 12 },
  tool: "fan"
}, 2);
assert.equal(migratedSave.version, 2);
assert.equal(migratedSave.cash, 123);
assert.equal(migratedSave.xp, 45);
assert.deepEqual(migratedSave.unlockedTools, ["hand", "ball", "fan"]);
assert.deepEqual(migratedSave.unlockedSkins, ["classic", "grid"]);
assert.equal(migratedSave.selectedSkin, "grid");
assert.deepEqual(migratedSave.settings, {
  reducedFlash: true,
  slapstick: false,
  audio: false,
  haptics: false,
  assetPack: "retro-office",
  audioPack: "soft",
  liquidType: "goo",
  slowMo: true,
  ceilingOpen: true,
  gravityMode: "low",
  fpsCounter: true
});
assert.deepEqual(migratedSave.customAssetPacks, [{ id: "private-pack" }]);
assert.equal(migratedSave.challengeMode, "juggle");
assert.deepEqual(migratedSave.challengeBests, { juggle: 12 });
assert.equal(migratedSave.tool, "fan");

const fallbackSave = migrateRuntimeSave({ settings: { gravityMode: "space" }, customAssetPacks: "bad", challengeBests: [] }, 3);
assert.equal(fallbackSave.version, 3);
assert.deepEqual(fallbackSave.unlockedTools, ["hand", "ball", "rope", "water"]);
assert.deepEqual(fallbackSave.unlockedSkins, ["classic"]);
assert.equal(fallbackSave.selectedSkin, "classic");
assert.equal(fallbackSave.settings.gravityMode, "normal");
assert.equal(fallbackSave.settings.assetPack, "base");
assert.equal(fallbackSave.settings.audioPack, "classic");
assert.equal(fallbackSave.settings.liquidType, "water");
assert.deepEqual(fallbackSave.customAssetPacks, []);
assert.deepEqual(fallbackSave.challengeBests, {});
assert.equal(fallbackSave.challengeMode, "free");
assert.equal(fallbackSave.tool, "hand");

const payload = createRuntimeSavePayload({
  cash: 12,
  xp: 34,
  unlockedTools: new Set(["hand", "rope"]),
  unlockedSkins: new Set(["classic", "grid"]),
  selectedSkin: "classic",
  settings: migratedSave.settings,
  customAssetPacks: [{ id: "private-pack" }],
  challengeMode: "free",
  challengeBests: { free: 1 },
  tool: "hand"
}, 4);
assert.equal(payload.version, 4);
assert.deepEqual(payload.unlockedTools, ["hand", "rope"]);
assert.deepEqual(payload.unlockedSkins, ["classic", "grid"]);
assert.deepEqual(payload.challengeBests, { free: 1 });

const scenePreset = createScenePreset(
  { enabled: true, level: 420, type: "goo" },
  [
    { label: "buddy_head", position: { x: 1, y: 2 }, angle: 0.5 },
    { label: "prop_ball", position: { x: 10, y: 20 }, angle: 0.25 },
    { label: "trampoline", position: { x: Number.NaN, y: 44 }, angle: "bad" }
  ]
);
assert.deepEqual(scenePreset, {
  liquid: { enabled: true, level: 420, type: "goo" },
  props: [
    { label: "prop_ball", x: 10, y: 20, angle: 0.25 },
    { label: "trampoline", x: 0, y: 44, angle: 0 }
  ]
});
const cappedScenePreset = createScenePreset({}, Array.from({ length: 40 }, (_, index) => ({
  label: `prop_${index}`,
  position: { x: index, y: index + 1 },
  angle: index / 10
})));
assert.equal(cappedScenePreset.props.length, 35);
assert.equal(cappedScenePreset.props[0].label, "prop_5");
assert.deepEqual(parseStoredScenePreset(null), { status: "missing", preset: null });
assert.deepEqual(parseStoredScenePreset("{bad"), { status: "invalid", preset: null });
assert.deepEqual(parseStoredScenePreset(JSON.stringify({ liquid: { type: "water" }, props: [{ label: "prop_ball", x: 5, y: 6, angle: 0.7 }, { label: 42 }] })), {
  status: "ready",
  preset: {
    liquid: { type: "water" },
    props: [{ label: "prop_ball", x: 5, y: 6, angle: 0.7 }]
  }
});
assert.equal(getScenePresetSaveToast(), "Scene preset saved.");
assert.equal(getScenePresetLoadToast("missing"), "No saved preset found.");
assert.equal(getScenePresetLoadToast("invalid"), "Scene preset could not be loaded.");
assert.equal(getScenePresetLoadToast("ready"), "Scene preset loaded.");

const runtimeSkins = [
  { id: "classic", color: "#d6ded9", accent: "#f5faf7" },
  { id: "robot", color: "#aeb7bd", accent: "#5ee0ff" },
  { id: "textured", color: "#6fffe2", accent: "#f1ff8b", texture: "skins/circuit.svg", textureScale: 0.64 }
];
assert.equal(getRuntimeSkin(runtimeSkins, "robot").id, "robot");
assert.equal(getRuntimeSkin(runtimeSkins, "missing").id, "classic");
assert.throws(() => getRuntimeSkin([], "missing"), /Runtime skin catalog is empty/);
assert.deepEqual(getRuntimeSkinPhysics("robot"), { density: 1.45, frictionAir: 1.35, restitution: 0.72, label: "robot-heavy" });
assert.deepEqual(getRuntimeSkinPhysics("classic-arcade:moon-boot"), { density: 0.96, frictionAir: 0.82, restitution: 1.46, label: "moon-boot-spring" });
assert.deepEqual(getRuntimeSkinPhysics("missing"), { density: 1, frictionAir: 1, restitution: 1, label: "standard" });
assert.deepEqual(getSkinSpriteRender(runtimeSkins[0]), {});
assert.deepEqual(getSkinSpriteRender(runtimeSkins[2]), { texture: "skins/circuit.svg", xScale: 0.64, yScale: 0.64 });
assert.deepEqual(getSkinSpriteRender({ ...runtimeSkins[2], textureScale: undefined }), { texture: "skins/circuit.svg", xScale: 0.72, yScale: 0.72 });
assert.deepEqual(getSkinBodyRender(runtimeSkins[0], "buddy_head"), {
  fillStyle: "#d6ded9",
  strokeStyle: "#f5faf7",
  lineWidth: 2,
  sprite: {}
});
assert.deepEqual(getSkinBodyRender(runtimeSkins[2], "buddy_torso"), {
  fillStyle: "#6fffe2",
  strokeStyle: "#f1ff8b",
  lineWidth: 1,
  sprite: { texture: "skins/circuit.svg", xScale: 0.64, yScale: 0.64 }
});
assert.deepEqual(getClassicPartRenderGeometry({ width: 40, height: 60, radius: 18 }, true), {
  radius: 18,
  gradientFocusX: -8.8,
  gradientFocusY: -16.8,
  gradientInnerRadius: 1.44,
  gradientOuterRadius: 43.199999999999996,
  lineWidth: 1.6,
  highlightX: -6.800000000000001,
  highlightY: -13.8,
  highlightRadiusX: 5.040000000000001,
  highlightRadiusY: 2.34
});
assert.deepEqual(getClassicPartRenderGeometry({ width: 30, height: 20 }, false), {
  radius: 10,
  gradientFocusX: -6.6,
  gradientFocusY: -5.6000000000000005,
  gradientInnerRadius: 1,
  gradientOuterRadius: 21.599999999999998,
  lineWidth: 1.2,
  highlightX: -5.1000000000000005,
  highlightY: -4.6000000000000005,
  highlightRadiusX: 2.8000000000000003,
  highlightRadiusY: 1.6
});
assert.deepEqual(getClassicFaceRenderGeometry(20, "Happy", ":)"), {
  eyeLeftX: -6.4,
  eyeRightX: 6.4,
  eyeY: -2,
  dotEyeRadius: 1.1,
  xEyeSize: 2,
  useXEyes: false,
  mouthX: 0,
  mouthY: 2,
  mouthRadius: 6.800000000000001,
  mouthStartAngle: 0.28,
  mouthEndAngle: Math.PI - 0.28
});
assert.deepEqual(getClassicFaceRenderGeometry(20, "Surprised", ":o"), {
  eyeLeftX: -6.4,
  eyeRightX: 6.4,
  eyeY: -2,
  dotEyeRadius: 1.1,
  xEyeSize: 2,
  useXEyes: false,
  mouthX: 0,
  mouthY: 5.6000000000000005,
  mouthRadius: 2.6,
  mouthStartAngle: 0,
  mouthEndAngle: Math.PI * 2
});
assert.deepEqual(getClassicFaceRenderGeometry(20, "Stunned", "x_x"), {
  eyeLeftX: -6.4,
  eyeRightX: 6.4,
  eyeY: -2,
  dotEyeRadius: 1.1,
  xEyeSize: 2,
  useXEyes: true,
  mouthX: 0,
  mouthY: 7.199999999999999,
  mouthRadius: 5.6000000000000005,
  mouthStartAngle: Math.PI * 1.12,
  mouthEndAngle: Math.PI * 1.88
});
assert.deepEqual(getAppliedSkinPhysics(
  { density: 0.0016, frictionAir: 0.01, restitution: 0.35 },
  getRuntimeSkinPhysics("robot")
), {
  density: 0.00232,
  frictionAir: 0.013500000000000002,
  restitution: 0.252,
  label: "robot-heavy"
});

const fanItem = { id: "fan", name: "Fan", cost: 120 };
assert.deepEqual(resolveToolPurchase(fanItem, 200, false), {
  status: "purchased",
  cash: 80,
  missing: 0,
  message: "Fan unlocked."
});
assert.deepEqual(resolveToolPurchase(fanItem, 90, false), {
  status: "insufficient",
  cash: 90,
  missing: 30,
  message: "Need $30 more for Fan."
});
assert.deepEqual(resolveToolPurchase(fanItem, 200, true), {
  status: "owned",
  cash: 200,
  missing: 0,
  message: "Fan already unlocked."
});
const neonSkin = { id: "neon", name: "Neon Mascot", cost: 50 };
assert.deepEqual(resolveSkinPurchase(neonSkin, 80, false), {
  status: "purchased",
  cash: 30,
  missing: 0,
  selectedSkin: "neon",
  message: "Neon Mascot unlocked."
});
assert.deepEqual(resolveSkinPurchase(neonSkin, 40, false), {
  status: "insufficient",
  cash: 40,
  missing: 10,
  selectedSkin: "",
  message: "Need $10 more for Neon Mascot."
});
assert.deepEqual(resolveSkinPurchase(neonSkin, 40, true), {
  status: "owned",
  cash: 40,
  missing: 0,
  selectedSkin: "neon",
  message: "Neon Mascot equipped."
});
assert.deepEqual(getShopItemButtonState("tool", false, false), { text: "Buy", disabled: false });
assert.deepEqual(getShopItemButtonState("tool", true, false), { text: "Owned", disabled: true });
assert.deepEqual(getShopItemButtonState("skin", true, false), { text: "Equip", disabled: false });
assert.deepEqual(getShopItemButtonState("skin", true, true), { text: "Equipped", disabled: true });

const challengeModes = {
  free: { name: "Free", event: "", target: 0, duration: 0, reward: 0 },
  liquid: { name: "Liquid Control", event: "liquid", target: 2, duration: 50, reward: 210 }
};
assert.equal(formatChallengeProgress(2), "2");
assert.equal(formatChallengeProgress(2.25), "2.3");
assert.equal(coverageMissionIds[0], "rope2");
const missionPool = [
  { id: "rope2", title: "Rope", description: "Use rope.", target: 2, event: "tether", reward: 10 },
  { id: "liquid2", title: "Liquid", description: "Use liquid.", target: 2, event: "liquid", reward: 20 },
  { id: "impact10", title: "Impact", description: "Impact.", target: 10, event: "impact", reward: 50 }
];
const chosenMissions = chooseRuntimeMissions(missionPool, 0, () => 0.8);
assert.equal(chosenMissions.missionCycle, 1);
assert.equal(chosenMissions.missions.length, 3);
assert.equal(chosenMissions.missions[0].id, "rope2");
assert.equal(chosenMissions.missions[0].progress, 0);
assert.equal(chosenMissions.missions[0].completed, false);
assert.ok(chosenMissions.missions[0].uniqueTags instanceof Set);
const fallbackMissions = chooseRuntimeMissions(missionPool, 8, () => 0.8, ["missing"]);
assert.equal(fallbackMissions.missions[0].id, "impact10");
assert.deepEqual(chooseRuntimeMissions([], 2, () => 0.8), { missions: [], missionCycle: 3 });
assert.equal(getMissionProgressPercent(1, 2), 50);
assert.equal(getMissionProgressPercent(9, 2), 100);
assert.equal(advanceMissionProgress(1.5, 1, 2), 2);
assert.deepEqual(getMissionReward(15), { cash: 15, xp: 8 });
assert.equal(getChallengeModeId(challengeModes, "liquid"), "liquid");
assert.equal(getChallengeModeId(challengeModes, "missing"), "free");
assert.equal(getChallengeModeOptionLabel(challengeModes.free), "Free Play");
assert.equal(getChallengeModeOptionLabel(challengeModes.liquid), "Liquid Control");
assert.deepEqual(getChallengeModeOption("free", challengeModes.free), { value: "free", label: "Free Play" });
assert.deepEqual(getChallengeModeOption("liquid", challengeModes.liquid), { value: "liquid", label: "Liquid Control" });
assert.deepEqual(createChallengeStartState(challengeModes, "liquid", 1000), {
  mode: "liquid",
  progress: 0,
  timeLeft: 50,
  completed: false,
  startedAt: 1000,
  lastResult: null
});
assert.equal(decrementChallengeTime(3, 400), 2.6);
assert.equal(decrementChallengeTime(0.2, 400), 0);
assert.equal(advanceChallengeProgress(1.5, 1, 2), 2);
assert.equal(advanceChallengeProgress(0.25, 0.5, 2), 0.75);
assert.deepEqual(getChallengeReward(210), { cash: 210, xp: 126 });
const finishedChallenge = createChallengeResult({
  modeId: "liquid",
  mode: challengeModes.liquid,
  success: true,
  startedAt: 1000,
  now: 3500,
  previousBest: { elapsed: 3, completedAt: 1 },
  completedAt: 999
});
assert.deepEqual(finishedChallenge, {
  result: {
    mode: "liquid",
    name: "Liquid Control",
    success: true,
    elapsed: 2.5,
    reward: 210,
    isBest: true
  },
  best: { elapsed: 2.5, completedAt: 999 }
});
assert.equal(getChallengeLabel({ modeId: "free", mode: challengeModes.free, progress: 0, timeLeft: 0, completed: false }), "Free");
assert.equal(getChallengeLabel({ modeId: "liquid", mode: challengeModes.liquid, progress: 1, timeLeft: 2.1, completed: false }), "1/2 3s");
assert.equal(getChallengeLabel({ modeId: "liquid", mode: challengeModes.liquid, progress: 2, timeLeft: 0, completed: true }), "Liquid Control done");
assert.equal(getChallengeLabel({ modeId: "liquid", mode: challengeModes.liquid, progress: 2, timeLeft: 0, completed: true, best: { elapsed: 2.5, completedAt: 999 } }), "Liquid Control 2.5s");

const replayChunks = [
  { blob: "old", time: 1000 },
  { blob: "mid", time: 1700 },
  { blob: "new", time: 2600 }
];
assert.deepEqual(trimReplayChunks(replayChunks, 2700, 1000), replayChunks.slice(1));
assert.equal(getReplayBufferSecondsFromChunks(replayChunks.slice(1)), 0.9);
assert.equal(getReplayBufferSecondsFromChunks([]), 0);
assert.equal(getReplayStripText([
  { text: "A", value: 1 },
  { text: "B", value: 2 },
  { text: "C", value: 3 },
  { text: "D", value: 4 },
  { text: "E", value: 5 },
  { text: "F", value: 6 },
  { text: "G", value: 7 },
  { text: "H", value: 8 },
  { text: "I", value: 9 }
], 4.4), "B +$2  |  C +$3  |  D +$4  |  E +$5  |  F +$6  |  G +$7  |  H +$8  |  I +$9  |  video buffer 4s");
assert.deepEqual(createSaveSnapshot({ cash: 12 }, "2026-05-06T00:00:00.000Z"), {
  app: "Buddy Lab 2026",
  type: "progression-save",
  exportedAt: "2026-05-06T00:00:00.000Z",
  save: { cash: 12 }
});
assert.deepEqual(extractImportedSave({ save: { cash: 9 } }), { cash: 9 });
assert.deepEqual(extractImportedSave({ cash: 9 }), { cash: 9 });
assert.equal(getReplayDownloadName(456), "buddy-lab-replay-456.webm");
assert.equal(getSaveDownloadName(123), "buddy-lab-save-123.json");
assert.equal(getReplayDownloadText(2048), "Recent replay ready (2 KB)");
assert.equal(getReplayDownloadText(1), "Recent replay ready (1 KB)");
assert.equal(getSaveDownloadText(2048), "Save snapshot ready (2 KB)");
assert.equal(getReplayReadyToast(0), "Recent 1s replay ready.");
assert.equal(getReplayReadyToast(4.4), "Recent 4s replay ready.");

console.log(JSON.stringify({ ok: true, helpers: ["assetPackRuntime", "challengeState", "toolCatalog", "toolActionMath", "toolPresentation", "coordinates", "effectsMath", "economyMath", "feedbackMapping", "hudPresentation", "layout", "liquidMath", "modeSettings", "progressionState", "physicsMath", "roomPresentation", "scoringMath", "saveState", "skinRuntime", "moodPresentation", "timerMath", "transferState"] }, null, 2));
