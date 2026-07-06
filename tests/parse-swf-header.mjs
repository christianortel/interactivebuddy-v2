// Parse a SWF header: signature, version, length, stage RECT (twips), frame rate, frame count.
// Usage: node tests/parse-swf-header.mjs <path-to-swf>
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node tests/parse-swf-header.mjs <path-to-swf>");
  process.exit(1);
}

const raw = readFileSync(path);
const signature = raw.toString("latin1", 0, 3);
const version = raw[3];
const uncompressedLength = raw.readUInt32LE(4);

let body;
if (signature === "FWS") {
  body = raw.subarray(8);
} else if (signature === "CWS") {
  body = inflateSync(raw.subarray(8));
} else {
  console.error(`Unsupported signature: ${signature}`);
  process.exit(1);
}

class BitReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.bytePos = 0;
    this.bitPos = 0;
  }
  readBits(count) {
    let value = 0;
    for (let i = 0; i < count; i++) {
      const byte = this.buffer[this.bytePos];
      const bit = (byte >> (7 - this.bitPos)) & 1;
      value = (value << 1) | bit;
      this.bitPos++;
      if (this.bitPos === 8) {
        this.bitPos = 0;
        this.bytePos++;
      }
    }
    return value;
  }
  align() {
    if (this.bitPos !== 0) {
      this.bitPos = 0;
      this.bytePos++;
    }
  }
}

const reader = new BitReader(body);
const nbits = reader.readBits(5);
const xMin = reader.readBits(nbits);
const xMax = reader.readBits(nbits);
const yMin = reader.readBits(nbits);
const yMax = reader.readBits(nbits);
reader.align();

const frameRate = body[reader.bytePos + 1] + body[reader.bytePos] / 256;
const frameCount = body.readUInt16LE(reader.bytePos + 2);

console.log(JSON.stringify({
  signature,
  swfVersion: version,
  fileBytes: raw.length,
  uncompressedLength,
  stageTwips: { xMin, xMax, yMin, yMax },
  stagePixels: {
    width: (xMax - xMin) / 20,
    height: (yMax - yMin) / 20
  },
  frameRate,
  frameCount
}, null, 2));
