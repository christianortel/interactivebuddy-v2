// Refined region measurements from a native 550x400 capture.
// Usage: CHROMIUM_PATH=... node tests/measure-capture2.mjs <capture.png>
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
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  const px = (x, y) => {
    const i = (y * img.width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const bg = px(450, 250);

  const box = (x0, x1, y0, y1, test) => {
    let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (test(px(x, y))) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  };

  // Buddy: non-background inside play area, clear of status text and frame.
  const buddy = box(210, 360, 250, 388, (c) => diff(c, bg) > 40);
  // Buddy head horizontal extent at its top rows for center estimate.
  const headRow = buddy.minY + 6;
  let headMin = 9999, headMax = -1;
  for (let x = 210; x <= 360; x++) {
    if (diff(px(x, headRow), bg) > 40) {
      if (x < headMin) headMin = x;
      if (x > headMax) headMax = x;
    }
  }
  // Face icon top-left.
  const face = box(5, 70, 30, 75, (c) => diff(c, bg) > 40);
  // Status text: white-ish pixels bottom-left.
  const status = box(15, 260, 365, 396, (c) => c[0] > 220 && c[1] > 220 && c[2] > 220);
  // Version label top-right: darker text on play area.
  const version = box(500, 545, 30, 50, (c) => diff(c, bg) > 30);
  // Menu labels: dark pixels inside white bar rows 12..26 → x bands.
  const bands = [];
  let inBand = false, bandStart = 0;
  for (let x = 20; x < 400; x++) {
    let dark = false;
    for (let y = 12; y <= 26; y++) {
      const c = px(x, y);
      if (c[0] < 120 && c[1] < 120 && c[2] < 120) { dark = true; break; }
    }
    if (dark && !inBand) { inBand = true; bandStart = x; }
    if (!dark && inBand) {
      inBand = false;
      if (x - bandStart > 4) bands.push({ from: bandStart, to: x - 1 });
      else if (bands.length && bandStart - bands[bands.length - 1].to < 8) bands[bands.length - 1].to = x - 1;
    }
  }
  return {
    background: hex(bg),
    buddy, headRow, headExtent: { headMin, headMax, center: (headMin + headMax) / 2 },
    face, status, version,
    menuLabelBands: bands
  };
}, png);

console.log(JSON.stringify(result, null, 2));
await browser.close();
