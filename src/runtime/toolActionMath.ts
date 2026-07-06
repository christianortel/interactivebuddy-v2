export function getConveyorDirection(power: number, rightThreshold = 55): number {
  return power >= rightThreshold ? 1 : -1;
}

export function getConveyorForce(direction: number, power: number, mass: number, horizontalScale = 0.000055, verticalScale = 0.000012): { x: number; y: number } {
  return {
    x: direction * horizontalScale * power * mass,
    y: -verticalScale * mass
  };
}

export function advanceConveyorPhase(currentPhase: number, deltaMs: number, direction: number, speed = 0.005, period = 24): number {
  return (currentPhase + deltaMs * speed * direction) % period;
}

export function shouldConveyorAffectBody(dx: number, dy: number, halfWidth = 98, minDy = -44, maxDy = 38): boolean {
  return Math.abs(dx) <= halfWidth && dy >= minDy && dy <= maxDy;
}

export function getConveyorScore(score = 4.4): number {
  return score;
}

export function getConveyorCooldown(cooldown = 450): number {
  return cooldown;
}

export function incrementRubberBurstShots(shots: number, maximum = 99): number {
  return Math.min(maximum, shots + 1);
}

export function getRubberCooldown(power: number, minimum = 70, base = 180, powerScale = 0.75): number {
  return Math.max(minimum, base - power * powerScale);
}

export function getRubberPelletSpeed(power: number, baseSpeed = 14, powerScale = 0.08): number {
  return baseSpeed + power * powerScale;
}

export function getRubberScore(power: number, baseScore = 1.8, powerScale = 0.012): number {
  return baseScore + power * powerScale;
}

export function getTickleImpulseMagnitude(mass: number, coefficient = 0.003): number {
  return coefficient * mass;
}

export function getTickleScore(score = 6): number {
  return score;
}

export function getPokeImpulseMagnitude(mass: number, coefficient = 0.0042): number {
  return coefficient * mass;
}

export function getPokeScore(score = 4.5): number {
  return score;
}

export function getSlapImpulseMagnitude(mass: number, coefficient = 0.0072): number {
  return coefficient * mass;
}

export function getSlapScore(score = 7.4): number {
  return score;
}

export function getTrampolinePlacementScore(score = 3): number {
  return score;
}

export function getPlatformPlacementScore(score = 3.2): number {
  return score;
}

export function getBumperPlacementScore(score = 3.8): number {
  return score;
}

export function getConveyorPlacementScore(score = 4.6): number {
  return score;
}

export function getGiftScore(score = 8): number {
  return score;
}

export function getMoneyDropScore(score = 10): number {
  return score;
}

export function getTreatScore(score = 7.2): number {
  return score;
}

export function getBoomboxPlacementScore(score = 4.5): number {
  return score;
}

export function getTeslaPlacementScore(score = 4): number {
  return score;
}

export function getRopeAttachScore(score = 5): number {
  return score;
}

export function getPaintballFireScore(score = 2): number {
  return score;
}

export function getFoamDartFireScore(score = 2.6): number {
  return score;
}

export function getCorkPopperFireScore(score = 2.2): number {
  return score;
}

export function getPlungerShotFireScore(score = 2.4): number {
  return score;
}

export function getStarShotFireScore(score = 2.5): number {
  return score;
}

export function getCannonballFireScore(score = 4.2): number {
  return score;
}

export function getPaintballHitScore(score = 9): number {
  return score;
}

export function getCorkPopperHitScore(score = 7.5): number {
  return score;
}

export function getPlungerShotHitScore(score = 8.2): number {
  return score;
}

export function getPlungerSuctionDuration(duration = 1650): number {
  return duration;
}

export function getStarShotHitScore(score = 8.4): number {
  return score;
}

export function getFoamDartHitScore(score = 8.5): number {
  return score;
}

export function getBallThrowScore(power: number, baseScore = 4, powerScale = 0.04): number {
  return baseScore + power * powerScale;
}

export function getBeachBallThrowScore(power: number, baseScore = 5.4, powerScale = 0.04): number {
  return baseScore + power * powerScale;
}

export function getBowlingBallThrowScore(power: number, baseScore = 7, powerScale = 0.05): number {
  return baseScore + power * powerScale;
}

