// Measure colors and geometry from a native 550x400 reference capture PNG.
// Loads the PNG in Chromium, draws to a canvas, and reports pixel scans.
// Usage: CHROMIUM_PATH=... node tests/measure-capture.mjs <capture.png>
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const file = process.argv[2];
const png = readFileSync(file).toString("base64");

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined
});
const page = await browser.newPage();
const result = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = `data:image/png;base64,${b64}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const px = (x, y) => {
    const d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

  // Vertical scan at x=450 (clear of buddy and face icon): find horizontal band transitions.
  const bands = [];
  let prev = px(450, 0);
  let bandStart = 0;
  for (let y = 1; y < img.height; y++) {
    const c = px(450, y);
    if (diff(c, prev) > 24) {
      bands.push({ from: bandStart, to: y - 1, color: hex(prev) });
      bandStart = y;
    }
    prev = c;
  }
  bands.push({ from: bandStart, to: img.height - 1, color: hex(prev) });

  // Horizontal scan at y=200: frame/play-area transitions.
  const cols = [];
  prev = px(0, 200);
  let colStart = 0;
  for (let x = 1; x < img.width; x++) {
    const c = px(x, 200);
    if (diff(c, prev) > 24) {
      cols.push({ from: colStart, to: x - 1, color: hex(prev) });
      colStart = x;
    }
    prev = c;
  }
  cols.push({ from: colStart, to: img.width - 1, color: hex(prev) });

  // Buddy bounding box: scan region y 240..img.height, x 200..380 for pixels far from background.
  const bg = px(450, 250);
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let y = 200; y < img.height - 2; y++) {
    for (let x = 180; x < 400; x++) {
      if (diff(px(x, y), bg) > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    size: { w: img.width, h: img.height },
    samples: {
      menuBar: hex(px(275, 8)),
      playArea: hex(px(450, 250)),
      frameTop: hex(px(275, 30)),
      frameLeft: hex(px(3, 200)),
      statusTextArea: hex(px(60, 381))
    },
    horizontalBandsAtX450: bands,
    verticalBandsAtY200: cols,
    buddyBox: { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 }
  };
}, png);

console.log(JSON.stringify(result, null, 2));
await browser.close();
