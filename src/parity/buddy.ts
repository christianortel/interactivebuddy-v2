// Buddy simulation for the parity runtime, 40 Hz fixed tick.
// Evidence-based values (see docs/MEASUREMENT_LOG.md):
//  - Part radii from DefineShape bounds (EV-0018): body 25.3, head 13.6, limbs 9.85.
//  - Spawn transforms from PlaceObject2 matrices (EV-0018).
//  - initPhysics defaults (EV-0019): slow=1, grav=0.8, damp=0.225.
//  - Spring multipliers (EV-0019): arms 1.5, legs 0.5.
// PROVISIONAL (flagged, pending full doBodyPhysics port): head spring multiplier,
// body reaction coupling, material bounce/friction for buddy parts, grab stretch rules.

import { PLAY_LEFT, PLAY_RIGHT, PLAY_TOP, PLAY_BOTTOM } from "./render.ts";
import { physicsState, gravityX, gravityY } from "./physicsState.ts";
import { spriteAtlas } from "./sprites.ts";

export const GRAV = 0.8;
export const DAMP = 0.225;
const ARM_MULT = 1.5;
const LEG_MULT = 0.5;
const HEAD_MULT = 1.5; // PROVISIONAL
const BOUNCE = 0.2; // PROVISIONAL material pair (0.85/0.2 table entry)
const FRICTION = 0.85; // PROVISIONAL

export interface Part {
  name: string;
  x: number;
  y: number;
  xv: number;
  yv: number;
  radius: number;
  /** Fire state (EV-0022): ignition transition pays out and hits emotion. */
  onFire: boolean;
  /** Remaining burn ticks; duration PROVISIONAL pending fire-decay decode. */
  fireTime: number;
  /** Rest anchor offset relative to body center (measured spawn deltas). */
  anchorX: number;
  anchorY: number;
  springMult: number;
  /**
   * PROVISIONAL: floor-support distance. The measured rest pose has the body
   * center 41.65px above the floor (389 - 347.35) — standing on legs. Until the
   * doBodyPhysics port establishes the real support math, the body collides with
   * the floor at this distance so the rest equilibrium matches the reference.
   */
  supportRadius?: number;
}

// Measured spawn transforms (EV-0018).
const SPAWN = {
  body: { x: 280.3, y: 347.35 },
  head: { x: 280.35, y: 311.1 },
  rLeg: { x: 295.15, y: 377.2 },
  lLeg: { x: 265.65, y: 375.7 },
  rArm: { x: 305.25, y: 334.05 },
  lArm: { x: 255.95, y: 334.05 }
} as const;

export class Buddy {
  body: Part;
  head: Part;
  rLeg: Part;
  lLeg: Part;
  rArm: Part;
  lArm: Part;
  parts: Part[];
  grabbed: Part | null = null;
  /** Body rotation state (M-REF-031/EV-0019: rv damping 0.96 air / 0.86 ground; upright spring 0.95 per tick). */
  bodyRot = 0;
  rv = 0;
  awake = true;
  /** Numeric mood core (EV-0022 addEmotion); clamp range PROVISIONAL. */
  emotion = 0;
  /** Active skin id; setSkin(skinId) drives per-part frame labels (EV-0028). */
  skin = "default";
  /** Tick counter driving the exact blink rule (EV-0029). */
  time = 0;
  /** Mouth switches to the "talking" frame while a bubble is active. */
  talking = false;
  /** Unconscious countdown; duration per stun source PROVISIONAL. */
  stunTimer = 0;

  stun(duration: number): void {
    this.awake = false;
    this.stunTimer = Math.max(this.stunTimer, duration);
    this.release();
    this.grabbed = null;
  }
  private onGround = false;
  private grabVelX = 0;
  private grabVelY = 0;

  addEmotion(delta: number): void {
    this.emotion = Math.max(-100, Math.min(100, this.emotion + delta));
  }