export function getBrickThrowScore(power: number, baseScore = 6, powerScale = 0.045): number {
  return baseScore + power * powerScale;
}

export function getCrateThrowScore(power: number, baseScore = 6.4, powerScale = 0.04): number {
  return baseScore + power * powerScale;
}

export function getBoxingGloveThrowScore(power: number, baseScore = 5, powerScale = 0.04): number {
  return baseScore + power * powerScale;
}

export function getAnvilThrowScore(power: number, baseScore = 9, powerScale = 0.06): number {
  return baseScore + power * powerScale;
}

export function getHandFlickScore(flickMagnitude: number, baseScore = 3, magnitudeScale = 0.08): number {
  return baseScore + flickMagnitude * magnitudeScale;
}

export function isMagneticBodyLabel(
  label: string | undefined,
  magneticLabels = ["prop_anvil", "prop_bowling", "prop_grenade", "prop_tesla", "prop_boombox"]
): boolean {
  return Boolean(label && magneticLabels.includes(label));
}

export function getMagnetRadius(power: number, base = 380): number {
  return base + power;
}

export function getMagnetForceMagnitude(
  power: number,
  mass: number,
  distance: number,
  radius: number,
  coefficient = 0.00011,
  minimumMass = 1
): number {
  return coefficient * power * Math.max(mass, minimumMass) * (1 - distance / radius);
}

export function getVacuumRadius(power: number, base = 330): number {
  return base + power;
}

export function getVacuumForceMagnitude(power: number, mass: number, distance: number, radius: number, coefficient = 0.00009): number {
  return coefficient * power * mass * (1 - distance / radius);
}

export function getVacuumScore(power: number, base = 5.8, powerScale = 0.035): number {
  return base + power * powerScale;
}

export function getVacuumCooldown(cooldown = 360): number {
  return cooldown;
}

export function getVacuumRingEffect(radius: number, radiusScale = 0.34, maxRadius = 10, life = 280): { radius: number; maxRadius: number; life: number } {
  return {
    radius: radius * radiusScale,
    maxRadius,
    life
  };
}

export function getRepulsorRadius(power: number, base = 280): number {
  return base + power;
}

export function getRepulsorForceMagnitude(power: number, mass: number, distance: number, radius: number, coefficient = 0.00013): number {
  return coefficient * power * mass * (1 - distance / radius);
}

export function getRepulsorAngularVelocity(angularVelocity: number, directionX: number, impulse = 0.0025): number {
  return angularVelocity + impulse * Math.sign(directionX || 1);
}

export function getRepulsorScore(power: number, base = 6.2, powerScale = 0.04): number {
  return base + power * powerScale;
}

export function getRepulsorCooldown(cooldown = 380): number {
  return cooldown;
}

export function getRepulsorRingEffect(radius: number, startRadius = 8, maxRadiusScale = 0.44, life = 300): { radius: number; maxRadius: number; life: number } {
  return {
    radius: startRadius,
    maxRadius: radius * maxRadiusScale,
    life
  };
}

export function getFanRadius(radius = 310): number {
  return radius;
}

export function getFanForceMagnitude(power: number, mass: number, distance: number, radius: number, cone: number, coefficient = 0.00011): number {
  return coefficient * power * mass * (1 - distance / radius) * cone;
}

export function getFanScore(power: number, base = 3.3, powerScale = 0.035): number {
  return base + power * powerScale;
}

export function getFanScoreCooldown(cooldown = 320): number {
  return cooldown;
}

export function getBlackHoleRadius(power: number, base = 360, powerScale = 1.8): number {
  return base + power * powerScale;
}

export function getBlackHolePullForceMagnitude(power: number, mass: number, distance: number, radius: number, coefficient = 0.00013): number {
  return coefficient * power * mass * (1 - distance / radius);
}

export function getBlackHoleOrbitForceMagnitude(power: number, mass: number, coefficient = 0.000025): number {
  return coefficient * power * mass;
}

export function getBlackHoleScore(power: number, base = 6, powerScale = 0.06): number {
  return base + power * powerScale;
}

export function getBlackHoleCooldown(cooldown = 430): number {
  return cooldown;
}

