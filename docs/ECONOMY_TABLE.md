# Economy Table — Interactive Buddy v1.02 (locked target)

## Measured facts

| Fact | Value | Evidence | Status |
| --- | --- | --- | --- |
| Currency display format | `$X.XX`, bottom-left, followed by ` - <tool name>` | EV-0002 | Measured |
| Money at boot (archival capture) | $0.00 | EV-0002 | Measured (clean-save status ⏳ confirm at runtime) |
| All shop prices (items/skins/modes) | See `docs/CONTENT_INVENTORY.md` tables — items 15–320, skins 60 flat, modes 20–400 | EV-0007 | Measured |
| Starting unlocks | Hand×4 (None/Open Hand/Tickle/Fist), Grenades, Weak Gravity Vortex, Baseballs, skin Buddy, modes FPS Counter + Open Ceiling | EV-0007 | Measured |
| Price semantics for owned-at-start items with nonzero price (Grenades 50, WGV 20, Baseballs 15) | UNKNOWN — confirm in store UI at runtime | — | Open question |

## Still to measure (runtime scenarios against the artifact)

| Fact | Method |
| --- | --- |
| Money per action/impact per item | Scripted runs in reference harness; also recoverable from AVM1 damage→money code |
| Payout timing/presentation | Frame-stepped clips |
| Diminishing returns / anti-farming | Repeated identical action runs |
| Purchase flow (confirmation, refunds?) | Store capture |
| Persistence of money/unlocks across reload (Flash SharedObject) | Reload test in harness |
| Reset/new-game behavior | File menu capture |

## Deterministic scenario contract

Unchanged: clean save → fixed seeded action sequence → assert exact final balance,
unlock state, and payout feedback. Fixtures in `tests/fixtures/economy/` once payout
values are measured.
