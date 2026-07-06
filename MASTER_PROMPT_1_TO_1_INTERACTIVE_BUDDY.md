# Original Intent and Upgraded Master Prompt: 1:1 Interactive Buddy

## Reconstructed original prompt

The verbatim first prompt is not stored in this repository. Based on the initial implementation and the project's later parity documents, its core intent can be reconstructed as:

> Build a browser-based remake of Interactive Buddy. Recreate the original room and ragdoll Buddy, let the player grab, drag, throw, poke, slap, tickle, and use the original tools, weapons, explosives, powers, and nice items. Recreate the original menus, item shop, skins, cash earnings, unlock progression, Buddy reactions, sound effects, and physics. It should be a fully playable 1:1 copy of Interactive Buddy that works locally in the browser.

That short prompt left the target version, complete content inventory, exact measurements, evidence requirements, asset/audio inputs, and definition of 1:1 completion unspecified. Use the upgraded prompt below instead.

## Upgraded copy-and-paste prompt

Copy everything below the divider into the other model. Give it this repository too if possible, along with every screenshot, recording, SWF/projector, audio file, or other Interactive Buddy reference you possess and may use. The repository is evidence of prior attempts, not the design target.

---

You are the lead engineer, game designer, technical artist, QA owner, and parity auditor for this project. Build a fully playable, private, offline, browser-based **1:1 copy of the original Interactive Buddy**.

This is not an "Interactive Buddy-inspired" game. It is not a modern reinterpretation, spiritual successor, feature expansion, or generic ragdoll sandbox. The player-facing target is Interactive Buddy itself: its room, Buddy, proportions, menus, categories, items, skins, interaction feel, reactions, economy, unlock flow, effects, sounds, timing, and overall Flash-era presentation.

The current repository contains a failed or incomplete attempt. Inspect it for reusable infrastructure, tests, reference notes, and local asset-loading support, but do not inherit its product decisions merely because they already exist. Replace or remove anything that conflicts with the 1:1 target. Passing the existing tests does not prove parity.

## Non-negotiable outcome

Deliver a complete game that, when shown beside the selected original Interactive Buddy reference build, is recognizably and measurably the same experience.

"Complete" means all of the following:

- The same default room composition, scale, colors, stage bounds, and visual density.
- The same Buddy appearance, body construction, spawn position, size, pose, physics, dragging, throwing, collisions, recovery, facial states, reactions, and idle behavior.
- The same top-level menus, nested submenus, labels, ordering, enable/disable states, controls, cursor behavior, and information hierarchy.
- The same item/tool roster for the selected reference version, grouped and ordered identically.
- The same practical behavior for every tool: targeting, power control, spawn point, speed, mass, bounce, cooldown, lifetime, collision response, effect radius, force, status effect, animation, particles, reaction, sound timing, and payout.
- The same shop/skin store structure, item names, prices, starting money, locked/unlocked state, purchasing behavior, unlock sequence, and money pacing.
- The same skins available in the selected reference version, with the same selection/equip behavior and equivalent local assets supplied by the user where required.
- The same audio event map, timing, layering, relative volume, looping, and interruption behavior when reference audio is supplied.
- The same reset behavior, settings, modes, persistence expectations, and other visible player-facing systems.
- Stable offline operation with no required network, account, backend, analytics, or cloud service.
- Repeatable parity evidence and tests proving the result instead of a written claim that it "feels close."

Do not add missions, XP, combo systems, radial wheels, replay export, modern dashboards, extra rooms, invented tools, invented skins, accessibility overlays, or other new features unless they exist in the selected reference build or are placed behind an optional extras flag that is off by default. The default experience must remain the 1:1 copy.

## First rule: lock the exact reference version

Interactive Buddy existed in more than one release/build. Do not mix content from different versions without documenting it.

Before implementation:

1. Inspect every supplied reference artifact.
2. Identify the exact target version/build if possible.
3. Create `reference/TARGET_BUILD.md` containing:
   - target title and version;
   - source of each reference artifact;
   - reference resolution and frame rate;
   - which screens, menus, tools, skins, sounds, and behaviors are directly evidenced;
   - conflicts between sources;
   - unresolved facts;
   - the rule used to resolve each conflict.
