export function decayShakeAmount(shake: number, deltaMs: number, decayPerMs = 0.03): number {
  return Math.max(0, shake - deltaMs * decayPerMs);
}

export function increaseShakeAmount(shake: number, amount: number, maxShake = 24): number {
  return Math.min(maxShake, shake + amount);
}

export function getShakeOffset(randomX: number, randomY: number, shake: number): { x: number; y: number } {
  return {
    x: (randomX - 0.5) * shake,
    y: (randomY - 0.5) * shake
  };
}

export function getShakeTransform(offset: { x: number; y: number }): string {
  return `translate(${offset.x}px, ${offset.y}px)`;
}

export function getExplosionBurstCount(radius: number, minimum = 18, maximum = 46, divisor = 7): number {
  return Math.max(minimum, Math.min(maximum, Math.round(radius / divisor)));
}

export function getExplosionRadius(radius: number | undefined | null, power: number, base = 190, powerScale = 2.15): number {
  return radius || base + power * powerScale;
}

export function getExplosionBaseForce(baseForce: number | undefined | null, power: number, coefficient = 0.00145, basePowerFactor = 0.8, powerScale = 72): number {
  return baseForce || coefficient * (basePowerFactor + power / powerScale);
}

export function getExplosionScoreBase(scoreBase: number | undefined | null, fallback = 13): number {
  return scoreBase || fallback;
}

export function getExplosionTriggerTime(now: number, delayMs: number): number {
  return now + delayMs;
}

export function getExplosionArmScore(score = 2.4): number {
  return score;
}

export function getExplosionFalloff(distance: number, radius: number): number {
  return 1 - distance / radius;
}

export function getExplosionForceMagnitude(baseForce: number, falloff: number, mass: number): number {
  return baseForce * falloff * mass;
}

export function getExplosionScore(scoreBase: number, falloff: number, power: number, basePowerFactor = 0.65, powerScale = 90): number {
  return scoreBase * falloff * (basePowerFactor + power / powerScale);
}

export function getImpactBurstCount(speed: number, maximum = 10): number {
  return Math.min(maximum, Math.round(speed));
}

export function getBurstParticle(
  position: { x: number; y: number },
  color: string,
  angleRandom: number,
  speedRandom: number,
  radiusRandom: number,
  lifeRandom: number,
  baseSpeed = 0.035,
  speedRange = 0.09,
  baseRadius = 2,
  radiusRange = 3,
  baseLife = 460,
  lifeRange = 380,
  maxLife = 840
): { type: "spark"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const angle = angleRandom * Math.PI * 2;
  const speed = baseSpeed + speedRandom * speedRange;
  return {
    type: "spark",
    x: position.x,
    y: position.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: baseRadius + radiusRandom * radiusRange,
    color,
    life: baseLife + lifeRandom * lifeRange,
    maxLife
  };
}

export function getConfettiBurstParticle(
  position: { x: number; y: number },
  color: string,
  angleRandom: number,
  speedRandom: number,
  radiusRandom: number,
  lifeRandom: number,
  angleBase = -Math.PI * 0.9,
  angleRange = Math.PI * 0.8,
  baseSpeed = 0.055,
  speedRange = 0.1,
  yOffset = -8,
  verticalBias = -0.035,
  baseRadius = 1.8,
  radiusRange = 2.4,
  baseLife = 680,
  lifeRange = 480,
  maxLife = 1160
): { type: "spark"; kind: "confetti"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const angle = angleBase + angleRandom * angleRange;
  const speed = baseSpeed + speedRandom * speedRange;
  return {
    type: "spark",
    kind: "confetti",
    x: position.x,
    y: position.y + yOffset,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed + verticalBias,
    radius: baseRadius + radiusRandom * radiusRange,
    color,
    life: baseLife + lifeRandom * lifeRange,
    maxLife
  };
}

