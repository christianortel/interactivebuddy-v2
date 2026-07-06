# Roadmap to 100% 1:1 — Interactive Buddy v1.02

Ordered execution plan from current state to the definition of done. Each item closes
by meeting the tool/system contract in the project charter and flipping its
PARITY_MATRIX row to Verified (evidence + test + side-by-side).

Current state: stage/room/menus/stores/save/audio/economy-core/buddy-core implemented
and evidence-backed; Guns + Grenades/Molotovs/Mines + fire live; first measured
earnings verified ($22 molotov run, EV-0025). All content below exists in decoded or
extractable form in the artifact.

## Phase A — Physics & interaction core (foundation for everything)
1. Full doBodyPhysics port: exact body support (drop the 41.65 stopgap), exact drag
   transmission, awake/unconscious/recovery rules, seizure/modifier handling,
   grabbingMouse (buddy grabs cursor), talking head-bob application, arm ignition
   continuation, punch/collision rv coupling.
2. Collision payouts everywhere: hitTimer anti-farm + addCash(max(3, force*0.02))
   object hits; the 5/1/7/3/15 fixed-award sites (decode contexts); bullet-hit cash
   (doBullets block); remaining velocity Math.min sites.
3. setBuddyXY port: reset/teleport + off-screen recovery.
4. Exact throw release-velocity sampling (decode or clip fixtures).

## Phase B — Finish the 24 remaining item behaviors
5. Hand: None (cursor only), Tickle (reaction + payout), Fist (fist clip, punch1-4
   sounds, measured punch payout min(0.5, dist*0.002)).
6. Explosives: Missiles, Flamethrower (stream ignition; fire sim ready).
7. God Powers: Weak/Strong Gravity Vortex (gravitateToPoint code), Fireballs,
   Explode At Mouse (explode() ready).
8. Guns polish: exact mach spread/str/ric; bulletDrawing trail look; non-Ctrl aim
   branch decode.
9. Objects: Baseballs, Rubber Balls (bouncyball), Bowling Balls (bowlball),
   Infants (baby objectType + sounds).
10. Miscellaneous: Wide/Narrow Nozzle Hose + Fire Hose (water streams, push force,
    fire extinguishing), Medieval Flail (wreckingBall chain physics), Stun Gun
    (shock@70, stun/unconscious).
11. Special: Magical Orb (orb + orbGlow), Gravity Shifter, Radio (radioMusic loop +
    reaction).
    Per item: cursor affordance, activation, physics params, reactions, sounds,
    payouts, numberOfObjects cap/cleanup.

## Phase C — Reactions, mood, faces, voice
12. Sayings extractor → private lane (per-event per-skin text/image bubbles); trigger
    wiring (item-sighted, explosion, fire, tickle...); 1500 ms timeSinceComment gate;
    questionMark image bubble.
13. Face states: enumerate righteye/lefteye/mouth frames (31), map emotion → face,
    blink/idle, hurt/happy/scared; modifier system (setModifier durations).
14. speak() port: per-skin voice sets (sc-*/nd-*), selection + concurrency rules.
15. Emotion decay/recovery rules (decode remaining addEmotion usage).

## Phase D — The 10 modes
16. FPS Counter (fpsText), Open Ceiling, Low Gravity (initPhysics params), NES Style
    Movement (lag), Blood and Gore (genGore port), Alternate Body Physics, Earthquake,
    Dynamic Camera (cam() port), Realistic Pyrotechnics, Scripting Engine Access
    (ShockScript console + create() API + per-frame scripts + script save keys).
    Modes menu checkmarks + modeContainer persistence.

## Phase E — The 11 skins
17. Art extraction pipeline: DefineShape gradient/geometry parser (or Ruffle sprite
    rasterization) → per-skin part art into the private lane.
18. Per-skin behaviors: speech-line sets (private lane), voice sets, specials
    (isAClock etc.), equip/purchase flow.
19. Custom Skin Creator window (350×400) controls + its save format.

## Phase F — Window contents
20. Stats (extract full stats.values key list), Custom Face editor (faceX/Y/Z/R/
    faceText), Physics Tweek sliders (133×225), Help / What's New? / About text
    (private lane, text_mc), ShockScript window (354×506: editor, scriptsList,
    every-frame checkbox, activeScript/activeScriptName persistence).

## Phase G — Visual & UI exactness
21. v2 component look from projector captures: menu metrics, window chrome, store
    inStockList selection UI + Buy control, scrollbars.
22. Effect ports: makeExplosion (3602 B), expLight, fireEffect/fireClip/fireGlowClip,
    gore visuals, water visuals.
23. Item/tool sprite art extraction (fist, pistol, shotgun, mach, stunGun,
    wreckingBall, knife, object sprites) → private lane.
24. Cursor states per item; plusSign/minusSign popup exact behavior; buddy sphere
    gradient extraction; face icon art; drop shadows.

## Phase H — Systems completion
25. Pause key (oPauseKey decode); Settings menu quality/sound entries (doMenus 8909 B
    decode); FPS display formatting; numberOfObjects cap; investigate knife/reminder/
    border clips; Clear File exact confirm flow (dontDoIt).
26. Save exactness: stats persistence, quality settings applied, corrupt-save
    recovery, reset flows.
27. Production polish: drop legacy app from default build; missing-asset diagnostics;
    offline guard.

## Phase I — Verification to "Verified" (runs alongside all phases)
28. Projector capture set (resolves GAP-15): every menu/store/window/skin/tool/
    reaction at native resolution → reference/screens + clips + evidence records.
29. Behavior fixtures from clips (throw arcs, knockback distances, settling, onsets)
    → tune all remaining provisionals within charter thresholds.
30. Test suite: deterministic economy scenarios (exact balances), catalog
    completeness, T-BOOT/T-OFFLINE/T-STEP guards, visual regression triplets for all
    checkpoints.
31. Side-by-side human review; flip matrix rows to Verified; close GAP_LEDGER;
    FINAL_PARITY_REPORT with linked evidence.
32. GAP-14 cleanup + commit strategy.

## External inputs still needed
- A Flash-projector (or period-correct player) capture session for pixel-exact UI
  internals and behavior clips — the one thing Ruffle cannot render (GAP-15). All
  other remaining work is extractable from the artifact already on disk.