export function getMagnetScore(power: number, base = 5.2, powerScale = 0.025): number {
  return base + power * powerScale;
}

export function getMagnetCooldown(cooldown = 420): number {
  return cooldown;
}

export function getMagnetRingEffect(radius: number, startRadius = 18, maxRadiusScale = 0.34, life = 320): { radius: number; maxRadius: number; life: number } {
  return {
    radius: startRadius,
    maxRadius: radius * maxRadiusScale,
    life
  };
}

export function getMagnetAngularVelocity(angularVelocity: number, directionX: number, impulse = 0.004): number {
  return angularVelocity + impulse * Math.sign(directionX || 1);
}

export function getConeFalloff(distance: number, radius: number, cone: number): number {
  return (1 - distance / radius) * cone;
}

export function getHeatConeRadius(radius = 240): number {
  return radius;
}

export function getHeatConeForce(
  direction: { x: number; y: number },
  power: number,
  mass: number,
  falloff: number,
  horizontalScale = 0.000035,
  verticalScale = 0.000018
): { x: number; y: number } {
  return {
    x: direction.x * horizontalScale * power * mass * falloff,
    y: -verticalScale * power * mass * falloff
  };
}

export function getHeatConeScore(power: number, base = 4.2, powerScale = 0.04): number {
  return base + power * powerScale;
}

export function getHeatConeCooldown(cooldown = 360): number {
  return cooldown;
}

export function getHeatConeParticle(
  position: { x: number; y: number },
  aim: { x: number; y: number },
  spreadRandom: number,
  velocityRandomX: number,
  velocityRandomY: number,
  radiusRandom: number
): { type: "spark"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const spread = (spreadRandom - 0.5) * 42;
  return {
    type: "spark",
    x: position.x + aim.x * 36 - aim.y * spread,
    y: position.y + aim.y * 36 + aim.x * spread,
    vx: aim.x * (0.055 + velocityRandomX * 0.035),
    vy: aim.y * (0.055 + velocityRandomY * 0.035) - 0.018,
    radius: 2 + radiusRandom * 2.5,
    color: "#ff8d66",
    life: 280,
    maxLife: 280
  };
}

export function getFrostPuffRadius(radius = 220): number {
  return radius;
}

export function getFrostPuffForce(
  direction: { x: number; y: number },
  power: number,
  mass: number,
  falloff: number,
  horizontalScale = 0.000018,
  verticalScale = 0.00001
): { x: number; y: number } {
  return {
    x: direction.x * horizontalScale * power * mass * falloff,
    y: -verticalScale * power * mass * falloff
  };
}

export function getFrostPuffScore(power: number, base = 3.9, powerScale = 0.035): number {
  return base + power * powerScale;
}

export function getFrostPuffCooldown(cooldown = 260): number {
  return cooldown;
}

export function getFrostEffectDuration(duration = 1050): number {
  return duration;
}

export function getFrostVelocityScale(falloff: number, base = 0.965, falloffScale = 0.05): number {
  return base - falloff * falloffScale;
}

export function getFrostAngularVelocityScale(falloff: number, base = 0.93, falloffScale = 0.08): number {
  return base - falloff * falloffScale;
}

export function getFrostPuffParticle(
  position: { x: number; y: number },
  aim: { x: number; y: number },
  spreadRandom: number,
  velocityRandomX: number,
  velocityRandomY: number,
  radiusRandom: number
): { type: "spark"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const spread = (spreadRandom - 0.5) * 48;
  return {
    type: "spark",
    x: position.x + aim.x * 34 - aim.y * spread,
    y: position.y + aim.y * 34 + aim.x * spread,
    vx: aim.x * (0.035 + velocityRandomX * 0.025) - aim.y * spread * 0.0004,
    vy: aim.y * (0.035 + velocityRandomY * 0.025) + aim.x * spread * 0.0004 - 0.026,
    radius: 2 + radiusRandom * 2.2,
    color: "#baf7ff",
    life: 340,
    maxLife: 340
  };
}

export function getGooMistRadius(radius = 225): number {
  return radius;
}

