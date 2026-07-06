// Rasterize sprites from the reference SWF into the user's private asset lane.
// For each target character id (+ optional frame), generates a minimal SWF
// (definition tags + PlaceObject2 + stop/goto actions), renders it in Ruffle
// on black and white backgrounds, derives alpha, trims, and writes PNG +
// manifest entries to assets/private/sprites/ (gitignored).
// Usage: CHROMIUM_PATH=... node tests/rasterize-swf-sprites.mjs
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SWF = "reference/private/interactive-buddy-v1.02.swf";
const OUT = "assets/private/sprites";
const GEN_DIR = "reference/private/gen-swf";
const STAGE_PX = 300; // generated stage is 300x300 px, sprite at center
const CAPTURE_SCALE = 2;

// Targets: name -> { id, frame (1-based) }
const TARGETS = {
  baseball: { id: 248 }, bowlball: { id: 252 }, bouncyball: { id: 333 },
  baby: { id: 458 }, fireball: { id: 331 }, grenade: { id: 299 },
  mine: { id: 305 }, molotov: { id: 345 }, missile: { id: 343 },
  orb: { id: 483 }, radio: { id: 479 }, vortex: { id: 491 },
  fister: { id: 493 }, wreckingBall: { id: 629 }, stunGun: { id: 623 },
  chain: { id: 446 }, moneySign: { id: 246 }, questionMark: { id: 301 },
  exclamation: { id: 250 }, star: { id: 293 }, smile: { id: 295 },
  bored: { id: 355 }, beCareful: { id: 349 }, flame: { id: 314 },
  gore: { id: 474 }, debris: { id: 341 },
  "weapon-idle": { id: 634, frame: 1 }, "weapon-fire": { id: 634, frame: 2 },
  // Face clips (EV-0029): eye 79 open:1/closed:15, mouth 85 normal:1/talking:8.
  "eye-open": { id: 79, frame: 1 }, "eye-closed": { id: 79, frame: 15 },
  "mouth-normal": { id: 85, frame: 1 }, "mouth-talking": { id: 85, frame: 8 },
  faceClip: { id: 673, frame: 1 },
  "bubble-upLeft": { id: 683, frame: 1 }, "bubble-upRight": { id: 683, frame: 10 },
  "bubble-downLeft": { id: 683, frame: 20 }, "bubble-downRight": { id: 683, frame: 30 }
};

// Buddy part skin frames (frame labels extracted from DefineSprite timelines,
// EV-0028): part sprite id + label->frame table. Every skin including the
// hidden insider/raspberry/wade variants.
const PART_LABELS = {
  head: { id: 100, labels: { default: 1, defaultng: 10, teletubby: 20, insider: 29, pirate: 38, goth: 47, strawberry: 55, raspberry: 64, rep: 73, dem: 81, baby: 87, gates: 95, tom: 101, wade: 106, nap: 112 } },
  body: { id: 411, labels: { default: 1, defaultng: 9, teletubby: 21, insider: 31, pirate: 41, goth: 50, strawberry: 58, raspberry: 67, rep: 76, dem: 82, baby: 88, gates: 94, tom: 100, nap: 105 } },
  rLeg: { id: 420, labels: { default: 1, defaultng: 8, teletubby: 18, insider: 27, pirate: 34, goth: 41, strawberry: 49, raspberry: 58, rep: 67, dem: 73, baby: 79, gates: 84, tom: 89, nap: 95 } },
  lLeg: { id: 427, labels: { default: 1, defaultng: 8, teletubby: 17, insider: 26, pirate: 34, goth: 41, strawberry: 49, raspberry: 58, rep: 67, dem: 73, baby: 78, gates: 83, tom: 89, nap: 94 } },
  rArm: { id: 435, labels: { default: 1, defaultng: 8, teletubby: 17, tom: 25, pirate: 33, goth: 40, strawberry: 47, raspberry: 56, rep: 65, dem: 70, baby: 76, gates: 81, nap: 88 } },
  lArm: { id: 438, labels: { default: 1, defaultng: 8, teletubby: 17, tom: 28, pirate: 36, goth: 44, strawberry: 51, raspberry: 61, rep: 69, dem: 75, baby: 80, gates: 85, nap: 90 } }
};
for (const [part, spec] of Object.entries(PART_LABELS)) {
  for (const [label, frame] of Object.entries(spec.labels)) {
    TARGETS[`${part}-${label}`] = { id: spec.id, frame };
  }
}