export function getMusicNoteParticle(
  position: { x: number; y: number },
  color: string,
  side: -1 | 1,
  xRandom: number,
  vxRandom: number,
  vyRandom: number,
  radiusRandom: number,
  lifeRandom: number,
  xOffset = 12,
  xRange = 18,
  yOffset = -16,
  baseVx = 0.015,
  vxRange = 0.025,
  baseVy = -0.05,
  vyRange = 0.06,
  baseRadius = 3,
  radiusRange = 1.5,
  baseLife = 820,
  lifeRange = 420,
  maxLife = 1240
): { type: "music"; kind: "music"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  return {
    type: "music",
    kind: "music",
    x: position.x + side * (xOffset + xRandom * xRange),
    y: position.y + yOffset,
    vx: side * (baseVx + vxRandom * vxRange),
    vy: baseVy - vyRandom * vyRange,
    radius: baseRadius + radiusRandom * radiusRange,
    color,
    life: baseLife + lifeRandom * lifeRange,
    maxLife
  };
}

export function getMoneySparkleParticle(
  position: { x: number; y: number },
  color: string,
  angleRandom: number,
  speedRandom: number,
  xRandom: number,
  radiusRandom: number,
  lifeRandom: number,
  angleBase = -Math.PI,
  angleRange = Math.PI,
  baseSpeed = 0.035,
  speedRange = 0.075,
  xRange = 16,
  xOffset = -8,
  yOffset = -10,
  verticalBias = -0.045,
  baseRadius = 2,
  radiusRange = 2,
  baseLife = 720,
  lifeRange = 420,
  maxLife = 1140
): { type: "spark"; kind: "money"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const angle = angleBase + angleRandom * angleRange;
  const speed = baseSpeed + speedRandom * speedRange;
  return {
    type: "spark",
    kind: "money",
    x: position.x + xRandom * xRange + xOffset,
    y: position.y + yOffset,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed + verticalBias,
    radius: baseRadius + radiusRandom * radiusRange,
    color,
    life: baseLife + lifeRandom * lifeRange,
    maxLife
  };
}

export function getTreatCrumbParticle(
  position: { x: number; y: number },
  color: string,
  angleRandom: number,
  speedRandom: number,
  radiusRandom: number,
  lifeRandom: number,
  angleBase = -Math.PI * 0.95,
  angleRange = Math.PI * 0.9,
  baseSpeed = 0.025,
  speedRange = 0.06,
  yOffset = -8,
  verticalBias = -0.025,
  baseRadius = 1.5,
  radiusRange = 2,
  baseLife = 620,
  lifeRange = 360,
  maxLife = 980
): { type: "spark"; kind: "treat"; x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number; maxLife: number } {
  const angle = angleBase + angleRandom * angleRange;
  const speed = baseSpeed + speedRandom * speedRange;
  return {
    type: "spark",
    kind: "treat",
    x: position.x,
    y: position.y + yOffset,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed + verticalBias,
    radius: baseRadius + radiusRandom * radiusRange,
    color,
    life: baseLife + lifeRandom * lifeRange,
    maxLife
  };
}

export function advanceTimedEffectLife(life: number, deltaMs: number): number {
  return life - deltaMs;
}

export function getParticlePositionAfterDelta(
  position: { x: number; y: number },
  velocity: { x: number; y: number },
  deltaMs: number
): { x: number; y: number } {
  return {
    x: position.x + velocity.x * deltaMs,
    y: position.y + velocity.y * deltaMs
  };
}

export function getParticleGravity(type: string | undefined, musicGravity = 0.00018, sparkGravity = 0.0007): number {
  return type === "music" ? musicGravity : sparkGravity;
}

export function getParticleVelocityYAfterGravity(velocityY: number, type: string | undefined, deltaMs: number): number {
  return velocityY + getParticleGravity(type) * deltaMs;
}

export function getParticleAlpha(life: number, maxLife: number): number {
  return Math.max(0, life / maxLife);
}

export function getBoltMidpoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
  randomX: number,
  randomY: number,
  jitter = 18
): { x: number; y: number } {
  const halfJitter = jitter / 2;
  return {
    x: (a.x + b.x) / 2 + randomX * jitter - halfJitter,
    y: (a.y + b.y) / 2 + randomY * jitter - halfJitter
  };
}

export function shouldKeepTimedEffect(life: number): boolean {
  return life > 0;
}

export function shouldKeepDecal(now: number, decalTime: number, lifetime = 8500): boolean {
  return now - decalTime < lifetime;
}
