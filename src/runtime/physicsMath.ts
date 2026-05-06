export interface VectorLike {
  x: number;
  y: number;
}

export interface BodyMassLike {
  mass?: number;
}

export interface BoundsLike {
  bounds: {
    min: VectorLike;
    max: VectorLike;
  };
}

export function clampVector(vector: VectorLike, maxMagnitude: number): VectorLike {
  const magnitude = vectorMagnitude(vector);
  if (!Number.isFinite(magnitude) || magnitude <= maxMagnitude) {
    return vector;
  }
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  const scale = maxMagnitude / magnitude;
  return {
    x: vector.x * scale,
    y: vector.y * scale
  };
}

export function getFiniteMass(body: BodyMassLike | undefined | null, fallback = 18): number {
  if (!body || !Number.isFinite(body.mass) || Number(body.mass) <= 0) {
    return fallback;
  }
  return Number(body.mass);
}

export function getDistanceWithMinimum(distance: number, minimum: number): number {
  return Math.max(distance, minimum);
}

export function getEquivalentMass(massA: number, massB: number, minimumSum = 0.01): number {
  return (massA * massB) / Math.max(massA + massB, minimumSum);
}

export function getImpactScore(speed: number, equivalentMass: number, multiplier = 1.9): number {
  return speed * equivalentMass * multiplier;
}

export function scaleStaticImpactScore(score: number, isStatic: boolean, label: string | undefined): number {
  if (!isStatic) {
    return score;
  }
  return score * (label === "trampoline" ? 1.15 : 0.38);
}

export function clampImpactScore(score: number, maximum = 46): number {
  return Math.min(score, maximum);
}

export function getFrameScale(deltaMs: number, frameMs = 16.67, minimum = 0.5, maximum = 1.6): number {
  return Math.max(minimum, Math.min(maximum, deltaMs / frameMs));
}

export function getGrabCorrectionMagnitude(distance: number, mass: number, maximum = 0.0014, distanceScale = 0.000012): number {
  return Math.min(maximum, distance * distanceScale) * mass;
}

export function getGrabFrictionAir(currentFrictionAir: number | undefined | null, minimum = 0.045): number {
  return Math.max(currentFrictionAir || 0, minimum);
}

export function getHandDragElapsed(elapsedMs: number, minimum = 16): number {
  return Math.max(minimum, elapsedMs);
}

export function getHandDragFlickScale(elapsedMs: number, maxElapsedMs = 140): number {
  return Math.min(1, maxElapsedMs / elapsedMs);
}

export function shouldUseStepFlick(stepMagnitude: number, totalMagnitude: number): boolean {
  return stepMagnitude > totalMagnitude;
}

export function getHandFlickAngularVelocity(angularVelocity: number, flickX: number, scale = 0.012, minimum = -0.35, maximum = 0.35): number {
  return angularVelocity + Math.max(minimum, Math.min(maximum, flickX * scale));
}

export function getDirectionOrFallback(vector: VectorLike, fallback: VectorLike, minimumMagnitude = 0.001): VectorLike {
  const magnitude = vectorMagnitude(vector);
  if (magnitude > minimumMagnitude) {
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    };
  }
  return fallback;
}

export function shouldUseLaunchDirection(magnitude: number, threshold = 4): boolean {
  return magnitude > threshold;
}

export function getClampedLaunchDistance(magnitude: number, maxDistance: number): number {
  return Math.min(magnitude, maxDistance);
}

export function getThrowScale(distance: number, maxDistance: number, baseScale: number, power: number, powerDivisor: number): number {
  return (distance / maxDistance) * (baseScale + power / powerDivisor);
}

export function getPoweredRadius(power: number, baseRadius: number, bonusRadius: number, powerRange = 100): number {
  return baseRadius + (power / powerRange) * bonusRadius;
}

export function getLaunchSpeed(power: number, baseSpeed: number, powerScale: number): number {
  return baseSpeed + power * powerScale;
}

export function getSignedAngularVelocity(x: number, coefficient: number): number {
  return coefficient * Math.sign(x || 1);
}

export function getHorizontalSpinSign(direction: VectorLike): number {
  return direction.x >= 0 ? 1 : -1;
}

export function getVectorAngle(vector: VectorLike): number {
  return Math.atan2(vector.y, vector.x);
}

export function getRecoveredVelocityComponent(velocity: number, damping = 0.45, maximum = 8): number {
  return Math.max(-maximum, Math.min(maximum, velocity * damping));
}

export function shouldReplaceNearest(distance: number, bestDistance: number): boolean {
  return distance < bestDistance;
}

export function isNearFloor(y: number | undefined | null, floorY: number, clearance = 130): boolean {
  return Number.isFinite(y) && Number(y) > floorY - clearance;
}

export function shouldSkipWallRecovery(now: number, cooldownUntil: number): boolean {
  return now < cooldownUntil;
}

export function getNextWallRecoveryCooldown(now: number, cooldownMs = 420): number {
  return now + cooldownMs;
}

export function getCombinedBounds(bodies: BoundsLike[]): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: Math.min(...bodies.map((body) => body.bounds.min.x)),
    maxX: Math.max(...bodies.map((body) => body.bounds.max.x)),
    minY: Math.min(...bodies.map((body) => body.bounds.min.y)),
    maxY: Math.max(...bodies.map((body) => body.bounds.max.y))
  };
}

export function getWallRecoveryOffset(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  stage: { width: number; height: number },
  sideMargin = 18,
  topLimit = -80,
  bottomMargin = 70
): VectorLike {
  let dx = 0;
  let dy = 0;
  if (bounds.minX < sideMargin) {
    dx = sideMargin - bounds.minX;
  } else if (bounds.maxX > stage.width - sideMargin) {
    dx = stage.width - sideMargin - bounds.maxX;
  }
  if (bounds.minY < topLimit) {
    dy = topLimit - bounds.minY;
  } else if (bounds.maxY > stage.height + bottomMargin) {
    dy = stage.height + bottomMargin - bounds.maxY;
  }
  return { x: dx, y: dy };
}

export function shouldApplySelfRighting(tilt: number, angularVelocity: number, tiltThreshold = 0.4, angularVelocityThreshold = 0.18): boolean {
  return Math.abs(tilt) > tiltThreshold && Math.abs(angularVelocity) < angularVelocityThreshold;
}

export function getSelfRightingAngularVelocity(angularVelocity: number, tilt: number, deltaMs: number, torqueScale = 0.00062): number {
  return angularVelocity - tilt * torqueScale * deltaMs;
}

export function getSelfRightingForce(tilt: number, mass: number, horizontalScale = 0.00001, verticalScale = 0.000022): VectorLike {
  return {
    x: -tilt * horizontalScale * mass,
    y: -verticalScale * mass
  };
}

export function getProjectileImpulseMagnitude(mass: number, coefficient: number): number {
  return coefficient * mass;
}

export function getScaledVelocity(velocity: VectorLike, scale: number): VectorLike {
  return {
    x: velocity.x * scale,
    y: velocity.y * scale
  };
}

export function getDampedAngularVelocity(angularVelocity: number, damping: number): number {
  return angularVelocity * damping;
}

export function getSpinAngularVelocity(angularVelocity: number, spinSign: number, impulse: number): number {
  return angularVelocity + spinSign * impulse;
}

export function getVelocityAfterDirectionalImpulse(velocity: VectorLike, direction: VectorLike, impulse: number, damping: number): VectorLike {
  return {
    x: (velocity.x + direction.x * impulse) * damping,
    y: (velocity.y + direction.y * impulse) * damping
  };
}

function vectorMagnitude(vector: VectorLike): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}
