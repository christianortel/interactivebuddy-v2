# Architectural Keep/Replace Decision (2026-07-03)

Verdict on the existing attempt ("Buddy Lab 2026"): **keep the infrastructure shell,
replace the product entirely.** The attempt is a different game that happens to share a
physics engine with the target; none of its product decisions carry evidentiary weight.

## Keep (infrastructure with reuse value)

| Asset | Why |
| --- | --- |
| Vite + TypeScript strict shell, static offline build | Matches required stack; builds clean |
| Vendored Matter.js + license | Offline rule satisfied; engine choice stays unless a measured prototype beats it |
| Test harness bones: node unit runner, Playwright/CDP browser scripts, python visual-regression scripts | Reusable rails for the parity harness (baselines themselves are invalid, GAP-13) |
| Private asset lane (`assets/private/` gitignored, manifest pattern, semantic keys) | Exactly the required user-supplied-asset mechanism |
| Save versioning/migration scaffolding (`js/storage.js` pattern) | Pattern reusable; schema will be replaced |
| LocalStorage persistence, no backend | Matches offline requirement |

## Replace / remove (product surface with no evidence basis)

| Item | Disposition |
| --- | --- |
| "Buddy Lab 2026" identity, menus, HUD (XP/Combo/Mood/Challenge), side panel, tool rail, radial wheel, replay export, missions/challenges, room packs, invented skins and 46-tool roster | Remove from default experience; nothing returns except re-specified from evidence (optional extras flag only if explicitly requested later) |
| Dual catalogs (`js/content.js` + `src/data/tools.ts`) | Replace with one authoritative typed catalog (GAP-06) |
| 960×640 stage + non-uniform CSS scaling | Replace with reference-stage units + single display transform + letterboxing (GAP-03) |
| Default Matter Runner stepping | Replace with fixed 60 Hz accumulator + render interpolation (GAP-08) |
| Invented economy (start $75, XP, combos, payouts) | Replace with measured economy (GAP-04) |
| Synth audio as final audio | Keep only as flagged dev fallback (GAP-10) |
| Dual runtimes (`main.js` legacy + `src/` partial migration) | Converge on one TypeScript runtime; `main.js` is reference-of-behavior during rewrite, then deleted |

## Rationale

The attempt optimized for adding invented content behind passing unit tests; HEAD did not
even boot (GAP-07), and its status documents claim progress the runtime does not have.
Rebuilding product-out from evidence on the kept rails is cheaper and safer than
retrofitting 46 invented tools into measured behaviors.

## Immediate consequences

1. No new tools/content until the reference lock is confirmed and the first vertical
   slice (stage, room, Buddy, hand, money display, menu shell) is measured.
2. `docs/PARITY_MATRIX.md` supersedes `INTERACTIVE_BUDDY_PARITY.md`;
   `docs/TEST_PLAN.md` supersedes root `TEST_PLAN.md` for parity claims.
3. First engineering slice after evidence arrives: reference coordinate system + fixed
   timestep + boot-integrity test (T-BOOT), then default room/Buddy parity.
