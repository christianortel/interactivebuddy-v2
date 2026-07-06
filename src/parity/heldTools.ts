// Held tools: Fist and Flamethrower.
// Fist (EV-0023): punch payout addCash(min(0.5, punchDist*0.002)) measured;
// punch1-4 impact sounds; punchDist mapping and impulse PROVISIONAL pending
// the fist block full decode. Flamethrower: stream ignition using the exact
// ignition payout table (EV-0022); stream shape/rate PROVISIONAL.

import type { Buddy } from "./buddy.ts";
import type { AudioSystem } from "./audio.ts";
import type { AwardFn } from "./objects.ts";
import { spriteAtlas } from "./sprites.ts";
import { physicsState } from "./physicsState.ts";

// Hose nozzle parameters — EXACT from the three water() call sites (EV-0031):
// water(x, y, xv, yv, life, strength, spread, size, disappearOnContact),
// velocity = speed along aim + jitter.
const HOSES: Record<string, { speed: number; life: number; strength: number; spread: number; size: number; disappear: boolean; jitter: number }> = {
  "Wide Nozzle Hose": { speed: 15, life: 25, strength: 0.005, spread: 4, size: 20, disappear: false, jitter: 0.5 },
  "Narrow Nozzle Hose": { speed: 30, life: 20, strength: 0.035, spread: 0.3, size: 20, disappear: true, jitter: 0.075 },
  "Fire Hose": { speed: 60, life: 20, strength: 0.25, spread: 0.3, size: 35, disappear: true, jitter: 0.04 }
};

interface Droplet {
  x: number;
  y: number;
  xv: number;
  yv: number;
  life: number;
  strength: number;
  size: number;
  disappear: boolean;
}

export class HeldTools {
  private punchCooldown = 0;
  private flameSoundCooldown = 0;
  private zapCooldown = 0;
  private droplets: Droplet[] = [];
  private flames: { x: number; y: number; xv: number; yv: number; life: number }[] = [];
  private zaps: { x: number; y: number; life: number }[] = [];
  // Medieval Flail ball state (constraint length/mass PROVISIONAL pending decode).
  private flail = { x: 0, y: 0, xv: 0, yv: 0, active: false, hitCooldown: 0 };

  tick(
    itemName: string,
    pointer: { x: number; y: number },
    pointerVel: { x: number; y: number },
    mouseDown: boolean,
    buddy: Buddy,
    audio: AudioSystem,
    award: AwardFn
  ): void {
    if (this.punchCooldown > 0) this.punchCooldown -= 1;
    if (this.flameSoundCooldown > 0) this.flameSoundCooldown -= 1;

    if (itemName === "Fist") {
      const speed = Math.hypot(pointerVel.x, pointerVel.y);
      if (speed > 2 && this.punchCooldown === 0) {
        for (const part of buddy.parts) {
          if (Math.hypot(pointer.x - part.x, pointer.y - part.y) <= part.radius + 8) {
            part.xv += pointerVel.x * 0.8; // PROVISIONAL impulse transfer
            part.yv += pointerVel.y * 0.8;
            const punchDist = speed * 25; // PROVISIONAL punchDist mapping
            award(Math.min(0.5, punchDist * 0.002), part.x, part.y - 12); // exact formula
            audio.play(`punch${1 + Math.floor(Math.random() * 4)}`, 100);
            buddy.addEmotion(-1); // PROVISIONAL punch emotion
            this.punchCooldown = 8; // PROVISIONAL re-hit window
            break;
          }
        }
      }
    }

    if (this.zapCooldown > 0) this.zapCooldown -= 1;
    if (itemName === "Stun Gun" && mouseDown && this.zapCooldown === 0) {
      for (const part of buddy.parts) {
        if (Math.hypot(pointer.x - part.x, pointer.y - part.y) <= part.radius + 6) {
          audio.play("shock", 70); // measured volume (EV-0020)
          buddy.stun(120); // PROVISIONAL stun duration
          buddy.addEmotion(-1); // PROVISIONAL
          this.zaps.push({ x: part.x, y: part.y, life: 8 });
          part.xv += (Math.random() - 0.5) * 6;
          this.zapCooldown = 20; // PROVISIONAL re-zap window
          break;
        }
      }
    }

    if (itemName === "Medieval Flail") {
      if (!this.flail.active) {
        this.flail.active = true;
        this.flail.x = pointer.x;
        this.flail.y = pointer.y + 60;
        this.flail.xv = 0;
        this.flail.yv = 0;
      }
      const CHAIN_LENGTH = 60; // PROVISIONAL
      this.flail.yv += 0.8; // exact gravity
      this.flail.x += this.flail.xv;
      this.flail.y += this.flail.yv;
      const dx = this.flail.x - pointer.x;
      const dy = this.flail.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist > CHAIN_LENGTH) {
        const scale = CHAIN_LENGTH / dist;
        const nx = pointer.x + dx * scale;
        const ny = pointer.y + dy * scale;
        this.flail.xv += (nx - this.flail.x) * 0.5;
        this.flail.yv += (ny - this.flail.y) * 0.5;
        this.flail.x = nx;
        this.flail.y = ny;
      }
      this.flail.xv *= 0.99;
      this.flail.yv *= 0.99;
      if (this.flail.hitCooldown > 0) this.flail.hitCooldown -= 1;
      for (const part of buddy.parts) {
        const pdx = this.flail.x - part.x;
        const pdy = this.flail.y - part.y;
        if (Math.hypot(pdx, pdy) <= part.radius + 8) {
          const relX = this.flail.xv - part.xv;
          const relY = this.flail.yv - part.yv;
          const impact = Math.hypot(relX, relY);
          part.xv += relX * 0.7;
          part.yv += relY * 0.7;
          this.flail.xv *= -0.3;
          this.flail.yv *= -0.3;
          if (impact > 25 && this.flail.hitCooldown === 0) {
            // Exact impact payout formula (EV-0026).
            award(Math.max(3, impact * 0.02), part.x, part.y - 12);
            audio.play(`punch${1 + Math.floor(Math.random() * 4)}`, 100);
            this.flail.hitCooldown = 20; // PROVISIONAL anti-farm window
          }
          break;
        }
      }
    } else {
      this.flail.active = false;
    }

