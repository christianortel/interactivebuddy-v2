# TODO Backlog

## Highest Priority

- Use `INTERACTIVE_BUDDY_PARITY.md` as the primary product tracker. Do not mark work done unless it moves a row in that file.
- Stop broad TypeScript migration unless the change directly improves 1:1 parity, testability, browser verification, or private asset/audio support.
- Build the reference-backed audit first: original menu hierarchy, shop categories, tool roster, prices, unlock state, buddy reactions, default room layout, and sound timing.
- Run the external CDP workflow from normal PowerShell (`npm run browser:launch-cdp`, then `npm run test:browser-smoke:external`) to confirm browser automation outside the restricted sandbox.
- Keep `npm run build`, `npm run test:unit`, `npm run test:runtime`, `npm run test:assets`, and `npm run test:static-smoke` green while parity work proceeds.
- Fill local/private asset and audio sample packs where exact fan-build visuals or sounds need to be loaded without relying on bundled placeholders.
- Fill `assets/private/manifest.json` and the ignored private pack folder from the committed examples as the exact local assets/sounds become available.

## 1:1 Parity Targets

- Default room: match reference resolution feel, wall/floor proportions, background, buddy starting position, and room scale.
- Buddy physics: tune body sizes, masses, constraints, damping, floor bounce, wall recovery, grab feel, and throw velocity from reference clips.
- Hand menu: implement separately selectable Poke, Slap, Tickle, and Grab behavior if the captured reference menu requires it.
- Items menu: reorder and retune tools to match the captured reference roster, category names, and unlock states.
- Shop: replace current custom economy pacing with reference price/unlock tables after source capture.
- UI: prioritize old Flash-era menu density, dropdown behavior, shop layout, labels, and status readouts over modern convenience UI.
- Assets: support private local/default packs for exact-looking buddy, tool, room, UI, and audio replacements supplied by the user.
- Audio: map exact sound events into audio-pack `samples`; keep synthesized audio as fallback.

## Verification

- Keep `npm run build` green.
- Keep `npm run test:unit`, `npm run test:runtime`, and `npm run test:assets` green.
- Keep `npm run test:static-smoke` green as a non-Chromium dist artifact and local serving check.
- Keep `npm run test:browser-smoke` green after browser automation is restored.
- Keep Playwright browser regression green after the Python Playwright/runtime blocker is resolved.
- Refresh visual baselines only after the corresponding reference target is documented in `INTERACTIVE_BUDDY_PARITY.md`.

## Documentation

- Update `PROJECT_STATUS.md` after each meaningful development step.
- Keep `INTERACTIVE_BUDDY_PARITY.md` aligned with the actual reference evidence and current implementation.
- Keep `docs/content-completion-matrix.md` aligned with shipped parity targets.
- Keep `docs/weapon-cosmetics-effects-audit.md` aligned with tool metadata and tests.
