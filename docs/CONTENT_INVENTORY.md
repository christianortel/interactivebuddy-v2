# Content Inventory — Interactive Buddy v1.02 (locked target)

Source of truth: the user-supplied reference artifact (EV-0001, SWF at
`reference/private/interactive-buddy-v1.02.swf`). Roster, categories, prices, and
starting-unlock flags below were extracted from the artifact's own `defineItem` data
table (EV-0007, decoded AVM1 pushes at file offsets 0x14e1a5–0x14e730). Names are exact.
Order below is the data-table order; on-screen ordering must still be confirmed by
runtime capture (assumed identical, marked ⏳ where unconfirmed).

Legend: Owned✓ = `startsOwned=true` flag in the data table. Price is the integer from
the table; on-screen currency formatting is `$X.XX` (EV-0002). Semantics of a nonzero
price on an owned-at-start item (e.g. Grenades) must be confirmed at runtime ⏳.

## Items menu (28 entries, 7 categories)

| # | Category | Name | Price | Start | Behavior notes (to measure) |
| --- | --- | --- | --- | --- | --- |
| 1 | Hand | None | 0 | ✓ | Cursor with no tool ⏳ |
| 2 | Hand | Open Hand | 0 | ✓ | Default tool at boot (EV-0002 status line "$0.00 - Open Hand") |
| 3 | Hand | Tickle | 0 | ✓ | ⏳ |
| 4 | Hand | Fist | 0 | ✓ | ⏳ |
| 5 | Explosives | Grenades | 50 | ✓ | ⏳ |
| 6 | Explosives | Molotov Cocktails | 60 | — | ⏳ |
| 7 | Explosives | Mines | 80 | — | ⏳ |
| 8 | Explosives | Flamethrower | 100 | — | ⏳ |
| 9 | Explosives | Missiles | 100 | — | ⏳ |
| 10 | God Powers | Weak Gravity Vortex | 20 | ✓ | ⏳ |
| 11 | God Powers | Strong Gravity Vortex | 30 | — | ⏳ |
| 12 | God Powers | Fireballs | 40 | — | ⏳ |
| 13 | God Powers | Explode At Mouse | 60 | — | ⏳ |
| 14 | Guns | Pistol | 60 | — | ⏳ |
| 15 | Guns | Shotgun | 100 | — | ⏳ |
| 16 | Guns | Machine Gun | 140 | — | ⏳ |
| 17 | Objects | Baseballs | 15 | ✓ | ⏳ |
| 18 | Objects | Rubber Balls | 20 | — | ⏳ |
| 19 | Objects | Bowling Balls | 40 | — | ⏳ |
| 20 | Objects | Infants | 60 | — | ⏳ |
| 21 | Miscellaneous | Wide Nozzle Hose | 15 | — | ⏳ |
| 22 | Miscellaneous | Narrow Nozzle Hose | 20 | — | ⏳ |
| 23 | Miscellaneous | Medieval Flail | 40 | — | ⏳ |
| 24 | Miscellaneous | Fire Hose | 60 | — | ⏳ |
| 25 | Miscellaneous | Stun Gun | 85 | — | ⏳ |
| 26 | Special | Magical Orb | 160 | — | ⏳ |
| 27 | Special | Gravity Shifter | 240 | — | ⏳ |
| 28 | Special | Radio | 320 | — | ⏳ |

## Skins menu (11 entries)

Internal skin IDs from the data table in parentheses.

| # | Name | Internal ID | Price | Start |
| --- | --- | --- | --- | --- |
| 1 | Buddy | default | 0 | ✓ |
| 2 | Teletubby | teletubby | 60 | — |
| 3 | Maddox | pirate | 60 | — |
| 4 | StrawberryClock | strawberry | 60 | — |
| 5 | Gregor the Goth | goth | 60 | — |
| 6 | Republican | rep | 60 | — |
| 7 | Democrat | dem | 60 | — |
| 8 | Moore | baby | 60 | — |
| 9 | Gates | gates | 60 | — |
| 10 | Tom | tom | 60 | — |
| 11 | Napoleon | nap | 60 | — |

