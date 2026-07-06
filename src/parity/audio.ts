// Event-driven audio for the parity runtime.
// Sound event names and volumes are measured from the artifact's playSound call
// sites (EV-0020): register@100, shotgunFire@80, pistolFire@80, machFire@80,
// explosion@75, beeper@75/100, shock@70, burnball@40, plus punch1..4, static,
// radioMusic and per-skin voice sets played via other paths.
// Audio files are the user's locally extracted assets in reference/private/sounds/
// (gitignored). Missing files log one diagnostic and stay silent — parity rows
// remain unverified while any file is missing.

// User-supplied private asset lane (gitignored; copied into dist for offline play).
const SOUND_BASE = "./assets/private/sounds/";

interface SoundIndexEntry {
  name: string;
  file: string | null;
}

export class AudioSystem {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private failed = new Set<string>();
  private activated = false;
  private files = new Map<string, string>();
  private indexLoaded: Promise<void>;

  constructor() {
    const activate = () => {
      this.activated = true;
    };
    window.addEventListener("pointerdown", activate, { once: true });
    this.indexLoaded = fetch(`${SOUND_BASE}index.json`)
      .then((response) => (response.ok ? response.json() : []))
      .then((index: SoundIndexEntry[]) => {
        for (const entry of index) {
          if (entry.file) this.files.set(entry.name, entry.file);
        }
      })
      .catch(() => {
        console.warn("[audio] sound index missing; audio disabled until assets are supplied");
      });
  }

  private ensureContext(): AudioContext | null {
    if (!this.activated) return null;
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.context = new Ctor();
    }
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
    return this.context;
  }

  /** Play a named sound event. Volume is the artifact's 0-100 scale. */
  play(name: string, volume = 100): void {
    const context = this.ensureContext();
    if (!context || this.failed.has(name)) return;
    const cached = this.buffers.get(name);
    if (cached) {
      this.start(context, cached, volume);
      return;
    }
    void this.indexLoaded
      .then(() => {
        const file = this.files.get(name) ?? `${name}.mp3`;
        return fetch(`${SOUND_BASE}${file}`);
      })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        this.buffers.set(name, buffer);
        this.start(context, buffer, volume);
      })
      .catch((error) => {
        this.failed.add(name);
        console.warn(`[audio] missing or undecodable sound "${name}": ${error}`);
      });
  }

  private start(context: AudioContext, buffer: AudioBuffer, volume: number): void {
    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume / 100));
    source.connect(gain);
    gain.connect(context.destination);
    source.start();
  }

  private loops = new Map<string, AudioBufferSourceNode>();

  /** Start a named looping sound (e.g. radioMusic); no-op if already looping. */
  startLoop(name: string, volume = 100): void {
    if (this.loops.has(name)) return;
    const context = this.ensureContext();
    if (!context) return;
    void this.indexLoaded
      .then(() => fetch(`${SOUND_BASE}${this.files.get(name) ?? `${name}.mp3`}`))
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        if (this.loops.has(name)) return;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = context.createGain();
        gain.gain.value = Math.max(0, Math.min(1, volume / 100));
        source.connect(gain);
        gain.connect(context.destination);
        source.start();
        this.loops.set(name, source);
      })
      .catch(() => {
        console.warn(`[audio] missing loop sound "${name}"`);
      });
  }

  stopLoop(name: string): void {
    const source = this.loops.get(name);
    if (source) {
      source.stop();
      this.loops.delete(name);
    }
  }
}
