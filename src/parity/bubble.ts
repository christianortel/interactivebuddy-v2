// Speech bubble system ported from buddySay (EV-0022, 0x15679e):
//   buddySay("sound", name)  -> speak(name, 100)   (voice line)
//   buddySay("script", src)  -> executeScript(src) (scripting engine)
//   buddySay(useImage, contents, time) -> bubble.newUseImage/newContents/time
// Bubble visuals: rounded bubble with tail toward the head, spawn reference
// (277.75, 309.5) (M-REF-032). Idle "..." cadence is PROVISIONAL pending clip
// timing measurement; fade behavior evidenced by EV-0009/EV-0013 captures.

import type { AudioSystem } from "./audio.ts";
import { spriteAtlas } from "./sprites.ts";

export class BubbleSystem {
  private contents = "";
  private time = 0;
  private alpha = 0;
  private idleCounter = 0;

  /** True while a bubble is being shown (drives the talking mouth frame). */
  get active(): boolean {
    return this.time > 0;
  }

  constructor(private audio: AudioSystem) {}

  say(type: "sound" | "script" | "text", contents: string, time = 80): void {
    if (type === "sound") {
      this.audio.play(contents, 100);
      return;
    }
    if (type === "script") {
      // Scripting engine arrives with the ShockScript slice.
      return;
    }
    this.contents = contents;
    this.time = time;
  }

  /** One 25 ms tick. Idle "..." cadence PROVISIONAL until measured. */
  tick(buddyIdle: boolean): void {
    if (this.time > 0) {
      this.time -= 1;
      this.alpha = Math.min(1, this.alpha + 0.1);
    } else {
      this.alpha = Math.max(0, this.alpha - 0.05);
    }
    if (buddyIdle) {
      this.idleCounter += 1;
      if (this.idleCounter > 320) { // ~8 s, PROVISIONAL
        this.say("text", "...", 120);
        this.idleCounter = 0;
      }
    } else {
      this.idleCounter = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, headX: number, headY: number): void {
    if (this.alpha <= 0.01 || !this.contents) return;
    // Real bubble sprite (683, spawn ref M-REF-032) when available.
    if (spriteAtlas.has("bubble")) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      spriteAtlas.draw(ctx, "bubble", Math.min(460, Math.max(90, headX + 8)), Math.max(120, headY - 60));
      ctx.fillStyle = "#111111";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(this.contents, Math.min(460, Math.max(90, headX + 8)) + 55, Math.max(120, headY - 60) - 70);
      ctx.textAlign = "left";
      ctx.restore();
      return;
    }
    // Bubble geometry approximated from EV-0009 captures (Tuning).
    const width = 160;
    const height = 100;
    const x = Math.min(540 - width, Math.max(15, headX + 8));
    const y = Math.max(32, headY - 145);
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.92;
    ctx.fillStyle = "#f4f6f3";
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 26);
    ctx.fill();
    // Tail toward the head.
    ctx.beginPath();
    ctx.moveTo(x + 28, y + height - 6);
    ctx.lineTo(headX + 6, headY - 12);
    ctx.lineTo(x + 58, y + height - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#111111";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.contents, x + width / 2, y + height / 2 + 8);
    ctx.textAlign = "left";
    ctx.restore();
  }
}
