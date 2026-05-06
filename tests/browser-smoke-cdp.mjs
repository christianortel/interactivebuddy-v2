import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(".");
const distRoot = resolve(root, "dist");
const port = Number(process.env.BUDDY_SMOKE_PORT || 5183);
const debugPort = Number(process.env.BUDDY_CHROME_DEBUG_PORT || 9333);
const externalCdp = process.env.BUDDY_EXTERNAL_CDP === "1";
const profileDir = resolve(root, ".chrome-cdp-smoke");

if (!existsSync(join(distRoot, "index.html"))) {
  throw new Error("dist/index.html is missing. Run npm run build before browser smoke.");
}

async function main() {
const server = createStaticServer(distRoot);
await new Promise((resolveStart) => server.listen(port, "127.0.0.1", resolveStart));

let chrome;
try {
  if (!externalCdp) {
    const chromePath = findChrome();
    await rm(profileDir, { recursive: true, force: true });
    chrome = spawn(chromePath, [
      "--headless",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--mute-audio",
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${debugPort}`,
      "about:blank"
    ], { stdio: "ignore" });
  }

  const wsUrl = await waitForBrowserWebSocketUrl(debugPort);
  console.error(`[browser-smoke] attaching to browser endpoint on port ${debugPort}`);
  const browser = await CdpClient.connect(wsUrl);
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const cdp = browser.session(sessionId);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  const loadEvent = cdp.waitForEvent("Page.loadEventFired", 12000);
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
  await loadEvent;
  await waitForRuntime(cdp, "Boolean(window.__buddyLabDebug?.state?.buddy)", 12000);
  console.error("[browser-smoke] game runtime ready");

  const initial = await evaluate(cdp, `(() => ({
    title: document.title,
    matterLoaded: Boolean(window.Matter?.Engine),
    toolIds: [...document.querySelectorAll('.tool-button')].map((button) => button.dataset.tool),
    auditIds: Object.keys(window.__buddyLabDebug.toolEffectAudit || {}),
    scripts: [...document.scripts].map((script) => script.getAttribute('src')).filter(Boolean)
  }))()`);

  const requiredTools = [
    "platform",
    "bumper",
    "conveyor",
    "vacuum",
    "repulsor",
    "magnet",
    "firecracker",
    "mine",
    "stickybomb",
    "largebomb",
    "cannonball",
    "crate",
    "moneydrop",
    "treat"
  ];
  assert.equal(initial.title, "Buddy Lab 2026");
  assert.equal(initial.matterLoaded, true);
  assert.ok(initial.scripts.some((source) => source.includes("vendor/matter.min.js")), "built page should load vendored Matter.js");
  for (const toolId of requiredTools) {
    assert.ok(initial.toolIds.includes(toolId), `${toolId} should be visible in toolbar`);
    assert.ok(initial.auditIds.includes(toolId), `${toolId} should have audit metadata`);
  }

  await evaluate(cdp, `(() => {
    const state = window.__buddyLabDebug.state;
    state.cash = 99999;
    state.unlockedTools = new Set(${JSON.stringify(initial.toolIds)});
    document.querySelectorAll('.tool-button').forEach((button) => button.classList.remove('tool-button--locked'));
  })()`);

  await dragTool(cdp, "crate", 180, 220, 390, 250);
  await dragTool(cdp, "cannonball", 210, 190, 450, 210);
  await clickTool(cdp, "platform", 480, 410);
  await clickTool(cdp, "bumper", 610, 360);
  await clickTool(cdp, "conveyor", 560, 500);
  await clickTool(cdp, "moneydrop", 430, 250);
  await clickTool(cdp, "treat", 465, 250);
  console.error("[browser-smoke] prop and environment tools exercised");

  await dragTool(cdp, "anvil", 650, 135, 680, 270);
  await holdTool(cdp, "vacuum", 165, 455, 700);
  await holdTool(cdp, "repulsor", 165, 455, 700);
  await holdTool(cdp, "magnet", 680, 270, 800);
  console.error("[browser-smoke] force tools exercised");

  await clickTool(cdp, "firecracker", 320, 460);
  await clickTool(cdp, "mine", 370, 460);
  await clickTool(cdp, "stickybomb", 125, 455);
  await clickTool(cdp, "largebomb", 440, 460);
  await wait(3100);
  console.error("[browser-smoke] explosive tools exercised");

  const finalState = await evaluate(cdp, `(() => {
    const { state } = window.__buddyLabDebug;
    const byLabel = (label) => state.props.filter((body) => body.label === label);
    const hasReplay = (text) => state.replayLog.some((entry) => entry.text === text || entry.tags?.includes(text));
    return {
      props: {
        crate: byLabel('prop_crate').at(-1)?.plugin?.cosmetic?.type || '',
        cannonball: byLabel('prop_cannonball').at(-1)?.plugin?.cosmetic?.type || '',
        platform: byLabel('platform').at(-1)?.plugin?.cosmetic?.type || '',
        bumper: byLabel('bumper').at(-1)?.plugin?.cosmetic?.type || '',
        conveyor: byLabel('conveyor').at(-1)?.plugin?.cosmetic?.type || '',
        moneydrop: byLabel('prop_moneydrop').at(-1)?.plugin?.cosmetic?.type || '',
        treat: byLabel('prop_treat').at(-1)?.plugin?.cosmetic?.type || ''
      },
      particles: {
        money: state.particles.some((particle) => particle.kind === 'money'),
        treat: state.particles.some((particle) => particle.kind === 'treat'),
        vacuum: state.particles.some((particle) => particle.kind === 'vacuum'),
        repulsor: state.particles.some((particle) => particle.kind === 'repulsor'),
        magnet: state.particles.some((particle) => particle.kind === 'magnet')
      },
      replay: {
        crate: hasReplay('crate'),
        cannonball: hasReplay('cannonball'),
        platform: hasReplay('platform'),
        bumper: hasReplay('bumper'),
        conveyor: hasReplay('conveyor'),
        moneydrop: hasReplay('moneydrop'),
        treat: hasReplay('treat'),
        vacuum: hasReplay('vacuum'),
        repulsor: hasReplay('repulsor'),
        magnet: hasReplay('magnet'),
        firecracker: hasReplay('firecracker'),
        mine: hasReplay('mine'),
        stickybomb: hasReplay('stickybomb'),
        largebomb: hasReplay('largebomb'),
        explosion: hasReplay('explosion')
      },
      liveExplosives: state.grenades.length,
      cash: state.cash,
      mood: state.mood
    };
  })()`);

  assert.equal(finalState.props.crate, "crate-cross");
  assert.equal(finalState.props.cannonball, "cannonball-iron");
  assert.equal(finalState.props.platform, "platform-plank");
  assert.equal(finalState.props.bumper, "bumper-ring");
  assert.equal(finalState.props.conveyor, "conveyor-belt");
  assert.equal(finalState.props.moneydrop, "money-drop");
  assert.equal(finalState.props.treat, "treat-cookie");
  assert.equal(finalState.particles.money, true);
  assert.equal(finalState.particles.treat, true);
  assert.equal(finalState.particles.vacuum, true);
  assert.equal(finalState.particles.repulsor, true);
  assert.equal(finalState.particles.magnet, true);
  for (const [key, value] of Object.entries(finalState.replay)) {
    assert.equal(value, true, `${key} should create a replay/scoring hook`);
  }
  assert.equal(finalState.liveExplosives, 0);
  assert.ok(Number.isFinite(finalState.cash));

  console.log(JSON.stringify({ ok: true, browser: "chrome-cdp", checks: finalState }, null, 2));
  await browser.close();
} finally {
  server.close();
  if (!externalCdp && chrome && !chrome.killed) {
    chrome.kill();
  }
}
}

async function clickTool(cdp, toolId, x, y) {
  await evaluate(cdp, `document.querySelector('.tool-button[data-tool="${toolId}"]').click()`);
  await pointer(cdp, "pointerdown", x, y);
  await pointer(cdp, "pointerup", x, y);
  await wait(120);
}

async function dragTool(cdp, toolId, startX, startY, endX, endY) {
  await evaluate(cdp, `document.querySelector('.tool-button[data-tool="${toolId}"]').click()`);
  await pointer(cdp, "pointerdown", startX, startY);
  await pointer(cdp, "pointermove", (startX + endX) / 2, (startY + endY) / 2);
  await pointer(cdp, "pointerup", endX, endY);
  await wait(180);
}

async function holdTool(cdp, toolId, x, y, duration) {
  await evaluate(cdp, `document.querySelector('.tool-button[data-tool="${toolId}"]').click()`);
  await pointer(cdp, "pointerdown", x, y);
  await wait(duration);
  await pointer(cdp, "pointerup", x, y);
  await wait(120);
}

async function pointer(cdp, type, worldX, worldY) {
  await evaluate(cdp, `(() => {
    const canvas = document.querySelector('#world');
    const rect = canvas.getBoundingClientRect();
    const eventTarget = ${JSON.stringify(type)} === 'pointerup' ? window : canvas;
    const event = new PointerEvent(${JSON.stringify(type)}, {
      bubbles: true,
      button: 0,
      buttons: ${type === "pointerup" ? 0 : 1},
      pointerId: 1,
      pointerType: 'mouse',
      clientX: rect.left + (${worldX} / 960) * rect.width,
      clientY: rect.top + (${worldY} / 640) * rect.height
    });
    eventTarget.dispatchEvent(event);
  })()`);
}

async function evaluate(cdp, expression) {
  const response = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return response.result.value;
}

async function waitForRuntime(cdp, expression, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) {
      return;
    }
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function waitForBrowserWebSocketUrl(debugPort) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) {
        const data = await response.json();
        if (data.webSocketDebuggerUrl) {
          return data.webSocketDebuggerUrl;
        }
      }
    } catch {
      // Retry until Chrome opens the debugging endpoint.
    }
    await wait(100);
  }
  throw new Error("Chrome remote debugging browser endpoint did not become ready");
}

function createStaticServer(directory) {
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
  };
  return createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
      const cleanPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "") || "index.html";
      const filePath = resolve(directory, cleanPath);
      if (!filePath.startsWith(directory)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(filePath);
      response.writeHead(200, { "content-type": mime[extname(filePath)] || "application/octet-stream" });
      response.end(content);
    } catch {
      response.writeHead(404).end("not found");
    }
  });
}

class CdpClient {
  static async connect(wsUrl) {
    const socket = new WebSocket(wsUrl);
    await new Promise((resolveOpen, rejectOpen) => {
      socket.addEventListener("open", resolveOpen, { once: true });
      socket.addEventListener("error", rejectOpen, { once: true });
    });
    return new CdpClient(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    socket.addEventListener("message", (message) => {
      const raw = typeof message.data === "string"
        ? message.data
        : Buffer.from(message.data).toString("utf8");
      this.handleMessage(JSON.parse(raw));
    });
    socket.addEventListener("close", () => this.rejectPending(new Error("CDP socket closed")));
    socket.addEventListener("error", () => this.rejectPending(new Error("CDP socket error")));
  }

  send(method, params = {}, timeoutMs = 10000, sessionId = null) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
    return new Promise((resolveSend, rejectSend) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectSend(new Error(`Timed out waiting for CDP ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend, timer });
    });
  }

  waitForEvent(method, timeoutMs, sessionId = null) {
    return new Promise((resolveEvent, rejectEvent) => {
      const timer = setTimeout(() => rejectEvent(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      const waiters = this.events.get(method) || [];
      waiters.push({ sessionId, resolve: (params) => {
        clearTimeout(timer);
        resolveEvent(params);
      } });
      this.events.set(method, waiters);
    });
  }

  handleMessage(message) {
    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) {
        pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result || {});
      }
      return;
    }
    if (message.method && this.events.has(message.method)) {
      const waiters = this.events.get(message.method);
      const remaining = [];
      for (const waiter of waiters) {
        if (!waiter.sessionId || waiter.sessionId === message.sessionId) {
          waiter.resolve(message.params || {});
        } else {
          remaining.push(waiter);
        }
      }
      if (remaining.length) {
        this.events.set(message.method, remaining);
      } else {
        this.events.delete(message.method);
      }
    }
  }

  close() {
    this.socket.close();
  }

  session(sessionId) {
    return {
      send: (method, params = {}, timeoutMs = 10000) => this.send(method, params, timeoutMs, sessionId),
      waitForEvent: (method, timeoutMs) => this.waitForEvent(method, timeoutMs, sessionId)
    };
  }

  rejectPending(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }
}

function findChrome() {
  const candidates = [
    process.env.BUDDY_CHROME_PATH,
    resolve(root, ".playwright-browsers/chromium-headless-shell-1217/chrome-headless-shell-win64/chrome-headless-shell.exe"),
    resolve(root, ".playwright-browsers/chromium-1217/chrome-win64/chrome.exe"),
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  ];
  const found = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!found) {
    throw new Error("No local Chromium-compatible executable found for CDP smoke. Set BUDDY_CHROME_PATH or run tests/launch-cdp-browser.ps1 and then tests/run-browser-smoke-external.ps1.");
  }
  return found;
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

await main();
