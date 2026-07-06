// Sprite atlas: the game's own artwork, rasterized from the user's reference
// artifact into assets/private/sprites/ (gitignored) by
// tests/rasterize-swf-sprites.mjs. Each manifest entry records the sprite's
// registration-point origin inside the trimmed image and the capture scale,
// so drawing at (x, y) reproduces the original registration alignment.
// While any sprite is missing, callers fall back to labeled placeholders and
// the corresponding parity rows stay unverified.

interface SpriteEntry {
  file: string;
  originX: number;
  originY: number;
  width: number;
  height: number;
  scale: number;
}

const BASE = "./assets/private/sprites/";

export class SpriteAtlas {
  private manifest: Record<string, SpriteEntry> = {};
  private images = new Map<string, HTMLImageElement>();
  private missing = new Set<string>();
  ready = false;

  constructor() {
    void fetch(`${BASE}manifest.json`)
      .then((response) => (response.ok ? response.json() : {}))
      .then((manifest: Record<string, SpriteEntry>) => {
        this.manifest = manifest;
        this.ready = true;
      })
      .catch(() => {
        console.warn("[sprites] private sprite manifest missing; placeholder art active");
      });
  }

  has(name: string): boolean {
    return Boolean(this.manifest[name]) && !this.missing.has(name);
  }

  /** Draw sprite with its registration origin at (x, y). Returns false if unavailable. */
  draw(
    ctx: CanvasRenderingContext2D,
    name: string,
    x: number,
    y: number,
    options: { rotation?: number; alpha?: number; scale?: number } = {}
  ): boolean {
    const entry = this.manifest[name];
    if (!entry || this.missing.has(name)) return false;
    let image = this.images.get(name);
    if (!image) {
      image = new Image();
      image.src = `${BASE}${entry.file}`;
      image.onerror = () => {
        this.missing.add(name);
        console.warn(`[sprites] missing sprite file "${entry.file}"`);
      };
      this.images.set(name, image);
    }
    if (!image.complete || image.naturalWidth === 0) return false;
    const inv = (options.scale ?? 1) / entry.scale;
    ctx.save();
    ctx.translate(x, y);
    if (options.rotation) ctx.rotate(options.rotation);
    if (options.alpha !== undefined) ctx.globalAlpha = options.alpha;
    ctx.drawImage(
      image,
      -entry.originX * inv,
      -entry.originY * inv,
      entry.width * inv,
      entry.height * inv
    );
    ctx.restore();
    return true;
  }
}

export const spriteAtlas = new SpriteAtlas();
