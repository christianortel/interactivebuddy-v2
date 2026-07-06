# Buddy Lab 2026

Private/offline TypeScript + Vite physics sandbox now being driven toward a high-fidelity Interactive Buddy fan-remake target. The game uses a boxed room, a Matter.js ragdoll buddy, mouse grabbing/throwing, tools, projectiles, explosions, progression, shop unlocks, skins, local saves, settings, asset packs, and audiovisual feedback.

The current product tracker is `INTERACTIVE_BUDDY_PARITY.md`. Treat that file as the source of truth for 1:1 work: capture reference evidence first, then tune/implement against that evidence. Broad TypeScript migration should wait unless it directly improves parity, browser verification, or private asset/audio support.

## Local Setup

```powershell
npm install
npm run dev
```

Open the local Vite preview URL, usually `http://127.0.0.1:5173`. In this Windows sandbox, `npm run dev` builds TypeScript first and serves the offline static output, which avoids blocked on-demand transform processes.

## Offline Build

```powershell
npm run build
npm run preview
```

The built `dist/` folder is static and can be served locally without a backend. Runtime physics uses the vendored Matter.js file under `vendor/`; asset packs are local JSON/SVG files under `assets/packs/`.

## Browser Verification

The fastest non-browser checks are:

```powershell
npm run build
npm run test:unit
npm run test:runtime
npm run test:assets
npm run test:static-smoke
```

`test:static-smoke` is a renderer-free production check for restricted environments: it validates the built HTML, bundled TypeScript shell, runtime chunk, vendored Matter.js, copied asset-pack manifest, and local static serving path.

The CDP browser smoke covers the built app, vendored Matter.js boot, and the newer tool batches:

```powershell
npm run build
npm run test:browser-smoke
```

If a restricted shell cannot launch Chromium renderers, launch the browser from a normal PowerShell session and attach to it:

```powershell
npm run browser:launch-cdp
npm run test:browser-smoke:external
```

The launcher prints the browser process id, profile path, debug port, and stop command. By default it uses port `9333`; pass `-DebugPort` to `tests/launch-cdp-browser.ps1` and `tests/run-browser-smoke-external.ps1` if that port is already in use.

For CI or a normal shell with Playwright's browser install available:

```powershell
npx playwright install chromium
$env:BUDDY_CHROME_PATH = node ./tests/resolve-playwright-chromium.mjs
npm run test:browser-smoke
```

## Controls

- `1`-`9`: select visible tools.
- Hand: click/drag body parts to grab, drag, throw, and fling; quick tap still tickles.
- Poke / Slap / Tickle: selectable basic tools for focused nudge, drag-shove, and happy tickle reactions.
- Mouse wheel/power slider: adjust tool power where supported.
- Aim-and-release tools: drag from the stage and release to fire.
- Hold tools: Fan, Gravity Well, Heat, Frost, Goo, Pulse, and Spark apply continuous effects.
- Place tools: Rope, Water, Trampoline, Grenade, Tesla, Gift, Confetti, and Boombox place or trigger at the cursor.
- `R`: reset the room.
- File > Reset Buddy respawns only the ragdoll.
- File/Footer > Clear Objects removes spawned props, ropes, explosives, and effect clutter while keeping the buddy.
- File/Footer > Reset Room clears objects, liquid, combo state, and respawns the buddy.

## Feature List

- Single-screen 2D boxed room with four collision boundaries.
- Multi-part Matter.js ragdoll buddy with head, torso, pelvis, arms, legs, hands, and feet.
- Spring-like mouse grabbing, throw velocity, selectable Poke/Slap/Tickle reactions, and wall recovery.
- Separate Reset Buddy, Clear Objects, and Reset Room controls for sandbox recovery.
- Money, XP, combos, anti-farm scoring, floating feedback, and local persistence.
- Shop progression with category tabs, locked/unlocked tools, owned/equipped card states, and buy/equip skin cards with color/texture previews.
- Original skin packs, texture-backed SVG skins, room themes, and private asset-pack import.
- Optional ignored private asset lane at `assets/private/manifest.json`, with templates under `assets/private/`.
- Private room/background texture support through room-level `texture` or `textureDataUrl`.
- Private asset-pack `toolTextures` overrides for local/user-owned spawned prop and tool art.
- Private asset-pack `uiTheme.variables` overrides for local menu/HUD skin tuning.
- Private asset-pack audio `samples` can now target exact feedback events such as Poke, Slap, Money Drop, elemental tools, explosives, and environment placements before falling back to generic synthesized sounds.
- Broad tool categories: hand/basic, thrown props, projectiles, explosives, elemental effects, force tools, environment builders, and nice/funny items.
- Mood/reaction states, face changes, small on-canvas reaction bubbles, particle effects, camera shake, synthesized audio feedback, mute/settings controls, persisted volume/shake/particle/debug toggles, reset-progress confirmation, and replay export.
- LocalStorage save/load, save import/export, settings persistence, saved scene presets, best challenge times, and lifetime earnings tracking.

