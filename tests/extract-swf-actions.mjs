// Walk SWF tags, decode AVM1 action blocks (DoAction/DoInitAction), and print
// decoded Push values plus function-call markers in stream order.
// Purpose: recover data tables (e.g. item name/price sequences) from an
// uncompressed SWF for measurement documentation.
// Usage: node tests/extract-swf-actions.mjs <path-to-swf> [grepTerm]
import { readFileSync } from "node:fs";

const path = process.argv[2];
const grepTerm = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : null;
const raw = readFileSync(path);

if (raw.toString("latin1", 0, 3) !== "FWS") {
  console.error("This script expects an uncompressed FWS file.");
  process.exit(1);
}

// Skip header: signature(3) version(1) length(4) + RECT + rate(2) + count(2)
const nbits = raw[8] >> 3;
const rectBits = 5 + nbits * 4;
const rectBytes = Math.ceil(rectBits / 8);
let pos = 8 + rectBytes + 4;

const actionBlocks = [];
while (pos + 2 <= raw.length) {
  const tagCodeAndLength = raw.readUInt16LE(pos);
  const tagCode = tagCodeAndLength >> 6;
  let tagLength = tagCodeAndLength & 0x3f;
  let headerSize = 2;
  if (tagLength === 0x3f) {
    tagLength = raw.readUInt32LE(pos + 2);
    headerSize = 6;
  }
  const bodyStart = pos + headerSize;
  if (tagCode === 12) {
    actionBlocks.push({ kind: "DoAction", start: bodyStart, end: bodyStart + tagLength });
  } else if (tagCode === 59) {
    // DoInitAction: sprite id (2 bytes) then actions
    actionBlocks.push({ kind: "DoInitAction", start: bodyStart + 2, end: bodyStart + tagLength });
  }
  pos = bodyStart + tagLength;
  if (tagCode === 0) break;
}