    // Magical Orb: telekinetic pull toward the orb at the cursor with a beam
    // line to the buddy (both Special items draw beams, EV-0032). Pull
    // strength/falloff PROVISIONAL pending gravitateToPoint decode.
    if (itemName === "Magical Orb" && mouseDown) {
      for (const part of buddy.parts) {
        const dx = pointer.x - part.x;
        const dy = pointer.y - part.y;
        const d = Math.max(30, Math.hypot(dx, dy));
        part.xv += (dx / d) * 1.6 * Math.min(1, 160 / d);
        part.yv += (dy / d) * 1.6 * Math.min(1, 160 / d);
      }
    }

    // Gravity Shifter: redirects gravity toward the held cursor direction
    // relative to the buddy (semantic PROVISIONAL pending full decode);
    // resets to down when released or unequipped.
    if (itemName === "Gravity Shifter" && mouseDown) {
      const dx = pointer.x - buddy.body.x;
      const dy = pointer.y - buddy.body.y;
      const d = Math.hypot(dx, dy) || 1;
      physicsState.gravityDirX = dx / d;
      physicsState.gravityDirY = dy / d;
    } else if (physicsState.gravityDirX !== 0 || physicsState.gravityDirY !== 1) {
      physicsState.gravityDirX = 0;
      physicsState.gravityDirY = 1;
    }

    const hose = HOSES[itemName];
    if (hose && mouseDown) {
      // Aim toward the buddy like the weapon clips (hoseRot analogue).
      const aim = Math.atan2(buddy.body.y - pointer.y, buddy.body.x - pointer.x);
      const angle = aim + (Math.random() - 0.5) * hose.jitter * 2;
      this.droplets.push({
        x: pointer.x,
        y: pointer.y,
        xv: Math.cos(angle) * hose.speed + (Math.random() - 0.5) * hose.spread,
        yv: Math.sin(angle) * hose.speed + (Math.random() - 0.5) * hose.spread,
        life: hose.life,
        strength: hose.strength,
        size: hose.size,
        disappear: hose.disappear
      });
    }
    const survivingDrops: Droplet[] = [];
    for (const drop of this.droplets) {
      drop.yv += 0.8; // exact gravity
      drop.x += drop.xv;
      drop.y += drop.yv;
      drop.life -= 1;
      let dead = drop.life <= 0 || drop.y > 389;
      for (const part of buddy.parts) {
        if (Math.hypot(drop.x - part.x, drop.y - part.y) <= part.radius + drop.size * 0.15) {
          // Push transfer scaled by exact strength; extinguish fire on contact.
          part.xv += drop.xv * drop.strength;
          part.yv += drop.yv * drop.strength;
          if (part.onFire) {
            part.onFire = false;
            part.fireTime = 0;
          }
          if (drop.disappear) dead = true;
          break;
        }
      }
      if (!dead) survivingDrops.push(drop);
    }
    this.droplets = survivingDrops;