## How To Add Tools

1. Add data in `src/data/tools.ts` for typed catalog visibility.
2. Add live runtime data in `js/content.js`.
3. Add a behavior factory or effect in `js/tool-behaviors.js` and `main.js`.
4. Add scoring tags and audit metadata in `TOOL_EFFECT_AUDIT`.
5. Add browser/unit coverage in `tests/`.
6. Update `PROJECT_STATUS.md` and any relevant docs.

## How To Add Skins

1. Add typed catalog data in `src/data/skins.ts` if it is built-in.
2. Add runtime skin data in `js/content.js`, a bundled pack under `assets/packs/`, or a private local import pack.
3. For exact fan-build art, prefer private local imports or private non-manifest packs.
4. Add spawned prop/tool art under pack-level `toolTextures` when a private image should replace a procedural tool cosmetic.
5. Validate packs with `npm run test:assets`.
6. Verify shop buy/equip behavior and texture application in browser tests.

## Known Limitations

- The current live runtime is the existing JavaScript game engine wrapped by a TypeScript/Vite entry point. Further migration is lower priority than fidelity work.
- Audio supports synthesized feedback plus exact-event audio-pack `samples` overrides for local or embedded private sound files.
- Some catalog entries in `src/data/tools.ts` are parity targets while the live runtime ships the current working tool set under `js/content.js`.
- `INTERACTIVE_BUDDY_PARITY.md` currently marks many 1:1 rows as blocked until reference captures are available.

A browser-based physics sandbox inspired by the old 2000s desktop toy-box loop: grab a soft ragdoll buddy, try tools, earn cash/XP from varied reactions, unlock more tools and skins, and keep experimenting.

## Current Playable Slice

- Matter.js ragdoll buddy built from rigid bodies and spring constraints.
- Classic top menu bar plus a modern HUD, mission panel, shop, and bottom tool rail.
- Tools: Open Hand, Poke, Slap, Tickle, Ball, Bowling Ball, Beach Ball, Foam Brick, Boxing Glove, Fan, Paintball, Foam Dart, Cork Popper, Plunger Shot, Star Launcher, Rubber Blaster, Heat Cone, Spark Wand, Frost Puff, Goo Mist, Pulse Beam, Grenade, Trampoline, Stage Weight, Elastic Rope, Water Fill, Gift Box, Money Drop, Treat, Confetti Popper, Boombox, Tesla Coil, and Black Hole.
- Local asset packs: JSON manifests can add skins, audio packs, and room palettes.
- Private asset packs: `assets/private/manifest.json` is auto-loaded when present and ignored by git for local fan-build files.
- Texture-backed pack skins: local SVG skin assets can be applied to the ragdoll bodies.
- Economy: cash, XP, combo timer, anti-grind yield decay, unlockable tools, unlockable skins, and local persistence.
- Reactions: mood state, face indicator, impact scoring, airborne scoring, shock/explosion/fan/paint/gift/tickle/water/rope tags, camera shake, replay strip, particle effects, Web Audio feedback with selectable packs, and supported-device haptics.
- Quality toggles: reduced flash, slapstick mode, audio, volume, camera shake, particles, haptics, slow motion, ceiling toggle, physics debug, reset buddy, clear objects, reset room, reset progress, save/load scene preset.

## Running Locally

Serve the folder and open the local URL:

```powershell
python -m http.server 5173
```

Then visit `http://localhost:5173`.

Matter.js is vendored in `vendor/matter.min.js`, so the playable slice can run locally after checkout without Wi-Fi.

## Controls

- `1`-`9`: select tools.
- Left drag with Hand: grab and fling.
- Quick tap with Hand: tickle fallback.
- Poke / Slap / Tickle: select from the basic tools for direct nudge, shove, and happy reaction behavior.
- Ball/Paintball: drag to aim, release to fire.
- Fan/Black Hole: hold on the stage.
- Paintball/Foam Dart/Cork Popper/Plunger Shot/Star Launcher: drag to aim and release.
- Grenade/Gift/Trampoline/Tesla: click to place.
- Heat Cone/Spark Wand/Frost Puff/Goo Mist/Pulse Beam: hold near Buddy for elemental effects.
- Rope: click near Buddy to attach an elastic ceiling tether.
- Water: click to set liquid height; click near the floor to drain.
- Confetti Popper: click to place a cheerful popper with particles and a gentle bump.
- Boombox: click to place a speaker that emits music notes, happy pulses, and gentle motion.
- Modes > Gravity: switch between Normal, Low Gravity, and Heavy Gravity physics.
- Modes > Debug > FPS Counter: show or hide the debug FPS overlay.
- Modes > Debug > Physics Debug: show or hide body outlines, centers, and constraint lines.
- Export: saves the recent rolling WebM replay buffer from the canvas when supported.
- Modes > Challenge: Free Play, Juggle Lab, Tether Tricks, Liquid Control, Prop Tricks, Bead Cannon, Suction Drill, Spin Drill, Spark Drill, Frost Test, Slip Test, Pulse Check, Cheer Check, Bonus Drop, Groove Check, and Clip Export.
- Rubber Blaster shows a burst/cooldown readout and feeds the Bead Cannon challenge.
- Settings > Asset pack shows a live room-palette preview and selectable room browser for loaded rooms.
- `R`: reset scene.

