# Parity Test Plan

Supersedes the root `TEST_PLAN.md` (which documents the failed attempt's suites) for all
parity claims. Existing suites remain useful for infrastructure health only; passing them
proves nothing about parity (demonstrated by GAP-07: HEAD passed all suites and did not
boot).

## Layers

1. **Unit** — coordinate transforms (display↔reference units, exactly one conversion),
   fixed-step timing/catch-up, tool math, state machines (mood/tools/menus/store/save),
   economy math, save migrations, catalog validation, evidence linkage.
2. **Integration (browser, real Chromium)** — input→physics behavior, menu/store flows,
   every tool's activation/collision/cleanup, clean-save progression, resets, offline
   asset loading. Seeded, deterministic.
3. **Visual regression** — reference vs remake vs diff triplets at identical logical
   resolution for: clean boot; every menu/submenu; every store page; every reaction
   state; every skin; every tool's key frames; dialogs; low/mid/high power results.
   Masks only for documented nondeterministic pixels.
4. **Behavior comparison** — tracked anchors (head/torso/hands/feet/projectile/cursor)
   against clip-derived fixtures: time-to-contact, peak displacement, trajectory,
   rotation, bounce height, settling time, joint extension, reaction onset/duration,
   effect/sound onset, money awarded.
5. **Guard tests** —
   - T-BOOT: production build boots headlessly with zero uncaught console errors
     (would have caught GAP-07).
   - T-OFFLINE: build serves and runs with network disabled; any remote request fails
     the test.
   - T-CATALOG: every content-inventory entry has implementation + evidence + test;
     fails on orphans (default-visible runtime content absent from the inventory).
   - T-STEP: simulation advances only by fixed steps; frame delta variation does not
     change physics outcomes for a seeded scenario.
   - T-ECON-*: deterministic economy scenarios, exact final balances.

## Acceptance thresholds

As specified in the project mandate (static geometry ≤2 ref px; buddy anchors at rest
≤3 ref px; menu text/order/state exact; rosters/prices exact; event onset ≤50 ms; long
durations ≤5%; projectile TTC/peak ≤5%; throw/bounce/settling ≤8%; economy exact;
save/reset exact; no uncaught errors; no network; 60 FPS normal / ≥30 FPS worst case),
tightened wherever evidence permits. Threshold pass + side-by-side human review both
required.

## Current suite status (2026-07-03)

- `npm run test:unit` — pass (8 modules) — infrastructure only.
- `npm run test:runtime` — pass — infrastructure only.
- `npm run build` — pass (tsc + vite).
- Boot check — fails at HEAD, passes in working tree after fix; no automated coverage yet.
- No parity tests exist yet; they require reference fixtures (GAP-01).
