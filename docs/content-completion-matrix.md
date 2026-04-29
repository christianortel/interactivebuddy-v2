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
| Early desktop menu bar | File, Skins, Items, Modes, Settings, Help style top UI | Shipped | Visual regression | Add fuller nested item browser only if useful. |
| Money from interaction | Cash, XP, combo, anti-grind scoring | Shipped | Browser regression | Tune economy after larger content set. |
| Buy unlocks | Shop grid for tools and skins | Shipped | Browser regression | Add shop filtering once item count grows. |
| Mood face | Mood readout and face icon | Shipped | Browser regression observes state changes | Add more expressive speech bubbles. |
| Ragdoll made of simple shapes | Smaller lower-left classic-scale Matter.js buddy with looser constraints and glossy segmented classic overlay | Shipped | Browser regression and visual baselines | Add optional soft-body visual pass only after more classic behavior is stable. |
| Skins store | Built-in skins plus asset-pack skins | Shipped | Browser regression | Add skin categories and previews. |
| Local save | Versioned localStorage save, import/export | Shipped | Browser regression | Add preset compatibility versioning. |
| Replay/export | Rolling WebM replay export | Shipped | Browser regression | Add GIF/MP4 export later. |
| Offline local play | Vendored Matter.js runtime loaded from `vendor/matter.min.js` | Shipped | Browser regression and source scan | Keep future third-party runtime assets vendored with licenses. |

## Tools And Effects

| Original-era reference | Buddy Lab 2026 equivalent | Status | Verification | Remaining work |
| --- | --- | --- | --- | --- |
| Open Hand | Hand grab, drag, flick, throw | Shipped | Browser regression | Continue feel tuning after playtest. |
| Tickle | Quick-tap Hand tickle reaction | Shipped | Browser regression through scoring/missions | Add a dedicated Tickle subtool if menu parity becomes priority. |
| Fist | Boxing Glove padded punch projectile with laced cosmetic overlay | Shipped | Browser regression | Add a true close-range punch subtool only if menu parity becomes priority. |
| Grenades | Grenade timed explosion | Shipped | Browser regression | Add grenade variants. |
| Bowling ball / heavy prop | Ball, Beach Ball with striped bouncy cosmetic overlay, Bowling Ball with classic hole/highlight cosmetics, Foam Brick with lined cosmetic overlay, Stage Weight with anvil cosmetic overlay, Prop Tricks challenge hooks | Shipped | Browser regression | Add more prop types only after projectile variant polish stabilizes. |
| Machine gun / rapid projectile | Rubber Blaster rapid pellet stream, Foam Dart sticky projectile, Cork Popper pop-impact projectile, Plunger Shot suction projectile, Star Launcher spin projectile, burst/cooldown HUD, Bead Cannon/Suction Drill/Spin Drill mission/challenge hooks, Dart Board mission, Cork Shots mission, three pellet visual variants | Shipped | Browser regression | Add more projectile variants only after nice-tool-later and classic parity checks stay stable. |
| Paint/projectile play | Paintball with decals/tint | Shipped | Browser regression | Add paint color picker or splatter decals. |
| Gravity vortex | Black Hole pull/orbit force | Shipped | Browser regression | Add visual strength rings and cooldown tuning. |
| Fire / heat | Heat Cone reduced-flash ember cone | Shipped | Browser regression | Add flame/ignite variants only after accessibility review. |
| Shock / electricity | Tesla Coil and Spark Wand handheld arcs | Shipped | Browser regression | Add additional chain variants only after stability review. |
| Cold / frost / goo / light | Frost Puff reduced-flash mist with chilled body overlays, Goo Mist slippery coating with lowered friction, Pulse Beam narrow low-flash energy beam with lit-body status and steady push | Shipped | Browser regression | Audit all shipped weapon cosmetics/effects before adding more variants. |
| Builders / environment | Trampoline, Rope, Water Fill | Shipped | Browser regression | Add platforms, conveyor, and prop spawners. |
| Nice/good powers | Gift Box, Confetti Popper, and Boombox with Cheer Check and Groove Check mission/challenge hooks | Shipped | Browser regression through direct tool effects, Cheer Check completion, and Groove Check completion | Add money variants only after projectile follow-up stabilizes. |
| Alternate physics modes | Slow motion, ceiling toggle, Gravity submenu, liquid types, Robot heavy physics, Gelatin bouncy physics | Shipped | Browser regression for settings, gravity, skin physics, and liquids | Add more skin physics only after more skins justify it. |
| Scripting engine / modding | JSON asset packs and private imports | Partial | Unit and browser regression | Add scriptable tool schema later. |
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
| Blank gray room | Base Lab and Classic Desktop | Shipped | Visual regression | Add optional old-menu wallpaper variants later. |
| Environment/room upgrades | Neon Lab, Retro Office, Classic Arcade, Classic Desktop, Workshop Garage, and Dojo Studio palettes plus live preview swatches and motif mini-room thumbnails | Shipped | Asset validation plus browser regression for default, selected, private import, and reload paths | Add more room presets only when they include original room motifs. |
| Skin voice/SFX swaps | Audio packs: Classic, Arcade, Sci-Fi, Soft, Neon Pulse, Office Click, Cabinet Thunk, Desktop Tap, Workshop Clack, Dojo Tap | Partial | Browser regression | Add per-skin voice bark hooks. |
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

1. `Nice Tool Later`: add a money-style nice tool only after projectile follow-up, and only with mood, scoring, visible effects, shop/radial behavior, audit metadata, and regression coverage.
2. `Room Preset Expansion Later`: add another room only after the next tool follow-ups, and only when it includes an original motif, pack metadata, preview thumbnails, selection/reload behavior, asset validation, and regression coverage.

## Audit Rules

- Add every shipped tool or skin to this matrix before marking the content batch done.
- Add direct browser behavior coverage for every new tool.
- Run `tests/run-regression.ps1 -Visual` before moving a content batch from `Planned` to `Shipped`.
- Keep exact old skins out of bundled packs unless rights are explicitly documented.
- Keep offline play intact by avoiding CDN/runtime network dependencies in shipped browser code.
- Keep `TOOL_EFFECT_AUDIT` and `docs/weapon-cosmetics-effects-audit.md` complete before adding new tools.
