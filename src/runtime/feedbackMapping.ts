const directFeedbackReasons = new Set([
  "impact",
  "throw",
  "beachball",
  "bowling",
  "punch",
  "crate",
  "cannonball",
  "airborne",
  "float",
  "tickle",
  "poke",
  "slap",
  "paint",
  "paintball",
  "dart",
  "dartHit",
  "rubber",
  "cork",
  "corkHit",
  "plunger",
  "plungerHit",
  "star",
  "starHit",
  "shock",
  "spark",
  "heat",
  "frost",
  "goo",
  "pulse",
  "wind",
  "gravity",
  "vacuum",
  "repulsor",
  "magnet",
  "gift",
  "moneydrop",
  "treat",
  "confetti",
  "boombox",
  "explosion"
]);

const placementFeedbackReasons = new Set([
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

const pulseLikeReasons = new Set([
  "heat",
  "frost",
  "goo",
  "pulse"
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
  if (directFeedbackReasons.has(reason)) {
    return { sound: reason, useSelectIntensity: false };
  }
  if (placementFeedbackReasons.has(reason)) {
    return { sound: reason, useSelectIntensity: true };
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
  if (tags.includes("heat") || pulseLikeReasons.has(reason)) {
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
