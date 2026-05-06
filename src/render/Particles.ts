export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export class ParticleSystem {
  readonly particles: Particle[] = [];

  emit(particle: Particle): void {
    this.particles.push(particle);
  }

  update(deltaMs: number): void {
    for (const particle of this.particles) {
      particle.life -= deltaMs;
      particle.x += particle.vx * (deltaMs / 1000);
      particle.y += particle.vy * (deltaMs / 1000);
    }
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      if (this.particles[index].life <= 0) {
        this.particles.splice(index, 1);
      }
    }
  }
}