4. Create `reference/evidence-index.json` with one record per screenshot, clip, audio sample, or observation. Each record must include an ID, source path/URL, target version, captured area, timestamp range if applicable, and facts supported.
5. Never silently guess an exact value. Measure it from evidence, isolate it as a clearly labeled provisional value, or ask for the missing reference.

If no executable reference or complete capture set is supplied, do not pretend that an exact 1:1 result has been proven. Continue building everything supported by available evidence, create explicit missing-reference slots, and report the remaining proof gaps precisely. Missing source evidence is not permission to invent a "close enough" replacement.

## Required working method

Use an evidence-first, vertical-slice process:

1. Audit the repo and references.
2. Produce the exact parity inventory and gap ledger.
3. Establish the deterministic runtime and capture harness.
4. Match the default room and Buddy before expanding content.
5. Match hand interaction and core reactions.
6. Match the original menus, item hierarchy, and store.
7. Implement and tune every original tool one category at a time.
8. Match economy and unlock progression from a clean save.
9. Integrate exact user-supplied local art/audio where available.
10. Run automated and side-by-side parity verification.
11. Fix every observable discrepancy.
12. Only then declare the build complete.

Do not spend the project building a long list of approximate tools while the room, Buddy, UI, physics, and economy remain wrong. Finish each parity slice end-to-end before moving on.

## Required audit artifacts

Create and maintain these files from the beginning:

- `reference/TARGET_BUILD.md`
- `reference/evidence-index.json`
- `reference/screens/` for normalized reference images
- `reference/clips/` for named reference clips or clip metadata
- `docs/PARITY_MATRIX.md`
- `docs/MEASUREMENT_LOG.md`
- `docs/CONTENT_INVENTORY.md`
- `docs/ECONOMY_TABLE.md`
- `docs/AUDIO_EVENT_MAP.md`
- `docs/GAP_LEDGER.md`
- `docs/TEST_PLAN.md`
- `docs/FINAL_PARITY_REPORT.md`

`docs/PARITY_MATRIX.md` must contain a row for every player-visible system and every individual tool/skin. Each row needs:

- stable ID;
- exact original name;
- original menu path and order;
- reference evidence IDs;
- measured target values;
- implementation location;
- automated test ID;
- visual comparison ID;
- status: `Unverified`, `Measured`, `Implemented`, `Tuning`, `Verified`, or `Blocked by missing reference`;
- discrepancy notes.

Only `Verified` means done. "Implemented," "playable," "similar," and "test passes" are not synonyms for parity.

## Technology and architecture

Use a maintainable browser stack suitable for deterministic 2D physics:

- TypeScript with strict mode.
- Vite or an equally simple static build tool.
- Matter.js unless a short measured prototype proves another engine matches the reference physics more accurately.
- Canvas 2D or WebGL for the stage; use DOM/CSS for menus only when it improves pixel parity and interaction accuracy.
- A fixed simulation timestep, normally 60 Hz, with rendering interpolation and controlled catch-up.
- One authoritative catalog for tools, menu ordering, prices, unlock rules, sprites, sounds, behavior parameters, and test IDs. Do not duplicate runtime content in separate JavaScript and TypeScript catalogs.
- Explicit state machines for Buddy mood/reactions, tools, menus, store, and save state.
- Seedable randomness for tests and capture reproduction.
- Versioned local save migrations.
- No CDN or runtime network dependency. Vendor dependencies and preserve their licenses.

Keep physics, rendering, input, audio, economy, content data, persistence, and UI separate enough to test independently. Do not over-engineer a server or framework the offline game does not need.

## Coordinate and timing model

Establish one reference coordinate system based on the target build's native stage dimensions. If the target dimensions cannot be established immediately, use a provisional logical stage and mark it unresolved in the measurement log.

