import { buddyPartSpecs, type BuddyPartSpec } from "./BuddyPart";
import { MoodSystem } from "./MoodSystem";

export interface BuddyRigSpec {
  parts: BuddyPartSpec[];
  scale: number;
  spawnX: number;
  spawnY: number;
}

export class Buddy {
  readonly rig: BuddyRigSpec;
  readonly mood = new MoodSystem();

  constructor(rig: BuddyRigSpec = Buddy.defaultRig()) {
    this.rig = rig;
  }

  static defaultRig(): BuddyRigSpec {
    return {
      parts: buddyPartSpecs,
      scale: 0.78,
      spawnX: 96,
      spawnY: 486
    };
  }
}