  constructor() {
    const make = (
      name: keyof typeof SPAWN,
      radius: number,
      springMult: number
    ): Part => ({
      name,
      x: SPAWN[name].x,
      y: SPAWN[name].y,
      xv: 0,
      yv: 0,
      radius,
      onFire: false,
      fireTime: 0,
      anchorX: SPAWN[name].x - SPAWN.body.x,
      anchorY: SPAWN[name].y - SPAWN.body.y,
      springMult
    });
    this.body = make("body", 25.3, 0);
    this.body.supportRadius = 41.65;
    this.head = make("head", 13.6, HEAD_MULT);
    this.rLeg = make("rLeg", 9.85, LEG_MULT);
    this.lLeg = make("lLeg", 9.85, LEG_MULT);
    this.rArm = make("rArm", 9.85, ARM_MULT);
    this.lArm = make("lArm", 9.85, ARM_MULT);
    this.parts = [this.body, this.head, this.rLeg, this.lLeg, this.rArm, this.lArm];
  }

  /** Advance one 25 ms tick. */
  tick(): void {
    this.time += 1;
    if (this.stunTimer > 0) {
      this.stunTimer -= 1;
      if (this.stunTimer === 0) this.awake = true;
    }
    const body = this.body;

    // Rotation (exact constants, EV-0019): damp rv, integrate, wrap to [-pi, pi].
    this.rv *= 0.96 - (this.onGround ? 0.1 : 0);
    this.bodyRot += this.rv;
    if (this.bodyRot > Math.PI) this.bodyRot -= Math.PI * 2;
    if (this.bodyRot < -Math.PI) this.bodyRot += Math.PI * 2;
    if (!this.awake) {
      // Unconscious: rotation flattens out on the ground (exact: *= 1 - onGround*0.1).
      this.bodyRot *= 1 - (this.onGround ? 0.1 : 0);
    } else if (this.onGround) {
      // Awake on ground: upright spring, factor 0.95 per tick (exact).
      this.bodyRot *= 0.95;
    }

    const cos = Math.cos(this.bodyRot);
    const sin = Math.sin(this.bodyRot);
    for (const part of this.parts) {
      if (part === this.grabbed) continue;
      if (part !== body) {
        // Evidenced integrator: anchors are polar offsets rotated by bodyRot;
        // velocity += (anchor - pos) * damp * mult + grav.
        const ax = body.x + part.anchorX * cos - part.anchorY * sin;
        const ay = body.y + part.anchorX * sin + part.anchorY * cos;
        part.xv += (ax - part.x) * DAMP * part.springMult + gravityX(GRAV);
        part.yv += (ay - part.y) * DAMP * part.springMult + gravityY(GRAV);
        // PROVISIONAL limb reaction on the body (pending full doBodyPhysics port).
        body.xv -= (ax - part.x) * DAMP * part.springMult * 0.18;
        body.yv -= (ay - part.y) * DAMP * part.springMult * 0.18;
      }
    }
    body.xv += gravityX(GRAV);
    body.yv += gravityY(GRAV);
    this.onGround = false;
    for (const part of this.parts) {
      if (part === this.grabbed) continue;
      part.x += part.xv;
      part.y += part.yv;
      this.collide(part);
    }
    // Exact stretch clamp (EV-0022, doBodyPhysics 0x169c18): a part further than
    // 35 px from its rotated anchor is pulled back to 34 px along the direction.
    // Applies to the grabbed part too — this is what drags the body along.
    for (const part of this.parts) {
      if (part === body) continue;
      const ax = body.x + part.anchorX * cos - part.anchorY * sin;
      const ay = body.y + part.anchorX * sin + part.anchorY * cos;
      const dx = part.x - ax;
      const dy = part.y - ay;
      const dist = Math.hypot(dx, dy);
      if (dist > 35) {
        const scale = 34 / dist;
        if (part === this.grabbed) {
          // PROVISIONAL drag transmission (pending exact body-force decode):
          // the clamp overflow moves the body toward the held part instead of
          // pulling the pinned part back, so dragging hauls the buddy along.
          const overflow = dist - 34;
          body.x += (dx / dist) * overflow;
          body.y += (dy / dist) * overflow;
          body.xv += (dx / dist) * overflow * 0.4;
          body.yv += (dy / dist) * overflow * 0.4;
        } else {
          part.x = ax + dx * scale;
          part.y = ay + dy * scale;
        }
      }
    }
    // Mild global drag keeps the provisional model stable at rest.
    for (const part of this.parts) {
      part.xv *= 0.98;
      part.yv *= 0.98;
    }
    // Fire burn-down (duration PROVISIONAL pending fire-decay decode).
    for (const part of this.parts) {
      if (part.onFire) {
        part.fireTime -= 1;
        if (part.fireTime <= 0) {
          part.onFire = false;
        }
      }
    }
  }

