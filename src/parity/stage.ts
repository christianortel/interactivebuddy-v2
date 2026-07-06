// Reference coordinate system: 550x400 stage units (M-REF-001), uniform scale,
// letterboxed. Pointer input converts display -> stage exactly once, here.

export const STAGE_WIDTH = 550;
export const STAGE_HEIGHT = 400;

export interface StageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function computeTransform(viewWidth: number, viewHeight: number): StageTransform {
  const scale = Math.min(viewWidth / STAGE_WIDTH, viewHeight / STAGE_HEIGHT);
  return {
    scale,
    offsetX: (viewWidth - STAGE_WIDTH * scale) / 2,
    offsetY: (viewHeight - STAGE_HEIGHT * scale) / 2
  };
}

export function displayToStage(
  transform: StageTransform,
  displayX: number,
  displayY: number
): { x: number; y: number } {
  return {
    x: (displayX - transform.offsetX) / transform.scale,
    y: (displayY - transform.offsetY) / transform.scale
  };
}
