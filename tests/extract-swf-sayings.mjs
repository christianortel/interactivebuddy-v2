// Extract the per-event, per-skin reaction tables ("sayings") from the decoded
// action dump into the user's private asset lane. The reaction text is the
// game's creative content: it is written ONLY to gitignored private files and
// loaded locally by the runtime. Stdout prints event names and counts only.
// Usage: node tests/extract-swf-sayings.mjs <decoded-actions.txt> [outdir]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const decodedPath = process.argv[2] || "reference/private/actions-decoded-v2.txt";
const outDirs = [process.argv[3] || "assets/private", "reference/private"];
const lines = readFileSync(decodedPath, "utf8").split("\n");

// Pattern per entry (see EV-0024 structure):
//   push c:"line1"[, c:"line2"...], N        <- strings array
//   initArray
//   push <flag>, c:"skin", 3                 <- [flag, skin] metadata
//   initArray
//   push 1, c:"sayings" / getVariable / push c:"<event>" / getMember / push c:"texts"
const sayings = {};
const parsePushStrings = (line) => {
  const body = line.replace(/^[0-9a-f]+\tpush /, "");
  const parts = [];
  const regex = /c:"((?:[^"\\]|\\.)*)"|(-?[0-9.]+)|(true|false)/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    if (match[1] !== undefined) parts.push({ kind: "str", value: match[1] });
    else if (match[3] !== undefined) parts.push({ kind: "bool", value: match[3] === "true" });
    else parts.push({ kind: "num", value: Number(match[2]) });
  }
  return parts;
};

for (let i = 0; i + 6 < lines.length; i++) {
  if (!lines[i + 1]?.includes("initArray")) continue;
  if (!lines[i + 3]?.includes("initArray")) continue;
  const linesParts = parsePushStrings(lines[i] ?? "");
  const metaParts = parsePushStrings(lines[i + 2] ?? "");
  if (linesParts.length < 2 || metaParts.length !== 3) continue;
  const countPart = linesParts[linesParts.length - 1];
  if (countPart.kind !== "num" || countPart.value !== linesParts.length - 1) continue;
  const texts = linesParts.slice(0, -1);
  if (!texts.every((part) => part.kind === "str")) continue;
  const [flag, skin, three] = metaParts;
  if (three.kind !== "num" || three.value !== 3 || skin.kind !== "str") continue;
  // Find the event name within the next few lines: push c:"<event>" then getMember.
  let event = null;
  for (let j = i + 4; j < i + 12 && j < lines.length; j++) {
    if (lines[j].includes('c:"sayings"')) {
      const eventLine = lines[j + 2] ?? "";
      const eventMatch = eventLine.match(/push c:"([A-Za-z0-9_]+)"/);
      if (eventMatch && lines[j + 3]?.includes("getMember")) {
        event = eventMatch[1];
      }
      break;
    }
  }
  if (!event) continue;
  sayings[event] ??= [];
  sayings[event].push({
    skin: skin.value,
    useImage: flag.kind === "bool" ? flag.value : flag.value,
    lines: texts.map((part) => part.value)
  });
}

const payload = JSON.stringify(sayings, null, 2);
for (const dir of outDirs) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "sayings.json"), payload);
}
console.log(
  JSON.stringify(
    Object.fromEntries(Object.entries(sayings).map(([event, list]) => [event, list.length])),
    null,
    2
  )
);
