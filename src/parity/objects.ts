// Spawned-object system, starting with Grenades (Explosives category).
// Evidence (EV-0024):
//   addObjectBase(false, false, 0.2, 0.65, 0.35, "circle", x, y, xv, yv, "grenade")
//     -> grenade material bounce 0.2 / friction 0.65 (matches material table).
//   explode(p, x, y): shake += p*35; explosion@75 via makeExplosion;
//     explodeTimer = 4; per-part radial force with falloff
//     r6 = d/p + 20/p - 20p, F = clamp(1e6/r6^2 - 1, 0, 150); mines chain
//     (holdExplode) within range; "explosion" reaction line gated to 1500 ms
//     since last comment.
// PROVISIONAL (flagged): grenade fuse length, grenade power p=1, grenade
// radius/art, spawn-velocity mapping from pointer motion, explosion visual.

import type { Buddy } from "./buddy.ts";
import type { AudioSystem } from "./audio.ts";
import { PLAY_LEFT, PLAY_RIGHT, PLAY_TOP, PLAY_BOTTOM } from "./render.ts";
import { GRAV } from "./buddy.ts";
import { physicsState, gravityX, gravityY } from "./physicsState.ts";
import { spriteAtlas } from "./sprites.ts";

interface GameObject {
  type: string;
  x: number;
  y: number;
  xv: number;
  yv: number;
  radius: number;
  bounce: number;
  friction: number;
  fuse: number;
  /** Mines: armed once landed (EV-0024: stuck mines detonate on contact). */
  stuck: boolean;
  /** Burning object (fireballs; fire spreads on contact, EV-0024). */
  onFire: boolean;
  /**
   * Fresh-projectile window: object-hit cash requires hitTimer > 0 at impact
   * (EV-0024 anti-farm gate). Window length PROVISIONAL.
   */
  hitTimer: number;
  /** Visual roll angle (spin coupling PROVISIONAL pending object-rotation decode). */
  rot: number;
  /** Missile homing target (EV-0032: createMissile carries xt/yt). */
  targetX?: number;
  targetY?: number;
}

export type AwardFn = (amount: number, x: number, y: number) => void;

const HIT_WINDOW_TICKS = 60; // PROVISIONAL

interface ExplosionFlash {
  x: number;
  y: number;
  power: number;
  timer: number; // explodeTimer = 4 (exact)
}

const GRENADE_FUSE_TICKS = 100; // PROVISIONAL (~2.5 s) pending fuse decode
const GRENADE_POWER = 1; // PROVISIONAL

export class ObjectSystem {
  objects: GameObject[] = [];
  flashes: ExplosionFlash[] = [];
  shake = 0;
  /** Reaction hook (say(event, time)); wired by the runtime. */
  onReaction?: (event: string, time: number) => void;

  spawn(type: string, x: number, y: number, xv: number, yv: number): void {
    // Exact materials from the addObjectBase call table (EV-0026):
    // type: [bounce, friction, sizeScale]. Radius = sizeScale * BASE_SIZE
    // (BASE_SIZE PROVISIONAL 20 px pending object sprite-bounds measurement).
    const MATERIALS: Record<string, [number, number, number]> = {
      radio: [0.2, 0.8, 0.6], // PROVISIONAL material pending radio decode
      baseball: [0.2, 0.8, 0.3],
      bowlball: [0.15, 0.9, 0.8],
      bouncyball: [0.95, 0.95, 0.08],
      baby: [0.1, 0.2, 0.5],
      fireball: [0.9, 0.9, 0.1],
      grenade: [0.2, 0.65, 0.35],
      mine: [0, 0, 0.2],
      molotov: [0.5, 0.5, 0.45]
    };
    if (type === "vortex" || type === "vortexStrong") {
      // Gravity Vortex placed object ("vortex" objectType, EV-0005).
      // Pull strength/lifetime PROVISIONAL pending vortex behavior decode.
      this.objects.push({
        type, x, y, xv: 0, yv: 0,
        radius: 10, bounce: 0, friction: 0,
        fuse: 160, stuck: true, onFire: false, hitTimer: 0, rot: 0
      });
      return;
    }
    if (type === "missile") {
      // EXACT spawn (EV-0032): from above the stage at random x, homing to the
      // click point; mass 1, friction 0.9, bounce 0.9, not flammable.
      this.objects.push({
        type, x: 25 + Math.random() * 500, y: -100, xv: 0, yv: 0,
        radius: 6, bounce: 0.9, friction: 0.9,
        fuse: Infinity, stuck: false, onFire: false, hitTimer: 0, rot: Math.PI / 2,
        targetX: x, targetY: y
      });
      return;
    }
    const material = MATERIALS[type];
    if (!material) return;
    // numberOfObjects cap (save key evidenced; exact limit PROVISIONAL 15):
    // oldest non-mine object despawns when the cap is exceeded.
    if (this.objects.length >= 15) {
      const index = this.objects.findIndex((candidate) => candidate.type !== "mine");
      if (index !== -1) this.objects.splice(index, 1);
    }
    const BASE_SIZE = 20; // PROVISIONAL
    this.objects.push({
      type, x, y, xv, yv,
      radius: Math.max(3, material[2] * BASE_SIZE),
      bounce: material[0],
      friction: material[1],
      fuse: type === "grenade" ? GRENADE_FUSE_TICKS : Infinity,
      stuck: false,
      onFire: type === "fireball", // fireballs spawn burning (EV-0026 flag)
      hitTimer: HIT_WINDOW_TICKS,
      rot: 0
    });
  }