## Regression Check

With the local server running:

```powershell
python .\tests\browser-regression.py --url http://localhost:5173
```

Or start the static server and run the check in one command:

```powershell
powershell -ExecutionPolicy Bypass -File .\tests\run-regression.ps1
```

To include visual screenshot capture:

```powershell
powershell -ExecutionPolicy Bypass -File .\tests\run-regression.ps1 -Visual
```

The check covers page health, asset-pack loading, mission coverage, audio/liquid settings, tool selection, scoring, challenge completion, shop buying, radial wheel behavior, and replay export. The visual pass compares stage, radial-wheel, shop, and textured-skin screenshots against `tests/baselines/visual`.
The runner also executes lightweight module unit checks before browser tests. It preflights Python Playwright before browser automation so missing local browser dependencies fail early.

To intentionally refresh visual baselines after a reviewed UI change:

```powershell
python .\tests\visual-regression.py --url http://localhost:5173 --output .\tests\artifacts\visual --baseline .\tests\baselines\visual --update-baseline
```

To validate asset packs only:

```powershell
python .\tests\validate-asset-packs.py --root .
```

To validate a standalone pack before adding it to the live manifest:

```powershell
python .\tests\validate-asset-packs.py --root . --pack assets/packs/template/pack.json
```

Asset-pack authoring details and a starter template live in `docs/asset-packs.md`. Content parity tracking and exact-skin/private-import guidance live in `docs/content-completion-matrix.md`. Weapon cosmetics/effects coverage lives in `docs/weapon-cosmetics-effects-audit.md`.

## Audit Queue

Done:

