export interface ReplayLogEntry {
  text: string;
  value: number;
}

export interface ReplayChunk<TBlob = unknown> {
  blob: TBlob;
  time: number;
}

export interface SaveSnapshot<TSave = unknown> {
  app: "Buddy Lab 2026";
  type: "progression-save";
  exportedAt: string;
  save: TSave;
}

export function trimReplayChunks<TBlob>(chunks: ReplayChunk<TBlob>[], now: number, replayBufferMs: number): ReplayChunk<TBlob>[] {
  const cutoff = now - replayBufferMs;
  return chunks.filter((chunk) => chunk.time >= cutoff);
}

export function getReplayBufferSeconds<TBlob>(chunks: ReplayChunk<TBlob>[]): number {
  if (!chunks.length) {
    return 0;
  }
  const oldest = chunks[0].time;
  const newest = chunks[chunks.length - 1].time;
  return Math.max(0, (newest - oldest) / 1000);
}

export function getReplayStripText(events: ReplayLogEntry[], bufferSeconds: number): string {
  const text = events
    .slice(-8)
    .map((event) => `${event.text} +$${event.value}`)
    .join("  |  ");
  return text + (bufferSeconds > 0 ? `  |  video buffer ${bufferSeconds.toFixed(0)}s` : "");
}

export function createSaveSnapshot<TSave>(save: TSave, exportedAt: string): SaveSnapshot<TSave> {
  return {
    app: "Buddy Lab 2026",
    type: "progression-save",
    exportedAt,
    save
  };
}

export function extractImportedSave(parsed: unknown): unknown {
  if (parsed && typeof parsed === "object" && "save" in parsed) {
    return (parsed as { save: unknown }).save;
  }
  return parsed;
}

export function getReplayDownloadName(timestamp: number): string {
  return `buddy-lab-replay-${timestamp}.webm`;
}

export function getSaveDownloadName(timestamp: number): string {
  return `buddy-lab-save-${timestamp}.json`;
}

export function getReplayDownloadText(sizeBytes: number): string {
  return `Recent replay ready (${getRoundedKilobytes(sizeBytes)} KB)`;
}

export function getSaveDownloadText(sizeBytes: number): string {
  return `Save snapshot ready (${getRoundedKilobytes(sizeBytes)} KB)`;
}

export function getReplayReadyToast(seconds: number): string {
  return `Recent ${Math.max(1, Math.round(seconds))}s replay ready.`;
}

function getRoundedKilobytes(sizeBytes: number): number {
  return Math.max(1, Math.round(sizeBytes / 1024));
}
