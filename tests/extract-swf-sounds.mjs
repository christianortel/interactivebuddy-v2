// Extract DefineSound tags from an uncompressed SWF into local audio files
// (user's private lane; gitignored). MP3 streams export as .mp3; uncompressed
// PCM exports as .wav; ADPCM is noted but not decoded.
// Usage: node tests/extract-swf-sounds.mjs <swf> <outdir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const raw = readFileSync(process.argv[2]);
const outDir = process.argv[3] || "reference/private/sounds";
mkdirSync(outDir, { recursive: true });

if (raw.toString("latin1", 0, 3) !== "FWS") {
  console.error("Expected uncompressed FWS");
  process.exit(1);
}

const nbits = raw[8] >> 3;
let pos = 8 + Math.ceil((5 + nbits * 4) / 8) + 4;

const sounds = new Map();
const exportsById = new Map();

while (pos + 2 <= raw.length) {
  const codeAndLength = raw.readUInt16LE(pos);
  const code = codeAndLength >> 6;
  let length = codeAndLength & 0x3f;
  let header = 2;
  if (length === 0x3f) {
    length = raw.readUInt32LE(pos + 2);
    header = 6;
  }
  const start = pos + header;
  if (code === 14) {
    // DefineSound: id(2), flags(1): format(4) rate(2) size(1) stereo(1), sampleCount(4), data
    const id = raw.readUInt16LE(start);
    const flags = raw[start + 2];
    const format = flags >> 4;
    const rateCode = (flags >> 2) & 3;
    const is16Bit = Boolean((flags >> 1) & 1);
    const stereo = Boolean(flags & 1);
    const sampleCount = raw.readUInt32LE(start + 3);
    sounds.set(id, {
      id,
      format,
      rate: [5512, 11025, 22050, 44100][rateCode],
      is16Bit,
      stereo,
      sampleCount,
      dataStart: start + 7,
      dataEnd: start + length
    });
  } else if (code === 56) {
    const count = raw.readUInt16LE(start);
    let p = start + 2;
    for (let i = 0; i < count; i++) {
      const tagId = raw.readUInt16LE(p);
      p += 2;
      let e = p;
      while (e < start + length && raw[e] !== 0) e++;
      exportsById.set(tagId, raw.toString("latin1", p, e));
      p = e + 1;
    }
  }
  if (code === 0) break;
  pos = start + length;
}

const FORMATS = { 0: "pcm-be", 1: "adpcm", 2: "mp3", 3: "pcm-le", 6: "nellymoser" };

// SWF ADPCM decoder (SWF spec sound format 1): IMA-style with 2-5 bit codes,
// 4096-sample blocks, per-block initial sample + 6-bit step index.
const STEP_TABLE = [
  7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45,
  50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230,
  253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963,
  1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327,
  3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442,
  11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794,
  32767
];
const INDEX_TABLES = {
  2: [-1, 2],
  3: [-1, -1, 2, 4],
  4: [-1, -1, -1, -1, 2, 4, 6, 8],
  5: [-1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 4, 6, 8, 10, 13, 16]
};

