# Decisions

## Product Target

- The current product goal is a high-fidelity, private, offline fan remake of Interactive Buddy's player-facing experience.
- Fidelity work takes priority over broad architecture migration. If a task does not improve parity, verification, or private asset/audio support, it should wait.
- `INTERACTIVE_BUDDY_PARITY.md` is the primary status tracker for 1:1 work.

## Technical Stack

- TypeScript and Vite are the supported project shell.
- Matter.js remains the physics engine because the current clean-room runtime already uses it and has regression coverage.
- LocalStorage remains the persistence layer because the save data is small and fully offline.
- The built app is static and backend-free.

## Migration Strategy

- Keep the existing working JavaScript runtime playable while adding the requested TypeScript module structure.
- Migrate systems incrementally from `main.js` and `js/*.js` into `src/` only when the migration directly supports parity, browser/unit coverage, or a stability issue.
- Prefer small, verified gameplay and UI parity batches over broad rewrites that risk destabilizing physics feel.
- Treat reference capture as a prerequisite for claiming 1:1 completion.
- Treat browser automation as an environment dependency: the repo keeps CDP smoke coverage ready, but this sandbox cannot currently run Chromium renderers because named-pipe/Mojo startup fails with Windows access-denied errors.

## Asset Strategy

- The runtime should support private local asset/audio packs strongly enough that a private offline build can use exact user-supplied visuals and sounds.
- Bundled packs remain fallback content and development fixtures.
- Placeholder audio and visuals are not parity-complete; they stay `Partial` until replaced or verified against the reference target.
