# Private Assets

This folder is the local drop-in lane for the private 1:1 fan build.

Committed files in this folder are only templates. Your real files should stay local and ignored by git:

```text
assets/private/
  manifest.json
  interactive-buddy-private/
    pack.json
    skins/
      buddy-default.png
    rooms/
      default-room.png
    ui/
      menu-bg.png
      shop-bg.png
    audio/
      impact.wav
      explosion.wav
      shock.wav
      tickle.wav
      poke.wav
      slap.wav
      gift.wav
      moneydrop.wav
      treat.wav
      confetti.wav
      boombox.wav
      paint.wav
      frost.wav
      goo.wav
      pulse.wav
      unlock.wav
      select.wav
```

To enable the private pack:

1. Copy `manifest.example.json` to `manifest.json`.
2. Create `interactive-buddy-private/pack.json`, using `pack.example.json` as a starting point.
3. Replace the example `textureDataUrl` and sample data URLs with your private file paths as you add files.
4. Run `npm run build` and start the game. The runtime loads `assets/private/manifest.json` automatically when it exists.

Missing `manifest.json` is fine. The game will silently use the normal bundled packs.

For private sounds, use `audioPacks.<id>.samples` in the pack JSON:

```json
{
  "impact": "assets/private/interactive-buddy-private/audio/impact.wav",
  "explosion": { "src": "assets/private/interactive-buddy-private/audio/explosion.wav", "gain": 0.9 },
  "frost": "assets/private/interactive-buddy-private/audio/frost.wav",
  "moneydrop": "assets/private/interactive-buddy-private/audio/moneydrop.wav"
}
```

Supported sample event keys include the generic fallbacks `impact`, `explosion`, `shock`, `paint`, `unlock`, and `select`, plus exact score/tool events such as `poke`, `slap`, `moneydrop`, `treat`, `confetti`, `heat`, `frost`, `goo`, `pulse`, `firecracker`, `mine`, `stickybomb`, `largebomb`, `wind`, `vacuum`, `conveyor`, and `liquid`. Exact event samples are tried first, then compatible generic samples or synthesized placeholders are used.
