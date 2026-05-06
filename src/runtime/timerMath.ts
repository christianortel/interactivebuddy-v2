export function decrementTimer(timerMs: number, deltaMs: number, minimum = 0): number {
  return Math.max(minimum, timerMs - deltaMs);
}

export function extendTimer(timerMs: number | undefined | null, durationMs: number): number {
  return Math.max(timerMs || 0, durationMs);
}

export function isTimerExpired(timerMs: number): boolean {
  return timerMs <= 0;
}