- Built the HTML shell for menus, HUD, stage overlays, missions, shop, settings, and tool rail.
- Replaced styling with responsive game UI that keeps the old menu-bar reference while using a denser 2026 layout.
- Upgraded gameplay JS with tools, scoring, unlocks, skins, missions, persistence, effects, and settings.
- Ran `node --check main.js` successfully.
- Verified in a headless browser at `http://localhost:5173`: no console/page errors, 9 tools rendered, 3 missions rendered, 11 shop items rendered, scoring stayed finite, and interactions updated cash/XP.
- Added real Web Audio and haptics feedback hooks: impacts, explosions, shock, tickle/gift, paint, unlocks, selection clicks, and fan wind now route through settings-aware feedback. Verified the audio/haptics toggles and browser load.
- Added and verified a dedicated radial tool wheel: right-click opens it on desktop, touch long-press opens it on touch devices, locked states are visible, and selecting a tool updates the active tool.
- Added and verified rope/liquid/export systems: Elastic Rope attaches a ceiling tether to the nearest limb, Water Fill applies visible liquid plus buoyancy/drag scoring, and Export records an 8-second WebM replay path when supported.
- Added and ran automated browser regression checks for tool selection, scoring, shop buying, and radial wheel behavior.
- Added and verified real rolling replay buffering: the canvas records short chunks continuously, keeps the recent replay window in memory, and Export creates a WebM link from that buffer without waiting through a new recording. Regression now covers replay export.
- Added and verified selectable audio packs on top of the synthesized fallback: Classic, Arcade, Sci-Fi, and Soft adjust pitch, waveform, noise filtering, decay, and master level. Regression covers pack persistence.
- Added and verified richer liquid types: Water, Slime, and Oil have separate visuals, buoyancy, drag, angular damping, and temporary friction behavior. Regression covers Slime selection and placement.
- Added and verified stronger mission coverage for newer systems: rope tethering, liquid use, radial wheel opens, and replay export now have mission cards, and mission refreshes cycle through those coverage cards.
- Added and verified local asset-pack loading from `assets/packs/manifest.json`: packs can add skins, audio-pack definitions, and room palettes. Regression confirms Neon Lab and Retro Office load, asset-pack audio choices appear, selection persists, and pack skins enter the shop.
- Added and verified dedicated challenge modes: Juggle Lab, Tether Tricks, Liquid Control, and Clip Export use the gameplay event stream, show HUD progress, pay rewards, and persist the selected mode. Regression completes Liquid Control and verifies all mode choices exist.
- Split static content definitions out of the prototype runtime: tool definitions, built-in skins, audio packs, liquid types, missions, and challenge modes now live in `js/content.js`. Regression stayed green after the module split.
- Added and verified CI-friendly regression startup: `tests/run-regression.ps1` starts the static Python server, waits for readiness, runs Playwright regression, and stops the server. `.github/workflows/browser-regression.yml` runs the same path in CI.
- Added and verified a real visual skin atlas path for asset packs: pack skins can declare local SVG `texture` paths and Matter sprite scale metadata. Regression buys/equips Circuit Buddy and confirms the buddy bodies receive `circuit.svg` sprites.
- Continued module extraction: save/load JSON helpers now live in `js/storage.js`, with regression confirming save behavior still works.
- Added and verified challenge result summaries and per-challenge best scores: completed challenges show a replay-strip summary, save best elapsed time per mode, and display best time in the HUD. Regression confirms Liquid Control records a best.
- Added and verified save-file version migration tests: saves now include `version: 2`, legacy saves are migrated with defaults for asset packs, haptics, liquids, challenge mode, best scores, and baseline free tools. Regression seeds a legacy save and verifies migration.
- Added and verified save import/export UI: File > Export Save creates a JSON snapshot link, File > Import Save reads a local JSON snapshot, migrates it, persists it, and reloads into the imported progression/settings state. Regression covers both export and import.
- Added and verified visual regression screenshot capture: `tests/visual-regression.py` captures the main stage, radial wheel, shop panel, and textured skin state. `tests/run-regression.ps1 -Visual` runs browser regression plus screenshot capture.
- Added and verified a lightweight asset-pack schema validator: `tests/validate-asset-packs.py` checks manifest entries, pack metadata, room palettes, skin fields, texture file existence, texture scales, and audio pack parameters. The regression runner now validates packs before browser tests.
- Added and verified asset-pack authoring documentation and a non-live template pack: `docs/asset-packs.md`, `assets/packs/template/pack.json`, and `assets/packs/template/skins/sample.svg`. The validator now supports standalone `--pack` checks, and the regression runner validates the template pack before browser tests.
- Added and verified baseline visual diff thresholds: `tests/visual-regression.py` now supports baseline updates, pixel-diff comparison, threshold failures, and diff artifact output. `tests/run-regression.ps1 -Visual` compares against `tests/baselines/visual`, and the full visual runner passes.
- Continued module extraction by moving Web Audio feedback into `js/feedback.js`. `main.js` now injects settings, audio-pack lookup, and user-activation checks into `FeedbackEngine`, keeping audio behavior separate from the gameplay runtime. `node --check` and the full `-Visual` regression runner pass.
- Continued module extraction by moving shop and purchase progression into `js/progression.js`. The controller owns shop rendering, tool unlock purchases, and skin buy/equip flow through injected runtime callbacks. `node --check` and the full `-Visual` regression runner pass.
- Continued module extraction by moving focused tool-behavior helpers into `js/tool-behaviors.js`: instant-placement classification plus Matter body factories for ball, paintball, grenade, trampoline, gift, and tesla. `node --check` and the full `-Visual` regression runner pass.
- Continued module extraction by moving HUD/control DOM lookup into `js/ui-bindings.js`. `main.js` now consumes named UI binding factories while keeping render behavior unchanged. `node --check` and the full `-Visual` regression runner pass.
- Added direct lightweight unit checks for extracted modules in `tests/unit-modules.mjs`. The checks cover asset-pack sanitization/registration, challenge/mission progression, feedback no-audio safety, progression transactions, storage JSON behavior, tool body factories, tool classification, transfer save import/export, transfer replay export, and UI binding lookup. The regression runner now executes these checks before asset validation and browser regression.
- Completed replay/save import-export extraction by moving replay buffer/export, save snapshot export, and save snapshot import into `js/transfer.js`. Full `tests/run-regression.ps1 -Visual` now passes with Playwright restored, covering save migration, save export/import, replay export, and visual baselines.
- Completed challenge/mission progression extraction by moving mission selection/rendering, mission reward progression, challenge timers, challenge completion, best-time tracking, and challenge HUD labels into `js/challenges.js`. Full `tests/run-regression.ps1 -Visual` passes, covering mission coverage, Liquid Control completion, rewards, and saved best times.
- Completed asset-pack loading/registration extraction by moving manifest loading, pack sanitization, skin registration, audio-pack registration, and duplicate-pack handling into `js/asset-packs.js`. Full `tests/run-regression.ps1 -Visual` passes, covering local pack loading, asset-pack audio, pack skins, and textured skin rendering.
- Added and verified a classic-inspired content expansion with legally distinct assets: Foam Brick and Stage Weight tools, the Classic Arcade asset pack, three original retro-style skins, and the Cabinet Thunk audio preset. Full `tests/run-regression.ps1 -Visual` passes with 13 tools, 20 shop items, Classic Arcade pack loading, and the expanded radial wheel.
- Added and verified custom local skin-pack import support: File > Import Skin Pack accepts Buddy Lab asset-pack JSON, registers user-provided private skins/audio/rooms, supports embedded data-URL textures, selects the imported pack, persists it in the save payload, and restores it after reload. Full `tests/run-regression.ps1 -Visual` passes with import/reload coverage.
- Added and verified a focused physics-feel tune: stronger prone self-righting, a small upward recovery force near the floor, and buddy wall-bound recovery that gently translates the ragdoll back inside the room while damping stuck velocities. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified focused asset-pack import documentation: `docs/asset-packs.md` now explains private skin-pack imports, wrapper JSON, embedded `textureDataUrl` textures, local persistence through `customAssetPacks`, and why bundled packs should stay original unless rights are secured. Asset-pack validation passes.
- Added and verified deeper grab-feel tuning plus direct throw regression for the classic-inspired props: Hand drags now add temporary friction-air damping, angular damping, pull correction, and release flick velocity; browser regression now throws Foam Brick and Stage Weight through the real UI and verifies spawned prop bodies, meaningful velocity, finite scoring, and cash gain. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified direct Hand grab/release and wall-recovery browser coverage: regression drags Buddy with the Hand tool, confirms release flick scoring and body velocity, forces an out-of-bounds ragdoll state, and verifies recovery brings the buddy back inside the stage with damped velocity. Wall recovery now uses a stronger 18px horizontal recovery margin. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified end-to-end browser coverage for imported embedded texture skins: the private pack regression now imports a `textureDataUrl` skin, persists the pack through reload, buys/equips the skin, and confirms data-URL sprites are applied to the buddy bodies. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified focused behavior regression for the remaining shipped effect tools: Rope attaches constraints, Tesla places coils and emits bolt/shock events, Grenade explodes and removes its prop, Paintball applies decals/tint, Fan moves Buddy with wind scoring, and Black Hole pulls Buddy while setting afraid mood. The Fan shop purchase check now uses a deterministic shop-row click after asserting the Buy state. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified a living content completion matrix: `docs/content-completion-matrix.md` maps old Interactive Buddy-era systems, tools, skins, rooms, audio, and modes to current shipped equivalents, planned legally distinct replacements, or private-import-only exact skins. The matrix defines bundling rules, next content batches, and audit rules for future work.
- Added and verified the Classic Props content batch: Bowling Ball and Boxing Glove are legally distinct aim-and-release tools with dedicated Matter body factories, throw scoring, shop entries, unit coverage, browser throw regression, and matrix status updates. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified the Classic Projectiles content batch: Rubber Blaster is a legally distinct rapid-fire projectile tool that fires bouncy pellets while held, scores projectile/blunt events, appears in the shop/radial wheel, has unit coverage, and is covered by browser regression for multi-pellet firing, velocity, replay events, and cash gain. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified the Elemental Starter content batch: Heat Cone is a reduced-flash-safe held elemental tool with ember cone visuals, heat/elemental/fear scoring, gentle warm push, haptic/audio feedback, shop/radial integration, and browser regression for heat events, ember particles, mood, movement, and cash gain. Tesla bolt lifetime was also lengthened to make the existing shock visual effect stable under regression. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Classic Skin Pack 2: Gloom Friend, Fruit Clock, and Everyday Pal are original legally distinct texture skins in the Classic Arcade pack. Asset validation confirms all SVG paths, and browser regression verifies shop presence plus buying/equipping Gloom Friend as a texture-backed skin. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified the Room Pack content batch: Classic Desktop is a manifest-backed gray desktop room pack with the Desk Pal texture skin and Desktop Tap audio preset. Asset validation confirms the pack, and browser regression verifies room selection persistence, palette registration, audio option loading, and shop skin presence. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Prop Variants challenge hooks: Bowling Ball now emits `bowling` plus shared `propVariant` events, Boxing Glove emits `punch` plus shared `propVariant` events, new Lane Test/Glove Work/Prop Variants mission cards listen to those hooks, and the new Prop Tricks challenge completes from real Bowling/Glove throws. Challenge options are now rebuilt from `CHALLENGE_MODES` so future challenge modes appear automatically. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Projectile Variants challenge/UI hooks: Rubber Blaster now emits a shared `beadCannon` event, displays a stable burst/cooldown HUD pill, has a Bead Cannon mission card, and completes the new Bead Cannon challenge from real rapid-fire pellet use. Browser regression covers the HUD status, event tag, mission coverage, challenge completion, saved best time, pellet count, and finite rewards. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Elemental Variants: Spark Wand is a handheld shock tool distinct from Tesla Coil, emits cursor-to-buddy bolt arcs, applies small stun impulses, records `sparkWand`/elemental events, feeds the Spark Drill mission and challenge, saves best challenge time, and is covered by browser regression for particles, mood, movement, scoring, mission coverage, and finite rewards. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Mode Parity: Modes now has an old-style nested Debug submenu with an FPS Counter toggle, the FPS overlay updates from the simulation loop, the setting migrates off for legacy saves, persists to localStorage, restores after reload, and saved slow-motion/ceiling mode state is applied during boot. Browser regression covers submenu structure, toggle feedback, live FPS text, persistence, reload restoration, and migration default. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Room Preview: Settings > Asset pack now renders a live four-swatch room-palette preview for the selected pack, updates when built-in packs change, updates when private packs are imported, and exposes preview metadata for regression. Browser regression covers the default room, Classic Desktop, Neon Lab, and imported Private Pack preview state. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Prop Cosmetics: Bowling Ball now carries a `bowling-classic` cosmetic skin with rendered lane-ball highlight and finger-hole details, while Boxing Glove carries a `glove-laced` cosmetic skin with rendered cuff and lace details. Unit checks cover cosmetic metadata from the body factories, browser regression verifies real spawned props carry the expected cosmetic IDs, and the full visual runner passes.
- Added and verified Projectile Polish: Rubber Blaster pellets now cycle three visible variants (`charcoal-lime`, `safety-orange`, and `mint-blue`) with per-variant colors plus stripe/dot overlays. Unit checks cover the variant factory, browser regression verifies real Rubber Blaster and Bead Cannon runs spawn multiple/all variants, and the full visual runner passes.
- Added and verified Elemental Polish: Frost Puff is a reduced-flash held cold tool with frost cone visuals, temporary chilled body overlays, velocity damping, `cold`/`frostPuff` scoring tags, the Frost Test mission and challenge, saved best challenge time, and browser regression for particles, frosted bodies, mood, scoring, mission coverage, and finite rewards. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Mode Polish: Modes now includes an old-style Gravity submenu with Normal, Low Gravity, and Heavy Gravity entries that change real Matter.js gravity, persist through migrated/current saves, restore after reload, and expose active `aria-pressed` menu state. Browser regression covers default gravity, migration default, Low Gravity selection, active state, saved value, engine gravity value, and reload restoration. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Room Polish: Settings > Asset pack now includes a compact room browser with palette buttons for every loaded built-in and private-imported room pack. Selecting a room from the browser updates the dropdown, preview, room palette, toast, and saved asset-pack state; private room browser entries persist through reload. Browser regression covers default room browser population, Classic Desktop browser selection, active/pressed state, imported Private Pack browser insertion, and reload restoration. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Prop Polish: Foam Brick now carries `foam-brick-lined` cosmetic metadata with mortar/chip overlay details, Stage Weight now carries `stage-weight-anvil` cosmetic metadata with bevel/stamp overlay details, and the existing Spark Wand stun impulse was slightly strengthened to remove a regression flake. Unit checks cover the new factory metadata, browser regression requires all four classic prop throws to carry cosmetic IDs, and the full visual runner passes.
- Added and verified Projectile Expansion: Foam Dart is a new aim-and-release projectile with a dedicated Matter body factory, `foam-dart` cosmetic overlay, launch scoring, sticky buddy-hit state, Dart Board mission coverage, and direct browser regression for spawned dart bodies, stuck state, hit/launch replay events, shared `foamDart` tags, particles, cosmetics, and finite cash gain. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Elemental Expansion: Goo Mist is a reduced-flash held elemental tool with green mist visuals, temporary slippery body coating, lowered friction, sideways shove, `goo`/`slippery`/`gooMist` scoring tags, Slip Test mission/challenge coverage, saved best challenge time, and browser regression for particles, coated bodies, friction state, mood, movement, scoring, mission coverage, and finite rewards. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Physics Variant Polish: Robot now applies a `robot-heavy` physics variant with higher density and lower bounce, while Gelatin Blob applies a `gelatin-bouncy` physics variant with lower density and higher bounce. Skin physics is applied on equip and new buddy spawn, falls back to standard physics for other skins, and browser regression verifies Robot/Gelatin through the real shop path with saved selection, variant metadata, density changes, restitution changes, and equipped state. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Room Expansion: room packs now carry motif metadata and Settings > Asset pack renders richer mini-room thumbnails with grid, floor, accent, buddy silhouette, and motif-specific lab/neon/office/arcade/desktop details while retaining palette swatches. Built-in packs and private imported packs preserve thumbnail motifs through selection and reload. Unit checks cover sanitized motif retention, asset validation covers updated pack JSON, and browser regression asserts default, Classic Desktop, and private-import thumbnail motifs. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Prop Expansion: Beach Ball is a new legally distinct light/bouncy prop with a dedicated Matter body factory, `beach-ball-striped` cosmetic metadata and render overlay, aim-and-release launch behavior, `beachball` mission hook, shared `propVariant` scoring/challenge support, and browser regression for tool unlock, spawn speed, cosmetic metadata, replay tags, mission coverage, finite cash, and visual runner stability. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Classic Buddy Feel: the default buddy now starts in the old lower-left stage position at a smaller classic scale, uses looser/damped ragdoll constraints for a floppier early-web-toy feel, and renders a glossy gray segmented overlay with a simple mood-aware face while preserving the 15-body physics skeleton. Browser regression asserts classic body metadata, lower-left spawn, smaller head scale, and damping, and the full visual runner passes.
- Added and verified Projectile Variant Polish: Cork Popper is a new legally distinct aim-and-release projectile with a dedicated Matter body factory, `cork-popper` cosmetic overlay, launch scoring, Buddy-hit collision scoring, pop impulse, Cork Shots mission coverage, and direct browser regression for spawned cork bodies, hit state, replay tags, particles, cosmetics, movement, and finite cash gain. Verification also hardened the regression by clearing leftover prop bodies before Hand flick checks and made Black Hole keep the intended afraid mood while active. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Offline Local Play Foundation: Matter.js 0.19.0 is now vendored under `vendor/` with its license, `index.html` loads the local runtime instead of jsdelivr, and browser regression verifies the app boots from the local vendor file with no CDN dependency.
- Added and verified Elemental Variant Polish: Pulse Beam is a low-flash held energy tool with narrow beam visuals, temporary lit body status metadata, steady push/torque physics, `light`/`pulseBeam` scoring tags, Pulse Check mission/challenge coverage, saved best challenge time, and browser regression for particles, pulsed bodies, mood, movement, scoring, mission coverage, and finite rewards. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Weapon Cosmetics And Effects Audit: every shipped tool now has a `TOOL_EFFECT_AUDIT` entry with cosmetic/effect identity, visible hook, scoring tags, and coverage notes; older simple props now expose explicit cosmetic metadata; Ball, Trampoline, and Gift received direct browser assertions; and the audit table in `docs/weapon-cosmetics-effects-audit.md` tracks all 24 shipped tools. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Skin Physics Expansion: Astronaut now applies an `astronaut-float` variant with lower density, lower air damping, and slightly higher bounce, while Moon Boot Buddy applies a `moon-boot-spring` texture-backed variant with springier restitution and reduced damping. Browser regression buys Robot, Gelatin Blob, Astronaut, and Moon Boot Buddy through the real shop path and asserts selected skin, physics variant metadata, density, air damping, restitution, texture retention, and equipped state. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Room Preset Expansion: Workshop Garage is a new original room pack with a workshop motif thumbnail, palette, Shop Apron Buddy texture skin, Workshop Clack audio pack, manifest registration, room-browser selection coverage, and reload persistence coverage. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Nice Tool Expansion: Confetti Popper is a new cheerful tool with `confetti-popper` cosmetic metadata, custom popper overlay, colored confetti particles, gentle buddy bump physics, `confetti`/`happy`/`nice` scoring tags, Cheer Check mission/challenge coverage, saved best challenge time, and direct browser regression. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Projectile Preset Expansion: Plunger Shot is a new aim-and-release projectile with `plunger-shot` cosmetic metadata, suction-cup overlay, launch and hit scoring, temporary Buddy suction status, tug impulse physics, Suction Drill mission/challenge coverage, saved best challenge time, and direct browser regression. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Room Preset Follow-up: Dojo Studio is a new original room pack with a dojo motif thumbnail, mat-floor palette, Practice Gi Buddy texture skin, Dojo Tap audio pack, manifest registration, room-browser selection coverage, and reload persistence coverage. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Nice Tool Follow-up: Boombox is a new cheerful timed tool with `boombox` speaker cosmetic metadata, custom overlay, music-note particles, rhythmic happy force pulses, `boombox`/`music`/`happy`/`nice` scoring tags, Groove Check mission/challenge coverage, saved best challenge time, and direct browser regression. Full `tests/run-regression.ps1 -Visual` passes.
- Added and verified Projectile Follow-up: Star Launcher is a new aim-and-release projectile with `star-shot` cosmetic metadata, custom spinning star overlay, launch and hit scoring, temporary Buddy spin status, twirl impulse physics, Spin Drill mission/challenge coverage, saved best challenge time, and direct browser regression. Full `tests/run-regression.ps1 -Visual` passes.
- Added Money Drop Bonus Drop coverage: Money Drop now has a `moneydrop4` mission card, a selectable Bonus Drop challenge mode, unit/runtime content assertions, and static smoke coverage that the built runtime exposes the mission, challenge, and cosmetic metadata. Direct browser behavior coverage remains pending until browser automation is available.
- Added and verified shop skin-card polish: skin cards show color/texture previews and all shop cards expose owned/equipped state through visible styling, `data-owned`, `data-active`, and `aria-current` for repeatable coverage.
- Added and verified mouse-wheel power control: scrolling over the play canvas steps the same power value used by the HUD slider and clamps to the slider range.
- Added and verified canvas cursor affordances: Hand shows grab/grabbing over Buddy, basic contact tools show a crosshair over Buddy, and drag/aim operations keep a crosshair.

