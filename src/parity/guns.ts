// Guns category (Pistol, Shotgun, Machine Gun) ported from the artifact
// (EV-0023, doWeaponPhysics fire blocks + bullet constructor):
//   bullet = { x, y, xv, yv, str, ricNum, type } pushed to a global array.
//   Pistol:  edge-fire; speed 250; spread ±0.0125 rad; str 1.25;
//            ric = floor(random()*1.5); sound pistolFire@80; muzzle anim.
//   Shotgun: edge-fire; 8 pellets; speed 125 + random()*150; spread ±0.175 rad;
//            str 0.65; ric = floor(4*random()^4); sound shotgunFire@80.
//   Mach:    fires while held, every 5 ticks (machReset=5); speed 250;
//            sound machFire@80; spread PROVISIONAL (block partially decoded).
//   Aim: weapon at cursor; angle = atan2 toward the buddy; Ctrl locks aim to
//   the head (evidenced); non-Ctrl target = body (PROVISIONAL: else-branch
//   pending decode). Bullets spawn at the cursor position.
// PROVISIONAL (flagged): impulse transfer factor, bullet trail look, weapon
// placeholder art (real sprite art arrives with the art-extraction slice),
// per-hit bullet cash (doBullets payout block pending decode).

import type { Buddy, Part } from "./buddy.ts";
import type { AudioSystem } from "./audio.ts";
import { PLAY_LEFT, PLAY_RIGHT, PLAY_TOP, PLAY_BOTTOM } from "./render.ts";
import { spriteAtlas } from "./sprites.ts";

// Weapon clip 634 frame labels: idle:1, fire:2 (EV-0028) — all three guns
// share the one weapon clip, playing "fire" on shot like the original
// gotoAndPlay("fire") (EV-0023).

interface Bullet {
  x: number;
  y: number;
  xv: number;
  yv: number;
  str: number;
  ricNum: number;
  type: string;
  age: number;
}

interface GunSpec {
  name: string;
  pellets: number;
  speed: () => number;
  spread: number;
  str: number;
  ricochets: () => number;
  auto: boolean;
  sound: string;
}

const GUNS: Record<string, GunSpec> = {
  Pistol: {
    name: "Pistol",
    pellets: 1,
    speed: () => 250,
    spread: 0.025,
    str: 1.25,
    ricochets: () => Math.floor(Math.random() * 1.5),
    auto: false,
    sound: "pistolFire"
  },
  Shotgun: {
    name: "Shotgun",
    pellets: 8,
    speed: () => 125 + Math.random() * 150,
    spread: 0.35,
    str: 0.65,
    ricochets: () => Math.floor(4 * Math.pow(Math.random(), 4)),
    auto: false,
    sound: "shotgunFire"
  },
  "Machine Gun": {
    name: "Machine Gun",
    pellets: 1,
    speed: () => 250,
    spread: 0.05, // PROVISIONAL pending full mach block decode
    str: 1.25, // PROVISIONAL
    ricochets: () => 0, // PROVISIONAL
    auto: true,
    sound: "machFire"
  }
};

const IMPULSE_FACTOR = 0.035; // PROVISIONAL velocity-transfer factor

export function isGun(itemName: string): boolean {
  return itemName in GUNS;
}

export class GunSystem {
  private bullets: Bullet[] = [];
  private machReset = 0;
  private wasDown = false;
  private fireAnim = 0;

  /** One 40 Hz tick. */
  tick(
    itemName: string,
    pointer: { x: number; y: number },
    mouseDown: boolean,
    ctrlDown: boolean,
    buddy: Buddy,
    audio: AudioSystem
  ): void {
    const spec = GUNS[itemName];
    if (spec) {
      if (this.machReset > 0) this.machReset -= 1;
      const edge = mouseDown && !this.wasDown;
      const shouldFire = spec.auto
        ? mouseDown && this.machReset === 0
        : edge;
      if (shouldFire) {
        if (spec.auto) this.machReset = 5; // exact mach cadence
        this.fire(spec, pointer, ctrlDown, buddy, audio);
      }
    }
    this.wasDown = mouseDown;
    this.updateBullets(buddy);
  }

  private aimAngle(pointer: { x: number; y: number }, ctrlDown: boolean, buddy: Buddy): number {
    const target: Part = ctrlDown ? buddy.head : buddy.body;
    return Math.atan2(target.y - pointer.y, target.x - pointer.x);
  }

