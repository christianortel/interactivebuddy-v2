// Reaction-line store. Loads the user's privately extracted sayings tables
// (assets/private/sayings.json, gitignored — creative text never ships in the
// repo) and picks the entry for the current skin. Event vocabulary (EV-0027):
// idle, thanks, help, explosion, scared, grenade, burn, zap, happy, sad.
// Selection rule (random line within skin entry) PROVISIONAL pending decode.

interface SayingEntry {
  skin: string;
  useImage: boolean | string;
  lines: string[];
}

export class SayingsStore {
  private table: Record<string, SayingEntry[]> = {};
  ready = false;

  constructor() {
    void fetch("./assets/private/sayings.json")
      .then((response) => (response.ok ? response.json() : {}))
      .then((table: Record<string, SayingEntry[]>) => {
        this.table = table;
        this.ready = true;
      })
      .catch(() => {
        console.warn("[sayings] private sayings.json missing; reactions muted");
      });
  }

  /** Pick a line (or image marker) for an event and skin id. */
  pick(event: string, skinId: string): { useImage: boolean | string; text: string } | null {
    const entries = this.table[event];
    if (!entries) return null;
    const entry =
      entries.find((candidate) => candidate.skin === skinId) ??
      entries.find((candidate) => candidate.skin === "basic") ??
      entries.find((candidate) => candidate.skin === "default");
    if (!entry || entry.lines.length === 0) return null;
    return {
      useImage: entry.useImage,
      text: entry.lines[Math.floor(Math.random() * entry.lines.length)]
    };
  }
}