  /**
   * Ignite a part, returning payout events per the exact ignition table
   * (EV-0022): body -2 emotion/+$10 and spreads to head+legs and drops the
   * grab; head -2/+$4; legs -1/+$2; arms PROVISIONAL at leg values.
   */
  ignite(target: Part): { cash: number; x: number; y: number }[] {
    const events: { cash: number; x: number; y: number }[] = [];
    const light = (part: Part, cash: number, emotionDelta: number): void => {
      if (part.onFire) return;
      part.onFire = true;
      part.fireTime = 200; // PROVISIONAL burn duration
      this.addEmotion(emotionDelta);
      events.push({ cash, x: part.x, y: part.y });
    };
    const valueFor = (part: Part): { cash: number; emotion: number } => {
      if (part === this.body) return { cash: 10, emotion: -2 };
      if (part === this.head) return { cash: 4, emotion: -2 };
      return { cash: 2, emotion: -1 }; // legs exact; arms PROVISIONAL
    };
    const value = valueFor(target);
    light(target, value.cash, value.emotion);
    if (target === this.body) {
      // Exact spread: body fire ignites head and both legs, and drops the grab.
      light(this.head, 4, -2);
      light(this.rLeg, 2, -1);
      light(this.lLeg, 2, -1);
      this.release();
      this.grabbed = null;
    }
    return events;
  }

  private collide(part: Part): void {
    const floor = PLAY_BOTTOM;
    const ceiling = PLAY_TOP;
    const floorReach = part.supportRadius ?? part.radius;
    if (part.y + floorReach > floor) {
      part.y = floor - floorReach;
      part.yv *= -BOUNCE;
      part.xv *= FRICTION;
      this.onGround = true;
    }
    if (!physicsState.openCeiling && part.y - part.radius < ceiling) {
      part.y = ceiling + part.radius;
      part.yv *= -BOUNCE;
    }
    if (part.x - part.radius < PLAY_LEFT) {
      part.x = PLAY_LEFT + part.radius;
      part.xv *= -BOUNCE;
    }
    if (part.x + part.radius > PLAY_RIGHT) {
      part.x = PLAY_RIGHT - part.radius;
      part.xv *= -BOUNCE;
    }
  }

  grabAt(x: number, y: number): boolean {
    let best: Part | null = null;
    let bestDist = Infinity;
    for (const part of this.parts) {
      const d = Math.hypot(part.x - x, part.y - y);
      if (d < part.radius + 6 && d < bestDist) {
        best = part;
        bestDist = d;
      }
    }
    if (best) {
      this.grabbed = best;
      this.grabVelX = 0;
      this.grabVelY = 0;
      return true;
    }
    return false;
  }

  dragTo(x: number, y: number): void {
    if (!this.grabbed) return;
    this.grabVelX = x - this.grabbed.x;
    this.grabVelY = y - this.grabbed.y;
    this.grabbed.x = x;
    this.grabbed.y = y;
  }

