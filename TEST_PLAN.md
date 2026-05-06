# Test Plan

## Build And Type Checks

```powershell
npm install
npm run build
```

Expected result: TypeScript passes and Vite emits a static `dist/` build.

## Unit Checks

```powershell
npm run test:unit
npm run test:runtime
```

Expected result: extracted modules, content metadata, tool factories, storage, transfer helpers, UI binding checks, and typed runtime helper checks pass.

## Asset Validation

```powershell
npm run test:assets
```

Expected result: manifest packs, room palettes, audio-pack values, skin metadata, and local SVG texture paths validate.

## Static Dist Smoke

```powershell
npm run build
npm run test:static-smoke
```

Expected result: the production `dist/` HTML references the bundled TypeScript shell, vendored Matter.js, runtime chunk, bundled CSS, and copied asset-pack manifest, and those files are served successfully from a local Node static server.

## Browser Regression

```powershell
npm run test:regression
```

Expected result: local server boots, no blocking console/page errors occur, tool selection works, scoring is finite, shop purchase/equip paths work, imported packs persist, and core tool effects behave.

## CDP Browser Smoke

```powershell
npm run build
npm run test:browser-smoke
```

Expected result: the built `dist/` app is served locally, a Chromium-compatible browser opens through DevTools Protocol, and the newer tool batches produce real props, particles, scoring hooks, and vendored-Matter boot evidence.

The smoke wrapper launches through PowerShell to avoid this sandbox's Node `spawn EPERM` browser-launch path. It prefers a locally extracted Playwright headless shell or Chrome-for-Testing binary under `.playwright-browsers/`, then falls back to installed Edge/Chrome.

When the local sandbox cannot launch Chromium directly, start the browser from a normal PowerShell session and attach to it:

```powershell
npm run build
npm run browser:launch-cdp
npm run test:browser-smoke:external
```

`browser:launch-cdp` prints the browser process id, debug port, and equivalent attach command. The external attach path requires the browser to keep `http://127.0.0.1:9333/json/version` reachable while `test:browser-smoke:external` runs.

In CI or a normal Linux/macOS environment with Playwright installed, resolve Playwright's Chromium executable and run the same smoke:

```powershell
npx playwright install chromium
$env:BUDDY_CHROME_PATH = node ./tests/resolve-playwright-chromium.mjs
npm run test:browser-smoke
```

Current blocker in this sandbox: Chromium renderers cannot stay alive. Installed Edge/Chrome, manually downloaded Chrome-for-Testing, and manually downloaded Chrome headless shell fail with `FATAL:mojo\public\cpp\platform\platform_channel.cc ... Access is denied (0x5)` and related Crashpad/network sandbox access-denied logs before page commands can complete.

## Visual Regression

```powershell
npm run test:visual
```

Expected result: stage, shop, radial wheel, and textured skin screenshots match accepted baselines within threshold.

## Manual Smoke

- Start `npm run dev`.
- Open the Vite URL.
- Grab and throw the buddy with Hand.
- Earn cash from impacts.
- Buy one locked tool.
- Equip one skin.
- Toggle mute/reduced flash/debug FPS.
- Reset buddy and clear room state.
- Reload and confirm money/unlocks/settings persist.
