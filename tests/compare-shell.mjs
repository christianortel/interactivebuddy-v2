// Capture the built parity shell at native 550x400 and pixel-diff it against a
// reference capture. Outputs remake capture + diff image + mismatch stats.
// Usage: CHROMIUM_PATH=... node tests/compare-shell.mjs <reference.png> <outdir>
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const referencePath = process.argv[2] || "reference/screens/idle-settled.png";
const outDir = process.argv[3] || "tests/artifacts/parity";
const PORT = 8643;

mkdirSync(outDir, { recursive: true });
const server = spawn(process.execPath, ["tests/serve-root.mjs", String(PORT)], { stdio: "ignore" });

try {
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const page = await browser.newPage({ viewport: { width: 550, height: 400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/dist/index.html`);
  await page.waitForFunction(() => Boolean(window.__ibParity), null, { timeout: 15000 });
  await page.waitForTimeout(500);
  const remakePath = join(outDir, "remake-shell.png");
  await page.screenshot({ path: remakePath });

  const refB64 = readFileSync(referencePath).toString("base64");
  const rmkB64 = readFileSync(remakePath).toString("base64");
  const result = await page.evaluate(async ([a, b]) => {
    const load = async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      return { ctx, w: img.width, h: img.height, canvas };
    };
    const ref = await load(a);
    const rmk = await load(b);
    const w = Math.min(ref.w, rmk.w);
    const h = Math.min(ref.h, rmk.h);
    const refData = ref.ctx.getImageData(0, 0, w, h).data;
    const rmkData = rmk.ctx.getImageData(0, 0, w, h).data;
    const diffCanvas = document.createElement("canvas");
    diffCanvas.width = w;
    diffCanvas.height = h;
    const diffCtx = diffCanvas.getContext("2d");
    const out = diffCtx.createImageData(w, h);
    let mismatched = 0;
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      const delta =
        Math.abs(refData[o] - rmkData[o]) +
        Math.abs(refData[o + 1] - rmkData[o + 1]) +
        Math.abs(refData[o + 2] - rmkData[o + 2]);
      if (delta > 30) {
        mismatched += 1;
        out.data[o] = 255;
        out.data[o + 1] = 0;
        out.data[o + 2] = 0;
        out.data[o + 3] = 255;
      } else {
        const gray = Math.round((refData[o] + refData[o + 1] + refData[o + 2]) / 3 / 3) + 150;
        out.data[o] = gray;
        out.data[o + 1] = gray;
        out.data[o + 2] = gray;
        out.data[o + 3] = 255;
      }
    }
    diffCtx.putImageData(out, 0, 0);
    return {
      width: w,
      height: h,
      mismatched,
      total: w * h,
      pct: ((mismatched / (w * h)) * 100).toFixed(2),
      diffPng: diffCanvas.toDataURL("image/png").split(",")[1]
    };
  }, [refB64, rmkB64]);

  writeFileSync(join(outDir, "diff.png"), Buffer.from(result.diffPng, "base64"));
  console.log(JSON.stringify({
    reference: referencePath,
    remake: remakePath,
    mismatchedPixels: result.mismatched,
    totalPixels: result.total,
    mismatchPercent: result.pct,
    pageErrors: errors
  }, null, 2));
  await browser.close();
} finally {
  server.kill();
}
