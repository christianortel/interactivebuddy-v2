# Weapon Cosmetics And Effects Audit

This audit confirms every shipped tool has an explicit clean-room visual identity, gameplay effect, scoring/replay hook, and regression coverage. Bundled assets remain original; exact old skins, ripped Flash art, or extracted audio stay private-import-only unless rights are documented.

Status key:

- `Complete`: metadata, visible effect, scoring tags, and regression coverage exist.
- `Needs expansion`: the tool works, but should receive a richer variant in a future content batch.

| Tool | Cosmetic/effect identity | Scoring and replay hooks | Regression coverage | Status |
| --- | --- | --- | --- | --- |
| Open Hand | Buddy contact highlight, grab/flick motion, tickle burst | `throw`, `tickle`, `hand` | Hand flick and wall recovery | Complete |
| Ball | `ball-basic` round prop metadata with highlight/rim overlay | `throw`, `blunt`, `toy` | Ball launch scoring and spawned prop metadata | Complete |
| Beach Ball | `beach-ball-striped` overlay | `beachball`, `propVariant` | Prop throw regression | Complete |
| Bowling Ball | `bowling-classic` highlight and finger-hole overlay | `bowling`, `propVariant` | Prop throw regression | Complete |
| Foam Brick | `foam-brick-lined` mortar/chip overlay | `throw`, `object` | Prop throw regression | Complete |
| Boxing Glove | `glove-laced` cuff/lace overlay | `punch`, `propVariant` | Prop throw regression | Complete |
| Fan | Cyan force cone | `wind`, `force` | Tool effects regression | Complete |
| Paintball | `paintball-splat` projectile metadata, decal/tint on hit | `paintball`, `paint` | Tool effects regression | Complete |
| Foam Dart | `foam-dart` tip/fin/stripe metadata, sticky state | `dart`, `dartHit`, `foamDart` | Tool effects regression | Complete |
| Cork Popper | `cork-popper` ring/fleck/cap overlay | `cork`, `corkHit`, `corkPopper` | Tool effects regression | Complete |
| Plunger Shot | `plunger-shot` suction-cup overlay and temporary Buddy suction status | `plunger`, `plungerHit`, `suction` | Tool effects and Suction Drill challenge | Complete |
| Rubber Blaster | `rubber-pellet` rotating variants and burst HUD | `rubber`, `beadCannon` | Tool effects and Bead Cannon challenge | Complete |
| Heat Cone | Reduced-flash ember cone | `heat`, `elemental` | Tool effects regression | Complete |
| Spark Wand | Cursor-to-body bolt arcs | `spark`, `sparkWand` | Spark Drill regression | Complete |
| Frost Puff | Temporary frost body status and mist | `frost`, `frostPuff`, `cold` | Frost Test regression | Complete |
| Goo Mist | Temporary goo body status and slippery physics | `goo`, `gooMist`, `slippery` | Slip Test regression | Complete |
| Pulse Beam | Temporary lit body status and narrow beam | `pulse`, `pulseBeam`, `light` | Pulse Check regression | Complete |
| Grenade | `grenade-shell` body metadata, timed burst | `armed`, `explosion` | Tool effects regression | Complete |
| Trampoline | `trampoline-pad` builder metadata, high-bounce pad | `build`, `builder` | Tool effects regression | Complete |
| Stage Weight | `stage-weight-anvil` bevel/stamp overlay | `throw`, `heavy` | Prop throw regression | Complete |
| Elastic Rope | Ceiling tether constraint line | `tether`, `builder`, `force` | Tool effects regression | Complete |
| Water Fill | Liquid room fill with type-specific physics | `liquid`, `builder` | Liquid use and Liquid Control challenge | Complete |
| Gift Box | `gift-box` ribbon/bow metadata and happy mood | `gift`, `happy` | Tool effects regression | Complete |
| Confetti Popper | `confetti-popper` popper metadata, colored particles, cheerful bump | `confetti`, `happy`, `nice` | Tool effects and Cheer Check challenge | Complete |
| Tesla Coil | `tesla-coil` coil/core metadata and bolt particles | `shock`, `stun` | Tool effects regression | Complete |
| Black Hole | Gravity ring field and orbit arc | `gravity`, `force` | Tool effects regression | Complete |

Next audit improvement:

- Keep this table in sync with `TOOL_EFFECT_AUDIT` in `js/content.js`.
- Any new tool must land with metadata, visible effect hooks, scoring tags, direct browser regression, and matrix/tracker updates in the same queue item.