Done assets:

- `assets/packs/neon-lab/pack.json`
- `assets/packs/neon-lab/skins/circuit.svg`
- `assets/packs/neon-lab/skins/hazmat.svg`
- `assets/packs/retro-office/pack.json`
- `assets/packs/retro-office/skins/intern.svg`
- `assets/packs/retro-office/skins/crt.svg`
- `assets/packs/template/pack.json`
- `assets/packs/template/skins/sample.svg`
- `tests/baselines/visual/stage.png`
- `tests/baselines/visual/radial-wheel.png`
- `tests/baselines/visual/shop.png`
- `tests/baselines/visual/textured-skin.png`
- `js/feedback.js`
- `js/progression.js`
- `js/tool-behaviors.js`
- `js/ui-bindings.js`
- `js/transfer.js`
- `js/challenges.js`
- `js/asset-packs.js`
- `js/content.js`
- `tests/unit-modules.mjs`
- `.gitignore`
- `assets/packs/classic-arcade/pack.json`
- `assets/packs/classic-arcade/skins/dance-kid.svg`
- `assets/packs/classic-arcade/skins/campaign-pal.svg`
- `assets/packs/classic-arcade/skins/moon-boot.svg`
- `assets/packs/classic-arcade/skins/gloom-friend.svg`
- `assets/packs/classic-arcade/skins/fruit-clock.svg`
- `assets/packs/classic-arcade/skins/everyday-pal.svg`
- `assets/packs/classic-desktop/pack.json`
- `assets/packs/classic-desktop/skins/desk-pal.svg`
- `assets/packs/workshop-garage/pack.json`
- `assets/packs/workshop-garage/skins/shop-apron.svg`
- `assets/packs/dojo-studio/pack.json`
- `assets/packs/dojo-studio/skins/practice-gi.svg`
- `docs/asset-packs.md`
- `docs/content-completion-matrix.md`
- `docs/weapon-cosmetics-effects-audit.md`
- `main.js`
- `tests/browser-regression.py`
- `vendor/README.md`
- `vendor/matter-js.LICENSE`
- `vendor/matter.min.js`

