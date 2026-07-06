# Target Build Lock

## Status: LOCKED — Interactive Buddy v1.02

Locked 2026-07-03 on user-supplied artifact selection. In-game version label "1.02"
visible top-right of the boot screen (EV-0002) matches the artifact title.

| Field | Value | Basis |
| --- | --- | --- |
| Title | Interactive Buddy | Artifact + boot screen |
| Author | Shock Value (Justin Goncalves) | Artifact title/general knowledge |
| Target version | v1.02 | EV-0002 corner label; artifact item title |
| Platform | Flash, SWF version 8, uncompressed FWS | EV-0006 header parse |
| Native stage | **550 × 400 px** (11000×8000 twips) | EV-0006 |
| Native frame rate | **40 fps** | EV-0006 |
| Root timeline frames | 42 | EV-0006 |
| File size / MD5 | 1,553,105 bytes / `baac2b44de9b49edd1167ada11526625` | EV-0001, matches archive.org metadata |

## Source of each reference artifact

| Artifact | Local path (gitignored) | Source |
| --- | --- | --- |
| Game SWF | `reference/private/interactive-buddy-v1.02.swf` | User-designated: archive.org item `interactive_buddy_v_1_02_by_shock_value_d6ma8m` (filename indicates a DeviantArt-distributed copy), downloaded 2026-07-03, MD5-verified |
| Boot screenshot | `reference/private/archive-cover.png` | Same item, `00_coverscreenshot.png` |
| Boot screenshot | `reference/private/archive-screenshot00.png` | Same item, `screenshot_00.png` |
| Animated screenshot | `reference/private/archive-emulator.gif` | Same item, emulator screenshot GIF |
| Strings dump (derived) | `reference/private/strings-raw.txt` | Extracted locally via `tests/extract-swf-strings.mjs` |
| Decoded action pushes (derived) | `reference/private/actions-decoded.txt` | Extracted locally via `tests/extract-swf-actions.mjs` |

The SWF and everything derived from it stay in gitignored lanes. Committed docs carry
only factual measurements (names, prices, dimensions, timings), never embedded assets or
the game's prose text.

## Directly evidenced so far

- Stage size, fps, SWF version (EV-0006).
- Boot composition: top menu bar (File, Skins, Items, Modes, Settings, Help), face icon
  top-left, "1.02" top-right, money/tool status line bottom-left ("$0.00 - Open Hand"),
  sphere-built gray Buddy right-of-center with "…" speech bubble, sage-gray room with
  darker frame (EV-0002/0003/0004).
- Complete item/skin/mode rosters with prices and starting-unlock flags (EV-0007) —
  see `docs/CONTENT_INVENTORY.md`.
- Existence of: item/skin/mode stores, stats window, help/about/updates windows,
  scripting console (with `create()` API), physics-tweak window, custom-skin window,
  clear-objects warning, pause toggle (EV-0005).

## Conflicts between sources

None detected. Single primary artifact; archival screenshots are consistent with it.

## Unresolved facts

- On-screen menu ordering vs data-table ordering (assumed identical, unconfirmed).
- File and Settings menu contents; store window layouts; purchase flow.
- Price semantics for owned-at-start items with nonzero prices.
- All per-item behavior parameters, payouts, reaction timings, sounds.
- Persistence behavior (SharedObject) and reset flows.

## Conflict-resolution rules

1. The locked SWF (run in Ruffle, cross-checked against a Flash-era projector where
   fidelity is suspect) is the top authority; archival captures second; secondary
   sources only for orientation, never for values.
2. Any value not measured from the artifact is labeled `PROVISIONAL` at point of use and
   logged in `docs/MEASUREMENT_LOG.md`.
3. No value is silently guessed.
