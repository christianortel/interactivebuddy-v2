import { ParticleSystem } from "./Particles";

export class Renderer {
  readonly particles = new ParticleSystem();

  constructor(readonly canvas: HTMLCanvasElement) {}

  clear(): void {
    const context = this.canvas.getContext("2d");
    context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
