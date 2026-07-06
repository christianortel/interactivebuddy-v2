// Shared runtime physics toggles driven by Modes (docs/CONTENT_INVENTORY.md).
// Exact base gravity is 0.8 (EV-0019). Low Gravity multiplier and Earthquake
// cadence are PROVISIONAL pending mode-effect decode.

export const physicsState = {
  gravityScale: 1,
  // Gravity direction unit vector (Gravity Shifter redirects it; default down).
  gravityDirX: 0,
  gravityDirY: 1,
  openCeiling: false,
  pyroMode: false
};

export function currentGravity(baseGravity: number): number {
  return baseGravity * physicsState.gravityScale;
}

export function gravityX(baseGravity: number): number {
  return baseGravity * physicsState.gravityScale * physicsState.gravityDirX;
}

export function gravityY(baseGravity: number): number {
  return baseGravity * physicsState.gravityScale * physicsState.gravityDirY;
}
