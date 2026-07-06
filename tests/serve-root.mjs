// Minimal static server over the repo root for the reference harness.
// Usage: node tests/serve-root.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.argv[2] || 8642);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".swf": "application/x-shockwave-flash",
  ".wasm": "application/wasm"
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
    if (path === "" || path === ".") path = "index.html";
    const full = join(root, path);
    if (!full.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(full);
    res.writeHead(200, { "Content-Type": MIME[extname(full).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`serving ${root} at http://127.0.0.1:${port}/`);
});