export function getGooMistForce(
  direction: { x: number; y: number },
  tangent: { x: number; y: number },
  power: number,
  mass: number,
  falloff: number,
  directionXScale = 0.000014,
  tangentXScale = 0.000024,
  directionYScale = 0.000006,
  verticalBias = 0.000008
): { x: number; y: number } {
  return {
    x: (direction.x * directionXScale + tangent.x * tangentXScale) * power * mass * falloff,
    y: (direction.y * directionYScale - verticalBias) * power * mass * falloff
  };
}

export function getGooAngularVelocity(angularVelocity: number, falloff: number, scale = 0.035): number {
  return angularVelocity + scale * falloff;
}

export function getGooMistScore(power: number, base = 4.1, powerScale = 0.034): number {
  return base + power * powerScale;
}

export function getGooMistCooldown(cooldown = 260): number {
  return cooldown;
}

export function getGooEffectDuration(duration = 1200): number {
  return duration;
}

export function getGooFriction(currentFriction: number | undefined | null, fallback = 0.1, maximum = 0.08): number {
  return Math.min(currentFriction || fallback, maximum);
}

export function getGooFrictionAir(currentFrictionAir: number | undefined | null, fallback = 0.01, maximum = 0.006): number {
  return Math.min(currentFrictionAir || fallback, maximum);
}

export function getGooMistParticle(
  position: { x: number; y: number },
  aim: { x: number; y: number },
  spreadRandom: number,
  velocityRandomX: number,
  velocityRandomY: number,
  radiusRandom: number
): { type: "spark"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const spread = (spreadRandom - 0.5) * 50;
  return {
    type: "spark",
    x: position.x + aim.x * 32 - aim.y * spread,
    y: position.y + aim.y * 32 + aim.x * spread,
    vx: aim.x * (0.028 + velocityRandomX * 0.026) - aim.y * spread * 0.0005,
    vy: aim.y * (0.028 + velocityRandomY * 0.026) + aim.x * spread * 0.0005 + 0.012,
    radius: 2.4 + radiusRandom * 2.8,
    color: "#98f17f",
    life: 360,
    maxLife: 360
  };
}

export function getPulseBeamRadius(radius = 315): number {
  return radius;
}

export function getPulseBeamSideDistance(delta: { x: number; y: number }, aim: { x: number; y: number }): number {
  return Math.abs(delta.x * -aim.y + delta.y * aim.x);
}

export function getPulseBeamFalloff(distance: number, radius: number, alignment: number, sideDistance: number, sideScale = 70): number {
  return (1 - distance / radius) * alignment * (1 - sideDistance / sideScale);
}

export function getPulseBeamForce(
  aim: { x: number; y: number },
  power: number,
  mass: number,
  falloff: number,
  forceScale = 0.00006,
  minimumFalloff = 0.1,
  verticalScale = 0.00001
): { x: number; y: number } {
  const force = forceScale * power * mass * Math.max(minimumFalloff, falloff);
  return {
    x: aim.x * force,
    y: aim.y * force - verticalScale * power * mass * falloff
  };
}

export function getPulseAngularVelocity(angularVelocity: number, falloff: number, scale = 0.026): number {
  return angularVelocity + scale * falloff;
}

export function getPulseBeamScore(power: number, base = 4.4, powerScale = 0.036): number {
  return base + power * powerScale;
}

export function getPulseBeamCooldown(cooldown = 250): number {
  return cooldown;
}

export function getPulseEffectDuration(duration = 850): number {
  return duration;
}

export function getPulseBeamParticle(
  position: { x: number; y: number },
  aim: { x: number; y: number },
  spreadRandom: number,
  distanceRandomX: number,
  distanceRandomY: number,
  radiusRandom: number
): { type: "spark"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const spread = (spreadRandom - 0.5) * 32;
  return {
    type: "spark",
    x: position.x + aim.x * (45 + distanceRandomX * 74) - aim.y * spread,
    y: position.y + aim.y * (45 + distanceRandomY * 74) + aim.x * spread,
    vx: aim.x * 0.08 - aim.y * spread * 0.00045,
    vy: aim.y * 0.08 + aim.x * spread * 0.00045 - 0.01,
    radius: 1.8 + radiusRandom * 1.9,
    color: "#fff27a",
    life: 260,
    maxLife: 260
  };
}

