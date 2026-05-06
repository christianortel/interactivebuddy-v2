export class ComboSystem {
  multiplier = 1;
  expiresAt = 0;

  record(now: number, windowMs = 4200): number {
    this.multiplier = Math.min(this.multiplier + 0.08, 5);
    this.expiresAt = now + windowMs;
    return this.multiplier;
  }

  update(now: number): number {
    if (now > this.expiresAt) {
      this.multiplier = 1;
    }
    return this.multiplier;
  }
}
