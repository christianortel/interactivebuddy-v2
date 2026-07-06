// Capture native-resolution reference evidence from the harness (Ruffle + SWF).
// Starts the static server, loads the harness, waits for SWF load, then takes
// timed screenshots (and optional click-then-capture steps) into reference/screens/.
// Usage: node tests/capture-reference.mjs [--steps steps.json]
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const PORT = 8642;
const OUT_DIR = "reference/screens";
const STAGE = { x: 0, y: 0, width: 550, height: 400 };

const stepsArg = process.argv.indexOf("--steps");
const steps = stepsArg !== -1
  ? JSON.parse(readFileSync(process.argv[stepsArg + 1], "utf8"))
  : [
      { wait: 1000, shot: "boot-t1s" },
      { wait: 2000, shot: "boot-t3s" },
      { wait: 5000, shot: "boot-t8s" }
    ];

mkdirSync(OUT_DIR, { recursive: true });

const server = spawn(process.execPath, ["tests/serve-root.mjs", String(PORT)], {
  stdio: "ignore"
});

try {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const page = await browser.newPage({ viewport: { width: 550, height: 400 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  if (process.env.CAPTURE_CONSOLE) {
    page.on("console", (message) => {
      console.log(`[console:${message.type()}]`, message.text().slice(0, 300));
    });
  }
  await page.goto(`http://127.0.0.1:${PORT}/reference/harness/index.html`);
  await page.waitForFunction(
    () => window.__swfLoaded === true || window.__swfLoadError,
    null,
    { timeout: 30000 }
  );
  const loadError = await page.evaluate(() => window.__swfLoadError || null);
  if (loadError) {
    console.error("SWF load error:", loadError);
    process.exitCode = 1;
  } else {
    for (const step of steps) {
      if (step.wait) await page.waitForTimeout(step.wait);
      if (step.click) {
        await page.mouse.click(step.click[0], step.click[1]);
      }
      if (step.move) {
        await page.mouse.move(step.move[0], step.move[1]);
      }
      if (step.down) {
        await page.mouse.move(step.down[0], step.down[1]);
        await page.mouse.down();
      }
      if (step.up) {
        await page.mouse.up();
      }
      if (step.shot) {
        const path = `${OUT_DIR}/${step.shot}.png`;
        await page.screenshot({ path, clip: STAGE });
        console.log("captured", path);
      }
    }
    // Sample stage pixels for color measurement from the last frame.
    const samples = await page.evaluate(() => {
      const player = document.querySelector("ruffle-player");
      const canvas = player && player.shadowRoot
        ? player.shadowRoot.querySelector("canvas")
        : null;
      if (!canvas) return null;
      const probe = document.createElement("canvas");
      probe.width = canvas.width;
      probe.height = canvas.height;
      const ctx = probe.getContext("2d");
      ctx.drawImage(canvas, 0, 0);
      const scaleX = canvas.width / 550;
      const scaleY = canvas.height / 400;
      const at = (x, y) => {
        const d = ctx.getImageData(Math.round(x * scaleX), Math.round(y * scaleY), 1, 1).data;
        return [d[0], d[1], d[2]];
      };
      return {
        canvasSize: { w: canvas.width, h: canvas.height },
        menuBar: at(275, 17),
        playAreaCenter: at(275, 200),
        frameTopLeft: at(4, 40),
        nearFloor: at(275, 380),
        bottomLeftText: at(60, 385)
      };
    });
    console.log("pixel samples:", JSON.stringify(samples));
  }
  if (errors.length) console.error("page errors:", errors);
  await browser.close();
} finally {
  server.kill();
}
