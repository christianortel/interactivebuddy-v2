# Gap Ledger

Every known gap between the repository and the 1:1 target. A gap closes only with linked
evidence + implementation + test. Ordered by severity.

| ID | Gap | Severity | State | Owner artifact |
| --- | --- | --- | --- | --- |
| GAP-01 | ~~No reference artifacts exist.~~ PARTIALLY CLOSED 2026-07-03: user-designated SWF v1.02 + archival screenshots acquired and verified (EV-0001..EV-0007); rosters/prices/stage/fps measured. STILL OPEN: native runtime captures (menus, stores, behaviors, clips, audio) via the Ruffle harness. | Blocker → High | PARTIAL | reference/TARGET_BUILD.md |
| GAP-02 | Product identity. PROGRESS 2026-07-03: default page (index.html) is now the parity shell runtime (src/parity); "Buddy Lab 2026" moved off the default path to legacy.html pending full replacement/removal. Remaining: legacy app still ships in the build; remove once parity content supersedes it. | High (was Blocker) | PARTIAL | docs/ARCHITECTURE_DECISION.md |
| GAP-03 | ~~Stage/coordinate model.~~ CLOSED for the parity runtime 2026-07-03: src/parity implements 550×400 reference units, single display transform, uniform letterbox, fixed 40 Hz loop (EV-RMK-0002). The legacy app (legacy.html) remains nonconforming by design. | Closed | CLOSED | src/parity/stage.ts, loop.ts |
| GAP-04 | Economy is invented (start $75, XP, combos, mission rewards, invented prices). Original loop unmeasured. | Blocker | OPEN | ECONOMY_TABLE |
| GAP-05 | UI shell (File/Skins/Items/Modes/Settings/Help menu bar, HUD, side panel, tool rail) has no evidence basis. | Blocker | OPEN | PARITY_MATRIX SYS-MENU/SYS-HUD |
| GAP-06 | Dual content catalogs disagree: js/content.js (46 tools) vs src/data/tools.ts (45). Violates single-authoritative-catalog rule. | High | OPEN | ARCHITECTURE_DECISION |
| GAP-07 | Committed HEAD (a9d99da) does not boot (`hasUserActivation` ReferenceError) while all unit suites pass — test suite cannot detect boot failure. | High | PARTIAL — boot fixed in working tree 2026-07-03; a boot-integrity browser test is still missing | TEST_PLAN T-BOOT |
| GAP-08 | Physics stepping uses default Matter Runner; fixed-60Hz-with-interpolation architecture not established or tested. | High | OPEN | TEST_PLAN T-STEP |
| GAP-09 | Buddy is an invented ragdoll (scale 0.78, invented masses/joints); original construction unmeasured. | High | OPEN | MEASUREMENT_LOG M-REF-004/007 |
| GAP-10 | Audio is synthesized placeholders; no event map measured. | High | OPEN | AUDIO_EVENT_MAP |
| GAP-11 | Save schema persists foreign state (XP, missions, challenge modes); original persistence behavior unmeasured. | Medium | OPEN | PARITY_MATRIX SYS-SAVE |
| GAP-12 | No reference capture/comparison harness (side-by-side, overlays, pixel diff, clip tracking). | Medium | OPEN — plan in `reference/harness/README.md` | TEST_PLAN |
| GAP-13 | Visual baselines in tests/baselines/ codify the invented UI (radial wheel, shop cards) and will be invalidated wholesale. | Medium | OPEN | TEST_PLAN |
| GAP-14 | Repo hygiene: untracked experiment dirs (codex-*, gitdir-*, notgit, browser profiles) and stray logs clutter the root. | Low | OPEN | — |
| GAP-15 | Ruffle harness: menu panels do not render. ROOT CAUSE FOUND 2026-07-03: the game's menus/windows are Flash MX 2004 v2 components (mx MenuBar/Menu, Window, PopUpManager), which Ruffle (0.3.0 and 0.4.0-nightly.2026.7.2 both tested) does not execute correctly (stack underflow + enumerate-undefined warnings; dropdown/panels never attach). Menu/store VISUAL captures therefore need a Flash-era projector run; meanwhile bytecode mining supplies exact values (M-REF-020..024). | High | ROOT-CAUSED — visual capture path pending | reference/harness README |

Resolved entries move to a "Closed" section with their closing evidence and test IDs.
None closed yet.