  tick(buddy: Buddy, audio: AudioSystem, award: AwardFn): void {
    this.shake *= 0.835; // exact decay (EV-0029)
    const surviving: GameObject[] = [];
    for (const object of this.objects) {
      let detonated = false;
      if (object.type === "vortex" || object.type === "vortexStrong") {
        // PROVISIONAL pull field pending vortex decode (gravitateToPoint).
        const strength = object.type === "vortexStrong" ? 0.8 : 0.35;
        for (const part of buddy.parts) {
          const dx = object.x - part.x;
          const dy = object.y - part.y;
          const d = Math.max(20, Math.hypot(dx, dy));
          part.xv += (dx / d) * strength * (200 / d) * 4;
          part.yv += (dy / d) * strength * (200 / d) * 4;
        }
        object.fuse -= 1;
        if (object.fuse > 0) surviving.push(object);
        continue;
      }
      if (object.type === "missile") {
        // Homing flight: turn toward target, thrust along heading
        // (thrust/turn-rate PROVISIONAL pending missile flight decode).
        const want = Math.atan2((object.targetY ?? 0) - object.y, (object.targetX ?? 0) - object.x);
        let deltaAngle = want - object.rot;
        while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
        object.rot += Math.max(-0.12, Math.min(0.12, deltaAngle));
        object.xv += Math.cos(object.rot) * 1.1;
        object.yv += Math.sin(object.rot) * 1.1;
        object.xv *= 0.92;
        object.yv *= 0.92;
        object.x += object.xv;
        object.y += object.yv;
        let boom = object.y + object.radius >= PLAY_BOTTOM ||
          (!physicsState.openCeiling && object.y - object.radius < PLAY_TOP && object.yv < 0) ||
          object.x < PLAY_LEFT || object.x > PLAY_RIGHT;
        if (!boom) {
          for (const part of buddy.parts) {
            if (Math.hypot(object.x - part.x, object.y - part.y) <= object.radius + part.radius) {
              boom = true;
              break;
            }
          }
        }
        if (!boom && Math.hypot((object.targetX ?? 0) - object.x, (object.targetY ?? 0) - object.y) < 8) {
          boom = true;
        }
        if (boom && object.y > PLAY_TOP - 10) {
          this.explode(1, object.x, object.y, buddy, audio, award); // power PROVISIONAL
        } else {
          surviving.push(object);
        }
        continue;
      }
      if (object.hitTimer > 0) object.hitTimer -= 1;
      if (!(object.type === "mine" && object.stuck)) {
        object.xv += gravityX(GRAV);
        object.yv += gravityY(GRAV);
        object.x += object.xv;
        object.y += object.yv;
        object.rot += object.xv * 0.04; // PROVISIONAL roll coupling
      }
      let touchedSurface = false;
      if (object.y + object.radius > PLAY_BOTTOM) {
        object.y = PLAY_BOTTOM - object.radius;
        object.yv *= -object.bounce;
        object.xv *= object.friction;
        touchedSurface = true;
        if (object.type === "mine") {
          object.stuck = true; // armed once landed
          object.xv = 0;
          object.yv = 0;
        }
      }
      if (!physicsState.openCeiling && object.y - object.radius < PLAY_TOP) {
        object.y = PLAY_TOP + object.radius;
        object.yv *= -object.bounce;
        touchedSurface = true;
      }
      if (physicsState.openCeiling && object.y + object.radius < PLAY_TOP - 60) {
        // Left through the open ceiling; despawn once well above the stage.
        continue;
      }
      if (object.x - object.radius < PLAY_LEFT) {
        object.x = PLAY_LEFT + object.radius;
        object.xv *= -object.bounce;
        touchedSurface = true;
      }
      if (object.x + object.radius > PLAY_RIGHT) {
        object.x = PLAY_RIGHT - object.radius;
        object.xv *= -object.bounce;
        touchedSurface = true;
      }
      // Buddy-part contact with momentum transfer, hit payout, fire spread.
      let touchedBuddy: import("./buddy.ts").Part | null = null;
      for (const part of buddy.parts) {
        const dx = object.x - part.x;
        const dy = object.y - part.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= object.radius + part.radius) {
          touchedBuddy = part;
          // Contact-detonators (molotov, armed mine) skip the generic
          // collision transfer/payout — detonation replaces it (EV-0024).
          if (object.type === "molotov" || (object.type === "mine" && object.stuck)) {
            break;
          }
          const relX = object.xv - part.xv;
          const relY = object.yv - part.yv;
          const impact = Math.hypot(relX, relY);
          // Momentum transfer (circleCollide port PROVISIONAL: mass ~ radius).
          const massRatio = object.radius / (object.radius + part.radius);
          part.xv += relX * massRatio;
          part.yv += relY * massRatio;
          object.xv -= relX * (1 - massRatio);
          object.yv -= relY * (1 - massRatio);
          if (dist > 0.01) {
            object.x = part.x + (dx / dist) * (object.radius + part.radius);
            object.y = part.y + (dy / dist) * (object.radius + part.radius);
          }
          // EXACT payout (EV-0026): impact speed = |relative velocity|; pays
          // only when speed > 25, amount = max(3, speed * 0.02), gated by the
          // fresh-projectile hitTimer window (anti-farm).
          if (object.hitTimer > 0 && impact > 25) {
            award(Math.max(3, impact * 0.02), part.x, part.y - 12);
            object.hitTimer = 0;
          }
          // Fire spread on contact (EV-0024): burning object ignites the part
          // and vice versa.
          if (object.onFire && !part.onFire) {
            for (const event of buddy.ignite(part)) {
              award(event.cash, event.x, event.y);
            }
            this.onReaction?.("burn", 120);
          } else if (part.onFire && !object.onFire && object.type !== "mine") {
            object.onFire = true;
          }
          break;
        }
      }
      if (object.type === "molotov" && (touchedSurface || touchedBuddy)) {
        // EV-0024: molotovs detonate on contact. Fire burst; knockback power
        // PROVISIONAL pending molotov explode-power decode.
        detonated = true;
        audio.play("burnball", 40); // measured volume
        this.explode(0.35, object.x, object.y, buddy, audio, award, false);
        for (const part of buddy.parts) {
          const d = Math.hypot(object.x - part.x, object.y - part.y);
          if (d < 45) { // PROVISIONAL ignition radius
            for (const event of buddy.ignite(part)) {
              award(event.cash, event.x, event.y);
            }
          }
        }
      } else if (object.type === "mine" && object.stuck && touchedBuddy) {
        // EV-0024: stuck mines detonate on contact.
        detonated = true;
        this.explode(GRENADE_POWER, object.x, object.y, buddy, audio, award);
      } else if (object.type === "grenade") {
        object.fuse -= 1;
        if (object.fuse <= 0) {
          detonated = true;
          this.explode(GRENADE_POWER, object.x, object.y, buddy, audio, award);
        }
      }
      if (!detonated) surviving.push(object);
    }
    this.objects = surviving;
    for (const flash of this.flashes) flash.timer -= 1;
    this.flashes = this.flashes.filter((flash) => flash.timer > 0);
    // Radio: radioMusic loops while any radio exists (loop rules PROVISIONAL).
    const hasRadio = this.objects.some((object) => object.type === "radio");
    if (hasRadio) audio.startLoop("radioMusic", 80);
    else audio.stopLoop("radioMusic");
  }

  /** Exact radial force application (EV-0024). */
  explode(
    power: number,
    x: number,
    y: number,
    buddy: Buddy,
    audio: AudioSystem,
    award?: AwardFn,
    withSound = true
  ): void {
    if (withSound) audio.play("explosion", 75);
    this.shake += power * 35; // exact
    this.flashes.push({ x, y, power, timer: 4 }); // explodeTimer = 4 (exact)
    this.onReaction?.("explosion", 160); // say('explosion', 160) evidenced
    for (const part of buddy.parts) {
      const dx = part.x - x;
      const dy = part.y - y;
      const distance = Math.abs(Math.hypot(dx, dy));
      const falloff = distance / power + 20 / power - 20 * power;
      const force = Math.max(0, Math.min(150, 1000000 / (falloff * falloff) - 1));
      if (force > 0 && distance > 0.01) {
        part.xv += (dx / distance) * force;
        part.yv += (dy / distance) * force;
      }
    }
    // Wake/rotation impulse PROVISIONAL until the doBodyPhysics rv coupling
    // for explosions is decoded.
    buddy.rv += (Math.random() - 0.5) * 0.3 * power;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const object of this.objects) {
      // Real extracted art when available; labeled placeholders otherwise.
      const spriteName = object.type === "vortexStrong" ? "vortex" : object.type;
      const spriteRotation =
        object.type === "missile" ? object.rot + Math.PI / 2 : object.rot;
      if (spriteAtlas.draw(ctx, spriteName, object.x, object.y, { rotation: spriteRotation })) {
        if (object.onFire) {
          const gradient = ctx.createRadialGradient(object.x, object.y - object.radius, 1, object.x, object.y - object.radius, object.radius * 2);
          gradient.addColorStop(0, "rgba(255, 235, 160, 0.9)");
          gradient.addColorStop(1, "rgba(200, 80, 20, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(object.x, object.y - object.radius, object.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        continue;
      }
      if (object.type === "vortex" || object.type === "vortexStrong") {
        const t = Date.now() / 200;
        ctx.strokeStyle = object.type === "vortexStrong" ? "#4a3a6a" : "#3a4a6a";
        ctx.lineWidth = 1.5;
        for (let arm = 0; arm < 3; arm++) {
          ctx.beginPath();
          for (let s = 0; s < 10; s++) {
            const angle = t + arm * 2.09 + s * 0.35;
            const radius = 2 + s * 1.6;
            const px = object.x + Math.cos(angle) * radius;
            const py = object.y + Math.sin(angle) * radius;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        continue;
      }
      if (object.type === "molotov") {
        ctx.fillStyle = "#4a6a3a";
        ctx.beginPath();
        ctx.ellipse(object.x, object.y, object.radius * 0.7, object.radius, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e8c46a";
        ctx.fillRect(object.x - 1, object.y - object.radius - 4, 2, 4);
      } else if (object.type === "mine") {
        ctx.fillStyle = object.stuck ? "#5a4a3a" : "#6a5a4a";
        ctx.beginPath();
        ctx.arc(object.x, object.y + object.radius * 0.3, object.radius, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = "#c04030";
        ctx.fillRect(object.x - 1, object.y - object.radius * 0.7 - 2, 2, 2);
      } else if (object.type === "baseball") {
        ctx.fillStyle = "#e8e4da";
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#b04030";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(object.x - object.radius * 0.4, object.y, object.radius * 0.8, -0.9, 0.9);
        ctx.stroke();
      } else if (object.type === "bowlball") {
        ctx.fillStyle = "#2a2a34";
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (object.type === "bouncyball") {
        ctx.fillStyle = "#c04060";
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (object.type === "baby") {
        ctx.fillStyle = "#e8c8b0";
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(object.x - 2.5, object.y - 1.5, 1.5, 1.5);
        ctx.fillRect(object.x + 1, object.y - 1.5, 1.5, 1.5);
      } else if (object.type === "fireball") {
        ctx.fillStyle = "#e07020";
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius + 1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#2e3a2e";
        ctx.beginPath();
        ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#556055";
        ctx.fillRect(object.x - 1, object.y - object.radius - 3, 2, 3);
      }
      if (object.onFire) {
        const gradient = ctx.createRadialGradient(object.x, object.y - object.radius, 1, object.x, object.y - object.radius, object.radius * 2);
        gradient.addColorStop(0, "rgba(255, 235, 160, 0.9)");
        gradient.addColorStop(1, "rgba(200, 80, 20, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(object.x, object.y - object.radius, object.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (const flash of this.flashes) {
      // PROVISIONAL explosion visual pending makeExplosion port.
      const t = 1 - flash.timer / 4;
      const radius = 20 + t * 60 * flash.power;
      ctx.save();
      ctx.globalAlpha = 0.85 * (1 - t);
      const gradient = ctx.createRadialGradient(flash.x, flash.y, 2, flash.x, flash.y, radius);
      gradient.addColorStop(0, "#fff6d8");
      gradient.addColorStop(0.5, "#f0a53a");
      gradient.addColorStop(1, "rgba(120, 60, 20, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
