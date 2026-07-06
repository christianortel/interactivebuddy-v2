export interface RuntimeRoomTheme {
  background?: string;
  grid?: string;
  floor?: string;
  accent?: string;
  motif?: string;
  texture?: string;
  textureDataUrl?: string;
  textureFit?: string;
}

export interface RuntimeAssetPack {
  id?: string;
  name?: string;
  room?: RuntimeRoomTheme;
}

export function getRoomPreviewSummary(pack: RuntimeAssetPack): { packId?: string; name: string } {
  return {
    packId: pack.id,
    name: pack.name || "Room"
  };
}

export function getRoomPreviewShellPresentation(pack: RuntimeAssetPack): {
  packId?: string;
  nameClassName: string;
  name: string;
  swatchesClassName: string;
  browserClassName: string;
} {
  const summary = getRoomPreviewSummary(pack);
  return {
    ...summary,
    nameClassName: "room-preview__name",
    swatchesClassName: "room-preview__swatches",
    browserClassName: "room-browser"
  };
}

export function getRoomTextureSource(room: RuntimeRoomTheme = {}): string {
  return room.texture || room.textureDataUrl || "";
}

export function getRoomBackgroundCss(room: RuntimeRoomTheme = {}): string {
  const background = room.background || "#9aa59d";
  const texture = getRoomTextureSource(room);
  return texture ? `url("${escapeCssUrl(texture)}") ${background}` : background;
}

export function getRoomBackgroundSize(room: RuntimeRoomTheme = {}): string {
  const fit = room.textureFit || "cover";
  return ["cover", "contain", "auto"].includes(fit) ? fit : "cover";
}

export function getRoomApplyPresentation(room: RuntimeRoomTheme = {}): { background: string; backgroundSize: string; floor: string } {
  return {
    background: getRoomBackgroundCss(room),
    backgroundSize: getRoomBackgroundSize(room),
    floor: room.floor || "#5f6962"
  };
}

export function getRoomMotif(pack: RuntimeAssetPack): string {
  const rawMotif = pack.room?.motif || pack.id || "grid";
  const motif = String(rawMotif).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return motif || "grid";
}

export function getRoomSwatches(room: RuntimeRoomTheme = {}): { label: string; color: string; title: string }[] {
  return [
    getRoomSwatch("Background", room.background),
    getRoomSwatch("Grid", room.grid),
    getRoomSwatch("Floor", room.floor),
    getRoomSwatch("Accent", room.accent)
  ];
}

export function getRoomSwatchPresentation(swatch: { color: string; title: string }): {
  className: string;
  background: string;
  title: string;
  ariaLabel: string;
} {
  return {
    className: "room-preview__swatch",
    background: swatch.color,
    title: swatch.title,
    ariaLabel: swatch.title
  };
}

export function getRoomThumbnailStyles(room: RuntimeRoomTheme = {}): Record<string, string> {
  return {
    "--room-bg": room.background || "#9aa59d",
    "--room-grid": room.grid || "#a7b0a9",
    "--room-floor": room.floor || "#5f6962",
    "--room-accent": room.accent || "#d8d2b8"
  };
}

export function getRoomThumbnailAriaLabel(pack: RuntimeAssetPack): string {
  return `${pack.name || "Room"} room thumbnail`;
}

export function getRoomThumbnailPresentation(pack: RuntimeAssetPack, sizeClass: string): {
  className: string;
  motif: string;
  ariaLabel: string;
  styles: Record<string, string>;
  layerClassNames: string[];
} {
  return {
    className: `room-thumbnail ${sizeClass}`,
    motif: getRoomMotif(pack),
    ariaLabel: getRoomThumbnailAriaLabel(pack),
    styles: getRoomThumbnailStyles(pack.room || {}),
    layerClassNames: ["grid", "floor", "accent", "buddy"].map((part) => `room-thumbnail__${part}`)
  };
}

export function getRoomBrowserButtonState(roomPackId: string | undefined, selectedPackId: string | undefined): { active: boolean; ariaPressed: string } {
  const active = Boolean(roomPackId && roomPackId === selectedPackId);
  return {
    active,
    ariaPressed: String(active)
  };
}

export function getRoomBrowserButtonPresentation(roomPack: RuntimeAssetPack, selectedPackId: string | undefined): {
  className: string;
  packId?: string;
  labelClassName: string;
  label: string;
  active: boolean;
  ariaPressed: string;
} {
  const state = getRoomBrowserButtonState(roomPack.id, selectedPackId);
  return {
    className: "room-browser__button",
    packId: roomPack.id,
    labelClassName: "room-browser__name",
    label: roomPack.name || "Room",
    ...state
  };
}

function getRoomSwatch(label: string, color: string | undefined): { label: string; color: string; title: string } {
  const resolvedColor = color || "#9aa59d";
  return {
    label,
    color: resolvedColor,
    title: `${label}: ${resolvedColor}`
  };
}

function escapeCssUrl(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