Each skin has associated speech-bubble line sets present in the artifact (see private
dump; creative text stays in the gitignored lane and is loaded from the user's artifact,
not committed).

## Modes menu (10 entries)

| # | Name | Internal ID | Price | Start |
| --- | --- | --- | --- | --- |
| 1 | FPS Counter | fps | 0 | ✓ |
| 2 | Open Ceiling | openCeil | 0 | ✓ |
| 3 | Low Gravity | lowGrav | 20 | — |
| 4 | NES Style Movement | lag | 20 | — |
| 5 | Blood and Gore | gore | 40 | — |
| 6 | Alternate Body Physics | realPhysics | 40 | — |
| 7 | Earthquake | earthquake | 40 | — |
| 8 | Dynamic Camera | dynCam | 40 | — |
| 9 | Realistic Pyrotechnics | pyroMode | 40 | — |
| 10 | Scripting Engine Access... | script | 400 | — |

## Windows (EV-0014 — exact titles and pixel sizes from initMenu)

| Window | Title | Content clip | Size (w×h) | Opened from |
| --- | --- | --- | --- | --- |
| statsWindow | Stats | stats_mc | 300×250 | File → "Stats..." |
| customSkinWindow | Custom Skin Creator | customSkin_mc | 350×400 | Skins → "Create Custom Skins..." |
| skinStoreWindow | Skin Store | skinStore_mc | 335×250 | Skins → "Buy New Skins..." |
| itemStoreWindow | Item Store | itemStore_mc | 335×250 | Items → "Buy New Items..." |
| faceWindow | Custom Face | customFace_mc | 298×406 | Settings → "Custom Face..." |
| scriptWindow | ShockScript Scripting Engine | script_mc | 354×506 | "Scripting Engine Access..." (menu placement ⏳) |
| modeStoreWindow | Mode Store | modeStore_mc | 315×250 | Modes → "Buy New Modes..." |
| physicsTweekWindow | Physics Tweek | physicsTweek_mc | 133×225 | Settings → "Physics..." |
| helpWindow | Help | text_mc | 350×350 | Help → "Help...." |
| updatesWindow | What's New? | text_mc | 350×350 | Help → "What's New?...." |
| aboutWindow | About | about_mc | 200×250 | Help → "About..." |

Windows are mx.containers.Window popups (v2 components) with close buttons; the menu
bar is an mx MenuBar with v2 Halo hover highlighting (M-REF-020). File menu also
contains "Clear File..." (reset save, confirm flow ⏳). Skins/Items/Modes menus are
rebuilt dynamically from owned content plus their store entry (EV-0014).

## Save schema (EV-0015)

`SharedObject.getLocal("daBud")` with keys: cash, item, skin, emotion, faceX, faceY,
faceZ, faceR, faceText, blurLevel, aaQuality, gQuality, physicsQuality, soundOn, stats,
modeContainer, numberOfObjects, activeScript, activeScriptName.

## Other evidenced player-facing surfaces (from UI state flags, EV-0005)

Item store, skin store, mode store windows; stats window (tracked stats include
"Bowling ball knockouts"); help window; about window; updates window; scripting
window (in-game scripting console with documented `create(objectType,...)` API — object
types: baseball, molotov, bowlball, bouncyball, grenade, fireball, mine, baby, orb,
radio, vortex); physics-tweak window; custom-skin window; clear-objects warning dialog;
face menu (top-left face icon); pause (keyboard pause key, "Paused"/"Unpaused").
Top menu bar: File, Skins, Items, Modes, Settings, Help (EV-0002). Version label "1.02"
top-right (EV-0002).

## Still unmeasured (runtime capture needed)

Per-item behavior (targeting, spawn, physics, effects, sounds, payouts, cooldowns);
menu-internal ordering vs data order; store window layouts and purchase flow; File and
Settings menu contents; money payout rules; each mode's exact effect; custom-skin
editor behavior; stats window full field list.
