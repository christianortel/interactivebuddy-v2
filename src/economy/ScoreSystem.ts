import { ComboSystem } from "./ComboSystem";

export interface ScoreEvent {
  force: number;
  tag: string;
  time: number;
}

export class ScoreSystem {
  readonly combo = new ComboSystem();
  private recentTags = new Map<string, number>();

  valueFor(event: ScoreEvent): number {
    const repeatedAt = this.recentTags.get(event.tag) ?? 0;
    const age = event.time - repeatedAt;
    const antiFarm = age < 650 ? 0.18 : age < 1400 ? 0.55 : 1;
    this.recentTags.set(event.tag, event.time);
    const combo = this.combo.record(event.time);
    return Math.max(1, Math.round(event.force * combo * antiFarm));
  }
}