- Store all measured positions and sizes in reference-stage units.
- Preserve aspect ratio and scale the entire experience as one composition.
- Letterbox instead of rearranging the original desktop UI.
- Do not create a responsive mobile redesign in the default parity mode.
- Convert pointer input from display coordinates to reference-stage coordinates exactly once.
- Drive physics from fixed simulation time, never raw variable frame delta.
- Record timings in milliseconds and physics values in documented units.

## Default room parity

Match before implementing the full catalog:

- canvas/stage dimensions and aspect ratio;
- top menu height and stage offsets;
- wall, floor, and ceiling collision locations;
- background/floor colors or texture;
- visible borders, gradients, shadows, and empty space;
- Buddy's initial position, scale, orientation, and distance from each boundary;
- original cursor and hover affordances;
- overlays, money display, status text, and any other default HUD elements;
- resizing/letterboxing behavior.

Capture the original and remake at identical logical dimensions. Use image overlays and pixel-difference output. Document areas that must differ only because a user-owned source asset has not yet been supplied.

## Buddy parity

Reconstruct Buddy from measurements, not taste. Record:

- number of rigid bodies;
- body shapes, dimensions, collision masks, and render layers;
- body mass/density, friction, air friction, restitution, inertia, and angular limits;
- joint anchors, length, stiffness, damping, and angular constraints;
- self-collision rules;
- initial pose and spawn transform;
- grab target selection and grab constraint behavior;
- maximum stretch or correction behavior;
- release velocity and throw amplification;
- wall/floor/ceiling collision response;
- off-screen and stuck-body recovery;
- idle motion and delayed reactions;
- facial/skin state transitions;
- hurt, angry, afraid, happy, tickled, shocked, burning, frozen, unconscious, and recovery states if present in the target build;
- reaction priority, duration, cooldown, interruption, and return-to-idle rules.

Create a debug calibration mode that can display bodies, joints, anchors, velocities, collision points, active reaction, and current measured parameters. This mode must be off in normal play and must not change simulation behavior.

## Input parity

Match all original input behavior:

- cursor icon/state over empty stage, Buddy, draggable body part, menu item, locked item, and active tool;
- click, hold, drag, release, mouse movement, and wheel behavior;
- body-part targeting priority;
- drag stiffness and pointer lag;
- throw velocity sampling window and clamping;
- power selection and discrete/continuous steps;
- tool cancellation and menu-open behavior;
- whether actions continue when the pointer leaves the stage;
- keyboard shortcuts only when evidenced in the target build.

Desktop mouse input is the parity target. Touch support may be additive, but it must not alter desktop behavior.

## Original UI and menu parity

Rebuild the menu system exactly for the selected reference version:

- top-level menu labels, widths, order, typography, colors, borders, and hover/pressed states;
- nested submenu hierarchy and opening direction;
- item labels, separators, icons, prices, checkmarks, radio states, locked states, and disabled states;
- click-away, Escape, submenu hover timing, z-index, and stage interaction blocking;
- store/skin store dimensions, tabs/categories, rows/cards, scrolling, purchase confirmation, selected/equipped state, and close behavior;
- money/status placement and formatting;
- dialogs, help/about panels, settings, reset actions, and confirmation flows.

Do not substitute a modern card dashboard, permanent mission sidebar, bottom action rail, or radial wheel unless the target reference actually contains it.

## Complete content inventory

Build `docs/CONTENT_INVENTORY.md` directly from the selected reference version. For every tool or item, record:

- exact name and aliases;
- exact menu path, category, and position;
- starting ownership/unlock state;
- price and prerequisite;
- selection behavior and cursor;
- activation gesture;
- power levels;
- spawned bodies and maximum counts;
- cooldown, ammo, duration, and cleanup rules;
- collision filters;
- visual frames/effects;
- audio events;
- Buddy reaction/state;
- economy events and anti-farming behavior;
- settings or modes that modify it;
- evidence IDs and unresolved facts.

The required categories are whatever the target build proves, not the categories the current repo happens to have. At minimum, investigate Hand/basic interactions, throwable objects, firearms/projectiles, explosives, force/gravity tools, elemental/status tools, environmental/building tools, nice/reward tools, modes, and skins. Include only categories and entries supported by the selected reference.

## Tool implementation contract

