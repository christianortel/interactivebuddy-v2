export function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function sanitizeAudioSamples(samples) {
  if (!samples || typeof samples !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(samples)
      .map(([eventName, sample]) => {
        if (typeof sample === "string" && sample.trim()) {
          return [eventName, { src: sample.trim() }];
        }
        if (!sample || typeof sample !== "object" || typeof sample.src !== "string" || !sample.src.trim()) {
          return null;
        }
        return [
          eventName,
          {
            src: sample.src.trim(),
            gain: finiteOr(sample.gain, 1),
            playbackRate: finiteOr(sample.playbackRate, 1)
          }
        ];
      })
      .filter(Boolean)
  );
}

export function sanitizeToolTextures(toolTextures) {
  if (!toolTextures || typeof toolTextures !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(toolTextures)
      .map(([key, texture]) => {
        const id = String(key || "").trim();
        if (!id || !texture || typeof texture !== "object") {
          return null;
        }
        const src = typeof texture.texture === "string" && texture.texture.trim()
          ? texture.texture.trim()
          : typeof texture.textureDataUrl === "string" && texture.textureDataUrl.trim()
            ? texture.textureDataUrl.trim()
            : "";
        if (!src) {
          return null;
        }
        return [
          id,
          {
            src,
            scale: finiteOr(texture.scale, 1),
            alpha: finiteOr(texture.alpha, 1),
            rotationOffset: finiteOr(texture.rotationOffset, 0),
            width: finiteOr(texture.width, 0),
            height: finiteOr(texture.height, 0)
          }
        ];
      })
      .filter(Boolean)
  );
}

const UI_THEME_VARIABLES = new Set([
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
  "--brand-bg"
]);

export function sanitizeUiTheme(uiTheme) {
  if (!uiTheme || typeof uiTheme !== "object") {
    return { variables: {} };
  }
  const variables = {};
  Object.entries(uiTheme.variables || {}).forEach(([key, value]) => {
    const variableName = String(key || "").trim();
    if (!UI_THEME_VARIABLES.has(variableName) || typeof value !== "string" || !value.trim()) {
      return;
    }
    variables[variableName] = value.trim();
  });
  return { variables };
}

export function sanitizeAssetPack(pack, manifestEntry = {}) {
  const id = String(pack.id || manifestEntry.id || "").trim();
  const name = String(pack.name || manifestEntry.name || id).trim();
  if (!id || !name) {
    throw new Error("Asset pack is missing id or name.");
  }
  const room = {
    background: pack.room?.background || "#9aa59d",
    grid: pack.room?.grid || "#a7b0a9",
    floor: pack.room?.floor || "#5f6962",
    accent: pack.room?.accent || "#d8d2b8",
    motif: pack.room?.motif || manifestEntry.room?.motif || "grid",
    texture: typeof pack.room?.texture === "string" ? pack.room.texture.trim() : "",
    textureDataUrl: typeof pack.room?.textureDataUrl === "string" ? pack.room.textureDataUrl.trim() : "",
    textureFit: pack.room?.textureFit || "cover"
  };
  const skins = Array.isArray(pack.skins)
    ? pack.skins
        .filter((skin) => skin && skin.id && skin.name)
        .map((skin) => ({
          id: String(skin.id),
          name: String(skin.name),
          cost: Number.isFinite(skin.cost) ? skin.cost : 300,
          color: skin.color || "#d6ded9",
          accent: skin.accent || room.accent,
          texture: skin.texture || skin.textureDataUrl || "",
          textureScale: finiteOr(skin.textureScale, 0.72),
          description: skin.description || `${skin.name} skin from ${name}.`,
          assetPack: id
        }))
    : [];
  const audioPacks = {};
  Object.entries(pack.audioPacks || {}).forEach(([audioId, audio]) => {
    if (!audio || !audio.name) {
      return;
    }
    audioPacks[audioId] = {
      name: String(audio.name),
      master: finiteOr(audio.master, 0.18),
      pitch: finiteOr(audio.pitch, 1),
      toneWave: audio.toneWave || "triangle",
      impactWave: audio.impactWave || "triangle",
      zapWave: audio.zapWave || "square",
      noiseFilter: finiteOr(audio.noiseFilter, 1),
      decay: finiteOr(audio.decay, 1),
      samples: sanitizeAudioSamples(audio.samples),
      assetPack: id
    };
  });
  return {
    id,
    name,
    description: pack.description || `${name} asset pack.`,
    room,
    skins,
    audioPacks,
    toolTextures: sanitizeToolTextures(pack.toolTextures),
    uiTheme: sanitizeUiTheme(pack.uiTheme)
  };
}

export function createAssetPackController({
  state,
  skinDefs,
  audioPacks,
  manifestUrl,
  manifests,
  fetchRef = fetch,
  logger = console
}) {
  const manifestSources = manifests || [{ url: manifestUrl, optional: false }];

  async function loadAssetPacks() {
    for (const manifest of manifestSources) {
      await loadAssetPackManifest(manifest.url, Boolean(manifest.optional));
    }
  }

  async function loadAssetPackManifest(url, optional = false) {
    if (!url) {
      return;
    }
    try {
      const manifestResponse = await fetchRef(url, { cache: "no-store" });
      if (!manifestResponse.ok) {
        throw new Error(`Manifest returned ${manifestResponse.status}`);
      }
      const manifest = await manifestResponse.json();
      const packs = Array.isArray(manifest.packs) ? manifest.packs : [];
      const loadedPacks = await Promise.all(
        packs.map(async (entry) => {
          const response = await fetchRef(entry.path, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`${entry.path} returned ${response.status}`);
          }
          return sanitizeAssetPack(await response.json(), entry);
        })
      );
      loadedPacks.forEach(registerAssetPack);
    } catch (error) {
      if (!optional) {
        logger.warn("Asset packs unavailable; using built-in assets.", error);
      }
    }
  }

  function registerAssetPack(pack) {
    if (state.assetPacks.some((candidate) => candidate.id === pack.id)) {
      return false;
    }
    state.assetPacks.push(pack);
    const existingSkinIds = new Set(skinDefs.map((skin) => skin.id));
    pack.skins.forEach((skin) => {
      if (!existingSkinIds.has(skin.id)) {
        skinDefs.push(skin);
      }
    });
    Object.assign(audioPacks, pack.audioPacks);
    return true;
  }

  function importAssetPack(pack, manifestEntry = {}) {
    const sanitized = sanitizeAssetPack(pack, manifestEntry);
    return {
      pack: sanitized,
      registered: registerAssetPack(sanitized)
    };
  }

  return {
    importAssetPack,
    loadAssetPacks,
    registerAssetPack
  };
}
