# Content Completion Matrix

This matrix tracks Buddy Lab 2026 against the old Interactive Buddy-style feature set while keeping bundled content legally distinct. Exact skins based on celebrities, named characters, brands, or community personas belong in private user imports unless the project has explicit rights to distribute them.

Status key:

- `Shipped`: implemented and covered by regression or validation.
- `Partial`: implemented, but still missing depth, variants, or dedicated coverage.
- `Planned`: not implemented yet.
- `Private import`: supported through `File > Import Skin Pack`, but not bundled.

## Source Basis

The current audit uses:

- User-supplied screenshots showing the old menu layout, Item categories, Hand submenu, Grenades submenu, settings, modes, and Skin Store entries.
- User requirements in the active project brief.
- Public game-directory descriptions of Interactive Buddy's core loop and example unlocks, including [Grouvee's Interactive Buddy entry](https://www.grouvee.com/games/417164-interactive-buddy/).
- Current repository state in `js/content.js`, `assets/packs`, and browser regression coverage.

Because the original Flash content list is fragmented online, every exact old item or skin should be treated as `Needs source verification` before bundling or cloning behavior.

## Core Systems

| Original-era reference | Buddy Lab 2026 equivalent | Status | Verification | Remaining work |
| --- | --- | --- | --- | --- |
| Single static room | 960x640 Matter.js stage with boundaries | Shipped | Browser and visual regression | Add more room presets. |
| Room recovery controls | Separate Reset Buddy, Clear Objects, and Reset Room controls | Shipped / needs direct browser coverage | Runtime/static/unit checks for controls and feedback; browser coverage pending automation restore | Verify exact old reset/menu behavior against reference captures. |
| Early desktop menu bar | File, Skins, Items, Modes, Settings, Help style top UI, with private `uiTheme.variables` for local menu/HUD skin tuning | Shipped / needs reference tuning | Visual regression for base UI; private theme visual coverage pending browser automation restore | Add fuller nested item browser only if useful. |
| Money from interaction | Cash, XP, combo, anti-grind scoring | Shipped | Browser regression | Tune economy after larger content set. |
| Buy unlocks | Shop grid with All/category tabs for paid tool categories and skins, plus buy/equip states and owned/equipped card indicators | Shipped / needs reference tuning | Unit/runtime checks and browser regression for core buy/equip; static smoke covers card-state CSS; direct tab/card browser coverage pending automation restore | Tune category names/order and prices after reference captures. |
| Mood face / reaction bubble | Mood readout, face icon, classic face overlay, and small on-canvas reaction bubbles above Buddy for happy, startled, angry, elemental, explosive, and nice-tool reactions | Shipped / needs reference tuning | Runtime helper checks and static smoke; direct browser visual coverage pending automation restore | Tune exact bubble text, timing, and placement after reference captures. |
| Ragdoll made of simple shapes | Smaller lower-left classic-scale Matter.js buddy with looser constraints and glossy segmented classic overlay | Shipped | Browser regression and visual baselines | Add optional soft-body visual pass only after more classic behavior is stable. |
| Skins store | Built-in skins plus asset-pack skins with shop color/texture preview cards and explicit equipped-card state | Shipped / needs reference tuning | Runtime/unit/static checks for preview/state metadata and CSS; browser regression pending automation restore | Tune exact skin category order, equipped styling, and preview density after reference captures. |
| Local save/settings | Versioned localStorage save, import/export, saved scene preset, persisted audio volume, camera shake/particle/debug-physics toggles, and Settings > Reset Progress cleanup | Shipped / needs direct settings browser coverage | Runtime/static/unit checks for volume/shake/particle/debug/reset controls and helpers; broader browser regression pending automation restore | Add preset compatibility versioning and direct settings/reset-progress browser/manual coverage. |
| Replay/export | Rolling WebM replay export | Shipped | Browser regression | Add GIF/MP4 export later. |
| Offline local play | Vendored Matter.js runtime loaded from `vendor/matter.min.js` | Shipped | Browser regression and source scan | Keep future third-party runtime assets vendored with licenses. |

## Tools And Effects

| Original-era reference | Buddy Lab 2026 equivalent | Status | Verification | Remaining work |
| --- | --- | --- | --- | --- |
| Open Hand | Hand grab, drag, flick, throw, quick-tap tickle fallback, Buddy hover/grab cursor states, and canvas mouse-wheel power adjustment | Shipped / needs reference tuning | Browser regression for Hand; static and runtime checks for baseline catalog, cursor state, and wheel-power continuity | Continue feel tuning after reference playtest. |
| Poke | Dedicated free Poke basic tool with small contact impulse, surprised reaction, scoring tags, and burst particles | Shipped / needs browser behavior coverage | Unit/runtime helper checks plus static smoke content assertions | Tune exact impulse, cursor behavior, and payout after browser automation or manual reference pass. |
| Tickle | Dedicated free Tickle basic tool plus quick-tap Hand tickle reaction | Shipped / needs browser behavior coverage | Browser regression through old Hand scoring/missions; static smoke content assertions for dedicated tool | Tune exact happy reaction timing against reference. |
| Slap / Fist | Dedicated free Slap basic tool for drag-direction shove and angry reaction; Boxing Glove remains a padded punch projectile with laced cosmetic overlay | Shipped / needs browser behavior coverage | Browser regression for Boxing Glove; unit/runtime helper checks plus static smoke content assertions for Slap | Tune close-range slap/punch feel after reference menu and force capture. |
| Grenades | Firecracker, Grenade, Mine, Sticky Bomb, and Cartoon Bomb timed explosions | Shipped / needs expanded browser coverage for the new explosive batch | Browser regression for Grenade; unit audit plus manual smoke pending for Firecracker/Mine/Sticky Bomb/Cartoon Bomb | Add contact-triggered mine timing after browser automation is restored. |
| Bowling ball / heavy prop | Ball, Beach Ball with striped bouncy cosmetic overlay, Bowling Ball with classic hole/highlight cosmetics, Foam Brick with lined cosmetic overlay, Crate with cross-braced box overlay, Stage Weight with anvil cosmetic overlay, Prop Tricks challenge hooks | Shipped / needs expanded browser coverage for Crate | Browser regression for earlier prop set; unit metadata plus manual smoke pending for Crate | Add more prop types only after projectile variant polish stabilizes. |
| Machine gun / rapid projectile | Rubber Blaster rapid pellet stream, Foam Dart sticky projectile, Cork Popper pop-impact projectile, Plunger Shot suction projectile, Star Launcher spin projectile, Cannonball heavy projectile, burst/cooldown HUD, Bead Cannon/Suction Drill/Spin Drill mission/challenge hooks, Dart Board mission, Cork Shots mission, three pellet visual variants | Shipped / needs expanded browser coverage for Cannonball | Browser regression for earlier projectile set; unit metadata plus manual smoke pending for Cannonball | Add more projectile variants only after nice-tool-later and classic parity checks stay stable. |
| Paint/projectile play | Paintball with decals/tint | Shipped | Browser regression | Add paint color picker or splatter decals. |
| Gravity/force tools | Fan, Vacuum, Repulsor, Magnet, and Black Hole pull/orbit force | Shipped / needs expanded browser coverage for the new force batch | Browser regression for Fan/Black Hole; unit audit plus manual smoke pending for Vacuum/Repulsor/Magnet | Add visual strength rings and cooldown tuning. |
| Fire / heat | Heat Cone reduced-flash ember cone | Shipped | Browser regression | Add flame/ignite variants only after accessibility review. |
| Shock / electricity | Tesla Coil and Spark Wand handheld arcs | Shipped | Browser regression | Add additional chain variants only after stability review. |
| Cold / frost / goo / light | Frost Puff reduced-flash mist with chilled body overlays, Goo Mist slippery coating with lowered friction, Pulse Beam narrow low-flash energy beam with lit-body status and steady push | Shipped | Browser regression | Audit all shipped weapon cosmetics/effects before adding more variants. |
| Builders / environment | Trampoline, Rope, Water Fill, Platform, Bumper, and Conveyor Belt | Shipped / needs expanded browser coverage for the new builder batch | Browser regression for Trampoline/Rope/Water; unit metadata plus manual smoke pending for Platform/Bumper/Conveyor | Add prop spawners and richer room gadgets. |
| Nice/good powers | Gift Box, Money Drop, Treat, Confetti Popper, and Boombox with Cheer Check, Bonus Drop, and Groove Check mission/challenge hooks | Shipped / needs expanded browser coverage for Money Drop and Treat | Browser regression covers direct Gift/Confetti/Boombox effects plus Cheer Check and Groove Check completion; static smoke and unit/runtime checks cover Money Drop's Bonus Drop content hook while browser automation is blocked | Add direct Money Drop and Treat browser behavior coverage after browser automation is restored. |
| Alternate physics modes | Slow motion, ceiling toggle, Gravity submenu, liquid types, Robot heavy physics, Gelatin bouncy physics | Shipped | Browser regression for settings, gravity, skin physics, and liquids | Add more skin physics only after more skins justify it. |
| Scripting engine / modding | JSON asset packs, private imports, exact-event audio sample overrides, private room/UI theming, and private `toolTextures` for spawned prop/tool art | Partial | Unit tests, runtime helper checks, static smoke, and asset validation; direct browser visual coverage pending automation restore | Add scriptable tool schema later. |
| Weapon cosmetics/effects audit | Every shipped tool has `TOOL_EFFECT_AUDIT` metadata, visible effect identity, scoring tags, and direct regression coverage | Shipped | Unit checks, browser regression, and `docs/weapon-cosmetics-effects-audit.md` | Keep synchronized as new tools ship. |

## Skins

Bundled skins must be original. Exact references are supported only as private imports unless rights are secured.

| Old Skin Store reference | Bundled equivalent | Status | Distribution guidance | Remaining work |
| --- | --- | --- | --- | --- |
| Classic gray buddy | Classic Buddy with glossy gray segmented overlay and simple mood face | Shipped | Bundled | Continue feel tuning after user playtest. |
| Maddox | None | Private import | User-owned/private JSON only unless rights are secured | Add a legally distinct "Blog Ranter" parody-style skin if desired. |
| Gaes | None | Private import | Needs source verification and rights review | Document if a user supplies asset privately. |
| Tom | Everyday Pal | Shipped as legally distinct | Ambiguous name; do not bundle exact likeness | Private imports can use user-owned exact art locally. |
| StrawberryClock | Fruit Clock | Shipped as legally distinct | Community persona; do not bundle exact asset | Private imports can use user-owned exact art locally. |
| Napoleon | Dance Kid | Shipped as legally distinct | Bundled equivalent must avoid exact likeness/name | Private imports can use user-owned exact art locally. |
| Gregor the Goth | Gloom Friend | Shipped as legally distinct | Named character/persona; do not bundle exact asset | Private imports can use user-owned exact art locally. |
| Republican | Campaign Pal | Shipped as legally distinct | Bundled equivalent must avoid real-party branding | Add alternate nonpartisan campaign variants. |
| Robot | Robot with `robot-heavy` physics | Shipped | Bundled | Add robot-specific audio later. |
| Gelatin/blob | Gelatin Blob with `gelatin-bouncy` physics | Shipped | Bundled | Add optional squishier constraint tuning. |
| Astronaut | Astronaut with `astronaut-float` physics | Shipped | Bundled | Add room/audio pairing. |
| Retro arcade skins | Dance Kid, Campaign Pal, Moon Boot with `moon-boot-spring` physics | Shipped | Bundled, original art | Add more classic-inspired pack skins. |
| Texture-backed pack skins | Circuit Buddy, Hazmat, Intern, CRT | Shipped | Bundled, original art | Add more rooms and texture scale checks. |
| User-provided exact skins | Private imported asset packs | Shipped | Private/local only | Add import examples for multi-skin packs. |

## Rooms, Audio, And Modes

| Original-era reference | Buddy Lab 2026 equivalent | Status | Verification | Remaining work |
| --- | --- | --- | --- | --- |
| Blank gray room | Classic Plain default room plus Classic Desktop | Shipped / needs reference tuning | Static/runtime checks; browser visual refresh pending automation restore | Tune exact default proportions and palette after reference captures. |
| Environment/room upgrades | Neon Lab, Retro Office, Classic Arcade, Classic Desktop, Workshop Garage, and Dojo Studio palettes plus live preview swatches, motif mini-room thumbnails, and private room texture support | Shipped / needs direct room-texture browser coverage | Asset validation plus browser regression for default, selected, private import, and reload paths; room texture rendering pending browser automation restore | Add more room presets only when they include original room motifs. |
| Skin voice/SFX swaps | Audio packs: Classic, Arcade, Sci-Fi, Soft, Neon Pulse, Office Click, Cabinet Thunk, Desktop Tap, Workshop Clack, Dojo Tap, plus exact-event private sample keys for hand/nice/elemental/explosive/force/builder sounds | Partial | Asset validation and runtime helper checks; browser audio timing pending automation/manual reference pass | Add per-skin voice bark hooks and fill private reference samples. |
| Modes menu | Challenge selector, ceiling toggle, replay export, nested Debug submenu | Shipped | Browser regression | Add more old-style mode entries only when tied to behavior. |
| FPS counter | Modes > Debug FPS Counter overlay | Shipped | Browser regression | Tune sampling only if real playtest shows jitter. |

## Bundling Policy

Bundle:

- Original skins, original names, original room palettes, and legally distinct references.
- Mechanics inspired by old categories when implemented with new art, names, tuning, and effects.
- Public-domain or explicitly licensed assets with recorded attribution.

Private import only:

- Exact celebrity likenesses.
- Exact named character skins, including Napoleon-style exact skins.
- Community persona skins such as screenshot-era named entries unless rights are secured.
- Ripped Flash assets, screenshots used as textures, or extracted audio.

## Next Content Batches

1. `Treat Nice Coverage Later`: add direct browser behavior coverage for Treat after browser automation is restored, with mood, scoring, visible effects, shop/radial behavior, audit metadata, and regression coverage.
2. `Room Preset Expansion Later`: add another room only after the next tool follow-ups, and only when it includes an original motif, pack metadata, preview thumbnails, selection/reload behavior, asset validation, and regression coverage.

## Audit Rules

- Add every shipped tool or skin to this matrix before marking the content batch done.
- Add direct browser behavior coverage for every new tool.
- Run `tests/run-regression.ps1 -Visual` before moving a content batch from `Planned` to `Shipped`.
- Keep exact old skins out of bundled packs unless rights are explicitly documented.
- Keep offline play intact by avoiding CDN/runtime network dependencies in shipped browser code.
- Keep `TOOL_EFFECT_AUDIT` and `docs/weapon-cosmetics-effects-audit.md` complete before adding new tools.