  private fire(
    spec: GunSpec,
    pointer: { x: number; y: number },
    ctrlDown: boolean,
    buddy: Buddy,
    audio: AudioSystem
  ): void {
    audio.play(spec.sound, 80);
    this.fireAnim = 3; // gotoAndPlay("fire") equivalent
    const aim = this.aimAngle(pointer, ctrlDown, buddy);
    for (let i = 0; i < spec.pellets; i++) {
      const angle = aim + (Math.random() - 0.5) * spec.spread;
      const speed = spec.speed();
      this.bullets.push({
        x: pointer.x,
        y: pointer.y,
        xv: Math.cos(angle) * speed,
        yv: Math.sin(angle) * speed,
        str: spec.str,
        ricNum: spec.ricochets(),
        type: spec.name,
        age: 0
      });
    }
  }

  private updateBullets(buddy: Buddy): void {
    const next: Bullet[] = [];
    for (const bullet of this.bullets) {
      bullet.age += 1;
      const steps = 8; // segment substeps for fast bullets
      let alive = true;
      for (let s = 0; s < steps && alive; s++) {
        bullet.x += bullet.xv / steps;
        bullet.y += bullet.yv / steps;
        // Part hit test.
        for (const part of buddy.parts) {
          const dx = bullet.x - part.x;
          const dy = bullet.y - part.y;
          if (dx * dx + dy * dy <= part.radius * part.radius) {
            part.xv += bullet.xv * bullet.str * IMPULSE_FACTOR;
            part.yv += bullet.yv * bullet.str * IMPULSE_FACTOR;
            alive = false;
            break;
          }
        }
        if (!alive) break;
        // Walls: ricochet while ricNum remains, else despawn.
        const bounce = (): boolean => {
          if (bullet.ricNum > 0) {
            bullet.ricNum -= 1;
            return true;
          }
          return false;
        };
        if (bullet.x < PLAY_LEFT) {
          if (bounce()) { bullet.x = PLAY_LEFT; bullet.xv *= -1; } else alive = false;
        } else if (bullet.x > PLAY_RIGHT) {
          if (bounce()) { bullet.x = PLAY_RIGHT; bullet.xv *= -1; } else alive = false;
        }
        if (bullet.y < PLAY_TOP) {
          if (bounce()) { bullet.y = PLAY_TOP; bullet.yv *= -1; } else alive = false;
        } else if (bullet.y > PLAY_BOTTOM) {
          if (bounce()) { bullet.y = PLAY_BOTTOM; bullet.yv *= -1; } else alive = false;
        }
      }
      if (alive && bullet.age < 40) next.push(bullet);
    }
    this.bullets = next;
  }

  draw(ctx: CanvasRenderingContext2D, itemName: string, pointer: { x: number; y: number }, ctrlDown: boolean, buddy: Buddy): void {
    // Bullet trails (PROVISIONAL look pending capture comparison).
    ctx.strokeStyle = "rgba(40, 44, 40, 0.8)";
    ctx.lineWidth = 1;
    for (const bullet of this.bullets) {
      const len = 6;
      const mag = Math.hypot(bullet.xv, bullet.yv) || 1;
      ctx.beginPath();
      ctx.moveTo(bullet.x - (bullet.xv / mag) * len, bullet.y - (bullet.yv / mag) * len);
      ctx.lineTo(bullet.x, bullet.y);
      ctx.stroke();
    }
    if (!isGun(itemName)) return;
    const aim = this.aimAngle(pointer, ctrlDown, buddy);
    if (this.fireAnim > 0) this.fireAnim -= 1;
    // Real extracted weapon art (shadow at +2/+2 per EV-0023); placeholder fallback.
    const sprite = this.fireAnim > 0 ? "weapon-fire" : "weapon-idle";
    if (spriteAtlas.has(sprite)) {
      spriteAtlas.draw(ctx, sprite, pointer.x + 2, pointer.y + 2, { rotation: aim, alpha: 0.3 });
      spriteAtlas.draw(ctx, sprite, pointer.x, pointer.y, { rotation: aim });
      return;
    }
    ctx.save();
    ctx.translate(pointer.x, pointer.y);
    ctx.rotate(aim);
    ctx.fillStyle = "#2f342f";
    ctx.fillRect(0, -2, 16, 4);
    ctx.fillRect(-6, -3, 8, 7);
    ctx.restore();
  }
}
