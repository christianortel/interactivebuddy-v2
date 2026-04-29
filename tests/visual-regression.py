import argparse
import json
import shutil
from pathlib import Path

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright


SAVE_KEY = "buddyLab2026.save.v1"


def capture(url, output_dir):
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    shots = {}
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 950}, has_touch=True)
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto(url, wait_until="domcontentloaded")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(1400)

        shots["stage"] = str(output.joinpath("stage.png"))
        page.screenshot(path=shots["stage"], full_page=True)

        box = page.locator("#world").bounding_box()
        page.mouse.click(box["x"] + box["width"] * 0.52, box["y"] + box["height"] * 0.43, button="right")
        page.wait_for_timeout(250)
        shots["radial"] = str(output.joinpath("radial-wheel.png"))
        page.screenshot(path=shots["radial"], full_page=True)

        page.mouse.click(20, 20)
        page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}')) || {{}};
              save.cash = 1000;
              localStorage.setItem('{SAVE_KEY}', JSON.stringify(save));
              window.__buddyLabDebug.state.cash = 1000;
              document.querySelector('#cash').textContent = '$1000';
              const pack = document.querySelector('#assetPack');
              pack.value = 'neon-lab';
              pack.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}
            """
        )
        page.wait_for_timeout(250)
        shots["shop"] = str(output.joinpath("shop.png"))
        page.locator(".side-panel").screenshot(path=shots["shop"])

        page.locator(".shop-item", has_text="Circuit Buddy").locator("button", has_text="Buy").click()
        page.wait_for_timeout(600)
        shots["texturedSkin"] = str(output.joinpath("textured-skin.png"))
        page.locator(".stage-card").screenshot(path=shots["texturedSkin"])

        browser.close()

    missing = [name for name, path in shots.items() if not Path(path).exists() or Path(path).stat().st_size <= 0]
    if errors:
        raise AssertionError(f"Console/page errors were reported: {errors}")
    if missing:
        raise AssertionError(f"Missing screenshots: {missing}")
    return shots


def compare_image(name, actual_path, baseline_path, diff_dir, pixel_threshold):
    actual = Image.open(actual_path).convert("RGBA")
    baseline = Image.open(baseline_path).convert("RGBA")
    if actual.size != baseline.size:
        return {
            "name": name,
            "passed": False,
            "reason": f"size mismatch: actual {actual.size}, baseline {baseline.size}"
        }

    diff = ImageChops.difference(actual, baseline)
    changed = 0
    total_delta = 0
    max_delta = 0
    data = diff.tobytes()
    channels = 4
    for index in range(0, len(data), channels):
        red = data[index]
        green = data[index + 1]
        blue = data[index + 2]
        alpha = data[index + 3]
        delta = max(red, green, blue, alpha)
        max_delta = max(max_delta, delta)
        total_delta += (red + green + blue) / 3
        if delta > pixel_threshold:
            changed += 1

    total = actual.width * actual.height
    changed_ratio = changed / total if total else 0
    mean_delta = total_delta / total if total else 0
    diff_path = None
    if changed:
        diff_dir.mkdir(parents=True, exist_ok=True)
        diff_path = diff_dir / f"{name}.png"
        diff.save(diff_path)

    return {
        "name": name,
        "passed": True,
        "changedRatio": round(changed_ratio, 6),
        "meanDelta": round(mean_delta, 4),
        "maxDelta": max_delta,
        "diff": str(diff_path) if diff_path else None
    }


def compare_shots(shots, baseline_dir, diff_dir, pixel_threshold, max_diff_ratio, max_mean_delta):
    baseline = Path(baseline_dir)
    missing = [name for name in shots if not baseline.joinpath(Path(shots[name]).name).exists()]
    if missing:
        raise AssertionError(f"Missing visual baselines: {missing}. Run with --update-baseline first.")

    comparisons = []
    failures = []
    for name, shot_path in shots.items():
        actual_path = Path(shot_path)
        baseline_path = baseline / actual_path.name
        comparison = compare_image(name, actual_path, baseline_path, Path(diff_dir), pixel_threshold)
        if comparison.get("passed"):
            if comparison["changedRatio"] > max_diff_ratio:
                comparison["passed"] = False
                comparison["reason"] = f"changedRatio {comparison['changedRatio']} > {max_diff_ratio}"
            if comparison["meanDelta"] > max_mean_delta:
                comparison["passed"] = False
                comparison["reason"] = f"meanDelta {comparison['meanDelta']} > {max_mean_delta}"
        comparisons.append(comparison)
        if not comparison["passed"]:
            failures.append(comparison)

    if failures:
        raise AssertionError(f"Visual differences exceeded thresholds: {failures}")
    return comparisons


def update_baselines(shots, baseline_dir):
    baseline = Path(baseline_dir)
    baseline.mkdir(parents=True, exist_ok=True)
    written = {}
    for name, shot_path in shots.items():
        destination = baseline / Path(shot_path).name
        shutil.copyfile(shot_path, destination)
        written[name] = str(destination)
    return written


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:5173")
    parser.add_argument("--output", default="tests/artifacts/visual")
    parser.add_argument("--baseline", default=None)
    parser.add_argument("--diff-output", default="tests/artifacts/visual-diff")
    parser.add_argument("--update-baseline", action="store_true")
    parser.add_argument("--pixel-threshold", type=int, default=16)
    parser.add_argument("--max-diff-ratio", type=float, default=0.08)
    parser.add_argument("--max-mean-delta", type=float, default=4.0)
    args = parser.parse_args()
    shots = capture(args.url, args.output)
    result = {"ok": True, "screenshots": shots}
    if args.update_baseline:
        baseline_dir = args.baseline or "tests/baselines/visual"
        result["baselines"] = update_baselines(shots, baseline_dir)
    elif args.baseline:
        result["comparisons"] = compare_shots(
            shots,
            args.baseline,
            args.diff_output,
            args.pixel_threshold,
            args.max_diff_ratio,
            args.max_mean_delta
        )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
