# Interactive Buddy Parity Tracker

> **SUPERSEDED (2026-07-03):** parity status now lives in `docs/PARITY_MATRIX.md`
> (with `docs/GAP_LEDGER.md`, `docs/MEASUREMENT_LOG.md`, `reference/TARGET_BUILD.md`).
> This file is kept as historical context of the earlier attempt and is no longer updated.

This is the primary tracker for turning the project into a high-fidelity offline fan remake. It supersedes vague "inspired by" backlog items. Work should be judged against observed reference behavior, not against whether a similar feature exists.

## Goal

Match Interactive Buddy's player-facing experience as closely as possible in a private, offline build:

- Same practical tool roster and menu organization.
- Same core room layout, buddy scale, physics feel, money pacing, unlock flow, and reaction timing.
- Same style of Flash-era UI density, shop browsing, dropdown behavior, and immediate interaction feedback.
- Same perceived audiovisual timing through local user-supplied asset and audio packs where exact files are desired.

The repository should keep runtime support for private local assets strong. Do not spend additional engineering time on broad TypeScript migration unless it directly improves parity, testability, or browser verification.

## Status Key

- `Done`: verified against reference capture and covered by an automated or repeatable manual check.
- `Close`: implemented and playable, but still needs tuning against reference.
- `Partial`: same category exists, but behavior/content differs materially.
- `Missing`: not implemented.
- `Blocked`: needs reference capture, browser automation, or private asset/audio input.

## Immediate Priority Order

1. Capture reference evidence: screenshots or video of menus, shop categories, item pricing, tool effects, buddy reactions, and sound timing.
2. Build the exact parity checklist from that evidence before adding more speculative tools.
3. Restore browser/visual verification by running the external CDP workflow outside the Codex sandbox.
4. Tune current mechanics toward reference feel: buddy physics, hand/tickle/poke/slap behavior, tool force, explosion strength, projectile speed, score/cash rate, and mood decay.
5. Replace placeholder visuals/audio in the private build through local asset-pack imports or private non-manifest packs.
6. Only then resume larger code migration or new architecture work.

## Reference Evidence Needed

| Area | Evidence needed | Current source state | Status |
| --- | --- | --- | --- |
| Main screen layout | Full-window screenshot at reference resolution, with default room and menus visible | Current UI is Flash-era inspired, not proven exact | Blocked |
| Menu hierarchy | Screenshots or video of every top menu and nested item category | Existing categories approximate old toy-box menus | Blocked |
| Shop | Screenshots of every shop category, price, unlock condition, and item name | Shop exists with category tabs, current economy, and local names, but reference order/prices are not verified | Blocked |
| Tool roster | Complete item list with categories and ordering | Current live catalog has 42 tools, but not source-verified as exact | Blocked |
| Tool behavior | Short clips for each weapon/tool at low, medium, and high power | Many mechanics exist and are testable | Blocked |
| Buddy reactions | Clips for idle, hurt, happy, tickle, throw, impact, explosions, and long idle | Mood system, face changes, and on-canvas reaction bubbles exist, but text/timing/facial parity still needs captures | Blocked |
| Physics feel | Reference clips of grab, drag, throw, bounce, floor collision, wall collision, and recovery | Matter.js ragdoll exists, needs numeric tuning | Close |
| Economy pacing | Cash gained per hit/tool, combo behavior if any, initial unlock path | Current scoring is custom XP/cash/combo | Partial |
| Sounds | Reference timings and private local audio files or user-approved substitutes | Synthesized audio packs exist | Partial |
| Skins/assets | Private user-supplied art/audio pack or exact visual reference captures | Asset-pack import plus optional ignored `assets/private/manifest.json` exists | Partial |

## Current Parity Snapshot

| System | Current state | Target action | Status |
| --- | --- | --- | --- |
| Offline boot | Static Vite build with vendored Matter.js | Keep static/offline path intact | Close |
| Buddy body | Segmented Matter.js ragdoll | Tune size, masses, constraints, bounce, and damping against reference clips | Close |
| Hand interaction | Grab, drag, flick, Buddy hover/grab cursor affordance, mouse-wheel power adjustment, plus separately selectable clean-room Poke, Slap, and Tickle basic tools | Tune targeting, cursor feel, power step feel, force, and reaction timing against reference clips | Partial |
| Weapons/tools | Large tool set already implemented | Reorder, rename in private build, retune, and fill missing exact items from reference checklist | Partial |
| Shop/progression | Buy/equip flow, cash, XP, unlocks, category-filtered shop browsing, and owned/equipped shop-card state | Replace current pacing, category order, card density, and prices/unlocks after source capture | Partial |
| UI | Dense top menus, radial/toolbar, shop, settings, reset buddy/clear objects/reset room/reset-progress controls, and room browser | Prioritize original menu hierarchy, shop density, and settings/reset placement over new UX flourishes | Partial |
| Save/settings | Local save, import/export, saved scene presets, persisted audio volume, camera shake/particle/debug-physics toggles, and confirmed reset-progress cleanup | Verify exact persistence/reset behavior expectations against reference and add direct browser/manual coverage | Partial |
| Rooms | Multiple room packs and palettes; default base room is now a plainer gray boxed-room preset | Tune exact default room proportions/color against reference; keep extra rooms optional | Partial |
| Skins | Built-in, imported, and optional ignored private texture packs with shop preview cards and equipped-card state | Fill `assets/private/manifest.json` and pack textures for exact fan assets; tune preview/category/equipped flow against reference | Partial |
| Audio | Web Audio synthesis, audio presets, and private sample overrides | Map each reference sound event to local files/data URLs and tune gain/timing | Partial |
| Browser verification | Static smoke passes; CDP runner exists | Run external CDP from normal PowerShell; unblock automated visual checks | Blocked |

