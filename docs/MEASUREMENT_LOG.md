# Measurement Log

Every measured or provisional value, with origin. Physics in documented units; timings in
ms; positions in reference-stage units once the reference stage is established.

## Reference measurements

Artifact locked 2026-07-03: see `reference/TARGET_BUILD.md`.

| ID | Measurement | Value | Evidence | Status |
| --- | --- | --- | --- | --- |
| M-REF-001 | Native stage size | **550 × 400 px** (11000×8000 twips) | EV-0006 | Measured |
| M-REF-002 | Native frame rate | **40 fps** (fixed-step target: 40 Hz, 25 ms) | EV-0006 | Measured |
| M-REF-009 | Currency/status format | `$X.XX - <Tool Name>`, bottom-left | EV-0002 | Measured |
| M-REF-010 | Boot money | $0.00 | EV-0002 | Measured (clean-save semantics ⏳) |
| M-REF-011 | Menu bar labels | File, Skins, Items, Modes, Settings, Help | EV-0002 | Measured |
| M-REF-012 | Full price/roster tables | See `docs/CONTENT_INVENTORY.md` | EV-0007 | Measured |
| M-REF-013 | Version label | "1.02" top-right | EV-0002 | Measured |
| M-REF-015 | Clean-save boot money | $0.00 (fresh profile, no SharedObject) | EV-0009 | Measured |
| M-REF-016 | Boot sequence | Title card ("Interactive Buddy / By Shock Value / Version 1.02") overlays live room, fades by ~t+3s; no separate menu screen; Buddy already spawned during card | EV-0008/0009 | Measured |
| M-REF-017 | Buddy spawn X | Bottom-center, ~x=275 of 550 (exact pixel geometry pending) | EV-0008/0009 | Measured (coarse) |
| M-REF-018 | Idle speech bubble | "..." bubble fades in/out during idle | EV-0009/0013 | Measured (timing pending) |
| M-REF-019 | Menu open state | Label latches boxed highlight while open; panel rendering blocked in harness (GAP-15: v2 components) | EV-0010 | Partial |
| M-REF-020 | UI framework | Menus/windows are Flash MX 2004 v2 components: mx.controls MenuBar/Menu, mx.containers.Window via mx.managers.PopUpManager.createPopUp; hover highlight = v2 Halo theme state | EV-0014 | Measured |
| M-REF-021 | Window inventory (title, contentPath, width×height) | Stats/stats_mc 300×250; Custom Skin Creator/customSkin_mc 350×400; Skin Store/skinStore_mc 335×250; Item Store/itemStore_mc 335×250; Custom Face/customFace_mc 298×406; ShockScript Scripting Engine/script_mc 354×506; Mode Store/modeStore_mc 315×250; Physics Tweek/physicsTweek_mc 133×225; Help/text_mc 350×350; What's New?/text_mc 350×350; About/about_mc 200×250 | EV-0014 | Measured |
| M-REF-022 | Static menu entries (grouping per change-handler; on-screen order ⏳) | File: "Stats...", "Clear File..."; Skins: "Buy New Skins...", "Create Custom Skins..." + owned skins; Items: "Buy New Items..." + owned items by category; Modes: "Buy New Modes..." + owned modes; Settings: "Custom Face...", "Physics...", "Scripting Engine Access..." (+ quality/sound settings ⏳); Help: "Help....", "What's New?....", "About..." | EV-0014 | Measured (partial) |
| M-REF-023 | Telemetry | None: `infopost` = `if (debugMode) trace(msg)` debug logger only; no network calls in it | EV-0016 | Measured |
| M-REF-024 | Save schema | SharedObject.getLocal("daBud"); data keys: cash, item, skin, emotion, faceX, faceY, faceZ, faceR, faceText, blurLevel, aaQuality, gQuality, physicsQuality, soundOn, stats, modeContainer, numberOfObjects, activeScript, activeScriptName; defaults observed in code: skin="default", physicsQuality="Full", aaQuality="low", item default token "fist" (⏳ reconcile with boot "Open Hand" display) | EV-0015 | Measured (semantics ⏳) |

| M-REF-025 | Stage colors | Play area `#959f95`; frame bevel: top `#556058` (y1–7), left `#69766d` (x1–11), right `#47514a` (x542–548), bottom `#454e47` (y390–398); outer edge `#999999`; menu bar white `#ffffff` y9–28 | EV-0017 (pixel scans of EV-0010 capture menu-file.png via tests/measure-capture.mjs) | Measured |
| M-REF-026 | Menu label x-extents (text pixels) | File 35–51, Skins 77–104, Items 134–160, Modes 187–222, Settings 248–291, Help 318–341; label text rows y12–26 | EV-0017 | Measured |
| M-REF-027 | Buddy rest geometry (coarse) | Bounding box x248–313 (w66), y305–388 (h84); head center x≈280.5; head width ≈24 at y311; feet/floor line y≈388 (play area ends y389) | EV-0017 | Measured (part-level geometry pending) |
| M-REF-028 | Face icon button | Bounding box ≈ x5–45, y30–75 incl. shadow; circle ≈ (8,33)–(40,65) | EV-0017 | Measured (coarse) |
| M-REF-029 | Status line geometry | White text y374–388 starting x16; version label "1.02" box x519–545, y30–50 | EV-0017 | Measured |

