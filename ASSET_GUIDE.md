# Asset Guide

## Current Asset Goal

The project now has a fidelity-first private fan-remake target. Built-in placeholder packs are useful only as fallback/dev fixtures. Exact-looking visuals and sounds should come from local/private packs supplied by the user and verified against `INTERACTIVE_BUDDY_PARITY.md`.

## Bundled Assets

- Keep bundled SVG, PNG, JSON, and audio metadata locally stored and easy to validate.
- Keep bundled placeholders small and replaceable.
- Do not mark placeholder art/audio as 1:1 complete unless it has been compared against reference evidence.

## Private Local Assets

- Use private asset-pack import for fan-build skins, room visuals, and user-supplied textures.
- Prefer `assets/private/manifest.json`, private non-manifest packs, or import JSON for files that should not become public fixtures.
- Use audio-pack `samples` for local or embedded private sounds before claiming exact sound parity.
- Track every exact asset/sound slot in `INTERACTIVE_BUDDY_PARITY.md` so missing files are visible instead of hidden behind placeholders.

## Private Folder

The runtime automatically attempts to load:

```text
assets/private/manifest.json
```

That file and the private pack folders it points at are ignored by git. Use the committed examples as starting points:

```text
assets/private/manifest.example.json
assets/private/pack.example.json
```

## Skin Packs

Skin packs live under `assets/packs/<pack-id>/` and are registered in `assets/packs/manifest.json`. Each pack may include:

- `pack.json` metadata.
- Original skin SVGs under `skins/`.
- Room palette metadata.
- Audio-pack parameter presets for synthesized sounds.

Private imports can include embedded `textureDataUrl` values for user-owned local content. Keep private fan-build packs out of the live manifest unless they are intended to be bundled fixtures.

## Audio

The runtime supports synthesized Web Audio fallback and audio-pack `samples` overrides. Add local paths or embedded `data:audio/...` URLs under `audioPacks.<id>.samples` for private exact sound replacement.
