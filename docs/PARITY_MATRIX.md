# Parity Matrix

Authoritative parity status for the 1:1 Interactive Buddy v1.02 remake. Supersedes
`INTERACTIVE_BUDDY_PARITY.md`. Target lock: `reference/TARGET_BUILD.md`.

Status vocabulary (only `Verified` means done):
`Unverified` → `Measured` (target values evidenced) → `Implemented` → `Tuning` →
`Verified` (evidence + automated test + side-by-side pass), or `Blocked: no reference`.

## System rows

| ID | System | Reference facts | Evidence | Implementation | Test | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SYS-STAGE | Stage/coordinates/fps | 550×400 px stage, 40 fps timeline | EV-0006 | src/parity/stage.ts + loop.ts (550×400 units, uniform letterbox, fixed 25 ms tick) | compare-shell run (headless boot, 0 errors) | **Implemented** | Default page is now the parity shell; old app at legacy.html |
| SYS-ROOM | Default room | Colors/geometry measured (M-REF-025) | EV-0002, EV-0017 | src/parity/render.ts | tests/compare-shell.mjs — 7.27% px diff vs EV-0010 capture | **Tuning** | Residual: text AA, bevel corners |
| SYS-BUDDY-BODY | Buddy construction | EXACT geometry (M-REF-030: radii 25.3/13.6/9.85, spawn transforms, depths) + physics constants (M-REF-031: grav 0.8, damp 0.225, arm 1.5 / leg 0.5) | EV-0018/0019 | src/parity/buddy.ts — live 40 Hz sim, Open Hand grab/drag/throw | compare-shell 7.43% | **Implemented / Tuning** | Provisional (flagged): body support model, head mult, buddy material bounce/friction, face render; full doBodyPhysics port pending |
| SYS-BUDDY-REACT | Reactions/speech/face | buddySay + addEmotion measured (EV-0022); face system exact (EV-0029: eye open/closed with blink rule, mouth normal/talking, measured offsets); sayings tables extracted (EV-0027) | EV-0002/0022/0027/0029 | bubble.ts + sayings.ts + buddy face overlay with extracted clips | Guard tests + driven face capture | **Implemented / Tuning** | Idle cadence + bubble geometry PROVISIONAL; per-skin voice wiring pending |
| SYS-INPUT | Cursor/drag/throw | Stretch clamp 35/34 measured (EV-0022); drag transmission implemented (body-follow PROVISIONAL); cursor states + throw velocity sampling unmeasured | EV-0022 | src/parity/buddy.ts grab/drag/clamp | Driven drag run: body hauls to cursor, clamp holds | **Implemented / Tuning** | Cursor art + release-velocity window need clips/decode |
| SYS-MENU | Menu bar + windows | Labels + measured x-extents (M-REF-026); hover fill #e6ffdb; windows inventory M-REF-021/022; panel pixel metrics blocked (GAP-15) | EV-0002/0005/0014/0017 | src/parity/ui.ts — dropdowns with measured entries, category submenus, hover-switch, click-away; windows with measured titles/sizes | EV-RMK-0003 driven run, 0 errors | **Implemented / Tuning** | Provisional: row metrics, entry ordering, window placement/modality |
| SYS-HUD | Money/status display | `$X.XX  -  <Item>` white 13px from x17 y386; version 1.02 #3c403c top-right | EV-0002, EV-0017 | src/parity/render.ts status line | compare-shell | **Tuning** | Font metrics vs Flash device text |
| SYS-SHOP | Stores | Prices/rosters measured (EV-0007); window sizes/titles measured (M-REF-021); content layout unmeasured (GAP-15) | EV-0007/0014 | src/parity/ui.ts — Item/Skin/Mode Store windows, exact rosters/prices/owned states, purchase flow persists to save | EV-RMK-0003 driven run | **Implemented / Tuning** | Provisional: list layout, Buy control look, purchase feedback |
| SYS-ECON | Economy | Boot $0.00; prices measured; addCash semantics + purchase flow decoded; payout call sites mapped with fixed awards; velocity formulas pending per-site decode | EV-0002/0007/0021 | src/parity/economy.ts (addCash core, totalCash stat, popup) + purchase flow with register sound | Driven run: addCash(0,5)→5, popup spawned | **Implemented (core) / Tuning** | Per-event amounts + decay rules port with each item slice; popup presentation provisional |
| SYS-SKINS | Skin system | setSkin = per-part frame labels (M-REF-036); all skins' original art extracted to private lane incl. hidden insider/raspberry/wade/defaultng | EV-0007/0028 | src/parity/sprites.ts atlas + buddy per-skin draw; equip flow works | Driven runs: Napoleon + goth render with original art | **Implemented / Tuning** | Face-state eye/mouth overlays pending (C13); per-skin voices/lines wiring pending |
| SYS-MODES | Modes | 10 modes, IDs+prices measured; effects unmeasured | EV-0007 | Invented modes menu | — | Measured (partial) | |
| SYS-SCRIPT | Scripting console | Purchasable (400); create() API with 11 object types | EV-0005/0007 | Absent | — | Measured (partial) | Part of default product (it's in the reference) |
| SYS-STATS | Stats window | Exists; tracks named stats | EV-0005 | Absent | — | Measured (partial) | Full field list pending |
| SYS-AUDIO | Audio events | 87 sounds extracted with original names; 8 playSound events measured with volumes (M-REF/EV-0020) | EV-0020 | src/parity/audio.ts + private-lane assets; register wired to purchases | Driven playback run, 0 errors | **Implemented / Tuning** | Trigger mapping for punch/static/voices + timing verification pending |
| SYS-SAVE | Persistence/resets | Unmeasured (likely SharedObject) | — | localStorage w/ foreign schema | — | Blocked: needs runtime observation | |
| SYS-PAUSE | Pause | Keyboard pause key, Paused/Unpaused states | EV-0005 | Absent | — | Measured (partial) | Key binding unconfirmed |
| SYS-OFFLINE | Offline boot | n/a (build requirement) | EV-RMK-0001 | Static Vite build | test:static-smoke | Implemented | |

## Item rows (menu path Items → category → name; order = data-table order, on-screen order ⏳)

All rows: evidence EV-0007 (+EV-0002 for Open Hand); implementation —; tests —;
status **Measured** (identity/price/unlock only — behavior unmeasured).

| ID | Name | Path | Price | Start | Discrepancy notes |
| --- | --- | --- | --- | --- | --- |
| ITEM-HAND-NONE | None | Hand #1 | 0 | ✓ | No remake equivalent |
| ITEM-HAND-OPEN | Open Hand | Hand #2 | 0 | ✓ | Remake "hand" is closest ancestor; behavior unverified |
| ITEM-HAND-TICKLE | Tickle | Hand #3 | 0 | ✓ | Remake "tickle" invented variant |
| ITEM-HAND-FIST | Fist | Hand #4 | 0 | ✓ | Remake "poke/slap" are NOT this |
| ITEM-EXPL-GRENADES | Grenades | Explosives #1 | 50 | ✓ | **Implemented/Tuning** (EV-0024: exact material 0.2/0.65, exact explosion falloff/force/shake/sound; src/parity/objects.ts; verified throw→boom→knockback) — provisional: fuse length, power p, radius/art, spawn velocity mapping, explosion visual |
| ITEM-EXPL-MOLOTOV | Molotov Cocktails | Explosives #2 | 60 | — | **Implemented/Tuning** (EV-0024/0025: contact detonation exact; ignition payouts exact; burnball@40) — provisional: ignition radius, knockback power, fire duration, art |
| ITEM-EXPL-MINES | Mines | Explosives #3 | 80 | — | **Implemented/Tuning** (EV-0024: stuck-mine contact detonation exact; chain-detonation rule known) — provisional: trigger geometry, arm behavior detail, power, art |
| ITEM-EXPL-FLAME | Flamethrower | Explosives #4 | 100 | — | Absent (remake heatcone is not this) |
| ITEM-EXPL-MISSILES | Missiles | Explosives #5 | 100 | — | **Implemented/Tuning** — EXACT spawn (EV-0032), real art, homing flight thrust/turn PROVISIONAL |
| ITEM-GOD-WEAKVORTEX | Weak Gravity Vortex | God Powers #1 | 20 | ✓ | **Implemented (provisional)** — placed vortex; pull strength/lifetime PROVISIONAL pending decode |
| ITEM-GOD-STRONGVORTEX | Strong Gravity Vortex | God Powers #2 | 30 | — | **Implemented (provisional)** — same |
| ITEM-GOD-FIREBALLS | Fireballs | God Powers #3 | 40 | — | **Implemented/Tuning** — exact material 0.9/0.9/0.1, spawns burning; ignition payouts exact |
| ITEM-GOD-EXPLODEMOUSE | Explode At Mouse | God Powers #4 | 60 | — | **Implemented/Tuning** — exact explode(); power p PROVISIONAL |
| ITEM-GUNS-PISTOL | Pistol | Guns #1 | 60 | — | **Implemented/Tuning** (EV-0023: exact speed/spread/str/ric/sound/cadence; src/parity/guns.ts; verified buy+equip+fire) — provisional: impulse factor, bullet cash, non-Ctrl aim target, trail look, weapon art |
| ITEM-GUNS-SHOTGUN | Shotgun | Guns #2 | 100 | — | **Implemented/Tuning** (EV-0023: 8 pellets, exact speeds/spread/str/ric) — same provisionals |
| ITEM-GUNS-MG | Machine Gun | Guns #3 | 140 | — | **Implemented/Tuning** (EV-0023: hold-fire, 5-tick cadence verified) — spread/str/ric provisional pending mach block completion |
| ITEM-OBJ-BASEBALLS | Baseballs | Objects #1 | 15 | ✓ | **Implemented/Tuning** — exact material 0.2/0.8/0.3 + exact impact payout max(3, speed·0.02) gated >25 (EV-0026; verified $3.00 deterministic hit) |
| ITEM-OBJ-RUBBER | Rubber Balls | Objects #2 | 20 | — | **Implemented/Tuning** — exact material 0.95/0.95/0.08 (bouncyball) |
| ITEM-OBJ-BOWLING | Bowling Balls | Objects #3 | 40 | — | **Implemented/Tuning** — exact material 0.15/0.9/0.8 |
| ITEM-OBJ-INFANTS | Infants | Objects #4 | 60 | — | **Implemented/Tuning** — exact material 0.1/0.2/0.5; per-type sounds/reactions pending |
| ITEM-MISC-WIDEHOSE | Wide Nozzle Hose | Miscellaneous #1 | 15 | — | **Implemented/Tuning** — exact nozzle params (EV-0031); droplet look + spawn rate PROVISIONAL |
| ITEM-MISC-NARROWHOSE | Narrow Nozzle Hose | Miscellaneous #2 | 20 | — | **Implemented/Tuning** — exact nozzle params (EV-0031) |
| ITEM-MISC-FLAIL | Medieval Flail | Miscellaneous #3 | 40 | — | **Implemented/Tuning** — real wreckingBall+chain art; exact impact payout; chain length/damping PROVISIONAL |
| ITEM-MISC-FIREHOSE | Fire Hose | Miscellaneous #4 | 60 | — | **Implemented/Tuning** — exact nozzle params (EV-0031); verified extinguish + cross-stage push |
| ITEM-MISC-STUNGUN | Stun Gun | Miscellaneous #5 | 85 | — | **Implemented/Tuning** — real stunGun art, shock@70 exact, unconscious via stun(); duration/zap visual PROVISIONAL |
| ITEM-SPEC-ORB | Magical Orb | Special #1 | 160 | — | **Implemented (provisional)** — real orb art + beam; pull strength pending gravitateToPoint decode |
| ITEM-SPEC-GRAVSHIFT | Gravity Shifter | Special #2 | 240 | — | **Implemented (provisional)** — directional gravity vector; exact semantic pending decode |
| ITEM-SPEC-RADIO | Radio | Special #3 | 320 | — | **Implemented/Tuning** — real radio art; radioMusic loops while placed; material/dance behavior PROVISIONAL |

## Skin rows (evidence EV-0007; status Measured — identity/price only; art requires captures)

SKIN-DEFAULT Buddy (0, owned); SKIN-TELETUBBY Teletubby (60); SKIN-MADDOX Maddox (60);
SKIN-STRAWBERRY StrawberryClock (60); SKIN-GOTH Gregor the Goth (60); SKIN-REP
Republican (60); SKIN-DEM Democrat (60); SKIN-MOORE Moore (60); SKIN-GATES Gates (60);
SKIN-TOM Tom (60); SKIN-NAP Napoleon (60). All absent from remake; remake's 5 skins are
orphans.

## Mode rows (evidence EV-0007; status Measured — identity/price only; effects require captures)

MODE-FPS FPS Counter (0, owned); MODE-OPENCEIL Open Ceiling (0, owned); MODE-LOWGRAV
Low Gravity (20); MODE-NES NES Style Movement (20); MODE-GORE Blood and Gore (40);
MODE-ALTPHYS Alternate Body Physics (40); MODE-QUAKE Earthquake (40); MODE-DYNCAM
Dynamic Camera (40); MODE-PYRO Realistic Pyrotechnics (40); MODE-SCRIPT Scripting
Engine Access... (400).

## Orphan register (default-visible remake content with no reference basis)

Correction vs 2026-07-03 first pass: the menu-bar labels and the names "Open Hand" and
"Tickle" DO match the reference; those specific identities are no longer orphans (their
behaviors remain unverified). Everything else stands: the other 42 remake tools, all 5
remake skins, XP/combo/missions/challenges, radial wheel, replay export, room packs,
liquid selector, haptics, camera-shake/particles toggles, invented File-menu contents,
side panel, tool rail, power slider (power control existence in reference unconfirmed),
and "Buddy Lab 2026" branding. Disposition per `docs/ARCHITECTURE_DECISION.md`: remove
or re-specify from evidence; nothing survives by default.