| M-REF-030 | Buddy part geometry (exact, from SWF tags) | 6 parts placed on main timeline: body sprite 411 (sphere r=25.3), head 100 (r=13.6, contains 31-frame righteye face sprite), rLeg 420 / lLeg 427 / rArm 435 / lArm 438 (r=9.85). Spawn: body (280.3, 347.35), head (280.35, 311.1), rLeg (295.15, 377.2), lLeg (265.65, 375.7), rArm (305.25, 334.05), lArm (255.95, 334.05). Depths: body 9, head 17, rLeg 34, lLeg 40, rArm 46, lArm 49 | EV-0018 | Measured |
| M-REF-031 | Physics constants and architecture | initPhysics(slow=1, grav=0.8, damp=0.225); limb integrator: vel += (bodyAnchor − pos) · damp · mult + grav, arm mult 1.5, leg mult 0.5; material friction/bounce pairs (0.85/0.2, 0.85/0.85, 0.9/0.9, 0.3/0.5, 0.4); functions: doBodyPhysics (15119 B), doObjectPhysics (7002 B), doWeaponPhysics (3858 B), setBuddyXY, buddySay; talking head-bob = sin(time)·0.65; body standing height: center 41.65 px above floor at rest | EV-0019 | Measured (full doBodyPhysics port pending) |
| M-REF-032 | UI element transforms | faceClip (30, 49) scale 1.833; versionClip (513.45, 31.65); topBar (11.7, 8) scaleX 0.964; fpsText (467.45, 373.05); money popups plusSign (49.25, 39.05) / minusSign (49.45, 43.95) scale 1.819; bubble spawn (277.75, 309.5); tool clips on timeline: knife, fist, stunGun, wreckingBall, pistol, shotgun, mach | EV-0018 | Measured |

| M-REF-033 | Grab/stretch rule | Limb max stretch 35 px from rotated body anchor, snapped to 34 px along direction; rArm exempt while grabbingMouse | EV-0022 | Measured + implemented |
| M-REF-034 | Ignition payouts/emotion | body: −2 emotion, +$10, spreads fire to head+legs, drops grab; head: −2, +$4; per leg: −1, +$2; addEmotion(delta) is the mood core | EV-0022 | Measured (fire sim pending) |
| M-REF-035 | Speech system | buddySay(type, contents, time): sound→speak@100, script→executeScript, else text/image bubble with display time | EV-0022 | Measured + bubble implemented (idle cadence PROVISIONAL) |

| M-REF-036 | Skin system | setSkin(id) = gotoAndStop(skinId frame label) on all 6 part clips; label→frame tables extracted per part (EV-0028); hidden labels: insider, raspberry, wade, defaultng (Newgrounds-gated) | EV-0028 | Measured + implemented (sprite atlas per-skin) |
| M-REF-037 | Weapon/bubble clips | Weapon 634: idle:1/fire:2 shared across all guns; bubble 683 orientations upLeft/upRight/downLeft/downRight at 1/10/20/30 | EV-0028 | Measured |

Pending (require harness captures at native resolution):

| ID | Measurement | Method |
| --- | --- | --- |
| M-REF-003 | Room bounds, floor/wall/ceiling positions | Native boot capture overlay |
| M-REF-004 | Buddy spawn position, at-rest dimensions, body-part geometry | Native boot capture |
| M-REF-005 | Background/floor/frame colors | Sampled pixels from native capture (archival PNGs may be color-shifted; prefer harness captures) |
| M-REF-006 | Menu geometry (heights, widths, typography) | Native menu captures |
| M-REF-007 | Hand drag stiffness/lag, throw velocity mapping | Tracked clips → fixtures |
| M-REF-008 | Reaction onsets/durations | Frame-stepped clips |
| M-REF-014 | Payout per action per item | Scripted harness runs + AVM1 code analysis |

## Remake current-state measurements (2026-07-03) {#remake-2026-07-03}

Evidence EV-RMK-0001. DOM-measured on the built app (screenshot capture unavailable in
this session's preview environment; values read via DOM APIs).

| Measurement | Value | Parity assessment |
| --- | --- | --- |
| Canvas logical size | 960×640 | Provisional invention; no evidence basis |
| Canvas CSS size at default window | 711×458 (non-uniform scale vs 960×640 aspect) | Violates single-composition scaling rule |
| Top menus | File, Skins, Items, Modes, Settings, Help | Invented; no evidence basis |
| HUD | Cash, XP, Combo, Mood, Challenge + power slider 10–100 step 5 | XP/Combo/Challenge are foreign to target |
| Clean-boot cash | $75 | Invented |
| Default unlocked tools | hand, poke, slap, tickle, ball, rope, water | Invented |
| Tool catalog size | 46 (js/content.js), 45 (src/data/tools.ts) — duplicated catalogs disagree | Architecture violation (single-catalog rule) |
| Shop cards at boot | 56 | Invented roster |
| Missions at boot | 3 | Foreign system |
| Boot integrity at HEAD a9d99da | Fails: `ReferenceError: hasUserActivation is not defined` (main.js:191) | Fixed in working tree 2026-07-03 with local activation fallback |
| Physics stepping | Matter.js `Runner.run` default | Fixed-step + interpolation architecture not yet established/verified |

## Provisional values currently load-bearing in the remake

All remake constants (stage 960×640, floor at y=622, buddy scale 0.78, cash $75, every
price/payout) are provisional inventions of the failed attempt, not measurements. None
may survive into the parity build without evidence.
