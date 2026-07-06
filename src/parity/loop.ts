// Fixed-timestep simulation loop at the reference frame rate of 40 Hz
// (M-REF-002: 25 ms per tick), with render interpolation and bounded catch-up.

export const TICK_MS = 25; // 40 Hz reference timeline
const MAX_CATCHUP_TICKS = 5;

export interface LoopCallbacks {
  /** Advance simulation by exactly one 25 ms tick. */
  tick(): void;
  /** Render; alpha in [0,1] interpolates between previous and current tick. */
  render(alpha: number): void;
}

export function startLoop(callbacks: LoopCallbacks): () => void {
  let accumulator = 0;
  let last = performance.now();
  let running = true;

  function frame(now: number): void {
    if (!running) return;
    accumulator += now - last;
    last = now;
    let ticks = 0;
    while (accumulator >= TICK_MS && ticks < MAX_CATCHUP_TICKS) {
      callbacks.tick();
      accumulator -= TICK_MS;
      ticks += 1;
    }
    if (ticks === MAX_CATCHUP_TICKS && accumulator >= TICK_MS) {
      accumulator = 0; // drop time after a long stall instead of spiraling
    }
    callbacks.render(Math.min(1, accumulator / TICK_MS));
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  return () => {
    running = false;
  };
}
