export interface StageSize {
  width: number;
  height: number;
}

export interface ClientPoint {
  clientX: number;
  clientY: number;
}

export interface ClientRectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function screenPointToWorld(rect: ClientRectLike, point: ClientPoint, stage: StageSize): { x: number; y: number } {
  return {
    x: ((point.clientX - rect.left) / rect.width) * stage.width,
    y: ((point.clientY - rect.top) / rect.height) * stage.height
  };
}

export function getClampedOverlayPosition(
  rect: ClientRectLike,
  point: ClientPoint,
  overlaySize: number,
  padding = 8
): { x: number; y: number } {
  const half = overlaySize / 2;
  const minX = half + padding;
  const minY = half + padding;
  const maxX = rect.width - half - padding;
  const maxY = rect.height - half - padding;
  return {
    x: Math.max(minX, Math.min(maxX, point.clientX - rect.left)),
    y: Math.max(minY, Math.min(maxY, point.clientY - rect.top))
  };
}

export function getOverlayCssPosition(position: { x: number; y: number }): { left: string; top: string } {
  return {
    left: `${position.x}px`,
    top: `${position.y}px`
  };
}