Every tool must be a complete behavior, not a colored particle effect with a score tag. A tool is only verified when it matches:

1. Discovery and unlock.
2. Menu placement and selection state.
3. Cursor/aim affordance.
4. Activation gesture.
5. Power behavior.
6. Spawn position and orientation.
7. Physics parameters.
8. Collision behavior.
9. Buddy state/reaction.
10. Visual effect and animation timing.
11. Audio event and timing.
12. Cash award and repeated-use decay.
13. Cooldown/ammo/lifetime.
14. Cleanup/reset behavior.
15. Side-by-side reference test.

Use data-driven definitions only for values and composition. Complex tool logic should remain typed, explicit, and testable. Avoid one giant switch statement and avoid pretending all tools can be represented by the same generic impulse function.

## Economy and progression parity

The remake must reproduce the original economic loop, not add a custom XP/combo layer.

Measure and implement:

- initial money and initial unlocked items;
- exact prices and purchase order constraints;
- money gained from each action at each power level;
- payout timing and on-screen presentation;
- diminishing returns, cooldowns, per-tool caps, recovery bonuses, or variety incentives;
- passive/idle earnings if present;
- skin costs and ownership behavior;
- persistence across reload;
- reset/new-game behavior.

Create deterministic economy scenarios from a clean save. Each scenario must replay a fixed action sequence and assert the final balance, unlock state, and visible feedback against the measured reference result.

## Visual assets, skins, and animation

For a private local build, support user-supplied reference-faithful art without committing unauthorized third-party files to a public repository.

- Create a gitignored `assets/private/` lane for supplied Buddy art, tool art, UI graphics, backgrounds, skin art, and audio.
- Create manifests with stable semantic asset keys so code does not depend on opaque filenames.
- Provide visible development fallbacks, but never claim visual parity while a fallback is active.
- Match source cropping, pivots, dimensions, filtering, transparency, layering, frame timing, and state mapping.
- Do not use screenshots as runtime UI when functional controls are required.
- Do not silently rename, redesign, or replace original skins in the private parity build.
- If an exact asset is unavailable, create a clearly labeled missing-asset entry and continue the runtime integration around it.

## Audio parity

Build an event-driven audio system. `docs/AUDIO_EVENT_MAP.md` must map every evidenced event to:

- reference evidence/sample;
- local asset key;
- trigger condition;
- delay from action/collision;
- gain and relative mix priority;
- loop start/end behavior;
- random variation rule;
- concurrency/voice limit;
- interruption rule;
- fallback state.

Audio must unlock correctly after browser user interaction. Do not use generic synthesized beeps as the final parity audio when exact user-supplied samples exist. A fallback audio pack is allowed for development, but its use must keep the relevant parity rows unverified.

## Save, reset, and offline behavior

- Save only the state the original persists, plus internal version metadata required for safe migration.
- Match purchase, money, skin, settings, room, and session persistence behavior to evidence.
- Match Reset Buddy, Clear Objects, Reset Room, Reset Progress/New Game, and confirmation behavior only where they exist.
- Corrupt or incompatible saves must fail safely and offer recovery.
- The production build must boot and run with the network disabled.
- All private assets must load locally and produce clear missing-file diagnostics.

## Verification harness

Build verification as part of the product, not after it.

### Automated tests

Include:

- unit tests for coordinate transforms, fixed-step timing, tool math, state machines, economy, save migrations, catalog validation, and evidence linkage;
- integration tests for input-to-physics behavior, menu/store flows, every tool's activation/collision/cleanup, progression from a clean save, resets, and offline asset loading;
- browser tests using a real Chromium build;
- deterministic seeded scenarios;
- catalog completeness tests that fail if an inventory item has no implementation, evidence, or test;
- orphan tests that fail if the runtime contains a default-visible tool absent from the reference inventory;
- offline build tests that fail on remote runtime requests.

### Visual regression

At identical logical resolution, capture at least:

- clean default boot;
- every open top-level menu and nested submenu;
- every store category and relevant scroll position;
- every Buddy reaction state;
- every skin;
- every tool at its important activation and impact frames;
- reset/settings dialogs;
- representative low-, medium-, and high-power results.

