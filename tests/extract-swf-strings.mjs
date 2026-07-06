// Extract printable ASCII strings (with byte offsets) from an uncompressed SWF.
// Output goes to stdout as text lines: <hex-offset>\t<string>
// Usage: node tests/extract-swf-strings.mjs <path-to-swf> [minLength]
import { readFileSync } from "node:fs";

const path = process.argv[2];
const minLength = Number(process.argv[3] || 4);
const buffer = readFileSync(path);

let start = -1;
const isPrintable = (b) => b >= 0x20 && b <= 0x7e;

for (let i = 0; i <= buffer.length; i++) {
  const printable = i < buffer.length && isPrintable(buffer[i]);
  if (printable && start === -1) {
    start = i;
  } else if (!printable && start !== -1) {
    const length = i - start;
    if (length >= minLength) {
      const text = buffer.toString("latin1", start, i);
      console.log(`${start.toString(16).padStart(8, "0")}\t${text}`);
    }
    start = -1;
  }
}
