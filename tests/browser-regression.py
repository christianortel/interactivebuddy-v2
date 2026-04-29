import argparse
import json
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright


SAVE_KEY = "buddyLab2026.save.v1"


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def money_to_int(value):
    return int(value.replace("$", "").replace(",", ""))


def run(url):
    result = {
        "url": url,
        "errors": [],
        "checks": {}
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 950}, has_touch=True)
        page.on("console", lambda msg: result["errors"].append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: result["errors"].append(str(exc)))

        page.goto(url, wait_until="domcontentloaded")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(1200)

        initial = page.evaluate(
            """
            () => ({
              title: document.title,
              tools: document.querySelectorAll('.tool-button').length,
              missions: document.querySelectorAll('.mission').length,
              shopItems: document.querySelectorAll('.shop-item').length,
              shopNames: [...document.querySelectorAll('.shop-item strong')].map((el) => el.textContent),
              cash: document.querySelector('#cash')?.textContent,
              xp: document.querySelector('#xp')?.textContent,
              radialButtons: document.querySelectorAll('.radial-wheel__button').length,
              assetPack: document.querySelector('#assetPack')?.value,
              assetPackOptions: [...document.querySelectorAll('#assetPack option')].map((option) => option.value),
              audioPack: document.querySelector('#audioPack')?.value,
              audioPackOptions: [...document.querySelectorAll('#audioPack option')].map((option) => option.value),
              liquidType: document.querySelector('#liquidType')?.value,
              challengeMode: document.querySelector('#challengeMode')?.value,
              challengeOptions: [...document.querySelectorAll('#challengeMode option')].map((option) => option.value),
              toolMeta: document.querySelector('#toolMeta')?.textContent,
              modeSubmenus: document.querySelectorAll('.menu__submenu').length,
              gravityButtons: [...document.querySelectorAll('.gravity-mode-button')].map((button) => button.dataset.gravityMode),
              gravityActive: document.querySelector('.gravity-mode-button.is-active')?.dataset.gravityMode,
              gravityY: window.__buddyLabDebug.engine.gravity.y,
              fpsButton: document.querySelector('#fpsCounterButton')?.textContent,
              fpsVisible: document.querySelector('#fpsCounter')?.classList.contains('fps-counter--visible'),
              fpsText: document.querySelector('#fpsCounter')?.textContent,
              matterLoaded: Boolean(window.Matter?.Engine),
              scriptSources: [...document.scripts].map((script) => script.getAttribute('src')).filter(Boolean),
              toolIds: [...document.querySelectorAll('.tool-button')].map((button) => button.dataset.tool),
              auditIds: Object.keys(window.__buddyLabDebug.toolEffectAudit || {}),
              auditComplete: [...document.querySelectorAll('.tool-button')].every((button) => {
                const audit = window.__buddyLabDebug.toolEffectAudit?.[button.dataset.tool];
                return audit && audit.cosmetic && audit.visual && audit.coverage && Array.isArray(audit.scoring) && audit.scoring.length > 0;
              }),
              roomPreviewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              roomPreviewName: document.querySelector('#roomPreview .room-preview__name')?.textContent,
              roomPreviewMotif: document.querySelector('#roomPreview .room-thumbnail--large')?.dataset.motif,
              roomPreviewSwatches: document.querySelectorAll('#roomPreview .room-preview__swatch').length,
              roomPreviewColors: [...document.querySelectorAll('#roomPreview .room-preview__swatch')]
                .map((swatch) => swatch.getAttribute('aria-label')),
              roomBrowserThumbnails: [...document.querySelectorAll('#roomPreview .room-browser__button .room-thumbnail--mini')]
                .map((thumbnail) => thumbnail.dataset.motif),
              roomBrowserButtons: [...document.querySelectorAll('#roomPreview .room-browser__button')].map((button) => button.dataset.roomPack),
              roomBrowserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack
            })
            """
        )
        assert_true(initial["title"] == "Buddy Lab 2026", "Unexpected page title")
        assert_true(initial["tools"] >= 13, "Expected at least 13 tools")
        assert_true(initial["radialButtons"] == initial["tools"], "Radial wheel should mirror tool count")
        assert_true(initial["missions"] == 3, "Expected 3 mission cards")
        assert_true(initial["shopItems"] >= 11, "Expected shop items")
        assert_true("NaN" not in initial["cash"], "Initial cash should be finite")
        assert_true("NaN" not in initial["xp"], "Initial XP should be finite")
        assert_true(initial["matterLoaded"], "Matter.js should load before the app starts")
        assert_true("vendor/matter.min.js" in initial["scriptSources"], "Matter.js should be loaded from the local vendor runtime")
        assert_true(not any(src.startswith(("http://", "https://", "//")) for src in initial["scriptSources"]), "Runtime scripts should not load from a CDN")
        assert_true(sorted(initial["toolIds"]) == sorted(initial["auditIds"]), "Every shipped tool should have effect audit metadata")
        assert_true(initial["auditComplete"], "Tool effect audit metadata should include cosmetic, visual, scoring, and coverage fields")
        assert_true(initial["assetPack"] == "base", "Default asset pack should be base")
        assert_true("neon-lab" in initial["assetPackOptions"], "Local Neon Lab asset pack should load")
        assert_true("retro-office" in initial["assetPackOptions"], "Local Retro Office asset pack should load")
        assert_true("classic-arcade" in initial["assetPackOptions"], "Classic Arcade asset pack should load")
        assert_true("classic-desktop" in initial["assetPackOptions"], "Classic Desktop room pack should load")
        assert_true("workshop-garage" in initial["assetPackOptions"], "Workshop Garage room pack should load")
        assert_true("dojo-studio" in initial["assetPackOptions"], "Dojo Studio room pack should load")
        assert_true({"Gloom Friend", "Fruit Clock", "Everyday Pal"}.issubset(set(initial["shopNames"])), "Classic Skin Pack 2 skins should appear in shop")
        assert_true("Desk Pal" in initial["shopNames"], "Classic Desktop skin should appear in shop")
        assert_true("Shop Apron Buddy" in initial["shopNames"], "Workshop Garage skin should appear in shop")
        assert_true("Practice Gi Buddy" in initial["shopNames"], "Dojo Studio skin should appear in shop")
        assert_true("neonPulse" in initial["audioPackOptions"], "Asset-pack audio pack should load")
        assert_true("officeClick" in initial["audioPackOptions"], "Second asset-pack audio pack should load")
        assert_true("cabinetThunk" in initial["audioPackOptions"], "Classic Arcade audio pack should load")
        assert_true("desktopTap" in initial["audioPackOptions"], "Classic Desktop audio pack should load")
        assert_true("workshopClack" in initial["audioPackOptions"], "Workshop Garage audio pack should load")
        assert_true("dojoTap" in initial["audioPackOptions"], "Dojo Studio audio pack should load")
        assert_true(initial["audioPack"] == "classic", "Default audio pack should be classic")
        assert_true(initial["liquidType"] == "water", "Default liquid type should be water")
        assert_true(initial["challengeMode"] == "free", "Default challenge mode should be Free Play")
        assert_true({"juggle", "tether", "liquid", "props", "bead", "suction", "spark", "frost", "goo", "pulse", "cheer", "export"}.issubset(set(initial["challengeOptions"])), "Challenge options should include new modes")
        assert_true(initial["toolMeta"] == "Utility", "Default tool meta should describe the active tool category")
        assert_true(initial["modeSubmenus"] >= 2 and initial["fpsButton"] == "FPS Counter", "Modes menu should expose old-style nested submenus")
        assert_true(initial["gravityButtons"] == ["normal", "low", "heavy"], "Modes > Gravity should expose normal/low/heavy options")
        assert_true(initial["gravityActive"] == "normal" and initial["gravityY"] == 1, "Gravity mode should default to Normal")
        assert_true(initial["fpsVisible"] is False and initial["fpsText"] == "FPS 0", "FPS counter should default hidden")
        assert_true(initial["roomPreviewPack"] == "base" and initial["roomPreviewName"] == "Base Lab", "Room preview should describe the default room pack")
        assert_true(initial["roomPreviewMotif"] == "lab", "Base room preview should expose a motif-aware thumbnail")
        assert_true(initial["roomPreviewSwatches"] == 4, "Room preview should show four palette swatches")
        assert_true(any("#87968e" in color for color in initial["roomPreviewColors"]), "Base room preview should expose the background color")
        assert_true(initial["roomBrowserActive"] == "base", "Room browser should default to Base Lab")
        assert_true({"base", "neon-lab", "retro-office", "classic-arcade", "classic-desktop", "workshop-garage", "dojo-studio"}.issubset(set(initial["roomBrowserButtons"])), "Room browser should list built-in room packs")
        assert_true({"lab", "neon", "office", "arcade", "desktop", "workshop", "dojo"}.issubset(set(initial["roomBrowserThumbnails"])), "Room browser should render motif thumbnails for built-in room packs")
        result["checks"]["initial"] = initial

        classic_buddy = page.evaluate(
            """
            () => {
              const bodies = Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy);
              const torso = window.__buddyLabDebug.state.torso;
              const head = window.__buddyLabDebug.state.head;
              return {
                bodyCount: bodies.length,
                classicParts: bodies.filter((body) => body.plugin?.classicPart).length,
                classicStyle: bodies.every((body) => body.plugin?.visualStyle === 'classic-og-inspired'),
                torsoX: torso.position.x,
                torsoY: torso.position.y,
                headRadius: head.circleRadius,
                torsoFrictionAir: torso.frictionAir
              };
            }
            """
        )
        assert_true(classic_buddy["bodyCount"] == 15 and classic_buddy["classicParts"] == 15, "Classic Buddy should keep the complete 15-body ragdoll")
        assert_true(classic_buddy["classicStyle"], "Default Buddy bodies should carry the classic visual style metadata")
        assert_true(classic_buddy["torsoX"] < 180 and classic_buddy["torsoY"] > 420, "Default Buddy should spawn in the old lower-left stage position")
        assert_true(classic_buddy["headRadius"] < 22, "Default Buddy should use the smaller classic-scale head")
        assert_true(classic_buddy["torsoFrictionAir"] >= 0.012, "Default Buddy should have light air damping for floppy OG-style motion")
        result["checks"]["classicBuddyFeel"] = classic_buddy

        page.evaluate(
            f"""
            () => localStorage.setItem('{SAVE_KEY}', JSON.stringify({{
              cash: 432,
              xp: 21,
              unlockedTools: ['hand', 'ball'],
              unlockedSkins: ['classic'],
              selectedSkin: 'classic',
              settings: {{ audio: false }},
              tool: 'ball'
            }}))
            """
        )
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(800)
        migration = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                version: save.version,
                cash: document.querySelector('#cash')?.textContent,
                tool: save.tool,
                audio: save.settings.audio,
                haptics: save.settings.haptics,
                assetPack: save.settings.assetPack,
                liquidType: save.settings.liquidType,
                gravityMode: save.settings.gravityMode,
                fpsCounter: save.settings.fpsCounter,
                challengeMode: save.challengeMode,
                hasChallengeBests: !!save.challengeBests,
                ropeUnlocked: save.unlockedTools.includes('rope'),
                waterUnlocked: save.unlockedTools.includes('water')
              }};
            }}
            """
        )
        assert_true(migration["version"] == 2, "Legacy save should migrate to version 2")
        assert_true(migration["cash"] == "$432", "Legacy cash should survive migration")
        assert_true(migration["tool"] == "ball", "Legacy selected tool should survive migration")
        assert_true(migration["audio"] is False, "Legacy audio setting should survive migration")
        assert_true(migration["haptics"] is True, "Missing haptics setting should default on")
        assert_true(migration["assetPack"] == "base", "Missing asset pack should default to base")
        assert_true(migration["liquidType"] == "water", "Missing liquid type should default to water")
        assert_true(migration["gravityMode"] == "normal", "Missing gravity mode should default to normal")
        assert_true(migration["fpsCounter"] is False, "Missing FPS counter setting should default off")
        assert_true(migration["challengeMode"] == "free", "Missing challenge mode should default to free")
        assert_true(migration["hasChallengeBests"], "Challenge bests should exist after migration")
        assert_true(migration["ropeUnlocked"] and migration["waterUnlocked"], "Migration should keep baseline free tools unlocked")
        result["checks"]["saveMigration"] = migration

        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(1200)

        page.evaluate("document.querySelector('#exportSaveButton').click()")
        page.wait_for_selector('#replayStrip a[download^="buddy-lab-save-"][download$=".json"]', timeout=2500)
        save_export = page.evaluate(
            """
            () => ({
              link: !!document.querySelector('#replayStrip a[download^="buddy-lab-save-"][download$=".json"]'),
              linkText: document.querySelector('#replayStrip a')?.textContent,
              toast: document.querySelector('#toast')?.textContent
            })
            """
        )
        assert_true(save_export["link"], "Save export should create a JSON download link")
        assert_true("Save snapshot ready" in save_export["linkText"], "Save export link should describe snapshot")
        result["checks"]["saveExport"] = save_export

        import_payload = {
            "app": "Buddy Lab 2026",
            "type": "progression-save",
            "save": {
                "version": 2,
                "cash": 678,
                "xp": 44,
                "unlockedTools": ["hand", "ball", "rope", "water", "fan"],
                "unlockedSkins": ["classic"],
                "selectedSkin": "classic",
                "settings": {
                    "assetPack": "retro-office",
                    "audioPack": "officeClick",
                    "liquidType": "oil",
                    "audio": False,
                    "haptics": False,
                    "slapstick": True
                },
                "challengeMode": "tether",
                "challengeBests": {"tether": {"elapsed": 12.5, "completedAt": 1}},
                "tool": "fan"
            }
        }
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
            json.dump(import_payload, handle)
            import_path = Path(handle.name)
        try:
            with page.expect_navigation(wait_until="networkidle"):
                page.set_input_files("#saveImportInput", str(import_path))
            page.wait_for_timeout(900)
        finally:
            import_path.unlink(missing_ok=True)
        save_import = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                cash: document.querySelector('#cash')?.textContent,
                activeTool: document.querySelector('.tool-button--active')?.dataset.tool,
                assetPack: document.querySelector('#assetPack')?.value,
                audioPack: document.querySelector('#audioPack')?.value,
                liquidType: document.querySelector('#liquidType')?.value,
                challengeMode: document.querySelector('#challengeMode')?.value,
                savedCash: save.cash,
                savedTool: save.tool,
                savedVersion: save.version,
                best: save.challengeBests?.tether?.elapsed
              }};
            }}
            """
        )
        assert_true(save_import["cash"] == "$678", "Imported cash should render")
        assert_true(save_import["activeTool"] == "fan", "Imported selected tool should apply")
        assert_true(save_import["assetPack"] == "retro-office", "Imported asset pack should apply")
        assert_true(save_import["audioPack"] == "officeClick", "Imported audio pack should apply")
        assert_true(save_import["liquidType"] == "oil", "Imported liquid type should apply")
        assert_true(save_import["challengeMode"] == "tether", "Imported challenge mode should apply")
        assert_true(save_import["savedVersion"] == 2 and save_import["savedCash"] == 678, "Imported save should persist as version 2")
        assert_true(save_import["best"] == 12.5, "Imported challenge best should persist")
        result["checks"]["saveImport"] = save_import

        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(1200)

        page.locator(".menu", has_text="Settings").hover()
        page.click('#roomPreview .room-browser__button[data-room-pack="classic-desktop"]')
        page.wait_for_timeout(180)
        room_pack = page.evaluate(
            f"""
            () => ({{
              selected: document.querySelector('#assetPack')?.value,
              saved: JSON.parse(localStorage.getItem('{SAVE_KEY}')).settings.assetPack,
              toast: document.querySelector('#toast')?.textContent,
              shopHasDeskPal: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Desk Pal'),
              audioHasDesktopTap: [...document.querySelectorAll('#audioPack option')].some((option) => option.value === 'desktopTap'),
              roomBackground: window.__buddyLabDebug.state.assetPacks.find((pack) => pack.id === 'classic-desktop')?.room.background,
              roomMotif: window.__buddyLabDebug.state.assetPacks.find((pack) => pack.id === 'classic-desktop')?.room.motif,
              previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              previewName: document.querySelector('#roomPreview .room-preview__name')?.textContent,
              previewMotif: document.querySelector('#roomPreview .room-thumbnail--large')?.dataset.motif,
              browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack,
              browserPressed: document.querySelector('#roomPreview .room-browser__button[data-room-pack="classic-desktop"]')?.getAttribute('aria-pressed'),
              browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="classic-desktop"] .room-thumbnail--mini')?.dataset.motif,
              browserCount: document.querySelectorAll('#roomPreview .room-browser__button').length,
              previewColors: [...document.querySelectorAll('#roomPreview .room-preview__swatch')]
                .map((swatch) => swatch.getAttribute('aria-label'))
            }})
            """
        )
        assert_true(room_pack["selected"] == "classic-desktop", "Classic Desktop selector should apply")
        assert_true(room_pack["saved"] == "classic-desktop", "Classic Desktop room pack should persist")
        assert_true(room_pack["shopHasDeskPal"], "Classic Desktop skin should be in shop")
        assert_true(room_pack["audioHasDesktopTap"], "Classic Desktop audio pack should be in selector")
        assert_true(room_pack["roomBackground"] == "#9aa59d", "Classic Desktop room palette should be registered")
        assert_true(room_pack["roomMotif"] == "desktop", "Classic Desktop room motif should be registered")
        assert_true(room_pack["previewPack"] == "classic-desktop" and room_pack["previewName"] == "Classic Desktop", "Classic Desktop room preview should update")
        assert_true(room_pack["previewMotif"] == "desktop" and room_pack["browserMotif"] == "desktop", "Classic Desktop preview and browser entry should render desktop thumbnails")
        assert_true(room_pack["browserActive"] == "classic-desktop" and room_pack["browserPressed"] == "true", "Room browser should show Classic Desktop as active")
        assert_true(room_pack["browserCount"] >= 5, "Room browser should show all loaded room packs")
        assert_true(any("#9aa59d" in color for color in room_pack["previewColors"]), "Classic Desktop preview should expose its room background")
        result["checks"]["roomPack"] = room_pack

        page.click('#roomPreview .room-browser__button[data-room-pack="workshop-garage"]')
        page.wait_for_timeout(180)
        workshop_room_pack = page.evaluate(
            f"""
            () => ({{
              selected: document.querySelector('#assetPack')?.value,
              saved: JSON.parse(localStorage.getItem('{SAVE_KEY}')).settings.assetPack,
              toast: document.querySelector('#toast')?.textContent,
              shopHasShopApron: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Shop Apron Buddy'),
              audioHasWorkshopClack: [...document.querySelectorAll('#audioPack option')].some((option) => option.value === 'workshopClack'),
              roomBackground: window.__buddyLabDebug.state.assetPacks.find((pack) => pack.id === 'workshop-garage')?.room.background,
              roomMotif: window.__buddyLabDebug.state.assetPacks.find((pack) => pack.id === 'workshop-garage')?.room.motif,
              previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              previewName: document.querySelector('#roomPreview .room-preview__name')?.textContent,
              previewMotif: document.querySelector('#roomPreview .room-thumbnail--large')?.dataset.motif,
              browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack,
              browserPressed: document.querySelector('#roomPreview .room-browser__button[data-room-pack="workshop-garage"]')?.getAttribute('aria-pressed'),
              browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="workshop-garage"] .room-thumbnail--mini')?.dataset.motif,
              browserCount: document.querySelectorAll('#roomPreview .room-browser__button').length,
              previewColors: [...document.querySelectorAll('#roomPreview .room-preview__swatch')]
                .map((swatch) => swatch.getAttribute('aria-label'))
            }})
            """
        )
        assert_true(workshop_room_pack["selected"] == "workshop-garage", "Workshop Garage selector should apply")
        assert_true(workshop_room_pack["saved"] == "workshop-garage", "Workshop Garage room pack should persist")
        assert_true(workshop_room_pack["shopHasShopApron"], "Workshop Garage skin should be in shop")
        assert_true(workshop_room_pack["audioHasWorkshopClack"], "Workshop Garage audio pack should be in selector")
        assert_true(workshop_room_pack["roomBackground"] == "#7f8c82", "Workshop Garage room palette should be registered")
        assert_true(workshop_room_pack["roomMotif"] == "workshop", "Workshop Garage room motif should be registered")
        assert_true(workshop_room_pack["previewPack"] == "workshop-garage" and workshop_room_pack["previewName"] == "Workshop Garage", "Workshop Garage room preview should update")
        assert_true(workshop_room_pack["previewMotif"] == "workshop" and workshop_room_pack["browserMotif"] == "workshop", "Workshop Garage preview and browser entry should render workshop thumbnails")
        assert_true(workshop_room_pack["browserActive"] == "workshop-garage" and workshop_room_pack["browserPressed"] == "true", "Room browser should show Workshop Garage as active")
        assert_true(workshop_room_pack["browserCount"] >= 6, "Room browser should include the new Workshop Garage pack")
        assert_true(any("#7f8c82" in color for color in workshop_room_pack["previewColors"]), "Workshop Garage preview should expose its room background")
        result["checks"]["workshopRoomPack"] = workshop_room_pack

        page.reload(wait_until="networkidle")
        page.wait_for_timeout(900)
        workshop_room_reload = page.evaluate(
            """
            () => ({
              selected: document.querySelector('#assetPack')?.value,
              hasOption: [...document.querySelectorAll('#assetPack option')].some((option) => option.value === 'workshop-garage'),
              hasSkin: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Shop Apron Buddy'),
              hasAudio: [...document.querySelectorAll('#audioPack option')].some((option) => option.value === 'workshopClack'),
              previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack,
              browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="workshop-garage"] .room-thumbnail--mini')?.dataset.motif
            })
            """
        )
        assert_true(workshop_room_reload["selected"] == "workshop-garage", "Workshop Garage selection should survive reload")
        assert_true(workshop_room_reload["hasOption"] and workshop_room_reload["hasSkin"] and workshop_room_reload["hasAudio"], "Workshop Garage content should survive reload")
        assert_true(workshop_room_reload["previewPack"] == "workshop-garage", "Workshop Garage preview should restore after reload")
        assert_true(workshop_room_reload["browserActive"] == "workshop-garage" and workshop_room_reload["browserMotif"] == "workshop", "Workshop Garage room browser state should survive reload")
        result["checks"]["workshopRoomReload"] = workshop_room_reload

        page.locator(".menu", has_text="Settings").hover()
        page.locator('#roomPreview .room-browser__button[data-room-pack="dojo-studio"]').scroll_into_view_if_needed()
        page.click('#roomPreview .room-browser__button[data-room-pack="dojo-studio"]')
        page.wait_for_timeout(180)
        dojo_room_pack = page.evaluate(
            f"""
            () => ({{
              selected: document.querySelector('#assetPack')?.value,
              saved: JSON.parse(localStorage.getItem('{SAVE_KEY}')).settings.assetPack,
              toast: document.querySelector('#toast')?.textContent,
              shopHasPracticeGi: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Practice Gi Buddy'),
              audioHasDojoTap: [...document.querySelectorAll('#audioPack option')].some((option) => option.value === 'dojoTap'),
              roomBackground: window.__buddyLabDebug.state.assetPacks.find((pack) => pack.id === 'dojo-studio')?.room.background,
              roomMotif: window.__buddyLabDebug.state.assetPacks.find((pack) => pack.id === 'dojo-studio')?.room.motif,
              previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              previewName: document.querySelector('#roomPreview .room-preview__name')?.textContent,
              previewMotif: document.querySelector('#roomPreview .room-thumbnail--large')?.dataset.motif,
              browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack,
              browserPressed: document.querySelector('#roomPreview .room-browser__button[data-room-pack="dojo-studio"]')?.getAttribute('aria-pressed'),
              browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="dojo-studio"] .room-thumbnail--mini')?.dataset.motif,
              browserCount: document.querySelectorAll('#roomPreview .room-browser__button').length,
              previewColors: [...document.querySelectorAll('#roomPreview .room-preview__swatch')]
                .map((swatch) => swatch.getAttribute('aria-label'))
            }})
            """
        )
        assert_true(dojo_room_pack["selected"] == "dojo-studio", "Dojo Studio selector should apply")
        assert_true(dojo_room_pack["saved"] == "dojo-studio", "Dojo Studio room pack should persist")
        assert_true(dojo_room_pack["shopHasPracticeGi"], "Dojo Studio skin should be in shop")
        assert_true(dojo_room_pack["audioHasDojoTap"], "Dojo Studio audio pack should be in selector")
        assert_true(dojo_room_pack["roomBackground"] == "#8c9084", "Dojo Studio room palette should be registered")
        assert_true(dojo_room_pack["roomMotif"] == "dojo", "Dojo Studio room motif should be registered")
        assert_true(dojo_room_pack["previewPack"] == "dojo-studio" and dojo_room_pack["previewName"] == "Dojo Studio", "Dojo Studio room preview should update")
        assert_true(dojo_room_pack["previewMotif"] == "dojo" and dojo_room_pack["browserMotif"] == "dojo", "Dojo Studio preview and browser entry should render dojo thumbnails")
        assert_true(dojo_room_pack["browserActive"] == "dojo-studio" and dojo_room_pack["browserPressed"] == "true", "Room browser should show Dojo Studio as active")
        assert_true(dojo_room_pack["browserCount"] >= 7, "Room browser should include the new Dojo Studio pack")
        assert_true(any("#8c9084" in color for color in dojo_room_pack["previewColors"]), "Dojo Studio preview should expose its room background")
        result["checks"]["dojoRoomPack"] = dojo_room_pack

        page.reload(wait_until="networkidle")
        page.wait_for_timeout(900)
        dojo_room_reload = page.evaluate(
            """
            () => ({
              selected: document.querySelector('#assetPack')?.value,
              hasOption: [...document.querySelectorAll('#assetPack option')].some((option) => option.value === 'dojo-studio'),
              hasSkin: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Practice Gi Buddy'),
              hasAudio: [...document.querySelectorAll('#audioPack option')].some((option) => option.value === 'dojoTap'),
              previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack,
              browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="dojo-studio"] .room-thumbnail--mini')?.dataset.motif
            })
            """
        )
        assert_true(dojo_room_reload["selected"] == "dojo-studio", "Dojo Studio selection should survive reload")
        assert_true(dojo_room_reload["hasOption"] and dojo_room_reload["hasSkin"] and dojo_room_reload["hasAudio"], "Dojo Studio content should survive reload")
        assert_true(dojo_room_reload["previewPack"] == "dojo-studio", "Dojo Studio preview should restore after reload")
        assert_true(dojo_room_reload["browserActive"] == "dojo-studio" and dojo_room_reload["browserMotif"] == "dojo", "Dojo Studio room browser state should survive reload")
        result["checks"]["dojoRoomReload"] = dojo_room_reload

        page.evaluate(
            """
            () => {
              const pack = document.querySelector('#assetPack');
              pack.value = 'neon-lab';
              pack.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        asset_pack = page.evaluate(
            f"""
            () => ({{
              selected: document.querySelector('#assetPack')?.value,
              saved: JSON.parse(localStorage.getItem('{SAVE_KEY}')).settings.assetPack,
              toast: document.querySelector('#toast')?.textContent,
              shopHasPackSkin: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Circuit Buddy'),
              previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
              previewName: document.querySelector('#roomPreview .room-preview__name')?.textContent
            }})
            """
        )
        assert_true(asset_pack["selected"] == "neon-lab", "Asset pack selector should change to Neon Lab")
        assert_true(asset_pack["saved"] == "neon-lab", "Asset pack should persist to localStorage")
        assert_true(asset_pack["shopHasPackSkin"], "Loaded asset-pack skin should appear in shop")
        assert_true(asset_pack["previewPack"] == "neon-lab" and asset_pack["previewName"] == "Neon Lab", "Neon Lab room preview should update")
        result["checks"]["assetPack"] = asset_pack

        page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              save.cash = 1000;
              localStorage.setItem('{SAVE_KEY}', JSON.stringify(save));
              window.__buddyLabDebug.state.cash = 1000;
              document.querySelector('#cash').textContent = '$1000';
            }}
            """
        )
        page.locator(".shop-item", has_text="Circuit Buddy").locator("button", has_text="Buy").click()
        page.wait_for_timeout(300)
        texture_skin = page.evaluate(
            """
            () => ({
              selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
              textureBodies: Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                .filter((body) => body.render.sprite?.texture?.includes('circuit.svg')).length,
              shopButton: [...document.querySelectorAll('.shop-item')]
                .find((item) => item.innerText.includes('Circuit Buddy'))
                ?.querySelector('button')?.textContent
            })
            """
        )
        assert_true(texture_skin["selectedSkin"] == "neon-lab:circuit", "Circuit Buddy should be selected after purchase")
        assert_true(texture_skin["textureBodies"] > 0, "Texture-backed skin should apply SVG sprites to buddy bodies")
        assert_true(texture_skin["shopButton"] == "Equipped", "Circuit Buddy shop button should show equipped")
        result["checks"]["textureSkin"] = texture_skin

        page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              save.cash = 4500;
              localStorage.setItem('{SAVE_KEY}', JSON.stringify(save));
              window.__buddyLabDebug.state.cash = 4500;
              document.querySelector('#cash').textContent = '$4500';
            }}
            """
        )
        page.locator(".shop-item", has_text="Gloom Friend").locator("button", has_text="Buy").click()
        page.wait_for_timeout(300)
        classic_skin_pack = page.evaluate(
            """
            () => ({
              selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
              textureBodies: Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                .filter((body) => body.render.sprite?.texture?.includes('gloom-friend.svg')).length,
              hasFruitClock: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Fruit Clock'),
              hasEverydayPal: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Everyday Pal'),
              shopButton: [...document.querySelectorAll('.shop-item')]
                .find((item) => item.innerText.includes('Gloom Friend'))
                ?.querySelector('button')?.textContent
            })
            """
        )
        assert_true(classic_skin_pack["selectedSkin"] == "classic-arcade:gloom-friend", "Gloom Friend should be selected after purchase")
        assert_true(classic_skin_pack["textureBodies"] > 0, "Gloom Friend should apply its SVG texture to buddy bodies")
        assert_true(classic_skin_pack["hasFruitClock"] and classic_skin_pack["hasEverydayPal"], "Classic Skin Pack 2 companion skins should remain in shop")
        assert_true(classic_skin_pack["shopButton"] == "Equipped", "Gloom Friend shop button should show equipped")
        result["checks"]["classicSkinPack2"] = classic_skin_pack

        page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              save.cash = 4500;
              localStorage.setItem('{SAVE_KEY}', JSON.stringify(save));
              window.__buddyLabDebug.state.cash = 4500;
              document.querySelector('#cash').textContent = '$4500';
            }}
            """
        )
        page.evaluate(
            """
            () => [...document.querySelectorAll('.shop-item')]
              .find((item) => item.querySelector('strong')?.textContent === 'Robot')
              ?.querySelector('button')
              ?.click()
            """
        )
        page.wait_for_timeout(250)
        robot_physics = page.evaluate(
            """
            () => {
              const torso = window.__buddyLabDebug.state.torso;
              return {
                selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
                variant: torso.plugin?.physicsVariant,
                density: torso.density,
                baseDensity: torso.plugin?.basePhysics?.density,
                frictionAir: torso.frictionAir,
                baseFrictionAir: torso.plugin?.basePhysics?.frictionAir,
                restitution: torso.restitution,
                baseRestitution: torso.plugin?.basePhysics?.restitution,
                shopButton: [...document.querySelectorAll('.shop-item')]
                  .find((item) => item.innerText.includes('Robot'))
                  ?.querySelector('button')?.textContent
              };
            }
            """
        )
        assert_true(robot_physics["selectedSkin"] == "robot", "Robot skin should be selected after purchase")
        assert_true(robot_physics["variant"] == "robot-heavy", "Robot should apply heavy physics variant metadata")
        assert_true(robot_physics["density"] > robot_physics["baseDensity"], "Robot should increase body density")
        assert_true(robot_physics["restitution"] < robot_physics["baseRestitution"], "Robot should reduce body bounce")
        assert_true(robot_physics["shopButton"] == "Equipped", "Robot shop button should show equipped")

        page.evaluate(
            """
            () => [...document.querySelectorAll('.shop-item')]
              .find((item) => item.querySelector('strong')?.textContent === 'Gelatin Blob')
              ?.querySelector('button')
              ?.click()
            """
        )
        page.wait_for_timeout(250)
        gelatin_physics = page.evaluate(
            """
            () => {
              const torso = window.__buddyLabDebug.state.torso;
              return {
                selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
                variant: torso.plugin?.physicsVariant,
                density: torso.density,
                baseDensity: torso.plugin?.basePhysics?.density,
                frictionAir: torso.frictionAir,
                baseFrictionAir: torso.plugin?.basePhysics?.frictionAir,
                restitution: torso.restitution,
                baseRestitution: torso.plugin?.basePhysics?.restitution,
                shopButton: [...document.querySelectorAll('.shop-item')]
                  .find((item) => item.innerText.includes('Gelatin Blob'))
                  ?.querySelector('button')?.textContent
              };
            }
            """
        )
        assert_true(gelatin_physics["selectedSkin"] == "gelatin", "Gelatin skin should be selected after purchase")
        assert_true(gelatin_physics["variant"] == "gelatin-bouncy", "Gelatin should apply bouncy physics variant metadata")
        assert_true(gelatin_physics["density"] < gelatin_physics["baseDensity"], "Gelatin should reduce body density")
        assert_true(gelatin_physics["restitution"] > gelatin_physics["baseRestitution"], "Gelatin should increase body bounce")
        assert_true(gelatin_physics["shopButton"] == "Equipped", "Gelatin shop button should show equipped")

        page.evaluate(
            """
            () => [...document.querySelectorAll('.shop-item')]
              .find((item) => item.querySelector('strong')?.textContent === 'Astronaut')
              ?.querySelector('button')
              ?.click()
            """
        )
        page.wait_for_timeout(250)
        astronaut_physics = page.evaluate(
            """
            () => {
              const torso = window.__buddyLabDebug.state.torso;
              return {
                selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
                variant: torso.plugin?.physicsVariant,
                density: torso.density,
                baseDensity: torso.plugin?.basePhysics?.density,
                frictionAir: torso.frictionAir,
                baseFrictionAir: torso.plugin?.basePhysics?.frictionAir,
                restitution: torso.restitution,
                baseRestitution: torso.plugin?.basePhysics?.restitution,
                shopButton: [...document.querySelectorAll('.shop-item')]
                  .find((item) => item.innerText.includes('Astronaut'))
                  ?.querySelector('button')?.textContent
              };
            }
            """
        )
        assert_true(astronaut_physics["selectedSkin"] == "astronaut", "Astronaut skin should be selected after purchase")
        assert_true(astronaut_physics["variant"] == "astronaut-float", "Astronaut should apply float physics variant metadata")
        assert_true(astronaut_physics["density"] < astronaut_physics["baseDensity"], "Astronaut should reduce body density")
        assert_true(astronaut_physics["frictionAir"] < astronaut_physics["baseFrictionAir"], "Astronaut should reduce air damping for floatier motion")
        assert_true(astronaut_physics["restitution"] > astronaut_physics["baseRestitution"], "Astronaut should slightly increase body bounce")
        assert_true(astronaut_physics["shopButton"] == "Equipped", "Astronaut shop button should show equipped")

        page.evaluate(
            """
            () => [...document.querySelectorAll('.shop-item')]
              .find((item) => item.querySelector('strong')?.textContent === 'Moon Boot Buddy')
              ?.querySelector('button')
              ?.click()
            """
        )
        page.wait_for_timeout(250)
        moon_boot_physics = page.evaluate(
            """
            () => {
              const torso = window.__buddyLabDebug.state.torso;
              return {
                selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
                variant: torso.plugin?.physicsVariant,
                density: torso.density,
                baseDensity: torso.plugin?.basePhysics?.density,
                frictionAir: torso.frictionAir,
                baseFrictionAir: torso.plugin?.basePhysics?.frictionAir,
                restitution: torso.restitution,
                baseRestitution: torso.plugin?.basePhysics?.restitution,
                textureBodies: Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                  .filter((body) => body.render.sprite?.texture?.includes('moon-boot.svg')).length,
                shopButton: [...document.querySelectorAll('.shop-item')]
                  .find((item) => item.innerText.includes('Moon Boot Buddy'))
                  ?.querySelector('button')?.textContent
              };
            }
            """
        )
        assert_true(moon_boot_physics["selectedSkin"] == "classic-arcade:moon-boot", "Moon Boot skin should be selected after purchase")
        assert_true(moon_boot_physics["variant"] == "moon-boot-spring", "Moon Boot should apply spring physics variant metadata")
        assert_true(moon_boot_physics["density"] < moon_boot_physics["baseDensity"], "Moon Boot should slightly reduce body density")
        assert_true(moon_boot_physics["frictionAir"] < moon_boot_physics["baseFrictionAir"], "Moon Boot should reduce air damping")
        assert_true(moon_boot_physics["restitution"] > moon_boot_physics["baseRestitution"], "Moon Boot should increase body bounce")
        assert_true(moon_boot_physics["textureBodies"] > 0, "Moon Boot should still apply its texture-backed skin")
        assert_true(moon_boot_physics["shopButton"] == "Equipped", "Moon Boot shop button should show equipped")
        result["checks"]["skinPhysicsVariants"] = {
            "robot": robot_physics,
            "gelatin": gelatin_physics,
            "astronaut": astronaut_physics,
            "moonBoot": moon_boot_physics
        }

        private_pack_payload = {
            "id": "private-pack",
            "name": "Private Pack",
            "description": "User supplied private skins.",
            "room": {
                "background": "#6f7f76",
                "grid": "#f0f7ef",
                "floor": "#506058",
                "accent": "#ffd27a",
                "motif": "office"
            },
            "skins": [
                {
                    "id": "private-pack:local-skin",
                    "name": "Local Test Skin",
                    "cost": 90,
                    "color": "#f0d6aa",
                    "accent": "#594532",
                    "textureDataUrl": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjBkNmFhIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjAiIGZpbGw9IiM1OTQ1MzIiLz48L3N2Zz4=",
                    "textureScale": 0.7,
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
                    "decay": 1
                }
            }
        }
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
            json.dump(private_pack_payload, handle)
            private_pack_path = Path(handle.name)
        try:
            page.set_input_files("#skinPackImportInput", str(private_pack_path))
            page.wait_for_timeout(500)
        finally:
            private_pack_path.unlink(missing_ok=True)
        custom_pack = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                selected: document.querySelector('#assetPack')?.value,
                hasOption: [...document.querySelectorAll('#assetPack option')].some((option) => option.value === 'private-pack'),
                hasAudio: [...document.querySelectorAll('#audioPack option')].some((option) => option.value === 'privateTone'),
                hasSkin: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Local Test Skin'),
                savedPack: save.settings.assetPack,
                savedCustom: save.customAssetPacks?.[0]?.id,
                previewPack: document.querySelector('#roomPreview')?.dataset.roomPack,
                previewName: document.querySelector('#roomPreview .room-preview__name')?.textContent,
                previewMotif: document.querySelector('#roomPreview .room-thumbnail--large')?.dataset.motif,
                browserHasPrivate: [...document.querySelectorAll('#roomPreview .room-browser__button')].some((button) => button.dataset.roomPack === 'private-pack'),
                browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="private-pack"] .room-thumbnail--mini')?.dataset.motif,
                browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack,
                toast: document.querySelector('#toast')?.textContent
              }};
            }}
            """
        )
        assert_true(custom_pack["selected"] == "private-pack", "Imported private pack should become selected")
        assert_true(custom_pack["hasOption"], "Imported private pack should be available in asset-pack selector")
        assert_true(custom_pack["hasAudio"], "Imported private audio pack should be available")
        assert_true(custom_pack["hasSkin"], "Imported private skin should appear in shop")
        assert_true(custom_pack["savedPack"] == "private-pack" and custom_pack["savedCustom"] == "private-pack", "Imported private pack should persist in save data")
        assert_true(custom_pack["previewPack"] == "private-pack" and custom_pack["previewName"] == "Private Pack", "Imported private pack room preview should update")
        assert_true(custom_pack["previewMotif"] == "office" and custom_pack["browserMotif"] == "office", "Imported private pack should render its motif thumbnail")
        assert_true(custom_pack["browserHasPrivate"] and custom_pack["browserActive"] == "private-pack", "Room browser should add and activate imported private room packs")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(900)
        custom_pack_reload = page.evaluate(
            """
            () => ({
              selected: document.querySelector('#assetPack')?.value,
              hasOption: [...document.querySelectorAll('#assetPack option')].some((option) => option.value === 'private-pack'),
              hasSkin: [...document.querySelectorAll('.shop-item strong')].some((el) => el.textContent === 'Local Test Skin'),
              browserHasPrivate: [...document.querySelectorAll('#roomPreview .room-browser__button')].some((button) => button.dataset.roomPack === 'private-pack'),
              browserMotif: document.querySelector('#roomPreview .room-browser__button[data-room-pack="private-pack"] .room-thumbnail--mini')?.dataset.motif,
              browserActive: document.querySelector('#roomPreview .room-browser__button.is-active')?.dataset.roomPack
            })
            """
        )
        assert_true(custom_pack_reload["selected"] == "private-pack", "Imported private pack selection should survive reload")
        assert_true(custom_pack_reload["hasOption"] and custom_pack_reload["hasSkin"], "Imported private pack content should survive reload")
        assert_true(custom_pack_reload["browserMotif"] == "office", "Imported private pack motif thumbnail should survive reload")
        assert_true(custom_pack_reload["browserHasPrivate"] and custom_pack_reload["browserActive"] == "private-pack", "Imported private room browser entry should survive reload")
        page.locator(".shop-item", has_text="Local Test Skin").locator("button", has_text="Buy").click()
        page.wait_for_timeout(300)
        custom_texture_skin = page.evaluate(
            """
            () => ({
              selectedSkin: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).selectedSkin,
              textureBodies: Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                .filter((body) => body.render.sprite?.texture?.startsWith('data:image/svg+xml')).length,
              shopButton: [...document.querySelectorAll('.shop-item')]
                .find((item) => item.innerText.includes('Local Test Skin'))
                ?.querySelector('button')?.textContent
            })
            """
        )
        assert_true(custom_texture_skin["selectedSkin"] == "private-pack:local-skin", "Imported data-URL skin should be selected after purchase")
        assert_true(custom_texture_skin["textureBodies"] > 0, "Imported data-URL skin should apply embedded sprites to buddy bodies")
        assert_true(custom_texture_skin["shopButton"] == "Equipped", "Imported data-URL skin shop button should show equipped")
        result["checks"]["customSkinPack"] = {**custom_pack, "reload": custom_pack_reload, "textureSkin": custom_texture_skin}

        required_mission_coverage = {"rope2", "liquid2", "bowling2", "beach3", "punch2", "prop4", "bead6", "dart4", "cork4", "plunger4", "spark5", "frost5", "goo5", "pulse5", "confetti5", "wheel3", "export1"}
        seen_missions = set(page.eval_on_selector_all(".mission", "(els) => els.map((el) => el.dataset.missionId)"))
        for _ in range(40):
            if required_mission_coverage.issubset(seen_missions):
                break
            page.click("#refreshMissions")
            page.wait_for_timeout(120)
            seen_missions.update(page.eval_on_selector_all(".mission", "(els) => els.map((el) => el.dataset.missionId)"))
        coverage = sorted(seen_missions.intersection(required_mission_coverage))
        assert_true(coverage == ["beach3", "bead6", "bowling2", "confetti5", "cork4", "dart4", "export1", "frost5", "goo5", "liquid2", "plunger4", "prop4", "pulse5", "punch2", "rope2", "spark5", "wheel3"], "Mission refreshes should cover rope/liquid/prop/projectile/elemental/nice/radial/export missions")
        result["checks"]["missionCoverage"] = {"coverage": coverage}

        page.evaluate(
            """
            () => {
              const pack = document.querySelector('#audioPack');
              pack.value = 'arcade';
              pack.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        audio_pack = page.evaluate(
            f"""
            () => ({{
              selected: document.querySelector('#audioPack')?.value,
              saved: JSON.parse(localStorage.getItem('{SAVE_KEY}')).settings.audioPack,
              toast: document.querySelector('#toast')?.textContent
            }})
            """
        )
        assert_true(audio_pack["selected"] == "arcade", "Audio pack selector should change to Arcade")
        assert_true(audio_pack["saved"] == "arcade", "Audio pack should persist to localStorage")
        result["checks"]["audioPack"] = audio_pack

        page.evaluate(
            """
            () => {
              const liquid = document.querySelector('#liquidType');
              liquid.value = 'slime';
              liquid.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        liquid_type = page.evaluate(
            f"""
            () => ({{
              selected: document.querySelector('#liquidType')?.value,
              saved: JSON.parse(localStorage.getItem('{SAVE_KEY}')).settings.liquidType,
              toast: document.querySelector('#toast')?.textContent
            }})
            """
        )
        assert_true(liquid_type["selected"] == "slime", "Liquid selector should change to Slime")
        assert_true(liquid_type["saved"] == "slime", "Liquid type should persist to localStorage")
        result["checks"]["liquidType"] = liquid_type

        page.locator(".menu", has_text="Modes").hover()
        page.locator(".menu__submenu-trigger", has_text="Debug").hover()
        page.click("#fpsCounterButton")
        page.wait_for_timeout(650)
        mode_parity = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                visible: document.querySelector('#fpsCounter')?.classList.contains('fps-counter--visible'),
                text: document.querySelector('#fpsCounter')?.textContent,
                saved: save.settings.fpsCounter,
                toast: document.querySelector('#toast')?.textContent,
                submenuCount: document.querySelectorAll('.menu__submenu').length
              }};
            }}
            """
        )
        assert_true(mode_parity["visible"], "FPS counter should become visible from Modes > Debug")
        assert_true(mode_parity["text"].startswith("FPS ") and mode_parity["text"] != "FPS 0", "FPS counter should update with a live value")
        assert_true(mode_parity["saved"] is True, "FPS counter setting should persist to localStorage")
        assert_true("FPS counter enabled" in mode_parity["toast"], "FPS toggle should give player feedback")
        assert_true(mode_parity["submenuCount"] >= 1, "Modes menu should keep nested submenu structure")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(650)
        mode_parity_reload = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                visible: document.querySelector('#fpsCounter')?.classList.contains('fps-counter--visible'),
                text: document.querySelector('#fpsCounter')?.textContent,
                saved: save.settings.fpsCounter
              }};
            }}
            """
        )
        assert_true(mode_parity_reload["visible"], "FPS counter should restore visible after reload")
        assert_true(mode_parity_reload["text"].startswith("FPS ") and mode_parity_reload["text"] != "FPS 0", "Restored FPS counter should keep updating")
        assert_true(mode_parity_reload["saved"] is True, "Reloaded save should keep FPS counter enabled")
        page.locator(".menu", has_text="Modes").hover()
        page.locator(".menu__submenu-trigger", has_text="Gravity").hover()
        page.click('.gravity-mode-button[data-gravity-mode="low"]')
        page.wait_for_timeout(180)
        gravity_mode = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                saved: save.settings.gravityMode,
                gravityY: window.__buddyLabDebug.engine.gravity.y,
                active: document.querySelector('.gravity-mode-button.is-active')?.dataset.gravityMode,
                pressed: document.querySelector('.gravity-mode-button[data-gravity-mode="low"]')?.getAttribute('aria-pressed'),
                toast: document.querySelector('#toast')?.textContent
              }};
            }}
            """
        )
        assert_true(gravity_mode["saved"] == "low", "Low Gravity mode should persist")
        assert_true(abs(gravity_mode["gravityY"] - 0.45) < 0.001, "Low Gravity mode should change engine gravity")
        assert_true(gravity_mode["active"] == "low" and gravity_mode["pressed"] == "true", "Low Gravity button should show active state")
        assert_true("Low Gravity enabled" in gravity_mode["toast"], "Gravity mode should give player feedback")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(650)
        gravity_mode_reload = page.evaluate(
            f"""
            () => {{
              const save = JSON.parse(localStorage.getItem('{SAVE_KEY}'));
              return {{
                saved: save.settings.gravityMode,
                gravityY: window.__buddyLabDebug.engine.gravity.y,
                active: document.querySelector('.gravity-mode-button.is-active')?.dataset.gravityMode
              }};
            }}
            """
        )
        assert_true(gravity_mode_reload["saved"] == "low", "Gravity mode should survive reload")
        assert_true(abs(gravity_mode_reload["gravityY"] - 0.45) < 0.001, "Reloaded Low Gravity should apply to engine gravity")
        assert_true(gravity_mode_reload["active"] == "low", "Reloaded Low Gravity should keep active menu state")
        result["checks"]["modeParity"] = {"enabled": mode_parity, "reload": mode_parity_reload, "gravity": gravity_mode, "gravityReload": gravity_mode_reload}
        page.locator(".menu", has_text="Modes").hover()
        page.locator(".menu__submenu-trigger", has_text="Gravity").hover()
        page.click('.gravity-mode-button[data-gravity-mode="normal"]')
        page.wait_for_timeout(120)

        page.click('.tool-button[data-tool="ball"]')
        selected = page.evaluate(
            """
            () => ({
              activeTool: document.querySelector('.tool-button--active')?.dataset.tool,
              readout: document.querySelector('#toolName')?.textContent
            })
            """
        )
        assert_true(selected["activeTool"] == "ball", "Ball should be selected from the rail")
        assert_true(selected["readout"] == "Ball", "Tool readout should match selected tool")
        result["checks"]["toolSelection"] = selected

        box = page.locator("#world").bounding_box()
        page.mouse.move(box["x"] + box["width"] * 0.35, box["y"] + box["height"] * 0.48)
        page.mouse.down()
        page.mouse.move(box["x"] + box["width"] * 0.64, box["y"] + box["height"] * 0.40, steps=8)
        page.mouse.up()
        page.wait_for_timeout(1200)
        scored = page.evaluate(
            """
            () => ({
              cash: document.querySelector('#cash')?.textContent,
              xp: document.querySelector('#xp')?.textContent,
              combo: document.querySelector('#combo')?.textContent,
              balls: window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_ball').length,
              ballCosmetic: window.__buddyLabDebug.state.props.find((body) => body.label === 'prop_ball')?.plugin?.cosmetic?.type || '',
              replayHasThrow: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'throw'),
              replayHasToy: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('toy'))
            })
            """
        )
        assert_true("NaN" not in scored["cash"], "Scoring cash should stay finite")
        assert_true("NaN" not in scored["xp"], "Scoring XP should stay finite")
        assert_true(money_to_int(scored["cash"]) > money_to_int(initial["cash"]), "Interaction should earn cash")
        assert_true(scored["balls"] >= 1, "Ball launch should spawn a ball prop")
        assert_true(scored["ballCosmetic"] == "ball-basic", "Ball should carry explicit cosmetic metadata")
        assert_true(scored["replayHasThrow"] and scored["replayHasToy"], "Ball should record throw/toy scoring tags")
        result["checks"]["scoring"] = scored

        page.evaluate(
            f"""
            () => localStorage.setItem('{SAVE_KEY}', JSON.stringify({{
              version: 2,
              cash: 3000,
              xp: 0,
              unlockedTools: ['hand', 'ball', 'beachball', 'bowling', 'brick', 'glove', 'anvil', 'rope', 'water', 'fan', 'paintball', 'foamdart', 'corkpopper', 'plunger', 'rubber', 'heatcone', 'sparkwand', 'frostpuff', 'goomist', 'pulsebeam', 'grenade', 'trampoline', 'gift', 'confetti', 'tesla', 'blackhole'],
              unlockedSkins: ['classic'],
              selectedSkin: 'classic',
              settings: {{ reducedFlash: true, slapstick: true, audio: false, haptics: false, slowMo: false, ceilingOpen: false, assetPack: 'base', audioPack: 'classic', liquidType: 'slime' }},
              challengeMode: 'free',
              challengeBests: {{}},
              tool: 'brick'
            }}))
            """
        )
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(800)
        box = page.locator("#world").bounding_box()

        prop_throws = {}
        for tool_id, label, minimum_speed in [("beachball", "prop_beachball", 3.0), ("bowling", "prop_bowling", 2.0), ("brick", "prop_brick", 2.5), ("glove", "prop_glove", 3.0), ("anvil", "prop_anvil", 1.5)]:
            page.click(f'.tool-button[data-tool="{tool_id}"]')
            before_cash = money_to_int(page.locator("#cash").text_content())
            page.mouse.move(box["x"] + box["width"] * 0.32, box["y"] + box["height"] * 0.36)
            page.mouse.down()
            page.mouse.move(box["x"] + box["width"] * 0.72, box["y"] + box["height"] * 0.31, steps=10)
            page.mouse.up()
            page.wait_for_timeout(450)
            thrown = page.evaluate(
                """
                (label) => {
                  const props = window.__buddyLabDebug.state.props.filter((body) => body.label === label);
                  const body = props.at(-1);
                  return {
                    count: props.length,
                    speed: body ? Matter.Vector.magnitude(body.velocity) : 0,
                    cash: document.querySelector('#cash')?.textContent,
                    activeTool: document.querySelector('.tool-button--active')?.dataset.tool,
                    cosmetic: body?.plugin?.cosmetic?.type || '',
                    replayHasEvent: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === (
                      label === 'prop_bowling' ? 'bowling' : label === 'prop_glove' ? 'punch' : label === 'prop_beachball' ? 'beachball' : 'throw'
                    )),
                    replayHasPropVariant: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('propVariant'))
                  };
                }
                """,
                label
            )
            assert_true(thrown["activeTool"] == tool_id, f"{tool_id} should be selected before throw")
            assert_true(thrown["count"] >= 1, f"{label} should spawn a prop body")
            assert_true(thrown["speed"] > minimum_speed, f"{label} should launch with meaningful velocity")
            assert_true("NaN" not in thrown["cash"], f"{label} throw cash should stay finite")
            assert_true(money_to_int(thrown["cash"]) > before_cash, f"{label} throw should score cash")
            assert_true(thrown["replayHasEvent"], f"{label} should record its prop-specific score hook")
            expected_cosmetics = {
                "beachball": "beach-ball-striped",
                "bowling": "bowling-classic",
                "brick": "foam-brick-lined",
                "glove": "glove-laced",
                "anvil": "stage-weight-anvil"
            }
            if tool_id in ["beachball", "bowling", "glove"]:
                assert_true(thrown["replayHasPropVariant"], f"{label} should record the shared prop variant hook")
            assert_true(thrown["cosmetic"] == expected_cosmetics[tool_id], f"{label} should carry its visual cosmetic skin metadata")
            prop_throws[tool_id] = thrown
        result["checks"]["propThrows"] = prop_throws

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'props';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        box = page.locator("#world").bounding_box()
        for tool_id in ["bowling", "glove", "bowling", "glove"]:
            page.click(f'.tool-button[data-tool="{tool_id}"]')
            page.mouse.move(box["x"] + box["width"] * 0.30, box["y"] + box["height"] * 0.34)
            page.mouse.down()
            page.mouse.move(box["x"] + box["width"] * 0.70, box["y"] + box["height"] * 0.31, steps=8)
            page.mouse.up()
            page.wait_for_timeout(180)
        prop_challenge = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              return {
                selected: document.querySelector('#challengeMode')?.value,
                hud: document.querySelector('#challenge')?.textContent,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.props?.elapsed,
                cash: document.querySelector('#cash')?.textContent
              };
            }
            """
        )
        assert_true(prop_challenge["selected"] == "props", "Prop Tricks challenge should stay selected")
        assert_true("Prop Tricks" in prop_challenge["summary"] and "Complete" in prop_challenge["summary"], "Prop Tricks should complete from Bowling/Glove hooks")
        assert_true(isinstance(prop_challenge["best"], (int, float)) and prop_challenge["best"] > 0, "Prop Tricks best time should be saved")
        assert_true("NaN" not in prop_challenge["cash"], "Prop Tricks reward should keep cash finite")
        result["checks"]["propVariantChallenge"] = prop_challenge

        page.evaluate(
            """
            () => {
              const { engine, state } = window.__buddyLabDebug;
              state.props.forEach((body) => Matter.World.remove(engine.world, body));
              state.props = [];
              state.grenades = [];
              state.coils = [];
              state.replayLog = [];
            }
            """
        )
        page.click('.tool-button[data-tool="hand"]')
        hand_start = page.evaluate(
            """
            () => {
              const body = window.__buddyLabDebug.state.torso || window.__buddyLabDebug.state.head;
              return {
                x: body.position.x,
                y: body.position.y,
                cash: document.querySelector('#cash')?.textContent
              };
            }
            """
        )
        before_hand_cash = money_to_int(hand_start["cash"])
        start_x = box["x"] + (hand_start["x"] / 960) * box["width"]
        start_y = box["y"] + (hand_start["y"] / 640) * box["height"]
        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.wait_for_timeout(80)
        page.mouse.move(start_x + box["width"] * 0.30, start_y - box["height"] * 0.12, steps=4)
        page.mouse.up()
        page.wait_for_timeout(650)
        hand_flick = page.evaluate(
            """
            () => {
              const body = window.__buddyLabDebug.state.torso || window.__buddyLabDebug.state.head;
              return {
                activeTool: document.querySelector('.tool-button--active')?.dataset.tool,
                cash: document.querySelector('#cash')?.textContent,
                speed: Matter.Vector.magnitude(body.velocity),
                replayHasThrow: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'throw')
              };
            }
            """
        )
        assert_true(hand_flick["activeTool"] == "hand", "Hand should be selected before grab/flick")
        assert_true("NaN" not in hand_flick["cash"], "Hand flick cash should stay finite")
        assert_true(money_to_int(hand_flick["cash"]) > before_hand_cash, "Hand release flick should score cash")
        assert_true(hand_flick["speed"] > 0.35, "Hand release flick should leave the grabbed body moving")
        assert_true(hand_flick["replayHasThrow"], "Hand release flick should record a throw event")

        wall_recovery = page.evaluate(
            """
            async () => {
              const { state } = window.__buddyLabDebug;
              const bodies = Matter.Composite.allBodies(state.buddy);
              Matter.Composite.translate(state.buddy, { x: -1200, y: 0 });
              bodies.forEach((body) => Matter.Body.setVelocity(body, { x: -9, y: 0 }));
              const beforeMinX = Math.min(...bodies.map((body) => body.position.x));
              await new Promise((resolve) => setTimeout(resolve, 1200));
              const afterMinX = Math.min(...bodies.map((body) => body.bounds.min.x));
              const maxSpeed = Math.max(...bodies.map((body) => Matter.Vector.magnitude(body.velocity)));
              return { beforeMinX, afterMinX, maxSpeed };
            }
            """
        )
        assert_true(wall_recovery["beforeMinX"] < 0, "Wall recovery setup should push buddy out of bounds")
        assert_true(wall_recovery["afterMinX"] >= 8, f"Wall recovery should bring buddy back inside the stage: {wall_recovery}")
        assert_true(wall_recovery["maxSpeed"] < 8, f"Wall recovery should damp stuck velocities: {wall_recovery}")
        result["checks"]["handAndWallRecovery"] = {"hand": hand_flick, "wall": wall_recovery}

        page.evaluate(
            f"""
            () => localStorage.setItem('{SAVE_KEY}', JSON.stringify({{
              version: 2,
              cash: 5000,
              xp: 0,
              unlockedTools: ['hand', 'ball', 'beachball', 'bowling', 'brick', 'glove', 'anvil', 'rope', 'water', 'fan', 'paintball', 'foamdart', 'corkpopper', 'plunger', 'rubber', 'heatcone', 'sparkwand', 'frostpuff', 'goomist', 'pulsebeam', 'grenade', 'trampoline', 'gift', 'confetti', 'tesla', 'blackhole'],
              unlockedSkins: ['classic'],
              selectedSkin: 'classic',
              settings: {{ reducedFlash: true, slapstick: true, audio: false, haptics: false, slowMo: false, ceilingOpen: false, assetPack: 'base', audioPack: 'classic', liquidType: 'slime' }},
              challengeMode: 'free',
              challengeBests: {{}},
              tool: 'hand'
            }}))
            """
        )
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(800)
        box = page.locator("#world").bounding_box()

        def stage_x(world_x):
            return box["x"] + (world_x / 960) * box["width"]

        def stage_y(world_y):
            return box["y"] + (world_y / 640) * box["height"]

        def center_buddy():
            return page.evaluate(
                """
                () => {
                  const { state } = window.__buddyLabDebug;
                  const bodies = Matter.Composite.allBodies(state.buddy);
                  const center = bodies.reduce((sum, body) => ({
                    x: sum.x + body.position.x / bodies.length,
                    y: sum.y + body.position.y / bodies.length
                  }), { x: 0, y: 0 });
                  Matter.Composite.translate(state.buddy, { x: 480 - center.x, y: 300 - center.y });
                  bodies.forEach((body) => {
                    Matter.Body.setVelocity(body, { x: 0, y: 0 });
                    Matter.Body.setAngularVelocity(body, 0);
                  });
                  state.replayLog = [];
                  state.particles = [];
                  state.decals = [];
                  return {
                    x: state.torso.position.x,
                    y: state.torso.position.y,
                    cash: document.querySelector('#cash')?.textContent
                  };
                }
                """
            )

        tool_effects = {}

        torso = center_buddy()
        page.click('.tool-button[data-tool="trampoline"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.click(stage_x(torso["x"]), stage_y(torso["y"] + 125))
        page.wait_for_timeout(250)
        trampoline_effect = page.evaluate(
            """
            () => {
              const pads = window.__buddyLabDebug.state.props.filter((body) => body.label === 'trampoline');
              return {
                pads: pads.length,
                cosmetic: pads.at(-1)?.plugin?.cosmetic?.type || '',
                bounce: pads.at(-1)?.plugin?.cosmetic?.bounce || '',
                cash: document.querySelector('#cash')?.textContent,
                replayHasBuild: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'build'),
                replayHasBuilder: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('builder'))
              };
            }
            """
        )
        assert_true(trampoline_effect["pads"] >= 1, "Trampoline should place a pad")
        assert_true(trampoline_effect["cosmetic"] == "trampoline-pad", "Trampoline should carry explicit cosmetic metadata")
        assert_true(trampoline_effect["bounce"] == "high", "Trampoline should document its high-bounce builder role")
        assert_true(trampoline_effect["replayHasBuild"] and trampoline_effect["replayHasBuilder"], "Trampoline should record build/builder tags")
        assert_true(money_to_int(trampoline_effect["cash"]) > before_cash, "Trampoline placement should score cash")
        tool_effects["trampoline"] = trampoline_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="gift"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.click(stage_x(torso["x"] + 140), stage_y(torso["y"] - 30))
        page.wait_for_timeout(300)
        gift_effect = page.evaluate(
            """
            () => {
              const gifts = window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_gift');
              return {
                gifts: gifts.length,
                cosmetic: gifts.at(-1)?.plugin?.cosmetic?.type || '',
                cash: document.querySelector('#cash')?.textContent,
                mood: window.__buddyLabDebug.state.mood,
                replayHasGift: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'gift'),
                replayHasHappy: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('happy'))
              };
            }
            """
        )
        assert_true(gift_effect["gifts"] >= 1, "Gift Box should place a gift prop")
        assert_true(gift_effect["cosmetic"] == "gift-box", "Gift Box should carry explicit cosmetic metadata")
        assert_true(gift_effect["replayHasGift"] and gift_effect["replayHasHappy"], "Gift Box should record gift/happy tags")
        assert_true("NaN" not in gift_effect["cash"] and money_to_int(gift_effect["cash"]) != before_cash, "Gift Box should update finite cash")
        tool_effects["gift"] = gift_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="confetti"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.click(stage_x(torso["x"] + 115), stage_y(torso["y"] + 5))
        page.wait_for_timeout(300)
        confetti_effect = page.evaluate(
            """
            () => {
              const poppers = window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_confetti');
              return {
                poppers: poppers.length,
                cosmetic: poppers.at(-1)?.plugin?.cosmetic?.type || '',
                confettiParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.kind === 'confetti').length,
                cash: document.querySelector('#cash')?.textContent,
                mood: window.__buddyLabDebug.state.mood,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity),
                replayHasConfetti: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'confetti'),
                replayHasHappy: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('happy')),
                replayHasNice: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('nice'))
              };
            }
            """
        )
        assert_true(confetti_effect["poppers"] >= 1, "Confetti Popper should place a popper prop")
        assert_true(confetti_effect["cosmetic"] == "confetti-popper", "Confetti Popper should carry explicit cosmetic metadata")
        assert_true(confetti_effect["confettiParticles"] >= 12, "Confetti Popper should emit visible confetti particles")
        assert_true(confetti_effect["mood"] == "Excited", "Confetti Popper should set excited mood")
        assert_true(confetti_effect["torsoSpeed"] > 0.02, "Confetti Popper should give Buddy a gentle bump")
        assert_true(confetti_effect["replayHasConfetti"] and confetti_effect["replayHasHappy"] and confetti_effect["replayHasNice"], "Confetti Popper should record confetti/happy/nice tags")
        assert_true(money_to_int(confetti_effect["cash"]) > before_cash, "Confetti Popper should score cash")
        tool_effects["confetti"] = confetti_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'cheer';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="confetti"]')
        for offset in [-80, -40, 0, 40, 80]:
            page.mouse.click(stage_x(torso["x"] + offset), stage_y(torso["y"] + 30))
            page.wait_for_timeout(130)
        cheer_challenge = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              return {
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.cheer?.elapsed,
                confettiParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.kind === 'confetti').length,
                cash: document.querySelector('#cash')?.textContent
              };
            }
            """
        )
        assert_true(cheer_challenge["selected"] == "cheer", "Cheer Check challenge should stay selected")
        assert_true("Cheer Check" in cheer_challenge["summary"] and "Complete" in cheer_challenge["summary"], "Cheer Check should complete from Confetti Popper hooks")
        assert_true(isinstance(cheer_challenge["best"], (int, float)) and cheer_challenge["best"] > 0, "Cheer Check best time should be saved")
        assert_true(cheer_challenge["confettiParticles"] >= 20, "Cheer Check should leave visible confetti particles")
        assert_true("NaN" not in cheer_challenge["cash"], "Cheer Check reward should keep cash finite")
        tool_effects["cheerChallenge"] = cheer_challenge

        torso = center_buddy()
        page.click('.tool-button[data-tool="rope"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.click(stage_x(torso["x"]), stage_y(torso["y"]))
        page.wait_for_timeout(300)
        rope_effect = page.evaluate(
            """
            () => ({
              ropes: window.__buddyLabDebug.state.ropes.length,
              cash: document.querySelector('#cash')?.textContent,
              replayHasTether: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'tether')
            })
            """
        )
        assert_true(rope_effect["ropes"] >= 1, "Rope should attach an elastic constraint")
        assert_true(rope_effect["replayHasTether"], "Rope should record a tether event")
        assert_true(money_to_int(rope_effect["cash"]) > before_cash, "Rope should score cash")
        tool_effects["rope"] = rope_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="tesla"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.click(stage_x(torso["x"] + 70), stage_y(torso["y"]))
        page.wait_for_timeout(120)
        tesla_effect = page.evaluate(
            """
            () => ({
              coils: window.__buddyLabDebug.state.coils.length,
              cosmetic: window.__buddyLabDebug.state.coils.at(-1)?.body?.plugin?.cosmetic?.type || '',
              bolts: window.__buddyLabDebug.state.particles.filter((particle) => particle.type === 'bolt').length,
              cash: document.querySelector('#cash')?.textContent,
              replayHasShock: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'shock')
            })
            """
        )
        assert_true(tesla_effect["coils"] >= 1, "Tesla should place a coil")
        assert_true(tesla_effect["cosmetic"] == "tesla-coil", "Tesla should carry explicit cosmetic metadata")
        assert_true(tesla_effect["bolts"] >= 1, "Tesla should emit bolt particles near Buddy")
        assert_true(tesla_effect["replayHasShock"], "Tesla should record a shock event")
        assert_true(money_to_int(tesla_effect["cash"]) > before_cash, "Tesla should score cash")
        tool_effects["tesla"] = tesla_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="grenade"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.click(stage_x(torso["x"] + 45), stage_y(torso["y"]))
        grenade_cosmetic = page.evaluate("() => window.__buddyLabDebug.state.grenades.at(-1)?.body?.plugin?.cosmetic?.type || ''")
        page.evaluate(
            """
            () => {
              const { state } = window.__buddyLabDebug;
              const grenade = state.grenades.at(-1);
              if (!grenade) {
                return;
              }
              Matter.Body.setPosition(grenade.body, {
                x: state.torso.position.x + 35,
                y: state.torso.position.y
              });
              Matter.Body.setVelocity(grenade.body, { x: 0, y: 0 });
              grenade.explodeAt = performance.now() + 90;
            }
            """
        )
        page.wait_for_timeout(450)
        grenade_effect = page.evaluate(
            """
            () => ({
              grenades: window.__buddyLabDebug.state.grenades.length,
              liveGrenadeProps: window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_grenade').length,
              cash: document.querySelector('#cash')?.textContent,
              replayHasExplosion: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'explosion')
            })
            """
        )
        assert_true(grenade_cosmetic == "grenade-shell", "Grenade should carry explicit cosmetic metadata before detonation")
        assert_true(grenade_effect["grenades"] == 0 and grenade_effect["liveGrenadeProps"] == 0, "Grenade should explode and remove its prop")
        assert_true(grenade_effect["replayHasExplosion"], "Grenade should record an explosion event")
        assert_true(money_to_int(grenade_effect["cash"]) > before_cash, "Grenade explosion should score cash")
        tool_effects["grenade"] = grenade_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="paintball"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 260), stage_y(torso["y"]))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] + 20), stage_y(torso["y"]), steps=5)
        page.mouse.up()
        page.evaluate(
            """
            () => {
              const { state } = window.__buddyLabDebug;
              const paint = state.props.find((body) => body.label === 'prop_paintball');
              if (!paint) {
                return;
              }
              Matter.Body.setPosition(paint, {
                x: state.torso.position.x - 18,
                y: state.torso.position.y
              });
              Matter.Body.setVelocity(paint, { x: 9, y: 0 });
            }
            """
        )
        page.wait_for_timeout(700)
        paint_effect = page.evaluate(
            """
            () => ({
              decals: window.__buddyLabDebug.state.decals.length,
              paintballs: window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_paintball').length,
              cash: document.querySelector('#cash')?.textContent,
              replayHasPaint: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'paint')
            })
            """
        )
        assert_true(paint_effect["decals"] >= 1, "Paintball should create a buddy decal/tint")
        assert_true(paint_effect["replayHasPaint"], "Paintball collision should record a paint event")
        assert_true(money_to_int(paint_effect["cash"]) > before_cash, "Paintball hit should score cash")
        tool_effects["paintball"] = paint_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="foamdart"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 245), stage_y(torso["y"] - 6))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] + 16), stage_y(torso["y"] - 2), steps=5)
        page.mouse.up()
        page.wait_for_timeout(720)
        dart_effect = page.evaluate(
            """
            () => {
              const darts = window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_foamdart');
              return {
                darts: darts.length,
                stuckDarts: darts.filter((body) => body.plugin?.stuck).length,
                cosmetic: darts.at(-1)?.plugin?.cosmetic?.type || '',
                cash: document.querySelector('#cash')?.textContent,
                replayHasDart: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'dart'),
                replayHasDartHit: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'dartHit'),
                replayHasFoamDart: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('foamDart')),
                burstParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#ffc857').length
              };
            }
            """
        )
        assert_true(dart_effect["darts"] >= 1, "Foam Dart should spawn a dart body")
        assert_true(dart_effect["stuckDarts"] >= 1, "Foam Dart should stick after hitting Buddy")
        assert_true(dart_effect["cosmetic"] == "foam-dart", "Foam Dart should carry cosmetic metadata")
        assert_true(dart_effect["replayHasDart"], "Foam Dart should score on launch")
        assert_true(dart_effect["replayHasDartHit"], "Foam Dart should score on hit")
        assert_true(dart_effect["replayHasFoamDart"], "Foam Dart should emit shared foamDart tags")
        assert_true(dart_effect["burstParticles"] >= 1, "Foam Dart hit should emit impact particles")
        assert_true(money_to_int(dart_effect["cash"]) > before_cash, "Foam Dart should score cash")
        tool_effects["foamdart"] = dart_effect

        page.evaluate(
            """
            () => {
              const { engine, state } = window.__buddyLabDebug;
              state.props
                .filter((body) => body.label === 'prop_foamdart')
                .forEach((body) => Matter.World.remove(engine.world, body));
              state.props = state.props.filter((body) => body.label !== 'prop_foamdart');
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="corkpopper"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 235), stage_y(torso["y"] - 4))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] + 18), stage_y(torso["y"] - 1), steps=5)
        page.mouse.up()
        page.wait_for_timeout(720)
        cork_effect = page.evaluate(
            """
            () => {
              const corks = window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_cork');
              return {
                corks: corks.length,
                hitCorks: corks.filter((body) => body.plugin?.hit).length,
                cosmetic: corks.at(-1)?.plugin?.cosmetic?.type || '',
                cash: document.querySelector('#cash')?.textContent,
                replayHasCork: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'cork'),
                replayHasCorkHit: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'corkHit'),
                replayHasCorkPopper: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('corkPopper')),
                burstParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#c58a55').length,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity)
              };
            }
            """
        )
        assert_true(cork_effect["corks"] >= 1, "Cork Popper should spawn a cork body")
        assert_true(cork_effect["hitCorks"] >= 1, "Cork Popper should mark corks after hitting Buddy")
        assert_true(cork_effect["cosmetic"] == "cork-popper", "Cork Popper should carry cosmetic metadata")
        assert_true(cork_effect["replayHasCork"], "Cork Popper should score on launch")
        assert_true(cork_effect["replayHasCorkHit"], "Cork Popper should score on hit")
        assert_true(cork_effect["replayHasCorkPopper"], "Cork Popper should emit shared corkPopper tags")
        assert_true(cork_effect["burstParticles"] >= 1, "Cork Popper hit should emit cork particles")
        assert_true(cork_effect["torsoSpeed"] > 0.05, "Cork Popper should pop Buddy with a small impulse")
        assert_true(money_to_int(cork_effect["cash"]) > before_cash, "Cork Popper should score cash")
        tool_effects["corkpopper"] = cork_effect

        page.evaluate(
            """
            () => {
              const { engine, state } = window.__buddyLabDebug;
              state.props
                .filter((body) => body.label === 'prop_cork')
                .forEach((body) => Matter.World.remove(engine.world, body));
              state.props = state.props.filter((body) => body.label !== 'prop_cork');
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="plunger"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 245), stage_y(torso["y"] - 4))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] + 12), stage_y(torso["y"] - 2), steps=5)
        page.mouse.up()
        page.wait_for_timeout(720)
        plunger_effect = page.evaluate(
            """
            () => {
              const plungers = window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_plunger');
              const suctionBodies = Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                .filter((body) => body.plugin?.suctionTime > 0);
              return {
                plungers: plungers.length,
                hitPlungers: plungers.filter((body) => body.plugin?.hit).length,
                suctionPlungers: plungers.filter((body) => body.plugin?.suction).length,
                suctionBodies: suctionBodies.length,
                cosmetic: plungers.at(-1)?.plugin?.cosmetic?.type || '',
                cash: document.querySelector('#cash')?.textContent,
                replayHasPlunger: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'plunger'),
                replayHasPlungerHit: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'plungerHit'),
                replayHasSuction: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('suction')),
                replayHasPlungerShot: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('plungerShot')),
                burstParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#e46e5f').length,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity)
              };
            }
            """
        )
        assert_true(plunger_effect["plungers"] >= 1, "Plunger Shot should spawn a plunger body")
        assert_true(plunger_effect["hitPlungers"] >= 1 and plunger_effect["suctionPlungers"] >= 1, "Plunger Shot should mark suction hits")
        assert_true(plunger_effect["suctionBodies"] >= 1, "Plunger Shot should mark Buddy with temporary suction status")
        assert_true(plunger_effect["cosmetic"] == "plunger-shot", "Plunger Shot should carry cosmetic metadata")
        assert_true(plunger_effect["replayHasPlunger"], "Plunger Shot should score on launch")
        assert_true(plunger_effect["replayHasPlungerHit"], "Plunger Shot should score on hit")
        assert_true(plunger_effect["replayHasSuction"] and plunger_effect["replayHasPlungerShot"], "Plunger Shot should emit suction and plungerShot tags")
        assert_true(plunger_effect["burstParticles"] >= 1, "Plunger Shot hit should emit suction particles")
        assert_true(plunger_effect["torsoSpeed"] > 0.05, "Plunger Shot should tug Buddy with a small impulse")
        assert_true(money_to_int(plunger_effect["cash"]) > before_cash, "Plunger Shot should score cash")
        tool_effects["plunger"] = plunger_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'suction';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="plunger"]')
        for offset in [-42, -18, 8, 34]:
            page.mouse.move(stage_x(torso["x"] - 245), stage_y(torso["y"] + offset))
            page.mouse.down()
            page.mouse.move(stage_x(torso["x"] + 16), stage_y(torso["y"] + offset), steps=5)
            page.mouse.up()
            page.wait_for_timeout(360)
        suction_challenge = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              return {
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.suction?.elapsed,
                suctionBodies: Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                  .filter((body) => body.plugin?.suctionTime > 0).length,
                cash: document.querySelector('#cash')?.textContent
              };
            }
            """
        )
        assert_true(suction_challenge["selected"] == "suction", "Suction Drill challenge should stay selected")
        assert_true("Suction Drill" in suction_challenge["summary"] and "Complete" in suction_challenge["summary"], "Suction Drill should complete from Plunger Shot hooks")
        assert_true(isinstance(suction_challenge["best"], (int, float)) and suction_challenge["best"] > 0, "Suction Drill best time should be saved")
        assert_true(suction_challenge["suctionBodies"] >= 1, "Suction Drill should leave visible suction body status")
        assert_true("NaN" not in suction_challenge["cash"], "Suction Drill reward should keep cash finite")
        tool_effects["suctionChallenge"] = suction_challenge

        torso = center_buddy()
        page.click('.tool-button[data-tool="rubber"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 230), stage_y(torso["y"]))
        page.mouse.down()
        for offset in [-180, -120, -60, 0]:
            page.mouse.move(stage_x(torso["x"] + offset), stage_y(torso["y"]), steps=2)
            page.wait_for_timeout(110)
        page.mouse.up()
        page.wait_for_timeout(350)
        rubber_effect = page.evaluate(
            """
            () => ({
              pellets: window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_rubber').length,
              cash: document.querySelector('#cash')?.textContent,
              toolMeta: document.querySelector('#toolMeta')?.textContent,
              replayHasRubber: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'rubber'),
              replayHasBeadCannon: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('beadCannon')),
              variants: [...new Set(window.__buddyLabDebug.state.props
                .filter((body) => body.label === 'prop_rubber')
                .map((body) => body.plugin?.cosmetic?.variant || ''))],
              fastestPellet: Math.max(0, ...window.__buddyLabDebug.state.props
                .filter((body) => body.label === 'prop_rubber')
                .map((body) => Matter.Vector.magnitude(body.velocity)))
            })
            """
        )
        assert_true(rubber_effect["pellets"] >= 2, "Rubber Blaster should fire multiple pellets while held")
        assert_true(rubber_effect["replayHasRubber"], "Rubber Blaster should record rubber firing events")
        assert_true(rubber_effect["replayHasBeadCannon"], "Rubber Blaster should emit the bead-cannon shared event")
        assert_true("Burst" in rubber_effect["toolMeta"], "Rubber Blaster should show burst status in the HUD")
        assert_true(len([variant for variant in rubber_effect["variants"] if variant]) >= 2, "Rubber Blaster should cycle visible pellet variants")
        assert_true(rubber_effect["fastestPellet"] > 1.2, "Rubber pellets should keep meaningful velocity")
        assert_true(money_to_int(rubber_effect["cash"]) > before_cash, "Rubber Blaster should score cash")
        tool_effects["rubber"] = rubber_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'bead';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
              window.__buddyLabDebug.state.rubberCooldown = 0;
              window.__buddyLabDebug.state.rubberBurstShots = 0;
              window.__buddyLabDebug.state.rubberBurstWindow = 0;
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="rubber"]')
        page.mouse.move(stage_x(torso["x"] - 230), stage_y(torso["y"] - 40))
        page.mouse.down()
        for offset in [-230, -190, -150, -110, -70, -30, 10, 50, 90, 130]:
            page.mouse.move(stage_x(torso["x"] + offset), stage_y(torso["y"] - 20), steps=2)
            page.wait_for_timeout(155)
        page.mouse.up()
        page.wait_for_timeout(350)
        bead_challenge = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              return {
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.bead?.elapsed,
                toolMeta: document.querySelector('#toolMeta')?.textContent,
                pellets: window.__buddyLabDebug.state.props.filter((body) => body.label === 'prop_rubber').length,
                variants: [...new Set(window.__buddyLabDebug.state.props
                  .filter((body) => body.label === 'prop_rubber')
                  .map((body) => body.plugin?.cosmetic?.variant || ''))],
                cash: document.querySelector('#cash')?.textContent
              };
            }
            """
        )
        assert_true(bead_challenge["selected"] == "bead", "Bead Cannon challenge should stay selected")
        assert_true("Bead Cannon" in bead_challenge["summary"] and "Complete" in bead_challenge["summary"], "Bead Cannon should complete from Rubber Blaster hooks")
        assert_true(isinstance(bead_challenge["best"], (int, float)) and bead_challenge["best"] > 0, "Bead Cannon best time should be saved")
        assert_true("Burst" in bead_challenge["toolMeta"], "Bead Cannon run should keep Rubber Blaster burst UI visible")
        assert_true(bead_challenge["pellets"] >= 6, "Bead Cannon run should fire enough rubber pellets")
        assert_true(len([variant for variant in bead_challenge["variants"] if variant]) >= 3, "Bead Cannon run should include every rubber pellet variant")
        assert_true("NaN" not in bead_challenge["cash"], "Bead Cannon reward should keep cash finite")
        result["checks"]["beadCannonChallenge"] = bead_challenge

        torso = center_buddy()
        page.click('.tool-button[data-tool="heatcone"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 220), stage_y(torso["y"]))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] - 120), stage_y(torso["y"]), steps=2)
        page.wait_for_timeout(760)
        page.mouse.up()
        heat_effect = page.evaluate(
            """
            () => ({
              cash: document.querySelector('#cash')?.textContent,
              replayHasHeat: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'heat'),
              emberParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#ff8d66').length,
              mood: window.__buddyLabDebug.state.mood,
              torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity)
            })
            """
        )
        assert_true(heat_effect["replayHasHeat"], "Heat Cone should record heat events")
        assert_true(heat_effect["emberParticles"] >= 1, "Heat Cone should emit ember particles")
        assert_true(heat_effect["mood"] == "Afraid", "Heat Cone should set afraid mood without flash")
        assert_true(heat_effect["torsoSpeed"] > 0.05, "Heat Cone should apply a small warm push")
        assert_true(money_to_int(heat_effect["cash"]) > before_cash, "Heat Cone should score cash")
        tool_effects["heatcone"] = heat_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'spark';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
              window.__buddyLabDebug.state.sparkWandCooldown = 0;
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="sparkwand"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 120), stage_y(torso["y"] - 10))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] - 70), stage_y(torso["y"] - 5), steps=3)
        page.wait_for_timeout(1600)
        page.mouse.up()
        page.wait_for_timeout(60)
        spark_effect = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              return {
                cash: document.querySelector('#cash')?.textContent,
                replayHasSpark: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'spark'),
                replayHasSparkWand: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('sparkWand')),
                boltParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.type === 'bolt' && particle.color === '#f1ff8b').length,
                mood: window.__buddyLabDebug.state.mood,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity),
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.spark?.elapsed
              };
            }
            """
        )
        assert_true(spark_effect["replayHasSpark"], "Spark Wand should record spark events")
        assert_true(spark_effect["replayHasSparkWand"], "Spark Wand should emit the shared sparkWand event")
        assert_true(spark_effect["boltParticles"] >= 1, "Spark Wand should emit cursor-to-buddy bolt particles")
        assert_true(spark_effect["mood"] == "Stunned", "Spark Wand should set stunned mood")
        assert_true(spark_effect["torsoSpeed"] > 0.05, "Spark Wand should apply a small stun impulse")
        assert_true(money_to_int(spark_effect["cash"]) > before_cash, "Spark Wand should score cash")
        assert_true(spark_effect["selected"] == "spark", "Spark Drill challenge should stay selected")
        assert_true("Spark Drill" in spark_effect["summary"] and "Complete" in spark_effect["summary"], "Spark Drill should complete from Spark Wand hooks")
        assert_true(isinstance(spark_effect["best"], (int, float)) and spark_effect["best"] > 0, "Spark Drill best time should be saved")
        tool_effects["sparkwand"] = spark_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'frost';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
              window.__buddyLabDebug.state.frostPuffCooldown = 0;
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="frostpuff"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 120), stage_y(torso["y"] - 8))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] - 68), stage_y(torso["y"] - 4), steps=3)
        page.wait_for_timeout(1600)
        page.mouse.up()
        page.wait_for_timeout(60)
        frost_effect = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              return {
                cash: document.querySelector('#cash')?.textContent,
                replayHasFrost: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'frost'),
                replayHasFrostPuff: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('frostPuff')),
                replayHasCold: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('cold')),
                frostParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#baf7ff').length,
                frostedBodies: Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                  .filter((body) => body.plugin?.frostTime > 0).length,
                mood: window.__buddyLabDebug.state.mood,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity),
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.frost?.elapsed
              };
            }
            """
        )
        assert_true(frost_effect["replayHasFrost"], "Frost Puff should record frost events")
        assert_true(frost_effect["replayHasFrostPuff"], "Frost Puff should emit the shared frostPuff event")
        assert_true(frost_effect["replayHasCold"], "Frost Puff should tag cold events")
        assert_true(frost_effect["frostParticles"] >= 1, "Frost Puff should emit visible frost mist particles")
        assert_true(frost_effect["frostedBodies"] >= 1, "Frost Puff should temporarily mark chilled buddy bodies")
        assert_true(frost_effect["mood"] == "Surprised", "Frost Puff should set surprised mood")
        assert_true(frost_effect["torsoSpeed"] > 0.02, "Frost Puff should apply a small chill push")
        assert_true(money_to_int(frost_effect["cash"]) > before_cash, "Frost Puff should score cash")
        assert_true(frost_effect["selected"] == "frost", "Frost Test challenge should stay selected")
        assert_true("Frost Test" in frost_effect["summary"] and "Complete" in frost_effect["summary"], "Frost Test should complete from Frost Puff hooks")
        assert_true(isinstance(frost_effect["best"], (int, float)) and frost_effect["best"] > 0, "Frost Test best time should be saved")
        tool_effects["frostpuff"] = frost_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'goo';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
              window.__buddyLabDebug.state.gooMistCooldown = 0;
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="goomist"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 125), stage_y(torso["y"] - 6))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] - 66), stage_y(torso["y"] - 2), steps=3)
        page.wait_for_timeout(1600)
        page.mouse.up()
        page.wait_for_timeout(60)
        goo_effect = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              const gooedBodies = Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                .filter((body) => body.plugin?.gooTime > 0);
              return {
                cash: document.querySelector('#cash')?.textContent,
                replayHasGoo: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'goo'),
                replayHasGooMist: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('gooMist')),
                replayHasSlippery: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('slippery')),
                gooParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#98f17f').length,
                gooedBodies: gooedBodies.length,
                lowestFriction: gooedBodies.length ? Math.min(...gooedBodies.map((body) => body.friction)) : 1,
                mood: window.__buddyLabDebug.state.mood,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity),
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.goo?.elapsed
              };
            }
            """
        )
        assert_true(goo_effect["replayHasGoo"], "Goo Mist should record goo events")
        assert_true(goo_effect["replayHasGooMist"], "Goo Mist should emit the shared gooMist event")
        assert_true(goo_effect["replayHasSlippery"], "Goo Mist should tag slippery events")
        assert_true(goo_effect["gooParticles"] >= 1, "Goo Mist should emit visible goo particles")
        assert_true(goo_effect["gooedBodies"] >= 1, "Goo Mist should temporarily mark coated buddy bodies")
        assert_true(goo_effect["lowestFriction"] <= 0.08, "Goo Mist should lower body friction while active")
        assert_true(goo_effect["mood"] == "Curious", "Goo Mist should set curious mood")
        assert_true(goo_effect["torsoSpeed"] > 0.02, "Goo Mist should apply a small slippery push")
        assert_true(money_to_int(goo_effect["cash"]) > before_cash, "Goo Mist should score cash")
        assert_true(goo_effect["selected"] == "goo", "Slip Test challenge should stay selected")
        assert_true("Slip Test" in goo_effect["summary"] and "Complete" in goo_effect["summary"], "Slip Test should complete from Goo Mist hooks")
        assert_true(isinstance(goo_effect["best"], (int, float)) and goo_effect["best"] > 0, "Slip Test best time should be saved")
        tool_effects["goomist"] = goo_effect

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'pulse';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
              window.__buddyLabDebug.state.pulseBeamCooldown = 0;
            }
            """
        )
        torso = center_buddy()
        page.click('.tool-button[data-tool="pulsebeam"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 130), stage_y(torso["y"] - 4))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] - 62), stage_y(torso["y"]), steps=3)
        page.wait_for_timeout(1600)
        page.mouse.up()
        pulse_effect = page.evaluate(
            """
            () => {
              const save = JSON.parse(localStorage.getItem('buddyLab2026.save.v1'));
              const pulsedBodies = Matter.Composite.allBodies(window.__buddyLabDebug.state.buddy)
                .filter((body) => body.plugin?.pulseTime > 0);
              return {
                cash: document.querySelector('#cash')?.textContent,
                replayHasPulse: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'pulse'),
                replayHasPulseBeam: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('pulseBeam')),
                replayHasLight: window.__buddyLabDebug.state.replayLog.some((entry) => entry.tags?.includes('light')),
                pulseParticles: window.__buddyLabDebug.state.particles.filter((particle) => particle.color === '#fff27a').length,
                pulsedBodies: pulsedBodies.length,
                mood: window.__buddyLabDebug.state.mood,
                torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity),
                selected: document.querySelector('#challengeMode')?.value,
                summary: document.querySelector('#replayStrip')?.textContent,
                best: save.challengeBests?.pulse?.elapsed
              };
            }
            """
        )
        assert_true(pulse_effect["replayHasPulse"], "Pulse Beam should record pulse events")
        assert_true(pulse_effect["replayHasPulseBeam"], "Pulse Beam should emit the shared pulseBeam event")
        assert_true(pulse_effect["replayHasLight"], "Pulse Beam should tag light events")
        assert_true(pulse_effect["pulseParticles"] >= 1, "Pulse Beam should emit visible low-flash particles")
        assert_true(pulse_effect["pulsedBodies"] >= 1, "Pulse Beam should temporarily mark lit buddy bodies")
        assert_true(pulse_effect["mood"] == "Afraid", "Pulse Beam should set afraid mood")
        assert_true(pulse_effect["torsoSpeed"] > 0.04, "Pulse Beam should apply a steady push")
        assert_true(money_to_int(pulse_effect["cash"]) > before_cash, "Pulse Beam should score cash")
        assert_true(pulse_effect["selected"] == "pulse", "Pulse Check challenge should stay selected")
        assert_true("Pulse Check" in pulse_effect["summary"] and "Complete" in pulse_effect["summary"], "Pulse Check should complete from Pulse Beam hooks")
        assert_true(isinstance(pulse_effect["best"], (int, float)) and pulse_effect["best"] > 0, "Pulse Check best time should be saved")
        tool_effects["pulsebeam"] = pulse_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="fan"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] - 250), stage_y(torso["y"]))
        page.mouse.down()
        page.mouse.move(stage_x(torso["x"] - 130), stage_y(torso["y"]), steps=2)
        page.wait_for_timeout(750)
        page.mouse.up()
        fan_effect = page.evaluate(
            """
            () => ({
              cash: document.querySelector('#cash')?.textContent,
              replayHasWind: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'wind'),
              torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity)
            })
            """
        )
        assert_true(fan_effect["replayHasWind"], "Fan should record wind force when it reaches Buddy")
        assert_true(fan_effect["torsoSpeed"] > 0.1, "Fan should move Buddy")
        assert_true(money_to_int(fan_effect["cash"]) > before_cash, "Fan should score cash")
        tool_effects["fan"] = fan_effect

        torso = center_buddy()
        page.click('.tool-button[data-tool="blackhole"]')
        before_cash = money_to_int(torso["cash"])
        page.mouse.move(stage_x(torso["x"] + 140), stage_y(torso["y"] - 20))
        page.mouse.down()
        page.wait_for_timeout(750)
        page.mouse.up()
        blackhole_effect = page.evaluate(
            """
            () => ({
              cash: document.querySelector('#cash')?.textContent,
              replayHasGravity: window.__buddyLabDebug.state.replayLog.some((entry) => entry.text === 'gravity'),
              mood: window.__buddyLabDebug.state.mood,
              torsoSpeed: Matter.Vector.magnitude(window.__buddyLabDebug.state.torso.velocity)
            })
            """
        )
        assert_true(blackhole_effect["replayHasGravity"], "Black Hole should record gravity force")
        assert_true(blackhole_effect["mood"] == "Afraid", "Black Hole should set an afraid mood")
        assert_true(blackhole_effect["torsoSpeed"] > 0.1, "Black Hole should move Buddy")
        assert_true(money_to_int(blackhole_effect["cash"]) > before_cash, "Black Hole should score cash")
        tool_effects["blackhole"] = blackhole_effect
        result["checks"]["toolEffects"] = tool_effects

        page.click('.tool-button[data-tool="water"]')
        box = page.locator("#world").bounding_box()
        page.mouse.click(box["x"] + box["width"] * 0.5, box["y"] + box["height"] * 0.62)
        page.wait_for_timeout(350)
        liquid_use = page.evaluate(
            """
            () => ({
              activeTool: document.querySelector('.tool-button--active')?.dataset.tool,
              toast: document.querySelector('#toast')?.textContent,
              cash: document.querySelector('#cash')?.textContent,
              liquidEnabled: window.__buddyLabDebug.state.liquid.enabled,
              liquidType: window.__buddyLabDebug.state.liquid.type
            })
            """
        )
        assert_true(liquid_use["activeTool"] == "water", "Water Fill tool should be selectable")
        assert_true(liquid_use["liquidEnabled"] and liquid_use["liquidType"] == "slime", "Liquid placement should use selected Slime type")
        assert_true("NaN" not in liquid_use["cash"], "Liquid scoring should stay finite")
        result["checks"]["liquidUse"] = liquid_use

        page.evaluate(
            """
            () => {
              const challenge = document.querySelector('#challengeMode');
              challenge.value = 'liquid';
              challenge.dispatchEvent(new Event('change', { bubbles: true }));
            }
            """
        )
        for y_factor in [0.62, 0.95, 0.60]:
            page.mouse.click(box["x"] + box["width"] * 0.5, box["y"] + box["height"] * y_factor)
            page.wait_for_timeout(220)
        challenge = page.evaluate(
            """
            () => ({
              selected: document.querySelector('#challengeMode')?.value,
              hud: document.querySelector('#challenge')?.textContent,
              cash: document.querySelector('#cash')?.textContent,
              toast: document.querySelector('#toast')?.textContent,
              summary: document.querySelector('#replayStrip')?.textContent,
              best: JSON.parse(localStorage.getItem('buddyLab2026.save.v1')).challengeBests?.liquid?.elapsed
            })
            """
        )
        assert_true(challenge["selected"] == "liquid", "Liquid Control challenge should stay selected")
        assert_true("Liquid Control" in challenge["hud"], "Liquid Control challenge should show in HUD")
        assert_true("Complete" in challenge["summary"], "Challenge result summary should show completion")
        assert_true(isinstance(challenge["best"], (int, float)) and challenge["best"] > 0, "Liquid Control best time should be saved")
        assert_true("NaN" not in challenge["cash"], "Challenge reward should keep cash finite")
        result["checks"]["challengeMode"] = challenge

        page.evaluate(
            f"""
            () => localStorage.setItem('{SAVE_KEY}', JSON.stringify({{
              cash: 1000,
              xp: 0,
              unlockedTools: ['hand', 'ball', 'rope', 'water'],
              unlockedSkins: ['classic'],
              selectedSkin: 'classic',
              settings: {{ reducedFlash: true, slapstick: true, audio: false, haptics: false, slowMo: false, ceilingOpen: false }},
              tool: 'hand'
            }}))
            """
        )
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(700)
        fan_shop_before = page.evaluate(
            """
            () => {
              const item = [...document.querySelectorAll('.shop-item')]
                .find((entry) => entry.innerText.includes('Fan'));
              return {
                exists: !!item,
                buttonText: item?.querySelector('button')?.textContent || ''
              };
            }
            """
        )
        assert_true(fan_shop_before["exists"], "Fan shop item should exist before purchase")
        assert_true(fan_shop_before["buttonText"].startswith("Buy"), f"Fan should be buyable before purchase: {fan_shop_before}")
        page.evaluate(
            """
            () => {
              [...document.querySelectorAll('.shop-item')]
                .find((entry) => entry.innerText.includes('Fan'))
                ?.querySelector('button')
                ?.click();
            }
            """
        )
        page.wait_for_timeout(300)
        shop = page.evaluate(
            """
            () => ({
              cash: document.querySelector('#cash')?.textContent,
              activeTool: document.querySelector('.tool-button--active')?.dataset.tool,
              fanLocked: document.querySelector('.tool-button[data-tool="fan"]')?.classList.contains('tool-button--locked'),
              readout: document.querySelector('#toolName')?.textContent
            })
            """
        )
        assert_true(shop["activeTool"] == "fan", "Buying Fan should select it")
        assert_true(shop["fanLocked"] is False, "Fan should be unlocked after purchase")
        assert_true(money_to_int(shop["cash"]) == 880, "Fan purchase should subtract $120")
        result["checks"]["shopBuying"] = shop

        page.mouse.click(box["x"] + box["width"] * 0.52, box["y"] + box["height"] * 0.43, button="right")
        page.wait_for_timeout(250)
        radial = page.evaluate(
            """
            () => ({
              open: document.querySelector('#radialWheel')?.classList.contains('radial-wheel--open'),
              buttons: document.querySelectorAll('.radial-wheel__button').length,
              active: document.querySelector('.radial-wheel__button--active')?.getAttribute('aria-label')
            })
            """
        )
        assert_true(radial["open"], "Right-click should open radial wheel")
        assert_true(radial["buttons"] >= 11, "Radial wheel should include all tools")
        result["checks"]["radialWheel"] = radial

        page.wait_for_timeout(1100)
        export_start = page.evaluate("performance.now()")
        page.click("#exportReplay")
        page.wait_for_selector('#replayStrip a[download$=".webm"]', timeout=2500)
        export_end = page.evaluate("performance.now()")
        replay = page.evaluate(
            """
            () => ({
              elapsedMs: 0,
              exportDisabled: document.querySelector('#exportReplay')?.disabled,
              exportText: document.querySelector('#exportReplay')?.textContent,
              link: !!document.querySelector('#replayStrip a[download$=".webm"]'),
              linkText: document.querySelector('#replayStrip a')?.textContent,
              replayVisible: document.querySelector('#replayStrip')?.classList.contains('replay-strip--visible')
            })
            """
        )
        replay["elapsedMs"] = round(export_end - export_start)
        assert_true(replay["link"], "Replay export should create a WebM link")
        assert_true(replay["replayVisible"], "Replay export link should be visible")
        assert_true(replay["elapsedMs"] < 2500, "Replay export should use the rolling buffer, not a fresh long recording")
        result["checks"]["replayExport"] = replay

        browser.close()

    assert_true(not result["errors"], "Console/page errors were reported")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:5173")
    args = parser.parse_args()

    try:
      result = run(args.url)
    except Exception as exc:
      print(json.dumps({"ok": False, "error": str(exc)}, indent=2))
      return 1

    print(json.dumps({"ok": True, **result}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