Produce three images per checkpoint: reference, remake, and difference/overlay. Use masks only for genuinely nondeterministic pixels, document every mask, and keep masks narrow.

### Physics and behavior comparison

For reference clips, mark frame/time and track observable anchors such as head center, torso center, hands, feet, projectile center, and cursor. Compare:

- time to contact;
- peak displacement;
- trajectory;
- rotation;
- bounce height;
- settling time;
- joint extension;
- reaction onset/duration;
- effect and sound onset;
- money awarded.

Store measurements as machine-readable fixtures. Tune parameters against the fixtures rather than by repeatedly saying the result "looks better."

## Acceptance thresholds

Use stricter measured thresholds when the evidence permits. Unless a target-specific threshold is recorded, use these provisional maximums:

- Static layout geometry: within 2 reference pixels for major edges and controls.
- Buddy body/joint anchor positions at rest: within 3 reference pixels.
- Color: visually indistinguishable in side-by-side review; record sampled target colors.
- Menu text/order/state: exact.
- Tool/store roster, labels, menu paths, prices, and unlock state: exact.
- Event and reaction onset: within 50 ms.
- Long animation/reaction duration: within 5%.
- Projectile time-to-contact and peak trajectory: within 5%.
- Throw/bounce peak position and settling time: within 8% across the defined calibration scenarios.
- Economy scenario final balances: exact.
- Save/reset outcomes: exact.
- No uncaught console errors.
- No unexpected network requests.
- Maintain 60 FPS on the agreed test machine during normal play and at least 30 FPS in the documented worst-case object scenario.

A threshold passing is necessary but not sufficient. Final side-by-side human review must also find no material mismatch in the default experience.

## Definition of done

Do not declare completion until:

- one target Interactive Buddy build is explicitly locked;
- every visible reference screen and menu is inventoried;
- every item and skin in that build has a parity row;
- every required row is `Verified`, not merely `Implemented`;
- all exact labels, orders, prices, and unlock states match;
- default boot, Buddy, room, menus, store, and full clean-save progression pass side-by-side review;
- every tool passes selection, behavior, reaction, economy, audio, cleanup, and capture tests;
- all automated tests pass from a clean checkout;
- production runs fully offline;
- private-asset installation is documented and validated;
- `docs/GAP_LEDGER.md` has no unresolved product gaps;
- `docs/FINAL_PARITY_REPORT.md` links every completion claim to evidence and test output.

If missing reference material or unavailable private assets prevent literal proof, do not call the project done. Finish all unblocked engineering, provide a playable build, and end with an exact blocker list containing the missing artifact, affected parity rows, and what must be captured or supplied.

## Progress reporting

At the end of every meaningful work session, report:

- what was measured;
- what was implemented;
- what was verified against which evidence IDs;
- commands/tests run and their results;
- screenshots/diffs produced;
- remaining discrepancies;
- next highest-priority parity slice.

Avoid percentage-complete estimates unless calculated directly from the parity matrix. Never hide blockers behind a large "done" list.

## Initial execution order

Begin now. Do not start by adding more tools.

1. Inspect the repository without trusting its status documents.
2. Inventory all supplied original-game references.
3. Lock the target version in `reference/TARGET_BUILD.md`.
4. Build the evidence index, content inventory, economy table, audio map, parity matrix, and gap ledger.
5. Run the existing app and capture its default boot, menus, Buddy interaction, store, and a representative tool from each category.
6. Compare the attempt against the reference and write a concise architectural keep/replace decision.
7. Establish clean deterministic build/test/capture commands.
8. Complete the first vertical parity slice: native layout, default room, default Buddy, Hand behavior, money display, and original top-menu shell.
9. Present side-by-side captures and measurements for that slice.
10. Continue slice by slice until the entire selected Interactive Buddy build meets the definition of done.

The controlling principle is simple: **if it is visible, audible, interactive, timed, priced, unlocked, or physically observable in the selected Interactive Buddy reference build, reproduce it 1:1 and prove it.**