function decodeAdpcm(data, sampleCount, stereo) {
  let bitPos = 0;
  const readBits = (n) => {
    let value = 0;
    for (let i = 0; i < n; i++) {
      const byte = data[bitPos >> 3];
      if (byte === undefined) return value << (n - i);
      value = (value << 1) | ((byte >> (7 - (bitPos & 7))) & 1);
      bitPos += 1;
    }
    return value;
  };
  const codeSize = readBits(2) + 2;
  const indexTable = INDEX_TABLES[codeSize];
  const channels = stereo ? 2 : 1;
  const out = new Int16Array(sampleCount * channels);
  const sample = new Array(channels).fill(0);
  const index = new Array(channels).fill(0);
  let written = 0;
  let inBlock = 0;
  while (written < sampleCount && bitPos < data.length * 8) {
    if (inBlock === 0) {
      for (let c = 0; c < channels; c++) {
        let s = readBits(16);
        if (s & 0x8000) s -= 0x10000;
        sample[c] = s;
        index[c] = readBits(6);
        if (index[c] > 88) index[c] = 88;
        out[written * channels + c] = sample[c];
      }
      written += 1;
      inBlock = 1;
      continue;
    }
    for (let c = 0; c < channels; c++) {
      const code = readBits(codeSize);
      const magnitudeBits = codeSize - 1;
      const sign = (code >> magnitudeBits) & 1;
      const magnitude = code & ((1 << magnitudeBits) - 1);
      const step = STEP_TABLE[index[c]];
      let delta = step >> magnitudeBits;
      for (let bit = 0; bit < magnitudeBits; bit++) {
        if ((magnitude >> (magnitudeBits - 1 - bit)) & 1) {
          delta += step >> bit;
        }
      }
      sample[c] += sign ? -delta : delta;
      if (sample[c] > 32767) sample[c] = 32767;
      if (sample[c] < -32768) sample[c] = -32768;
      index[c] += indexTable[magnitude];
      if (index[c] < 0) index[c] = 0;
      if (index[c] > 88) index[c] = 88;
      out[written * channels + c] = sample[c];
    }
    written += 1;
    inBlock = (inBlock + 1) % 4096;
  }
  return out;
}

function writeWav(path, samples, rate, channels) {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.length * 2);
  const wav = Buffer.alloc(44 + data.length);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + data.length, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE((rate * channels * 16) / 8, 28);
  wav.writeUInt16LE((channels * 16) / 8, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(data.length, 40);
  data.copy(wav, 44);
  writeFileSync(path, wav);
}
const index = [];
for (const sound of sounds.values()) {
  const name = exportsById.get(sound.id) || `sound-${sound.id}`;
  const format = FORMATS[sound.format] || `fmt${sound.format}`;
  let file = null;
  if (sound.format === 2) {
    // MP3: skip SeekSamples (2 bytes), rest is an MP3 stream.
    file = `${name}.mp3`;
    writeFileSync(join(outDir, file), raw.subarray(sound.dataStart + 2, sound.dataEnd));
  } else if (sound.format === 1) {
    const samples = decodeAdpcm(
      raw.subarray(sound.dataStart, sound.dataEnd),
      sound.sampleCount,
      sound.stereo
    );
    file = `${name}.wav`;
    writeWav(join(outDir, file), samples, sound.rate, sound.stereo ? 2 : 1);
  } else if (sound.format === 3 || sound.format === 0) {
    // PCM: wrap in a minimal WAV header.
    const data = raw.subarray(sound.dataStart, sound.dataEnd);
    const channels = sound.stereo ? 2 : 1;
    const bits = sound.is16Bit ? 16 : 8;
    const byteRate = (sound.rate * channels * bits) / 8;
    const wav = Buffer.alloc(44 + data.length);
    wav.write("RIFF", 0);
    wav.writeUInt32LE(36 + data.length, 4);
    wav.write("WAVEfmt ", 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(channels, 22);
    wav.writeUInt32LE(sound.rate, 24);
    wav.writeUInt32LE(byteRate, 28);
    wav.writeUInt16LE((channels * bits) / 8, 32);
    wav.writeUInt16LE(bits, 34);
    wav.write("data", 36);
    wav.writeUInt32LE(data.length, 40);
    data.copy(wav, 44);
    file = `${name}.wav`;
    writeFileSync(join(outDir, file), wav);
  }
  index.push({
    id: sound.id,
    name,
    format,
    rate: sound.rate,
    stereo: sound.stereo,
    sampleCount: sound.sampleCount,
    bytes: sound.dataEnd - sound.dataStart,
    file
  });
}

writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2));
console.log(JSON.stringify({ extracted: index.length, outDir, named: index.filter((s) => !s.name.startsWith("sound-")).length }));
console.log(index.map((s) => `${s.name} (${s.format}, ${s.rate}Hz, ${s.file ?? "NOT DECODED"})`).join("\n"));
