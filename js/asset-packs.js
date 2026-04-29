export function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function sanitizeAssetPack(pack, manifestEntry = {}) {
  const id = String(pack.id || manifestEntry.id || "").trim();
  const name = String(pack.name || manifestEntry.name || id).trim();
  if (!id || !name) {
    throw new Error("Asset pack is missing id or name.");
  }
  const room = {
    background: pack.room?.background || "#87968e",
    grid: pack.room?.grid || "#e8f7f4",
    floor: pack.room?.floor || "#64736b",
    accent: pack.room?.accent || "#98f17f",
    motif: pack.room?.motif || manifestEntry.room?.motif || "grid"
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
      assetPack: id
    };
  });
  return {
    id,
    name,
    description: pack.description || `${name} asset pack.`,
    room,
    skins,
    audioPacks
  };
}

export function createAssetPackController({
  state,
  skinDefs,
  audioPacks,
  manifestUrl,
  fetchRef = fetch,
  logger = console
}) {
  async function loadAssetPacks() {
    try {
      const manifestResponse = await fetchRef(manifestUrl, { cache: "no-store" });
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
      logger.warn("Asset packs unavailable; using built-in assets.", error);
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
