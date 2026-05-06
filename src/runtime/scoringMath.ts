export function getComboMultiplier(comboCount: number): number {
  return 1 + Math.min(Math.max(comboCount - 1, 0), 7) * 0.22;
}

export function getScoreAntiGrind(heat: number): number {
  return Math.max(0.35, 1 - heat * 0.17);
}

export function incrementToolHeat(heat: number): number {
  return Math.min(5, heat + 1);
}

export function decayToolHeat(heat: number, deltaMs: number, decayWindowMs = 8500): number {
  return Math.max(0, heat - deltaMs / decayWindowMs);
}

export function getFeedbackIntensity(reward: number): number {
  return Math.min(1.8, Math.max(0.25, reward / 28));
}

export function calculateReward(baseValue: number, multiplier: number, antiGrind: number, minimum = 1): number {
  return Math.max(minimum, Math.round(baseValue * multiplier * antiGrind));
}

export function calculateXpGain(reward: number, xpRatio = 0.42, minimum = 1): number {
  return Math.max(minimum, Math.round(reward * xpRatio));
}

export function getChallengeRecordAmount(reason: string, baseValue: number, airborneDivisor = 7): number {
  return reason === "airborne" ? Math.max(1, Math.round(baseValue / airborneDivisor)) : 1;
}

export function shouldSkipAirborneForSpawnGrace(now: number, spawnGraceUntil: number): boolean {
  return now < spawnGraceUntil;
}

export function shouldAwardAirborne(sinceFloorMs: number, torsoY: number | undefined | null, floorY: number, minAirborneMs = 450, floorClearance = 85): boolean {
  return sinceFloorMs > minAirborneMs && Number.isFinite(torsoY) && Number(torsoY) < floorY - floorClearance;
}

export function getAirborneScore(seconds: number, scorePerSecond = 7): number {
  return scorePerSecond * seconds;
}

export function advanceAirborneBank(currentBank: number, deltaMs: number): { bank: number; seconds: number } {
  const total = currentBank + deltaMs / 1000;
  if (total < 1) {
    return { bank: total, seconds: 0 };
  }
  const seconds = Math.floor(total);
  return { bank: total - seconds, seconds };
}

export function getComboFillPercent(comboTimer: number, comboWindowMs: number): number {
  if (comboTimer <= 0 || comboWindowMs <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (comboTimer / comboWindowMs) * 100));
}
