const impactReasons = new Set(["impact", "throw", "bowling", "punch", "crate", "cannonball", "airborne", "float"]);
const shockReasons = new Set(["shock", "spark", "gravity", "vacuum", "repulsor", "magnet"]);
const happyReasons = new Set(["tickle", "gift", "moneydrop", "treat", "confetti", "boombox"]);
const paintReasons = new Set([
  "paint",
  "paintball",
  "rubber",
  "cork",
  "corkHit",
  "plunger",
  "plungerHit",
  "star",
  "starHit",
  "heat",
  "frost",
  "goo",
  "pulse"
]);
const selectReasons = new Set([
  "armed",
  "firecracker",
  "mine",
  "stickybomb",
  "largebomb",
  "build",
  "platform",
  "bumper",
  "conveyor",
  "tether",
  "liquid"
]);

export interface FeedbackPlayback {
  sound: string;
  useSelectIntensity: boolean;
}

export interface UserActivationState {
  isActive?: boolean;
  hasBeenActive?: boolean;
}

export function canUseHaptics(hapticsEnabled: boolean, hasVibrate: boolean, userActivation?: UserActivationState | null): boolean {
  if (!hapticsEnabled || !hasVibrate) {
    return false;
  }
  if (!userActivation) {
    return true;
  }
  return Boolean(userActivation.isActive || userActivation.hasBeenActive);
}

export function getFeedbackPlayback(reason: string): FeedbackPlayback | null {
  if (impactReasons.has(reason)) {
    return { sound: "impact", useSelectIntensity: false };
  }
  if (reason === "explosion") {
    return { sound: "explosion", useSelectIntensity: false };
  }
  if (shockReasons.has(reason)) {
    return { sound: "shock", useSelectIntensity: false };
  }
  if (happyReasons.has(reason)) {
    return { sound: reason === "confetti" ? "gift" : reason, useSelectIntensity: false };
  }
  if (paintReasons.has(reason)) {
    return { sound: "paint", useSelectIntensity: false };
  }
  if (selectReasons.has(reason)) {
    return { sound: "select", useSelectIntensity: true };
  }
  return null;
}

export function getFeedbackPulsePattern(reason: string, reward: number, tags: string[]): number | number[] | null {
  if (tags.includes("explosive") || reason === "explosion") {
    return [45, 35, 90];
  }
  if (tags.includes("shock")) {
    return [16, 24, 16];
  }
  if (tags.includes("cold")) {
    return [10, 18];
  }
  if (tags.includes("slippery")) {
    return [8, 12];
  }
  if (tags.includes("heat")) {
    return 14;
  }
  if (tags.includes("happy") || reason === "tickle") {
    return 18;
  }
  if (reason === "impact" && reward > 4) {
    return Math.min(50, 8 + reward);
  }
  return null;
}
