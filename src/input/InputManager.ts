export interface PointerSample {
  x: number;
  y: number;
  time: number;
}

export function isPrimaryPointerButton(button: number): boolean {
  return button === 0;
}

export function isTouchPointerType(pointerType: string | undefined): boolean {
  return pointerType === "touch";
}

export function isResetKey(key: string): boolean {
  return key === "r" || key === "R";
}

export class InputManager {
  private samples: PointerSample[] = [];

  recordPointer(sample: PointerSample): void {
    this.samples.push(sample);
    this.samples = this.samples.filter((entry) => sample.time - entry.time <= 120);
  }

  velocity(): { x: number; y: number } {
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    if (!first || !last || first === last) {
      return { x: 0, y: 0 };
    }
    const seconds = Math.max((last.time - first.time) / 1000, 0.001);
    return {
      x: (last.x - first.x) / seconds,
      y: (last.y - first.y) / seconds
    };
  }
}