    if (itemName === "Flamethrower" && mouseDown) {
      const target = buddy.body;
      const angle = Math.atan2(target.y - pointer.y, target.x - pointer.x);
      for (let i = 0; i < 3; i++) {
        const spread = (Math.random() - 0.5) * 0.3;
        const speed = 6 + Math.random() * 4;
        this.flames.push({
          x: pointer.x,
          y: pointer.y,
          xv: Math.cos(angle + spread) * speed,
          yv: Math.sin(angle + spread) * speed,
          life: 24
        });
      }
      if (this.flameSoundCooldown === 0) {
        audio.play("burnball", 40);
        this.flameSoundCooldown = 24;
      }
    }

    const surviving: typeof this.flames = [];
    for (const flame of this.flames) {
      flame.x += flame.xv;
      flame.y += flame.yv;
      flame.yv -= 0.08; // flames drift upward
      flame.life -= 1;
      let hit = false;
      for (const part of buddy.parts) {
        if (Math.hypot(flame.x - part.x, flame.y - part.y) <= part.radius + 3) {
          hit = true;
          if (!part.onFire) {
            for (const event of buddy.ignite(part)) {
              award(event.cash, event.x, event.y);
            }
          }
          break;
        }
      }
      if (!hit && flame.life > 0) surviving.push(flame);
    }
    this.flames = surviving;
  }

  draw(ctx: CanvasRenderingContext2D, itemName: string, pointer: { x: number; y: number }): void {
    // Zap flashes (zapGraphic sprite extraction pending; jagged-line stand-in).
    this.zaps = this.zaps.filter((zap) => zap.life-- > 0);
    for (const zap of this.zaps) {
      ctx.strokeStyle = `rgba(120, 180, 255, ${zap.life / 8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let zx = zap.x, zy = zap.y - 14;
      ctx.moveTo(zx, zy);
      for (let i = 0; i < 4; i++) {
        zx += (Math.random() - 0.5) * 10;
        zy += 7;
        ctx.lineTo(zx, zy);
      }
      ctx.stroke();
    }
    if (itemName === "Medieval Flail" && this.flail.active) {
      // Chain links from cursor to ball, then the wrecking ball (real art).
      const links = 6;
      for (let i = 1; i <= links; i++) {
        const t = i / (links + 1);
        const cx = pointer.x + (this.flail.x - pointer.x) * t;
        const cy = pointer.y + (this.flail.y - pointer.y) * t;
        if (!spriteAtlas.draw(ctx, "chain", cx, cy)) {
          ctx.fillStyle = "#4a4a4a";
          ctx.beginPath();
          ctx.arc(cx, cy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!spriteAtlas.draw(ctx, "wreckingBall", this.flail.x, this.flail.y)) {
        ctx.fillStyle = "#3a3a42";
        ctx.beginPath();
        ctx.arc(this.flail.x, this.flail.y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (itemName === "Stun Gun") {
      if (!spriteAtlas.draw(ctx, "stunGun", pointer.x, pointer.y)) {
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(pointer.x - 3, pointer.y - 6, 6, 12);
      }
    }
    if (itemName === "Magical Orb") {
      // Beam to the buddy is drawn by main (needs buddy position); orb art here.
      const pulse = 1 + Math.sin(Date.now() / 150) * 0.08;
      if (!spriteAtlas.draw(ctx, "orb", pointer.x, pointer.y, { scale: pulse })) {
        ctx.fillStyle = "#7fd0e8";
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Water droplets (visual look PROVISIONAL pending water draw-API port).
    for (const drop of this.droplets) {
      const radius = drop.size * 0.12 + Math.random() * 1.5;
      const gradient = ctx.createRadialGradient(drop.x, drop.y, 0.5, drop.x, drop.y, radius);
      gradient.addColorStop(0, "rgba(200, 225, 245, 0.9)");
      gradient.addColorStop(1, "rgba(120, 170, 220, 0.15)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const flame of this.flames) {
      const t = flame.life / 24;
      const gradient = ctx.createRadialGradient(flame.x, flame.y, 0.5, flame.x, flame.y, 5);
      gradient.addColorStop(0, `rgba(255, 235, 150, ${0.8 * t})`);
      gradient.addColorStop(1, "rgba(210, 90, 20, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(flame.x, flame.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (itemName === "Fist") {
      if (spriteAtlas.draw(ctx, "fister", pointer.x, pointer.y)) return;
      ctx.fillStyle = "#d8b898";
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#9a7858";
      ctx.stroke();
    } else if (itemName === "Flamethrower") {
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(pointer.x - 4, pointer.y - 3, 14, 6);
    }
  }
}