## Tool Parity Audit

Do not mark any row `Done` until it has reference evidence and a repeatable check.

| Reference category | Current equivalent | Needed for 1:1 feel | Status |
| --- | --- | --- | --- |
| Hand / grab | Open Hand | Tune grabbing, dragging, release velocity, and body targeting | Close |
| Poke / tickle / slap | Separately selectable Poke, Slap, and Tickle basic tools, plus Hand quick-tap tickle fallback | Browser/manual feel pass and reference tuning for exact force, timing, cursor behavior, and payouts | Partial |
| Throwable balls/props | Ball, Beach Ball, Bowling Ball, Brick, Crate, Stage Weight, Boxing Glove | Verify exact roster, ordering, prices, masses, bounce, and launch speeds | Partial |
| Guns/projectiles | Paintball, Rubber Blaster, Foam Dart, Cork Popper, Plunger Shot, Star Shot, Cannonball | Verify exact old weapons and tune fire rate/projectile response | Partial |
| Explosives | Grenade, Firecracker, Mine, Sticky Bomb, Cartoon Bomb | Verify arming delay, blast radius, force, scoring, and visuals | Partial |
| Force/gravity | Fan, Black Hole, Vacuum, Repulsor, Magnet | Verify strength, cooldown, cursor behavior, and visual affordances | Partial |
| Elemental/effects | Heat Cone, Frost Puff, Goo Mist, Pulse Beam, Spark Wand, Tesla Coil | Keep only if in reference or optional extras; tune if retained | Partial |
| Environment/builders | Trampoline, Rope, Water/Liquid, Platform, Bumper, Conveyor | Verify which are actually in target reference version | Partial |
| Nice/reward tools | Gift, Money Drop, Treat, Confetti, Boombox | Money Drop now has Bonus Drop mission/challenge coverage; still verify exact "nice" roster, prices, and cash/happy timing against reference | Partial |

## Asset And Sound Parity

Exact art/audio should be treated as a private local input lane, not a speculative placeholder lane.

| Asset lane | Current capability | Needed next | Status |
| --- | --- | --- | --- |
| Buddy body art | Canvas/vector body rendering plus texture-backed skins loaded from imports or `assets/private/manifest.json` | Fill private default-buddy texture/profile pack | Partial |
| Tool sprites/textures | Procedural cosmetic overlays plus private asset-pack `toolTextures` that can override spawned tool/prop cosmetics by cosmetic id or body label | Fill private texture mappings if exact user-owned tool art is supplied; add browser visual coverage after automation is restored | Partial |
| Room background | Room palette packs plus private room `texture` / `textureDataUrl` background support | Fill private room/background texture if exact user-owned backdrop art is supplied; add browser visual coverage after automation is restored | Partial |
| UI graphics | CSS/HTML menus plus private asset-pack `uiTheme.variables` for constrained menu/HUD skinning | Fill private UI theme variables or future private UI image paths from reference captures; add browser visual coverage after automation is restored | Partial |
| Sounds | Synthesized audio presets plus exact-event `audioPacks.<id>.samples` file/data-URL overrides for hand, nice, elemental, explosive, force, projectile, and builder events | Fill event-to-sample map from private reference files and verify timing/volume against captures | Partial |

## Verification Rules

- Every parity batch must update this tracker before being called done.
- Browser-visible work needs either automated CDP coverage or a repeatable manual browser checklist while sandbox browser automation is blocked.
- Static smoke remains useful for boot integrity, but it does not prove 1:1 fidelity.
- Visual baselines should be refreshed only after the reference target for that screen is documented.
- A feature that is merely "similar" stays `Partial` until measured against reference evidence.

## Next Lane

Start with a reference-backed UI/tool roster audit:

1. Gather screenshots/video for the original main menu, item categories, shop, and default play screen.
2. Convert those captures into exact tables for tool names, order, category, cost, default lock state, and visible behavior.
3. Update this tracker with those tables.
4. Implement the first narrow parity batch: default room + buddy scale + hand/poke/slap/tickle menu behavior.