  release(): void {
    if (!this.grabbed) return;
    this.grabbed.xv = this.grabVelX;
    this.grabbed.yv = this.grabVelY;
    this.grabbed = null;
  }

  /** Render at reference depths: body(9), head(17), rLeg(34), lLeg(40), rArm(46), lArm(49). */
  draw(ctx: CanvasRenderingContext2D): void {
    // Real extracted part art (registration-aligned, per-skin frame labels);
    // the body rotates with bodyRot. Falls back to measured-gradient spheres.
    const partSprite = (part: Part, rotation = 0): boolean =>
      spriteAtlas.draw(ctx, `${part.name}-${this.skin}`, part.x, part.y, { rotation }) ||
      spriteAtlas.draw(ctx, `${part.name}-default`, part.x, part.y, { rotation });
    if (!partSprite(this.body, this.bodyRot)) this.sphere(ctx, this.body);
    if (!partSprite(this.head)) {
      this.sphere(ctx, this.head);
      this.drawFace(ctx);
    } else if (this.skin === "default" || this.skin === "defaultng") {
      // Face overlay clips at measured offsets (EV-0029): righteye (-2.75,-3.2),
      // lefteye (4.2,-2.95), mouth (0, 7.3). Exact blink rule: closed when
      // unconscious or when floor((time/2) % 80) == 0.
      const closed = !this.awake || Math.floor((this.time / 2) % 80) === 0;
      const eye = closed ? "eye-closed" : "eye-open";
      const mouth = this.talking ? "mouth-talking" : "mouth-normal";
      const drewEyes =
        spriteAtlas.draw(ctx, eye, this.head.x - 2.75, this.head.y - 3.2) &&
        spriteAtlas.draw(ctx, eye, this.head.x + 4.2, this.head.y - 2.95);
      spriteAtlas.draw(ctx, mouth, this.head.x, this.head.y + 7.3);
      if (!drewEyes) this.drawFace(ctx);
    }
    if (!partSprite(this.rLeg)) this.sphere(ctx, this.rLeg);
    if (!partSprite(this.lLeg)) this.sphere(ctx, this.lLeg);
    if (!partSprite(this.rArm)) this.sphere(ctx, this.rArm);
    if (!partSprite(this.lArm)) this.sphere(ctx, this.lArm);
  }

  drawFlames(ctx: CanvasRenderingContext2D): void {
    // PROVISIONAL flame look pending fire-effect port (fireEffect/fireClip).
    for (const part of this.parts) {
      if (!part.onFire) continue;
      for (let i = 0; i < 3; i++) {
        const fx = part.x + (Math.random() - 0.5) * part.radius * 1.4;
        const fy = part.y - part.radius * (0.4 + Math.random() * 0.8);
        const r = 3 + Math.random() * part.radius * 0.5;
        const gradient = ctx.createRadialGradient(fx, fy, 0.5, fx, fy, r);
        gradient.addColorStop(0, "rgba(255, 240, 170, 0.9)");
        gradient.addColorStop(0.6, "rgba(240, 140, 40, 0.7)");
        gradient.addColorStop(1, "rgba(180, 60, 10, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private sphere(ctx: CanvasRenderingContext2D, part: Part): void {
    const g = ctx.createRadialGradient(
      part.x - part.radius * 0.35,
      part.y - part.radius * 0.4,
      part.radius * 0.15,
      part.x,
      part.y,
      part.radius
    );
    g.addColorStop(0, "#e2e6e0");
    g.addColorStop(0.7, "#a9b1a8");
    g.addColorStop(1, "#7e877e");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // PROVISIONAL face pass (righteye sprite has 31 frames of states, EV-0018;
  // exact face art/state mapping pending face-state capture inventory).
  private drawFace(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.head;
    ctx.fillStyle = "#3a403a";
    ctx.beginPath();
    ctx.arc(x - 4.5, y - 2, 1.6, 0, Math.PI * 2);
    ctx.arc(x + 4.5, y - 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}
