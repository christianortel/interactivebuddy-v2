# Reference capture harness

Runs the locked reference artifact (Interactive Buddy v1.02 SWF, gitignored at
`reference/private/interactive-buddy-v1.02.swf`) in a vendored Ruffle player at native
550×400 for measurement and capture. See `reference/TARGET_BUILD.md` for the lock.

## Usage

Interactive session (drive the game manually in a browser):

```
node tests/serve-root.mjs 8642
# open http://127.0.0.1:8642/reference/harness/index.html
```

Automated captures into `reference/screens/` (gitignored):

```
CHROMIUM_PATH=".playwright-browsers/chromium-1217/chrome-win64/chrome.exe" \
  node tests/capture-reference.mjs [--steps steps.json]
```

Steps JSON: array of `{ wait?, move?: [x,y], click?: [x,y], down?: [x,y], up?: true,
shot?: "name" }` in native stage coordinates.

Related extraction tools (run against the SWF):

- `node tests/parse-swf-header.mjs <swf>` — stage size, fps, frame count.
- `node tests/extract-swf-strings.mjs <swf> [minLen]` — printable strings + offsets.
- `node tests/extract-swf-actions.mjs <swf> [grep]` — decoded AVM1 pushes/calls
  (source of the item/skin/mode price tables).

## Known issues

- **GAP-15:** menu panels do not render under Ruffle 0.3.0 (menu-open state latches,
  label highlights, no panel graphics). Menu/store captures are blocked until resolved
  (try newer Ruffle, AVM1 code reading, manual session, or Flash projector cross-check).
- WebGL canvas pixels cannot be probed via drawImage (buffer not preserved); sample
  colors from the PNG captures instead.
- Ruffle fidelity caveat: where behavior is suspect, cross-check against a Flash-era
  projector run and record which player produced each measurement.
