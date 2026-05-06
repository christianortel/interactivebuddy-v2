export function shouldDrainLiquid(pointerY: number, floorY: number, liquidEnabled: boolean, drainMargin = 48): boolean {
  return liquidEnabled && pointerY > floorY - drainMargin;
}

export function getClampedLiquidLevel(pointerY: number, floorY: number, minimumLevel = 150, floorMargin = 35): number {
  return Math.max(minimumLevel, Math.min(floorY - floorMargin, pointerY));
}

export function getLiquidWaveY(level: number, time: number, x: number, amplitude = 5, frequency = 0.025): number {
  return level + Math.sin(time + x * frequency) * amplitude;
}

export function getLiquidSubmersion(depth: number, maxDepth = 120): number {
  return Math.min(1, depth / maxDepth);
}

export function getLiquidAngularDampingFactor(deltaMs: number, angularDamping: number, submersion: number, maxDamping = 0.04, scale = 0.00012): number {
  return 1 - Math.min(maxDamping, deltaMs * scale * angularDamping * submersion);
}

export function getLiquidFriction(type: string, currentFriction: number, baseFriction: number, oilMaximum = 0.18, slimeMinimum = 0.82): number {
  if (type === "oil") {
    return Math.min(currentFriction, oilMaximum);
  }
  if (type === "slime") {
    return Math.max(currentFriction, slimeMinimum);
  }
  return baseFriction;
}

export function getLiquidBuoyancyForce(
  buoyancy: number,
  mass: number,
  submersion: number,
  power: number,
  coefficient = 0.00021,
  basePowerFactor = 0.9,
  powerScale = 120
): number {
  return -coefficient * buoyancy * mass * submersion * (basePowerFactor + power / powerScale);
}

export function getLiquidDragForce(
  velocity: number,
  drag: number,
  mass: number,
  submersion: number,
  coefficient: number
): number {
  return -velocity * coefficient * drag * mass * submersion;
}

export function getLiquidScore(score = 4.5): number {
  return score;
}

export function getLiquidScoreCooldown(cooldown = 850): number {
  return cooldown;
}

export function getLiquidDrainScore(score = 2): number {
  return score;
}

export function getLiquidFillScore(score = 3): number {
  return score;
}

export function getLiquidDrainToast(liquidName: string): string {
  return `${liquidName} drained.`;
}

export function getLiquidFillToast(liquidName: string): string {
  return `${liquidName} level set.`;
}

export function getLiquidSelectedToast(liquidName: string): string {
  return `${liquidName} selected.`;
}

export function getSelectedLiquidTypeId<TLiquid>(
  liquidTypes: Record<string, TLiquid>,
  selectedId: string | undefined,
  fallbackId = "water"
): string {
  return selectedId && liquidTypes[selectedId] ? selectedId : fallbackId;
}

export function resolveLiquidType<TLiquid>(
  liquidTypes: Record<string, TLiquid>,
  selectedId: string | undefined,
  fallbackId = "water"
): TLiquid {
  const typeId = getSelectedLiquidTypeId(liquidTypes, selectedId, fallbackId);
  const liquidType = liquidTypes[typeId];
  if (liquidType) {
    return liquidType;
  }
  throw new Error("Runtime liquid type catalog is missing its fallback type");
}
