// Parse structural tags from an uncompressed SWF: DefineShape bounds,
// DefineSprite contents (PlaceObject2 with matrices, depths, names),
// ExportAssets linkage names, and main-timeline placements.
// Purpose: measure exact part geometry (twips -> px) for parity implementation.
// Usage: node tests/parse-swf-shapes.mjs <swf> [--sprite <id>] [--names]
import { readFileSync } from "node:fs";

const raw = readFileSync(process.argv[2]);
if (raw.toString("latin1", 0, 3) !== "FWS") {
  console.error("Expected uncompressed FWS");
  process.exit(1);
}

class Bits {
  constructor(buffer, pos) {
    this.b = buffer;
    this.bytePos = pos;
    this.bitPos = 0;
  }
  readUB(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.b[this.bytePos];
      v = (v << 1) | ((byte >> (7 - this.bitPos)) & 1);
      this.bitPos++;
      if (this.bitPos === 8) { this.bitPos = 0; this.bytePos++; }
    }
    return v >>> 0;
  }
  readSB(n) {
    let v = this.readUB(n);
    if (n > 0 && v & (1 << (n - 1))) v -= 1 << n;
    return v;
  }
  align() { if (this.bitPos) { this.bitPos = 0; this.bytePos++; } }
}

function readRect(buffer, pos) {
  const bits = new Bits(buffer, pos);
  const n = bits.readUB(5);
  const rect = {
    xMin: bits.readSB(n), xMax: bits.readSB(n),
    yMin: bits.readSB(n), yMax: bits.readSB(n)
  };
  bits.align();
  return { rect, next: bits.bytePos };
}

function readMatrix(buffer, pos) {
  const bits = new Bits(buffer, pos);
  const m = { scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0, translateX: 0, translateY: 0 };
  if (bits.readUB(1)) {
    const n = bits.readUB(5);
    m.scaleX = bits.readSB(n) / 65536;
    m.scaleY = bits.readSB(n) / 65536;
  }
  if (bits.readUB(1)) {
    const n = bits.readUB(5);
    m.rotateSkew0 = bits.readSB(n) / 65536;
    m.rotateSkew1 = bits.readSB(n) / 65536;
  }
  const n = bits.readUB(5);
  m.translateX = bits.readSB(n);
  m.translateY = bits.readSB(n);
  bits.align();
  return { matrix: m, next: bits.bytePos };
}

// Header skip
const nbits = raw[8] >> 3;
let pos = 8 + Math.ceil((5 + nbits * 4) / 8) + 4;

const shapes = new Map();
const sprites = new Map();
const exportsByName = new Map();
const mainTimeline = [];

function parsePlaceObject2(buffer, start, end) {
  const flags = buffer[start];
  let p = start + 1;
  const depth = buffer.readUInt16LE(p); p += 2;
  const entry = { depth };
  if (flags & 0x02) { entry.characterId = buffer.readUInt16LE(p); p += 2; }
  if (flags & 0x04) { const r = readMatrix(buffer, p); entry.matrix = r.matrix; p = r.next; }
  if (flags & 0x08) { // color transform - skip via bits
    const bits = new Bits(buffer, p);
    const hasAdd = bits.readUB(1), hasMult = bits.readUB(1), n = bits.readUB(4);
    let fields = 0;
    if (hasMult) fields += 4;
    if (hasAdd) fields += 4;
    for (let i = 0; i < fields; i++) bits.readSB(n);
    bits.align();
    p = bits.bytePos;
  }
  if (flags & 0x10) { entry.ratio = buffer.readUInt16LE(p); p += 2; }
  if (flags & 0x20) {
    let e = p;
    while (e < end && buffer[e] !== 0) e++;
    entry.name = buffer.toString("latin1", p, e);
    p = e + 1;
  }
  if (flags & 0x40) { entry.clipDepth = buffer.readUInt16LE(p); p += 2; }
  entry.hasClipActions = Boolean(flags & 0x80);
  return entry;
}

function walkTags(buffer, startPos, endPos, sink) {
  let p = startPos;
  while (p + 2 <= endPos) {
    const codeAndLength = buffer.readUInt16LE(p);
    const code = codeAndLength >> 6;
    let length = codeAndLength & 0x3f;
    let header = 2;
    if (length === 0x3f) { length = buffer.readUInt32LE(p + 2); header = 6; }
    const bodyStart = p + header;
    sink(code, bodyStart, bodyStart + length);
    if (code === 0) break;
    p = bodyStart + length;
  }
}

walkTags(raw, pos, raw.length, (code, start, end) => {
  if (code === 2 || code === 22 || code === 32 || code === 83) {
    const id = raw.readUInt16LE(start);
    const { rect } = readRect(raw, start + 2);
    shapes.set(id, {
      id,
      kind: `DefineShape${code === 2 ? "" : code === 22 ? "2" : code === 32 ? "3" : "4"}`,
      boundsPx: {
        xMin: rect.xMin / 20, xMax: rect.xMax / 20,
        yMin: rect.yMin / 20, yMax: rect.yMax / 20,
        width: (rect.xMax - rect.xMin) / 20,
        height: (rect.yMax - rect.yMin) / 20
      }
    });
  } else if (code === 39) {
    const id = raw.readUInt16LE(start);
    const frameCount = raw.readUInt16LE(start + 2);
    const placements = [];
    walkTags(raw, start + 4, end, (innerCode, innerStart, innerEnd) => {
      if (innerCode === 26) {
        placements.push(parsePlaceObject2(raw, innerStart, innerEnd));
      }
    });
    sprites.set(id, { id, frameCount, placements });
  } else if (code === 56) {
    const count = raw.readUInt16LE(start);
    let p2 = start + 2;
    for (let i = 0; i < count; i++) {
      const tagId = raw.readUInt16LE(p2); p2 += 2;
      let e = p2;
      while (e < end && raw[e] !== 0) e++;
      exportsByName.set(raw.toString("latin1", p2, e), tagId);
      p2 = e + 1;
    }
  } else if (code === 26) {
    mainTimeline.push(parsePlaceObject2(raw, start, end));
  }
});

const spriteArg = process.argv.indexOf("--sprite");
if (spriteArg !== -1) {
  const id = Number(process.argv[spriteArg + 1]);
  const sprite = sprites.get(id);
  if (!sprite) { console.error("no sprite", id); process.exit(1); }
  for (const place of sprite.placements) {
    const target = sprites.get(place.characterId) || shapes.get(place.characterId);
    console.log(JSON.stringify({
      depth: place.depth,
      characterId: place.characterId,
      kind: target ? (target.kind || "sprite") : "?",
      name: place.name,
      translatePx: place.matrix
        ? { x: place.matrix.translateX / 20, y: place.matrix.translateY / 20 }
        : null,
      scale: place.matrix ? { x: place.matrix.scaleX, y: place.matrix.scaleY } : null,
      boundsPx: target && target.boundsPx ? target.boundsPx : undefined,
      frames: target && target.frameCount ? target.frameCount : undefined
    }));
  }
} else if (process.argv.includes("--names")) {
  console.log(JSON.stringify({
    exports: Object.fromEntries(exportsByName),
    namedMainTimeline: mainTimeline.filter((entry) => entry.name),
    spriteCount: sprites.size,
    shapeCount: shapes.size
  }, null, 2));
} else {
  console.log(JSON.stringify({
    spriteCount: sprites.size,
    shapeCount: shapes.size,
    exportCount: exportsByName.size,
    namedPlacements: mainTimeline.filter((entry) => entry.name).map((entry) => ({
      name: entry.name, characterId: entry.characterId, depth: entry.depth
    }))
  }, null, 2));
}