export function getSparkWandRange(range = 280): number {
  return range;
}

export function shouldSpawnSparkWandIdleBurst(randomValue: number, chance = 0.24): boolean {
  return randomValue < chance;
}

export function getSparkWandJitter(
  away: { x: number; y: number },
  randomX: number,
  randomY: number,
  spread = 0.55
): { x: number; y: number } {
  return {
    x: away.x + (randomX - 0.5) * spread,
    y: away.y + (randomY - 0.5) * spread
  };
}

export function getSparkWandForceMagnitude(mass: number, coefficient = 0.0018): number {
  return coefficient * mass;
}

export function getSparkWandAngularVelocity(angularVelocity: number, randomValue: number, spread = 0.07): number {
  return angularVelocity + (randomValue - 0.5) * spread;
}

export function getSparkWandScore(power: number, base = 3.8, powerScale = 0.035): number {
  return base + power * powerScale;
}

export function getSparkWandCooldown(cooldown = 240): number {
  return cooldown;
}

export function getTeslaPulseInterval(interval = 900): number {
  return interval;
}

export function getTeslaRange(range = 180): number {
  return range;
}

export function getTeslaTargetLimit(limit = 3): number {
  return limit;
}

export function getTeslaForceMagnitude(mass: number, coefficient = 0.0012): number {
  return coefficient * mass;
}

export function getTeslaScore(score = 4.5): number {
  return score;
}

export function getBoomboxBeatInterval(interval = 620): number {
  return interval;
}

export function getBoomboxInitialBeat(beat = 60): number {
  return beat;
}

export function getBoomboxLife(life = 5600): number {
  return life;
}

export function getBoomboxRange(range = 230): number {
  return range;
}

export function getBoomboxFalloff(distance: number, range: number): number {
  return 1 - distance / range;
}

export function getBoomboxSide(bodyX: number, sourceX: number): number {
  return bodyX >= sourceX ? 1 : -1;
}

export function getBoomboxPulseForce(side: number, falloff: number, mass: number, horizontalScale = 0.00042, verticalScale = 0.00062): { x: number; y: number } {
  return {
    x: side * horizontalScale * falloff * mass,
    y: -verticalScale * falloff * mass
  };
}

export function getBoomboxAngularVelocity(angularVelocity: number, side: number, falloff: number, scale = 0.006): number {
  return angularVelocity + side * scale * falloff;
}

export function getBoomboxNoteCount(touchedBuddy: boolean, touchedCount = 9, idleCount = 5): number {
  return touchedBuddy ? touchedCount : idleCount;
}

export function getBoomboxScore(touchedBuddy: boolean, touchedScore = 4.8, idleScore = 2.4): number {
  return touchedBuddy ? touchedScore : idleScore;
}

export function getNudgeFalloff(distance: number, radius: number): number {
  return 1 - distance / radius;
}

export function getNudgeSide(deltaX: number): number {
  return deltaX >= 0 ? 1 : -1;
}

export function getNudgeForce(side: number, horizontalForce: number, liftForce: number, falloff: number, mass: number): { x: number; y: number } {
  return {
    x: side * horizontalForce * falloff * mass,
    y: liftForce * falloff * mass
  };
}

export function getRandomTossVelocity(randomValue: number, horizontalSpread: number, verticalVelocity: number): { x: number; y: number } {
  return {
    x: (randomValue - 0.5) * horizontalSpread,
    y: verticalVelocity
  };
}

export function getConfettiPopperRange(range = 210): number {
  return range;
}

export function getConfettiLiftVector(away: { x: number; y: number }, horizontalScale = 0.55, verticalOffset = 0.9, verticalMaximum = -0.65): { x: number; y: number } {
  return {
    x: away.x * horizontalScale,
    y: Math.min(verticalMaximum, away.y - verticalOffset)
  };
}

export function getConfettiForceMagnitude(mass: number, distance: number, falloffRadius = 250, coefficient = 0.00105): number {
  return coefficient * mass * (1 - distance / falloffRadius);
}

export function getConfettiScore(touchedBuddy: boolean, touchedScore = 9.5, idleScore = 6.5): number {
  return touchedBuddy ? touchedScore : idleScore;
}
