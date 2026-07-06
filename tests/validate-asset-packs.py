import argparse
import json
from pathlib import Path


REQUIRED_ROOM_KEYS = {"background", "grid", "floor", "accent"}
REQUIRED_AUDIO_KEYS = {"name", "master", "pitch", "toneWave", "impactWave", "zapWave", "noiseFilter", "decay"}
SUPPORTED_SAMPLE_EVENTS = {
    "airborne",
    "armed",
    "beachball",
    "boombox",
    "bowling",
    "build",
    "bumper",
    "cannonball",
    "confetti",
    "conveyor",
    "cork",
    "corkHit",
    "crate",
    "dart",
    "dartHit",
    "explosion",
    "firecracker",
    "float",
    "frost",
    "gift",
    "goo",
    "gravity",
    "heat",
    "impact",
    "largebomb",
    "liquid",
    "magnet",
    "mine",
    "moneydrop",
    "paint",
    "paintball",
    "platform",
    "plunger",
    "plungerHit",
    "poke",
    "pulse",
    "punch",
    "repulsor",
    "rubber",
    "select",
    "shock",
    "slap",
    "spark",
    "star",
    "starHit",
    "stickybomb",
    "tether",
    "throw",
    "tickle",
    "treat",
    "unlock",
    "vacuum",
    "wind",
}
SUPPORTED_IMAGE_TYPES = {".svg", ".png", ".jpg", ".jpeg", ".webp"}
SUPPORTED_UI_THEME_VARIABLES = {
    "--bg",
    "--room",
    "--room-dark",
    "--panel",
    "--panel-text",
    "--ink",
    "--muted",
    "--line",
    "--accent",
    "--accent-2",
    "--warn",
    "--danger",
    "--menu-bg",
    "--menu-border",
    "--menu-panel-bg",
    "--menu-panel-border",
    "--menu-hover",
    "--menu-hover-outline",
    "--menu-active",
    "--menu-active-edge",
    "--brand-bg",
}


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def read_json(path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def resolve_root_path(root, path):
    resolved = Path(path)
    if not resolved.is_absolute():
        resolved = root / resolved
    return resolved.resolve()


def validate_image_source(root, src, label):
    assert_true(isinstance(src, str) and src, f"{label} missing image source")
    if src.startswith("data:image/"):
        return
    image_path = root / src
    assert_true(image_path.exists(), f"Image not found for {label}: {image_path}")
    assert_true(image_path.suffix.lower() in SUPPORTED_IMAGE_TYPES, f"Unsupported image type for {label}")


def validate_pack(root, entry):
    assert_true(entry.get("id"), "Manifest pack entry missing id")
    assert_true(entry.get("name"), f"Manifest pack {entry.get('id')} missing name")
    assert_true(entry.get("path"), f"Manifest pack {entry.get('id')} missing path")

    pack_path = resolve_root_path(root, entry["path"])
    assert_true(pack_path.exists(), f"Pack file not found: {pack_path}")
    pack = read_json(pack_path)

    assert_true(pack.get("id") == entry["id"], f"Pack id mismatch for {entry['id']}")
    assert_true(pack.get("name"), f"Pack {entry['id']} missing name")
    assert_true(isinstance(pack.get("description"), str), f"Pack {entry['id']} missing description")

    room = pack.get("room")
    assert_true(isinstance(room, dict), f"Pack {entry['id']} missing room object")
    missing_room = REQUIRED_ROOM_KEYS.difference(room)
    assert_true(not missing_room, f"Pack {entry['id']} room missing {sorted(missing_room)}")
    room_texture = room.get("texture") or room.get("textureDataUrl")
    if room_texture:
        validate_image_source(root, room_texture, f"room texture {entry['id']}")
    if "textureFit" in room:
        assert_true(room["textureFit"] in {"cover", "contain", "auto"}, f"Pack {entry['id']} room textureFit must be cover, contain, or auto")

    skins = pack.get("skins")
    assert_true(isinstance(skins, list) and skins, f"Pack {entry['id']} must define at least one skin")
    seen_skin_ids = set()
    for skin in skins:
        for key in ["id", "name", "color", "accent", "description"]:
            assert_true(skin.get(key), f"Skin in {entry['id']} missing {key}")
        assert_true(skin["id"] not in seen_skin_ids, f"Duplicate skin id {skin['id']}")
        seen_skin_ids.add(skin["id"])
        assert_true(isinstance(skin.get("cost"), int) and skin["cost"] >= 0, f"Skin {skin['id']} cost must be a non-negative integer")
        if skin.get("texture"):
            validate_image_source(root, skin["texture"], skin["id"])
            assert_true(isinstance(skin.get("textureScale"), (int, float)) and skin["textureScale"] > 0, f"Skin {skin['id']} textureScale must be positive")

    tool_textures = pack.get("toolTextures", {})
    assert_true(isinstance(tool_textures, dict), f"Pack {entry['id']} toolTextures must be an object")
    for texture_id, texture in tool_textures.items():
        assert_true(isinstance(texture_id, str) and texture_id, f"Pack {entry['id']} has an empty tool texture id")
        assert_true(isinstance(texture, dict), f"Tool texture {texture_id} must be an object")
        src = texture.get("texture") or texture.get("textureDataUrl")
        validate_image_source(root, src, f"tool texture {texture_id}")
        for key in ["scale", "alpha", "width", "height", "rotationOffset"]:
            if key in texture:
                assert_true(isinstance(texture[key], (int, float)), f"Tool texture {texture_id} {key} must be numeric")
        if "scale" in texture:
            assert_true(texture["scale"] > 0, f"Tool texture {texture_id} scale must be positive")
        if "alpha" in texture:
            assert_true(0 <= texture["alpha"] <= 1, f"Tool texture {texture_id} alpha must be between 0 and 1")
        if "width" in texture:
            assert_true(texture["width"] > 0, f"Tool texture {texture_id} width must be positive")
        if "height" in texture:
            assert_true(texture["height"] > 0, f"Tool texture {texture_id} height must be positive")

    ui_theme = pack.get("uiTheme", {})
    assert_true(isinstance(ui_theme, dict), f"Pack {entry['id']} uiTheme must be an object")
    ui_variables = ui_theme.get("variables", {})
    assert_true(isinstance(ui_variables, dict), f"Pack {entry['id']} uiTheme.variables must be an object")
    for variable_name, variable_value in ui_variables.items():
        assert_true(variable_name in SUPPORTED_UI_THEME_VARIABLES, f"Unsupported UI theme variable {variable_name}")
        assert_true(isinstance(variable_value, str) and variable_value, f"UI theme variable {variable_name} must be a non-empty string")

    audio_packs = pack.get("audioPacks", {})
    assert_true(isinstance(audio_packs, dict), f"Pack {entry['id']} audioPacks must be an object")
    for audio_id, audio in audio_packs.items():
        missing_audio = REQUIRED_AUDIO_KEYS.difference(audio)
        assert_true(not missing_audio, f"Audio pack {audio_id} missing {sorted(missing_audio)}")
        for key in ["master", "pitch", "noiseFilter", "decay"]:
            assert_true(isinstance(audio[key], (int, float)) and audio[key] > 0, f"Audio pack {audio_id} {key} must be positive")
        samples = audio.get("samples", {})
        assert_true(isinstance(samples, dict), f"Audio pack {audio_id} samples must be an object")
        for sample_event, sample in samples.items():
            assert_true(sample_event in SUPPORTED_SAMPLE_EVENTS, f"Audio pack {audio_id} unsupported sample event {sample_event}")
            if isinstance(sample, str):
                src = sample
            else:
                assert_true(isinstance(sample, dict), f"Audio sample {audio_id}.{sample_event} must be a string or object")
                src = sample.get("src")
                if "gain" in sample:
                    assert_true(isinstance(sample["gain"], (int, float)) and sample["gain"] >= 0, f"Audio sample {audio_id}.{sample_event} gain must be non-negative")
                if "playbackRate" in sample:
                    assert_true(isinstance(sample["playbackRate"], (int, float)) and sample["playbackRate"] > 0, f"Audio sample {audio_id}.{sample_event} playbackRate must be positive")
            assert_true(isinstance(src, str) and src, f"Audio sample {audio_id}.{sample_event} missing src")
            if not src.startswith("data:audio/"):
                sample_path = root / src
                assert_true(sample_path.exists(), f"Audio sample not found for {audio_id}.{sample_event}: {sample_path}")
                assert_true(sample_path.suffix.lower() in {".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac"}, f"Unsupported audio sample type for {audio_id}.{sample_event}")

    return {
        "id": pack["id"],
        "skins": len(skins),
        "audioPacks": len(audio_packs)
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--manifest", default="assets/packs/manifest.json")
    parser.add_argument("--pack", default=None, help="Validate one pack.json file without requiring it in the live manifest")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if args.pack:
        pack_path = resolve_root_path(root, args.pack)
        assert_true(pack_path.exists(), f"Pack file not found: {pack_path}")
        pack = read_json(pack_path)
        entry = {
            "id": pack.get("id"),
            "name": pack.get("name"),
            "path": str(pack_path)
        }
        results = [validate_pack(root, entry)]
    else:
        manifest_path = resolve_root_path(root, args.manifest)
        assert_true(manifest_path.exists(), f"Manifest not found: {manifest_path}")
        manifest = read_json(manifest_path)
        packs = manifest.get("packs")
        assert_true(isinstance(packs, list) and packs, "Manifest must contain a non-empty packs array")
        results = [validate_pack(root, entry) for entry in packs]
    print(json.dumps({"ok": True, "packs": results}, indent=2))


if __name__ == "__main__":
    main()
