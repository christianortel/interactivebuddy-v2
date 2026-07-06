# Asset Pack Authoring

Asset packs live under `assets/packs/<pack-id>/` and are discovered through `assets/packs/manifest.json`.

## Pack Structure

```text
assets/packs/my-pack/
  pack.json
  skins/
    my-skin.svg
```

Add live packs to `assets/packs/manifest.json`:

```json
{
  "id": "my-pack",
  "name": "My Pack",
  "path": "assets/packs/my-pack/pack.json"
}
```

## `pack.json`

Required top-level fields:

- `id`: unique pack id. Use lowercase words with hyphens.
- `name`: display name.
- `description`: short author-facing summary.
- `room`: palette used when the asset pack is selected.
- `skins`: at least one skin.
- `audioPacks`: object of optional synthesized audio profiles.

Optional top-level fields:

- `toolTextures`: object that maps a spawned prop cosmetic id, such as `money-drop`, `gift-box`, `grenade-shell`, or `prop_moneydrop`, to a private local or embedded image override.
- `uiTheme`: constrained CSS-variable theme overrides for the shell, HUD, and old-style menus.

Required `room` fields:

- `background`
- `grid`
- `floor`
- `accent`

Optional room texture fields:

- `texture`: local path to `.svg`, `.png`, `.jpg`, `.jpeg`, or `.webp`.
- `textureDataUrl`: embedded `data:image/...` texture for private local imports.
- `textureFit`: `cover`, `contain`, or `auto`; defaults to `cover`.

Room textures are applied as the canvas background behind the physics bodies. The room palette remains the fallback while the image loads or when no image is supplied.

Required skin fields:

- `id`: globally unique id, preferably `pack-id:skin-id`.
- `name`
- `cost`: non-negative integer.
- `color`: fallback body color.
- `accent`: outline/highlight color.
- `description`

Optional skin texture fields:

- `texture`: local path to `.svg`, `.png`, `.jpg`, `.jpeg`, or `.webp`.
- `textureDataUrl`: embedded `data:image/...` texture for private local imports.
- `textureScale`: positive number used by Matter.js sprite rendering.

Optional tool texture fields:

- `texture`: local path to `.svg`, `.png`, `.jpg`, `.jpeg`, or `.webp`.
- `textureDataUrl`: embedded `data:image/...` texture for private local imports.
- `scale`: positive multiplier applied to the spawned physics body's bounds.
- `alpha`: 0-1 opacity.
- `rotationOffset`: radians added to the physics body angle.
- `width` / `height`: optional explicit drawn size in canvas pixels before `scale`.

Tool texture keys should normally use the clean-room cosmetic ids documented in `docs/weapon-cosmetics-effects-audit.md`, for example `ball-basic`, `money-drop`, `sticky-bomb`, or `large-cartoon-bomb`. Body labels such as `prop_moneydrop` are also accepted. If a texture is missing or not loaded yet, the procedural clean-room drawing remains visible as a fallback.

Optional UI theme fields:

- `uiTheme.variables`: object mapping supported CSS variables to string values.
- Supported variables include `--bg`, `--panel`, `--panel-text`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-2`, `--warn`, `--danger`, `--menu-bg`, `--menu-border`, `--menu-panel-bg`, `--menu-panel-border`, `--menu-hover`, `--menu-hover-outline`, `--menu-active`, `--menu-active-edge`, and `--brand-bg`.

The runtime ignores unsupported variables. This keeps private UI tuning local and reviewable while avoiding arbitrary bundled CSS injection.

Required audio pack fields:

- `name`
- `master`
- `pitch`
- `toneWave`
- `impactWave`
- `zapWave`
- `noiseFilter`
- `decay`

Use browser oscillator waveform names for wave fields: `sine`, `square`, `sawtooth`, or `triangle`.

Optional audio sample fields:

- `samples`: object mapping feedback events to local file paths or embedded data URLs.
- Supported high-value event keys include generic fallbacks such as `impact`, `explosion`, `shock`, `paint`, `unlock`, and `select`, plus exact score/tool events such as `poke`, `slap`, `moneydrop`, `treat`, `confetti`, `heat`, `frost`, `goo`, `pulse`, `firecracker`, `mine`, `stickybomb`, `largebomb`, `wind`, `vacuum`, `conveyor`, and `liquid`.
- Exact event samples are tried first. If a pack omits one, the feedback engine falls back to the closest generic sample or synthesized placeholder sound.
- A sample value can be a string path/URL, or an object with `src`, optional `gain`, and optional `playbackRate`.

Example:

```json
{
  "audioPacks": {
    "privateExact": {
      "name": "Private Exact",
      "master": 0.22,
      "pitch": 1,
      "toneWave": "triangle",
      "impactWave": "triangle",
      "zapWave": "square",
      "noiseFilter": 1,
      "decay": 1,
      "samples": {
        "impact": "audio/impact.wav",
        "explosion": { "src": "data:audio/wav;base64,...", "gain": 0.85, "playbackRate": 1 },
        "frost": "audio/frost.wav",
        "moneydrop": "audio/moneydrop.wav",
        "conveyor": "audio/conveyor.wav"
      }
    }
  }
}
```

## Template

A validator-clean template is available at:

```text
assets/packs/template/pack.json
```

The template is not listed in the live manifest, so it will not appear in-game until copied and added to `assets/packs/manifest.json`.

## Private Skin-Pack Import

Use `File > Import Skin Pack` in-game for private or user-provided packs. Imported packs use the same `pack.json` shape as bundled packs, but they do not need to be added to `assets/packs/manifest.json`.

For a persistent private fan-build folder, use `assets/private/manifest.json` instead. It is loaded automatically after the bundled manifest when present, and real private files are ignored by git. Start from:

```text
assets/private/manifest.example.json
assets/private/pack.example.json
```

The importer also accepts a wrapper object with the pack under `pack`:

```json
{
  "pack": {
    "id": "private-pack",
    "name": "Private Pack",
    "description": "Local private skins.",
    "room": {
      "background": "#6f7f76",
      "grid": "#f0f7ef",
      "floor": "#506058",
      "accent": "#ffd27a",
      "textureDataUrl": "data:image/svg+xml;base64,...",
      "textureFit": "cover"
    },
    "skins": [
      {
        "id": "private-pack:local-skin",
        "name": "Local Test Skin",
        "cost": 90,
        "color": "#f0d6aa",
        "accent": "#594532",
        "textureDataUrl": "data:image/svg+xml;base64,PHN2Zy8+",
        "textureScale": 0.72,
        "description": "Private local skin."
      }
    ],
    "toolTextures": {
      "money-drop": {
        "textureDataUrl": "data:image/svg+xml;base64,...",
        "scale": 1,
        "alpha": 1
      }
    },
    "uiTheme": {
      "variables": {
        "--panel": "rgba(246, 248, 241, 0.94)",
        "--accent": "#d8d2b8",
        "--menu-bg": "linear-gradient(#f7f7ee, #d9d8cd)"
      }
    },
    "audioPacks": {
      "privateTone": {
        "name": "Private Tone",
        "master": 0.18,
        "pitch": 1.05,
        "toneWave": "triangle",
        "impactWave": "triangle",
        "zapWave": "square",
        "noiseFilter": 1,
        "decay": 1,
        "samples": {
          "impact": "data:audio/wav;base64,..."
        }
      }
    }
  }
}
```

After import, the pack is selected immediately. Its room palette, skins, and audio packs appear in the regular UI and are stored in the local save payload under `customAssetPacks`, so they survive reloads on the same browser profile.

Use imported packs for private references, fan skins, or user-owned art. Keep bundled repository packs original and legally distinct unless the project has explicit rights to ship the referenced character, celebrity, brand, or asset.

## Embedded Textures

`textureDataUrl` is intended for private imports where the image should travel inside the JSON file. It accepts standard browser data URLs such as:

```text
data:image/svg+xml;base64,...
data:image/png;base64,...
data:image/webp;base64,...
```

Keep embedded textures small because imported pack JSON is persisted in browser local storage. Prefer compact SVG or optimized PNG/WebP assets, and use `textureScale` to fit the texture to the ragdoll bodies.

For bundled packs, prefer `texture` file paths instead. They are easier to review, validate, diff, and cache.

## Validation

Validate all live packs:

```powershell
python .\tests\validate-asset-packs.py --root .
```

Validate a standalone pack before adding it to the manifest:

```powershell
python .\tests\validate-asset-packs.py --root . --pack assets/packs/template/pack.json
```

The validator checks manifest and file-backed packs. Private imported packs with `textureDataUrl` are accepted by the in-game importer and covered by browser regression, but they are not intended to be committed as live manifest entries.