// Optional target filter: RASTER_ONLY="name1,name2" extracts a subset and
// merges into the existing manifest instead of replacing it.
const only = process.env.RASTER_ONLY?.split(",").map((name) => name.trim());
if (only?.length) {
  for (const key of Object.keys(TARGETS)) {
    if (!only.includes(key)) delete TARGETS[key];
  }
}

// ---- SWF tag surgery -------------------------------------------------------
const raw = readFileSync(SWF);
const nbits0 = raw[8] >> 3;
let pos = 8 + Math.ceil((5 + nbits0 * 4) / 8) + 4;
const CONTROL_TAGS = new Set([0, 1, 4, 5, 9, 12, 24, 26, 28, 43, 56, 59, 69, 77, 86]);
const definitionChunks = [];
while (pos + 2 <= raw.length) {
  const codeAndLength = raw.readUInt16LE(pos);
  const code = codeAndLength >> 6;
  let length = codeAndLength & 0x3f;
  let header = 2;
  if (length === 0x3f) { length = raw.readUInt32LE(pos + 2); header = 6; }
  if (!CONTROL_TAGS.has(code)) {
    definitionChunks.push(raw.subarray(pos, pos + header + length));
  }
  if (code === 0) break;
  pos += header + length;
}
const definitions = Buffer.concat(definitionChunks);

function tag(code, body) {
  if (body.length >= 0x3f) {
    const head = Buffer.alloc(6);
    head.writeUInt16LE((code << 6) | 0x3f, 0);
    head.writeUInt32LE(body.length, 2);
    return Buffer.concat([head, body]);
  }
  const head = Buffer.alloc(2);
  head.writeUInt16LE((code << 6) | body.length, 0);
  return Buffer.concat([head, body]);
}

