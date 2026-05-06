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

Required `room` fields:

- `background`
- `grid`
- `floor`
- `accent`

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
- Supported high-value event keys include `impact`, `explosion`, `shock`, `tickle`, `gift`, `boombox`, `paint`, `unlock`, and `select`.
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
        "explosion": { "src": "data:audio/wav;base64,...", "gain": 0.85, "playbackRate": 1 }
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
      "accent": "#ffd27a"
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
