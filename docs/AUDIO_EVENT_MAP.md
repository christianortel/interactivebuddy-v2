# Audio Event Map — Interactive Buddy v1.02 (locked target)

Sound assets: 87 sounds extracted from the reference artifact into the user's private
lane (`assets/private/sounds/`, gitignored; `reference/private/sounds/` is the archival
copy) via `tests/extract-swf-sounds.mjs` — 78 MP3 + 9 SWF-ADPCM decoded to WAV.
Runtime: `src/parity/audio.ts` (event-name API, index-resolved files, activation-gated,
missing-file diagnostics). Verified end-to-end 2026-07-03 (EV-0020).

## Measured playSound events (exact names + volumes from call sites, EV-0020)

| Event name | Volume | Trigger (evidenced) | Asset | Status |
| --- | --- | --- | --- | --- |
| register | 100 | Store purchase success (item/skin/mode) | register.wav | Implemented (wired) |
| shotgunFire | 80 | Shotgun fire | shotgunFire.mp3 | Asset ready; item pending |
| pistolFire | 80 | Pistol fire | pistolFire.mp3 | Asset ready; item pending |
| machFire | 80 | Machine Gun fire | machFire.mp3 | Asset ready; item pending |
| explosion | 75 | Explosions | explosion.wav | Asset ready; items pending |
| shock | 70 | Stun Gun / shock | shock.wav | Asset ready; item pending |
| beeper | 75 / 100 | UI/scripting beeps | beeper.wav | Asset ready |
| burnball | 40 / default | Fire ignition | burnball.wav | Asset ready |

## Additional named assets (trigger mapping pending — played via attachSound paths)

punch1–punch4 (impact variations), static, radioMusic (Radio item),
StrawberryClock voice set (30 `sc-*` clips), Napoleon voice set (`nap-dang`, 16 `nd-*`
clips), 5 unnamed internal sounds (`sound-590/595/598/603/607`).

## Still to measure

Per-event trigger conditions and delays for punch/static/voice sets (from
doBodyPhysics/doObjectPhysics call sites); loop behavior for radioMusic/static;
voice-line selection rules per skin/emotion; concurrency/interruption rules; exact
attachSound volume defaults. Timing verification against projector captures remains
required before rows become Verified.
