# Weapon Cosmetics And Effects Audit

This audit confirms every shipped tool has an explicit clean-room visual identity, gameplay effect, scoring/replay hook, and regression coverage. Bundled assets remain original; exact old skins, ripped Flash art, or extracted audio stay private-import-only unless rights are documented.

Status key:

- `Complete`: metadata, visible effect, scoring tags, and regression coverage exist.
- `Needs expansion`: the tool works, but should receive a richer variant in a future content batch.

| Tool | Cosmetic/effect identity | Scoring and replay hooks | Regression coverage | Status |
| --- | --- | --- | --- | --- |
| Open Hand | Buddy contact highlight, grab/flick motion, quick-tap tickle fallback | `throw`, `tickle`, `hand` | Hand flick and wall recovery | Complete |
| Poke | Small contact burst, single-part nudge, surprised reaction | `poke`, `hand`, `basic` | Unit/runtime helper checks plus static smoke; direct browser behavior pending automation restore | Needs expansion |
| Slap | Broad contact burst, drag-direction shove, slapstick spin, angry reaction | `slap`, `hand`, `basic`, `blunt` | Unit/runtime helper checks plus static smoke; direct browser behavior pending automation restore | Needs expansion |
| Tickle | Happy contact burst and quick low-force tickle impulse | `tickle`, `happy`, `hand`, `basic` | Unit/runtime helper checks plus static smoke; direct browser behavior pending automation restore | Needs expansion |
| Ball | `ball-basic` round prop metadata with highlight/rim overlay | `throw`, `blunt`, `toy` | Ball launch scoring and spawned prop metadata | Complete |
| Beach Ball | `beach-ball-striped` overlay | `beachball`, `propVariant` | Prop throw regression | Complete |
| Bowling Ball | `bowling-classic` highlight and finger-hole overlay | `bowling`, `propVariant` | Prop throw regression | Complete |
| Foam Brick | `foam-brick-lined` mortar/chip overlay | `throw`, `object` | Prop throw regression | Complete |
| Crate | `crate-cross` wooden box metadata with cross-brace overlay | `crate`, `object`, `propVariant` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Boxing Glove | `glove-laced` cuff/lace overlay | `punch`, `propVariant` | Prop throw regression | Complete |
| Fan | Cyan force cone | `wind`, `force` | Tool effects regression | Complete |
| Paintball | `paintball-splat` projectile metadata, decal/tint on hit | `paintball`, `paint` | Tool effects regression | Complete |
| Foam Dart | `foam-dart` tip/fin/stripe metadata, sticky state | `dart`, `dartHit`, `foamDart` | Tool effects regression | Complete |
| Cork Popper | `cork-popper` ring/fleck/cap overlay | `cork`, `corkHit`, `corkPopper` | Tool effects regression | Complete |
| Plunger Shot | `plunger-shot` suction-cup overlay and temporary Buddy suction status | `plunger`, `plungerHit`, `suction` | Tool effects and Suction Drill challenge | Complete |
| Star Launcher | `star-shot` spinning foam star overlay and temporary Buddy spin status | `star`, `starHit`, `starShot` | Tool effects and Spin Drill challenge | Complete |
| Cannonball | `cannonball-iron` heavy projectile metadata with shine/scuff overlay | `cannonball`, `projectile`, `heavy` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Rubber Blaster | `rubber-pellet` rotating variants and burst HUD | `rubber`, `beadCannon` | Tool effects and Bead Cannon challenge | Complete |
| Heat Cone | Reduced-flash ember cone | `heat`, `elemental` | Tool effects regression | Complete |
| Spark Wand | Cursor-to-body bolt arcs | `spark`, `sparkWand` | Spark Drill regression | Complete |
| Frost Puff | Temporary frost body status and mist | `frost`, `frostPuff`, `cold` | Frost Test regression | Complete |
| Goo Mist | Temporary goo body status and slippery physics | `goo`, `gooMist`, `slippery` | Slip Test regression | Complete |
| Pulse Beam | Temporary lit body status and narrow beam | `pulse`, `pulseBeam`, `light` | Pulse Check regression | Complete |
| Firecracker | `firecracker-tube` timed spark prop metadata | `firecracker`, `explosion` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Grenade | `grenade-shell` body metadata, timed burst | `armed`, `explosion` | Tool effects regression | Complete |
| Mine | `mine-button` low puck metadata with trigger button | `mine`, `explosion` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Sticky Bomb | `sticky-bomb` compact explosive metadata with optional attached constraint | `stickybomb`, `explosion` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Cartoon Bomb | `large-cartoon-bomb` wide-burst clean-room bomb metadata | `largebomb`, `explosion` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Trampoline | `trampoline-pad` builder metadata, high-bounce pad | `build`, `builder` | Tool effects regression | Complete |
| Platform | `platform-plank` ledge metadata with stripe/rivet overlay | `platform`, `builder` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Bumper | `bumper-ring` high-bounce circle metadata with ring/core overlay | `bumper`, `builder`, `bounce` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Conveyor Belt | `conveyor-belt` moving builder metadata with animated arrows | `conveyor`, `builder`, `force` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Stage Weight | `stage-weight-anvil` bevel/stamp overlay | `throw`, `heavy` | Prop throw regression | Complete |
| Elastic Rope | Ceiling tether constraint line | `tether`, `builder`, `force` | Tool effects regression | Complete |
| Water Fill | Liquid room fill with type-specific physics | `liquid`, `builder` | Liquid use and Liquid Control challenge | Complete |
| Gift Box | `gift-box` ribbon/bow metadata and happy mood | `gift`, `happy` | Tool effects regression | Complete |
| Money Drop | `money-drop` bill bundle metadata, coin particles, and happy/cash feedback | `moneydrop`, `cash`, `happy`, `nice` | Unit/runtime coverage plus static smoke for Bonus Drop mission/challenge content; direct browser behavior still pending automation restore | Needs expansion |
| Treat | `treat-cookie` snack metadata, crumb particles, and happy bump | `treat`, `happy`, `nice` | Unit metadata and manual smoke pending browser automation restore | Needs expansion |
| Confetti Popper | `confetti-popper` popper metadata, colored particles, cheerful bump | `confetti`, `happy`, `nice` | Tool effects and Cheer Check challenge | Complete |
| Boombox | `boombox` speaker metadata, music-note particles, rhythmic happy pulses | `boombox`, `music`, `happy`, `nice` | Tool effects and Groove Check challenge | Complete |
| Tesla Coil | `tesla-coil` coil/core metadata and bolt particles | `shock`, `stun` | Tool effects regression | Complete |
| Vacuum | Inward cyan force field and suction particles | `vacuum`, `force` | Unit audit and manual smoke pending browser automation restore | Needs expansion |
| Repulsor | Yellow radial force ring and outward shove | `repulsor`, `force` | Unit audit and manual smoke pending browser automation restore | Needs expansion |
| Magnet | Pink magnetic pull field targeting heavy loose props | `magnet`, `force` | Unit audit and manual smoke pending browser automation restore | Needs expansion |
| Black Hole | Gravity ring field and orbit arc | `gravity`, `force` | Tool effects regression | Complete |

Next audit improvement:

- Keep this table in sync with `TOOL_EFFECT_AUDIT` in `js/content.js`.
- Any new tool must land with metadata, visible effect hooks, scoring tags, direct browser regression, and matrix/tracker updates in the same queue item.