function decodeActions(start, end) {
  const out = [];
  let constantPool = [];
  let p = start;
  while (p < end) {
    const opcode = raw[p];
    if (opcode === 0) { p += 1; continue; }
    let length = 0;
    let body = p + 1;
    if (opcode >= 0x80) {
      length = raw.readUInt16LE(p + 1);
      body = p + 3;
    }
    if (opcode === 0x88) {
      // ConstantPool
      const count = raw.readUInt16LE(body);
      constantPool = [];
      let sp = body + 2;
      for (let i = 0; i < count; i++) {
        let e = sp;
        while (e < body + length && raw[e] !== 0) e++;
        constantPool.push(raw.toString("latin1", sp, e));
        sp = e + 1;
      }
      out.push({ off: p, op: "pool", size: count });
    } else if (opcode === 0x96) {
      // Push
      let sp = body;
      const values = [];
      while (sp < body + length) {
        const type = raw[sp];
        sp += 1;
        if (type === 0) {
          let e = sp;
          while (e < body + length && raw[e] !== 0) e++;
          values.push(JSON.stringify(raw.toString("latin1", sp, e)));
          sp = e + 1;
        } else if (type === 1) { values.push(String(raw.readFloatLE(sp))); sp += 4; }
        else if (type === 2) { values.push("null"); }
        else if (type === 3) { values.push("undefined"); }
        else if (type === 4) { values.push(`reg${raw[sp]}`); sp += 1; }
        else if (type === 5) { values.push(raw[sp] ? "true" : "false"); sp += 1; }
        else if (type === 6) {
          // DOUBLE: two little-endian words, high word first
          const b = Buffer.alloc(8);
          raw.copy(b, 4, sp, sp + 4);
          raw.copy(b, 0, sp + 4, sp + 8);
          values.push(String(b.readDoubleLE(0)));
          sp += 8;
        }
        else if (type === 7) { values.push(String(raw.readInt32LE(sp))); sp += 4; }
        else if (type === 8) { values.push(`c:${JSON.stringify(constantPool[raw[sp]] ?? `#${raw[sp]}`)}`); sp += 1; }
        else if (type === 9) { values.push(`c:${JSON.stringify(constantPool[raw.readUInt16LE(sp)] ?? `#${raw.readUInt16LE(sp)}`)}`); sp += 2; }
        else { values.push(`?type${type}`); break; }
      }
      out.push({ off: p, op: "push", values });
    } else if (opcode === 0x9b || opcode === 0x8e) {
      // DefineFunction / DefineFunction2
      let sp = body;
      let e = sp;
      while (e < body + length && raw[e] !== 0) e++;
      const name = raw.toString("latin1", sp, e);
      let codeSize;
      if (opcode === 0x9b) {
        const numParams = raw.readUInt16LE(e + 1);
        let pp = e + 3;
        for (let i = 0; i < numParams; i++) {
          while (raw[pp] !== 0) pp++;
          pp++;
        }
        codeSize = raw.readUInt16LE(pp);
      } else {
        codeSize = raw.readUInt16LE(body + length - 2);
      }
      out.push({ off: p, op: `defineFunction${opcode === 0x8e ? "2" : ""} "${name}" codeSize=${codeSize} bodyAt=${(body + length).toString(16)}` });
    } else if (opcode === 0x9d) {
      out.push({ off: p, op: `if -> ${(body + length + raw.readInt16LE(body)).toString(16)}` });
    } else if (opcode === 0x99) {
      out.push({ off: p, op: `jump -> ${(body + length + raw.readInt16LE(body)).toString(16)}` });
    } else {
      const NAMES = {
        0x3d: "callFunction", 0x52: "callMethod", 0x40: "newObject", 0x42: "initArray",
        0x43: "initObject", 0x1c: "getVariable", 0x1d: "setVariable", 0x4e: "getMember",
        0x4f: "setMember", 0x12: "not", 0x49: "equals2", 0x48: "less2", 0x67: "greater",
        0x0a: "add", 0x47: "add2", 0x0b: "subtract", 0x0c: "multiply", 0x0d: "divide",
        0x3e: "return", 0x17: "pop", 0x4c: "pushDuplicate", 0x87: "storeRegister",
        0x3b: "delete", 0x24: "cloneSprite", 0x8b: "setTarget", 0x20: "setTarget2",
        0x22: "getProperty", 0x23: "setProperty", 0x51: "increment", 0x50: "decrement",
        0x9a: "getURL2", 0x8c: "gotoLabel", 0x81: "gotoFrame", 0x9f: "gotoFrame2",
        0x26: "trace", 0x34: "getTime", 0x30: "randomNumber", 0x3a: "delete2",
        0x44: "typeof", 0x3c: "defineLocal", 0x41: "defineLocal2", 0x46: "enumerate",
        0x55: "enumerate2", 0x69: "extends", 0x54: "instanceOf", 0x2b: "castOp",
        0x60: "bitAnd", 0x61: "bitOr", 0x62: "bitXor", 0x63: "bitLShift", 0x64: "bitRShift",
        0x10: "and", 0x11: "or", 0x18: "toInteger", 0x4a: "toNumber", 0x4b: "toString"
      };
      if (opcode === 0x87) {
        out.push({ off: p, op: `storeRegister r${raw[body]}` });
      } else if (NAMES[opcode]) {
        out.push({ off: p, op: NAMES[opcode] });
      } else if (process.env.DECODE_ALL) {
        out.push({ off: p, op: `op0x${opcode.toString(16)}` });
      }
    }
    p = opcode >= 0x80 ? body + length : p + 1;
  }
  return out;
}

const rangeArg = process.argv.indexOf("--range");
const range = rangeArg !== -1
  ? [parseInt(process.argv[rangeArg + 1], 16), parseInt(process.argv[rangeArg + 2], 16)]
  : null;

for (const block of actionBlocks) {
  if (range && (block.end < range[0] || block.start > range[1])) continue;
  let items = decodeActions(block.start, block.end);
  if (range) items = items.filter((it) => it.off >= range[0] && it.off <= range[1]);
  const lines = items.map((it) => {
    if (it.op === "push") return `${it.off.toString(16)}\tpush ${it.values.join(", ")}`;
    if (it.op === "pool") return `${it.off.toString(16)}\tpool(${it.size})`;
    return `${it.off.toString(16)}\t${it.op}`;
  });
  const text = lines.join("\n");
  if (!grepTerm || text.includes(grepTerm)) {
    console.log(`=== ${block.kind} @${block.start.toString(16)}..${block.end.toString(16)} ===`);
    console.log(text);
  }
}
