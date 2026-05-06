export interface RuntimeNamedPack {
  id?: string;
  name?: string;
}

export interface RuntimeAudioPack {
  name: string;
  assetPack?: string;
}

export type ImportedAssetPackParseResult =
  | { status: "invalid"; pack: null }
  | { status: "ready"; pack: unknown };

export function resolveAssetPack<TPack extends RuntimeNamedPack>(packs: TPack[], packId: string | undefined): TPack {
  const fallback = packs[0];
  const match = packs.find((pack) => pack.id === packId);
  if (match || fallback) {
    return (match || fallback) as TPack;
  }
  throw new Error("Runtime asset pack list is empty");
}

export function getSelectedAssetPackId<TPack extends RuntimeNamedPack>(
  packs: TPack[],
  selectedId: string | undefined
): string {
  return resolveAssetPack(packs, selectedId).id || "";
}

export function getAssetPackOption(pack: RuntimeNamedPack): { value: string; label: string } {
  return {
    value: pack.id || "",
    label: pack.name || "Asset Pack"
  };
}

export function getAudioPackOptionLabel(audioPack: RuntimeAudioPack, linkedAssetPack?: RuntimeNamedPack): string {
  return audioPack.assetPack && linkedAssetPack?.name ? `${audioPack.name} (${linkedAssetPack.name})` : audioPack.name;
}

export function getAudioPackOption(id: string, audioPack: RuntimeAudioPack, linkedAssetPack?: RuntimeNamedPack): { value: string; label: string } {
  return {
    value: id,
    label: getAudioPackOptionLabel(audioPack, linkedAssetPack)
  };
}

export function getAudioPackSelectedToast(audioPackName: string): string {
  return `${audioPackName} audio pack selected.`;
}

export function getAssetPackSelectedToast(assetPackName: string): string {
  return `${assetPackName} asset pack selected.`;
}

export function getSelectedAudioPackId<TAudioPack>(
  audioPacks: Record<string, TAudioPack>,
  selectedId: string | undefined,
  fallbackId = "classic"
): string {
  return selectedId && audioPacks[selectedId] ? selectedId : fallbackId;
}

export function resolveAudioPack<TAudioPack>(
  audioPacks: Record<string, TAudioPack>,
  selectedId: string | undefined,
  fallbackId = "classic"
): TAudioPack {
  const packId = getSelectedAudioPackId(audioPacks, selectedId, fallbackId);
  const audioPack = audioPacks[packId];
  if (audioPack) {
    return audioPack;
  }
  throw new Error("Runtime audio pack catalog is missing its fallback pack");
}

export function parseImportedAssetPackText(text: string): ImportedAssetPackParseResult {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && "pack" in parsed) {
      return { status: "ready", pack: (parsed as { pack: unknown }).pack };
    }
    return { status: "ready", pack: parsed };
  } catch {
    return { status: "invalid", pack: null };
  }
}

export function getAssetPackImportToast(status: "imported" | "duplicate" | "failed", packName?: string): string {
  if (status === "imported" && packName) {
    return `${packName} skin pack imported.`;
  }
  if (status === "duplicate" && packName) {
    return `${packName} is already loaded.`;
  }
  return "Skin pack import failed. Use a Buddy Lab asset-pack JSON.";
}
