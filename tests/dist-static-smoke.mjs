import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

import { TOOL_DEFS } from "../js/content.js";

const root = resolve(".");
const distRoot = join(root, "dist");
const port = Number(process.env.BUDDY_STATIC_SMOKE_PORT || 5193);
const requiredDomIds = [
  "world",
  "toolRail",
  "shopGrid",
  "skinMenu",
  "itemMenu",
  "assetPack",
  "audioPack",
  "toast",
  "radialWheel",
  "saveImportInput",
  "skinPackImportInput"
];

if (!existsSync(join(distRoot, "index.html"))) {
  throw new Error("dist/index.html is missing. Run npm run build before static smoke.");
}

const html = await readText("index.html");
assert.match(html, /<title>Buddy Lab 2026<\/title>/);
assert.doesNotMatch(html, /\/src\/main\.ts/, "production HTML should not reference the Vite source entry");
assert.match(html, /<script[^>]+src="\.\/assets\/index-[^"]+\.js"/, "production HTML should load the bundled TS shell");
assert.match(html, /<script src="vendor\/matter\.min\.js"><\/script>/, "production HTML should load vendored Matter.js");
assert.match(html, /<link[^>]+href="\.\/assets\/index-[^"]+\.css"/, "production HTML should load bundled CSS");
assert.ok(
  html.indexOf('<script src="vendor/matter.min.js"></script>') < html.indexOf('type="module"'),
  "vendored Matter.js must load before the bundled runtime module"
);
for (const id of requiredDomIds) {
  assert.match(html, new RegExp(`id="${id}"`), `dist HTML should include #${id}`);
}

const moduleSrc = extractRequiredAttribute(html, /<script[^>]+type="module"[^>]+src="([^"]+)"/);
const cssHref = extractRequiredAttribute(html, /<link[^>]+href="([^"]+index-[^"]+\.css)"/);
const shellSource = await readText(moduleSrc);
const runtimeChunk = extractRequiredAttribute(shellSource, /import\("\.\/(main-[^"]+\.js)"\)/);
const runtimeSource = await readText(`assets/${runtimeChunk}`);
const matterSource = await readText("vendor/matter.min.js");
const manifest = JSON.parse(await readText("assets/packs/manifest.json"));

assert.match(shellSource, /__buddyLabProject/, "bundled shell should attach project metadata before runtime import");
assert.match(shellSource, /cleanRoom:\s*!0/, "bundled shell should preserve clean-room metadata");
assert.match(runtimeSource, /__buddyLabDebug/, "legacy runtime chunk should expose debug state for smoke and regression coverage");
assert.match(runtimeSource, /toolEffectAudit/, "legacy runtime chunk should expose tool-effect audit metadata");
assert.match(matterSource, /Matter/, "vendored Matter.js should be copied into dist");
assert.ok(Array.isArray(manifest.packs) && manifest.packs.length > 0, "asset-pack manifest should be copied into dist");

const missingTools = TOOL_DEFS.map((tool) => tool.id).filter((id) => !shellSource.includes(`id:"${id}"`) && !shellSource.includes(`id: "${id}"`));
assert.deepEqual(missingTools, [], "typed shell catalog should include every live tool id");

const server = createStaticServer(distRoot);
await new Promise((resolveStart) => server.listen(port, "127.0.0.1", resolveStart));
try {
  await expectOk("/", "text/html");
  await expectOk(moduleSrc, "text/javascript");
  await expectOk(`./assets/${runtimeChunk}`, "text/javascript");
  await expectOk(cssHref, "text/css");
  await expectOk("vendor/matter.min.js", "text/javascript");
  await expectOk("assets/packs/manifest.json", "application/json");
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}

console.log(JSON.stringify({
  ok: true,
  check: "dist-static-smoke",
  tools: TOOL_DEFS.length,
  assetPacks: manifest.packs.length,
  module: moduleSrc,
  runtime: `./assets/${runtimeChunk}`,
  css: cssHref
}, null, 2));

async function readText(relativePath) {
  return readFile(join(distRoot, normalizeRelativePath(relativePath)), "utf8");
}

function extractRequiredAttribute(source, pattern) {
  const match = source.match(pattern);
  assert.ok(match, `Expected pattern ${pattern} to match`);
  return match[1];
}

async function expectOk(relativePath, expectedContentType) {
  const response = await fetch(`http://127.0.0.1:${port}/${normalizeRelativePath(relativePath)}`);
  assert.equal(response.status, 200, `${relativePath} should be served`);
  assert.match(response.headers.get("content-type") || "", new RegExp(expectedContentType), `${relativePath} content type`);
  assert.ok((await response.text()).length > 0, `${relativePath} should not be empty`);
}

function normalizeRelativePath(relativePath) {
  return relativePath.replace(/^\.\//, "").replace(/^\/+/, "");
}

function createStaticServer(baseDir) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
      const normalized = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      const filePath = join(baseDir, normalized);
      const relativeFile = relative(baseDir, filePath);
      if (relativeFile.startsWith("..") || relativeFile === "" || resolve(filePath) === baseDir) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(await readFile(filePath));
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
}

function contentType(filePath) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
