# Interactive Buddy Parity Tracker

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
| Shop | Screenshots of every shop category, price, unlock condition, and item name | Shop exists with current economy and local names | Blocked |
| Tool roster | Complete item list with categories and ordering | Current live catalog has 42 tools, but not source-verified as exact | Blocked |
| Tool behavior | Short clips for each weapon/tool at low, medium, and high power | Many mechanics exist and are testable | Blocked |
| Buddy reactions | Clips for idle, hurt, happy, tickle, throw, impact, explosions, and long idle | Mood system exists, needs timing/facial parity | Blocked |
| Physics feel | Reference clips of grab, drag, throw, bounce, floor collision, wall collision, and recovery | Matter.js ragdoll exists, needs numeric tuning | Close |
| Economy pacing | Cash gained per hit/tool, combo behavior if any, initial unlock path | Current scoring is custom XP/cash/combo | Partial |
| Sounds | Reference timings and private local audio files or user-approved substitutes | Synthesized audio packs exist | Partial |
| Skins/assets | Private user-supplied art/audio pack or exact visual reference captures | Asset-pack import plus optional ignored `assets/private/manifest.json` exists | Partial |

## Current Parity Snapshot

| System | Current state | Target action | Status |
| --- | --- | --- | --- |
| Offline boot | Static Vite build with vendored Matter.js | Keep static/offline path intact | Close |
| Buddy body | Segmented Matter.js ragdoll | Tune size, masses, constraints, bounce, and damping against reference clips | Close |
| Hand interaction | Grab, drag, flick, quick tickle behavior | Split/select Poke, Slap, Tickle, Grab if reference menu requires it | Partial |
| Weapons/tools | Large tool set already implemented | Reorder, rename in private build, retune, and fill missing exact items from reference checklist | Partial |
| Shop/progression | Buy/equip flow, cash, XP, unlocks | Replace current pacing with reference prices/unlocks after source capture | Partial |
| UI | Dense top menus, radial/toolbar, shop, settings, room browser | Prioritize original menu hierarchy and shop density over new UX flourishes | Partial |
| Rooms | Multiple room packs and palettes | Make default room match reference proportions/color; keep extra rooms optional | Partial |
| Skins | Built-in, imported, and optional ignored private texture packs | Fill `assets/private/manifest.json` and pack textures for exact fan assets; improve preview/category flow | Partial |
| Audio | Web Audio synthesis, audio presets, and private sample overrides | Map each reference sound event to local files/data URLs and tune gain/timing | Partial |
| Browser verification | Static smoke passes; CDP runner exists | Run external CDP from normal PowerShell; unblock automated visual checks | Blocked |

## Tool Parity Audit

Do not mark any row `Done` until it has reference evidence and a repeatable check.

| Reference category | Current equivalent | Needed for 1:1 feel | Status |
| --- | --- | --- | --- |
| Hand / grab | Open Hand | Tune grabbing, dragging, release velocity, and body targeting | Close |
| Poke / tickle / slap | Quick Hand tickle plus punch-like props | Add separately selectable subtools if present in reference menus | Partial |
| Throwable balls/props | Ball, Beach Ball, Bowling Ball, Brick, Crate, Stage Weight, Boxing Glove | Verify exact roster, ordering, prices, masses, bounce, and launch speeds | Partial |
| Guns/projectiles | Paintball, Rubber Blaster, Foam Dart, Cork Popper, Plunger Shot, Star Shot, Cannonball | Verify exact old weapons and tune fire rate/projectile response | Partial |
| Explosives | Grenade, Firecracker, Mine, Sticky Bomb, Cartoon Bomb | Verify arming delay, blast radius, force, scoring, and visuals | Partial |
| Force/gravity | Fan, Black Hole, Vacuum, Repulsor, Magnet | Verify strength, cooldown, cursor behavior, and visual affordances | Partial |
| Elemental/effects | Heat Cone, Frost Puff, Goo Mist, Pulse Beam, Spark Wand, Tesla Coil | Keep only if in reference or optional extras; tune if retained | Partial |
| Environment/builders | Trampoline, Rope, Water/Liquid, Platform, Bumper, Conveyor | Verify which are actually in target reference version | Partial |
| Nice/reward tools | Gift, Money Drop, Treat, Confetti, Boombox | Verify exact "nice" tools and cash/happy reaction behavior | Partial |

## Asset And Sound Parity

Exact art/audio should be treated as a private local input lane, not a speculative placeholder lane.

| Asset lane | Current capability | Needed next | Status |
| --- | --- | --- | --- |
| Buddy body art | Canvas/vector body rendering plus texture-backed skins loaded from imports or `assets/private/manifest.json` | Fill private default-buddy texture/profile pack | Partial |
| Tool sprites/textures | Procedural cosmetic overlays in `main.js` and metadata in `js/content.js` | Add private tool texture mapping support if exact tool art is supplied | Missing |
| Room background | Room palette packs | Add a private room texture/background path if exact backdrop is supplied | Partial |
| UI graphics | CSS/HTML menus | Add reference-matched layout pass and optional private UI skin CSS/assets | Partial |
| Sounds | Synthesized audio presets plus `audioPacks.<id>.samples` file/data-URL overrides | Fill event-to-sample map from private reference files | Partial |

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
