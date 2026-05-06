export type BuddyMood =
  | "neutral"
  | "happy"
  | "scared"
  | "angry"
  | "dizzy"
  | "stunned"
  | "frozen"
  | "shocked"
  | "overheated"
  | "confused";

export interface MoodEvent {
  mood: BuddyMood;
  durationMs: number;
  bubble?: string;
}

export class MoodSystem {
  current: BuddyMood = "neutral";
  expiresAt = 0;
  bubble = "";

  trigger(event: MoodEvent, now = performance.now()): void {
    this.current = event.mood;
    this.expiresAt = now + event.durationMs;
    this.bubble = event.bubble ?? "";
  }

  update(now = performance.now()): BuddyMood {
    if (this.current !== "neutral" && now >= this.expiresAt) {
      this.current = "neutral";
      this.bubble = "";
    }
    return this.current;
  }
}
