// Parity guard tests (docs/TEST_PLAN.md):
//   T-BOOT: built app boots headlessly with zero page errors.
//   T-ECON-MOLOTOV: deterministic clean-save scenario — one molotov dropped on
//     the buddy pays exactly $22.00 (measured ignition table, EV-0022/0025).
//   T-NET: no requests leave localhost (offline rule).
// Usage: CHROMIUM_PATH=... node tests/parity-checks.mjs
import { chromium } from "playwright";
import { spawn } from "node:child_process";

const PORT = 8647;
const server = spawn(process.execPath, ["tests/serve-root.mjs", String(PORT)], { stdio: "ignore" });
const failures = [];

try {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const page = await browser.newPage({ viewport: { width: 550, height: 400 } });
  const pageErrors = [];
  const remoteRequests = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      remoteRequests.push(request.url());
    }
  });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem(
      "ib-parity.daBud.v1",
      JSON.stringify({
        cash: 0, item: "Molotov Cocktails", skin: "default", emotion: 0,
        faceX: 0, faceY: 0, faceZ: 0, faceR: 0, faceText: "", blurLevel: 0,
        aaQuality: "low", gQuality: "high", physicsQuality: "Full", soundOn: true,
        numberOfObjects: 0, activeScript: "", activeScriptName: "",
        owned: {
          items: ["None", "Open Hand", "Tickle", "Fist", "Grenades", "Molotov Cocktails", "Weak Gravity Vortex", "Baseballs"],
          skins: ["Buddy"],
          modes: ["FPS Counter", "Open Ceiling"]
        },
        activeModes: []
      })
    );
  });

  // T-BOOT
  await page.goto(`http://127.0.0.1:${PORT}/dist/index.html`);
  await page.waitForFunction(() => Boolean(window.__ibParity), null, { timeout: 15000 });
  await page.waitForTimeout(400);
  if (pageErrors.length > 0) failures.push(`T-BOOT page errors: ${pageErrors.join("; ")}`);

  // T-ECON-MOLOTOV: spawn overlapping the buddy body center (280, 347 rest
  // pose measured) -> instant contact detonation ignites all six parts:
  // body 10 (+spread head 4, legs 2+2) + arms 2+2 = exactly 22.
  await page.mouse.move(280, 347);
  await page.waitForTimeout(120); // let the pointermove reach the page before clicking
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(800);
  const cash = await page.evaluate(() => window.__ibParity.shell.cash);
  if (cash !== 22) failures.push(`T-ECON-MOLOTOV expected exactly 22, got ${cash}`);

  // T-NET
  if (remoteRequests.length > 0) failures.push(`T-NET remote requests: ${remoteRequests.join("; ")}`);

  await browser.close();
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checks: ["T-BOOT", "T-ECON-MOLOTOV", "T-NET"] }));