In progress:

- None.

Next improvements:

- Use `INTERACTIVE_BUDDY_PARITY.md` as the primary queue.
- Gather reference evidence for menus, shop, tool roster/order, prices, buddy physics/reactions, default room, and sound timing.
- Implement the first narrow fidelity batch: default room proportions/colors, buddy scale/physics tuning, and separately selectable Hand/Poke/Slap/Tickle behavior if the reference menu requires it.
- Fill private audio-pack `samples` from reference sounds with exact event keys before claiming sound parity.
- Copy `assets/private/manifest.example.json` and `assets/private/pack.example.json` when building the local private replacement pack.

Process notes:

- Finish one queue item completely before moving to the next.
- Verify with `node --check` plus browser regression after gameplay changes.
- When verification exposes weak behavior, fix the behavior first and update this tracker after the fix passes.
- Prefer small module extractions with dependency injection and direct regression coverage over broad rewrites.
- Prefer fidelity batches over module extractions unless the extraction directly supports parity or verification.
- After a queue group is cleared, start the next queue with testability gaps before adding new gameplay surface area.
- Do not mark an extraction complete unless the full runner passes or the tracker explicitly records the verification blocker.
- For UI preview work, cover default content, built-in pack switching, and private import behavior before marking the queue item done.
- For cosmetic-only work, attach explicit metadata that regression can assert, then verify the rendered overlay through the full visual runner.
- For projectile visual variants, assert both normal tool use and challenge use so cosmetic rotation stays tied to real gameplay.
- For elemental variants, verify five surfaces together: direct tool effect, replay tags, challenge completion, mission rotation, and visible non-flashy particles/status overlays.
- For weapon/effect audits, build a gap table first, then close missing metadata, visuals, scoring tags, and regression assertions tool by tool.
- Keep `docs/weapon-cosmetics-effects-audit.md`, `TOOL_EFFECT_AUDIT`, unit checks, and browser checks synchronized whenever tools change.
- For nice tools, verify they are not cosmetic-only: require a visible prop/effect, mood change, scoring tags, mission/challenge path, and a measurable non-destructive physics response.
- For mode menu work, only add entries that alter real simulation or settings state, then assert default, active state, save migration, and reload behavior.
- For room browser work, assert built-in room population, direct browser selection, active state, private import insertion, and reload restoration.
- For prop polish work, every spawned prop factory should expose cosmetic metadata that unit tests and real throw regression both assert.
- For projectile expansion, cover factory metadata, direct launch behavior, collision behavior, replay tags, mission coverage, and visual particles before marking the item done.
- For elemental expansion, assert status-state metadata plus a real physics change, not just particles and score events.
- For physics variant polish, test skin selection through the shop and assert measurable Matter body values, not only selected skin IDs.
- For skin physics expansion, cover built-in and asset-pack skins through the real shop path and assert texture retention for texture-backed variants.
- For room expansion, assert motif metadata in sanitized packs plus actual DOM thumbnails for default, built-in selected, private-imported, and reload paths.
- For prop expansion, add the new prop to both direct throw regression and mission coverage; require cosmetic metadata plus replay event/tag assertions.
- For classic buddy feel work, verify both appearance metadata and measurable physics/spawn values so visual style changes do not silently detach from the ragdoll behavior.
- For offline-readiness work, remove network runtime dependencies first, vendor licenses with the code, and verify a fresh local server boot before marking the item done.
- For projectile variant polish, isolate prior projectile bodies before direct collision tests and assert both launch and hit events so path blockage cannot hide a weak behavior.