function placeObject2(charId, depth, txTwips, tyTwips, name) {
  const bits = [];
  const pushBits = (value, count) => {
    for (let i = count - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  pushBits(0, 1); // no scale
  pushBits(0, 1); // no rotate
  const tbits = 17;
  pushBits(tbits, 5);
  pushBits(txTwips & ((1 << tbits) - 1), tbits);
  pushBits(tyTwips & ((1 << tbits) - 1), tbits);
  while (bits.length % 8 !== 0) bits.push(0);
  const matrix = Buffer.alloc(bits.length / 8);
  bits.forEach((bit, index) => {
    if (bit) matrix[index >> 3] |= 0x80 >> (index & 7);
  });
  const nameBuffer = Buffer.from(`${name}\0`, "latin1");
  const body = Buffer.alloc(1 + 2 + 2 + matrix.length + nameBuffer.length);
  let p = 0;
  body[p++] = 0x02 | 0x04 | 0x20; // hasCharacter | hasMatrix | hasName
  body.writeUInt16LE(depth, p); p += 2;
  body.writeUInt16LE(charId, p); p += 2;
  matrix.copy(body, p); p += matrix.length;
  nameBuffer.copy(body, p);
  return tag(26, body);
}

function doActionStopAt(name, frame) {
  const parts = [];
  const target = Buffer.from(`${name}\0`, "latin1");
  const setTarget = Buffer.alloc(3 + target.length);
  setTarget[0] = 0x8b;
  setTarget.writeUInt16LE(target.length, 1);
  target.copy(setTarget, 3);
  parts.push(setTarget);
  if (frame > 1) {
    const goto = Buffer.alloc(5);
    goto[0] = 0x81;
    goto.writeUInt16LE(2, 1);
    goto.writeUInt16LE(frame - 1, 3);
    parts.push(goto);
  }
  parts.push(Buffer.from([0x07])); // Stop
  const clearTarget = Buffer.alloc(4);
  clearTarget[0] = 0x8b;
  clearTarget.writeUInt16LE(1, 1);
  parts.push(clearTarget);
  parts.push(Buffer.from([0x07, 0x00])); // stop main timeline + end
  return tag(12, Buffer.concat(parts));
}

function buildSwf(charId, frame, bgColor) {
  const stageTwips = STAGE_PX * 20;
  const rectBits = [];
  const pushBits = (value, count) => {
    for (let i = count - 1; i >= 0; i--) rectBits.push((value >> i) & 1);
  };
  pushBits(17, 5);
  pushBits(0, 17); pushBits(stageTwips, 17); pushBits(0, 17); pushBits(stageTwips, 17);
  while (rectBits.length % 8 !== 0) rectBits.push(0);
  const rect = Buffer.alloc(rectBits.length / 8);
  rectBits.forEach((bit, index) => {
    if (bit) rect[index >> 3] |= 0x80 >> (index & 7);
  });
  const header2 = Buffer.alloc(4);
  // 1 fps: nested clips (eye/mouth sub-sprites) stay on frame 1 at capture
  // time, so faces are captured in their rest state.
  header2.writeUInt16LE(1 << 8, 0);
  header2.writeUInt16LE(1, 2); // 1 frame
  const bg = tag(9, Buffer.from(bgColor));
  const place = placeObject2(charId, 1, (STAGE_PX / 2) * 20, (STAGE_PX / 2) * 20, "s");
  const actions = doActionStopAt("s", frame);
  const body = Buffer.concat([rect, header2, bg, definitions, place, actions, tag(1, Buffer.alloc(0)), tag(0, Buffer.alloc(0))]);
  const head = Buffer.alloc(8);
  head.write("FWS", 0, "latin1");
  head[3] = 8;
  head.writeUInt32LE(8 + body.length, 4);
  return Buffer.concat([head, body]);
}

// ---- Render + alpha-derive -------------------------------------------------
mkdirSync(OUT, { recursive: true });
mkdirSync(GEN_DIR, { recursive: true });
writeFileSync(join(GEN_DIR, "raster-harness.html"), `<!DOCTYPE html><html><head><style>html,body{margin:0;background:#808080}#p ruffle-player{width:${STAGE_PX * CAPTURE_SCALE}px;height:${STAGE_PX * CAPTURE_SCALE}px;display:block}</style></head><body><div id="p"></div>
<script src="/node_modules/@ruffle-rs/ruffle/ruffle.js"></script>
<script>window.RufflePlayer=window.RufflePlayer||{};window.RufflePlayer.config={autoplay:"on",unmuteOverlay:"hidden",letterbox:"off",scale:"exactFit",contextMenu:"off",splashScreen:false,logLevel:"error"};
window.addEventListener("DOMContentLoaded",()=>{const r=window.RufflePlayer.newest();const pl=r.createPlayer();pl.style.width="${STAGE_PX * CAPTURE_SCALE}px";pl.style.height="${STAGE_PX * CAPTURE_SCALE}px";document.getElementById("p").appendChild(pl);
const swf=new URLSearchParams(location.search).get("swf");pl.ruffle().load("/reference/private/gen-swf/"+swf).then(()=>{window.__ok=true}).catch(e=>{window.__err=String(e)});});</script></body></html>`);

const PORT = 8649;
const server = spawn(process.execPath, ["tests/serve-root.mjs", String(PORT)], { stdio: "ignore" });
const manifest = {};

try {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const page = await browser.newPage({
    viewport: { width: STAGE_PX * CAPTURE_SCALE, height: STAGE_PX * CAPTURE_SCALE }
  });

  for (const [name, target] of Object.entries(TARGETS)) {
    const captures = {};
    for (const [bgName, bgColor] of [["b", [0, 0, 0]], ["w", [255, 255, 255]]]) {
      const swfName = `${name}-${bgName}.swf`;
      writeFileSync(join(GEN_DIR, swfName), buildSwf(target.id, target.frame ?? 1, bgColor));
      await page.goto(`http://127.0.0.1:${PORT}/reference/private/gen-swf/raster-harness.html?swf=${swfName}`);
      try {
        await page.waitForFunction(() => window.__ok || window.__err, null, { timeout: 15000 });
      } catch {
        console.error(`${name}: load timeout`);
      }
      // 1 fps SWFs paint on the first frame tick (~1s); wait past it.
      await page.waitForTimeout(1500);
      captures[bgName] = await page.screenshot();
    }
    // Alpha-derive in the browser (canvas decode of both PNGs).
    const result = await page.evaluate(
      async ([blackB64, whiteB64]) => {
        const load = async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          context.drawImage(img, 0, 0);
          return context.getImageData(0, 0, img.width, img.height);
        };
        const black = await load(blackB64);
        const white = await load(whiteB64);
        const w = black.width;
        const h = black.height;
        const out = new ImageData(w, h);
        let minX = w, maxX = -1, minY = h, maxY = -1;
        for (let i = 0; i < w * h; i++) {
          const o = i * 4;
          const alphaR = 255 - (white.data[o] - black.data[o]);
          const alphaG = 255 - (white.data[o + 1] - black.data[o + 1]);
          const alphaB = 255 - (white.data[o + 2] - black.data[o + 2]);
          const alpha = Math.max(0, Math.min(255, Math.round((alphaR + alphaG + alphaB) / 3)));
          if (alpha > 4) {
            const x = i % w, y = (i / w) | 0;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            const scale = alpha > 0 ? 255 / alpha : 0;
            out.data[o] = Math.min(255, black.data[o] * scale);
            out.data[o + 1] = Math.min(255, black.data[o + 1] * scale);
            out.data[o + 2] = Math.min(255, black.data[o + 2] * scale);
            out.data[o + 3] = alpha;
          }
        }
        if (maxX < minX) return null;
        const trimW = maxX - minX + 1;
        const trimH = maxY - minY + 1;
        const canvas = document.createElement("canvas");
        canvas.width = trimW;
        canvas.height = trimH;
        const context = canvas.getContext("2d");
        const full = document.createElement("canvas");
        full.width = w;
        full.height = h;
        full.getContext("2d").putImageData(out, 0, 0);
        context.drawImage(full, -minX, -minY);
        return { png: canvas.toDataURL("image/png").split(",")[1], minX, minY, trimW, trimH };
      },
      [captures.b.toString("base64"), captures.w.toString("base64")]
    );
    if (!result) {
      console.error(`${name}: empty render`);
      continue;
    }
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(result.png, "base64"));
    manifest[name] = {
      file: `${name}.png`,
      // Sprite origin (registration point) position within the trimmed image,
      // in capture pixels; capture scale below.
      originX: (STAGE_PX / 2) * CAPTURE_SCALE - result.minX,
      originY: (STAGE_PX / 2) * CAPTURE_SCALE - result.minY,
      width: result.trimW,
      height: result.trimH,
      scale: CAPTURE_SCALE
    };
    console.log(`${name}: ${result.trimW}x${result.trimH}`);
  }
  await browser.close();
} finally {
  server.kill();
}
let finalManifest = manifest;
if (only?.length) {
  try {
    finalManifest = { ...JSON.parse(readFileSync(join(OUT, "manifest.json"), "utf8")), ...manifest };
  } catch {
    // no existing manifest to merge
  }
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(finalManifest, null, 2));
console.log(`wrote ${Object.keys(manifest).length} sprites (manifest total ${Object.keys(finalManifest).length}) to ${OUT}`);
