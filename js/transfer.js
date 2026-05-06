import {
  createSaveSnapshot,
  extractImportedSave,
  getReplayBufferSeconds as getReplayBufferSecondsFromChunks,
  getReplayDownloadName,
  getReplayDownloadText,
  getReplayReadyToast,
  getReplayStripText,
  getSaveDownloadName,
  getSaveDownloadText,
  trimReplayChunks
} from "../src/runtime/transferState.ts";

export function createTransferController({
  state,
  canvas,
  exportReplayButton,
  replayStrip,
  replayBufferMs,
  createSavePayload,
  saveGame,
  migrateSave,
  writeJson,
  storageKey,
  toast,
  recordMission,
  recordChallenge,
  documentRef = document,
  windowRef = window,
  urlRef = URL,
  BlobCtor = Blob,
  now = () => performance.now(),
  dateNow = () => Date.now()
}) {
  function showReplay() {
    if (!state.replayLog.length) {
      toast("No replay events yet.");
      return;
    }
    const seconds = getReplayBufferSeconds();
    replayStrip.textContent = getReplayStripText(state.replayLog, seconds);
    replayStrip.classList.add("replay-strip--visible");
    windowRef.setTimeout(() => replayStrip.classList.remove("replay-strip--visible"), 5200);
  }

  function startReplayBuffer() {
    const MediaRecorderCtor = windowRef.MediaRecorder;
    if (!canvas.captureStream || !MediaRecorderCtor) {
      state.replaySupported = false;
      exportReplayButton.disabled = true;
      exportReplayButton.title = "Video replay export is not supported in this browser.";
      return;
    }
    if (state.replayRecorder && state.replayRecorder.state !== "inactive") {
      return;
    }
    const mimeType = MediaRecorderCtor.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorderCtor(stream, { mimeType });
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        state.replayChunks.push({ blob: event.data, time: now() });
        trimReplayBuffer();
      }
    });
    recorder.addEventListener("error", () => {
      state.replaySupported = false;
      exportReplayButton.disabled = false;
      exportReplayButton.textContent = "Export";
      toast("Replay recorder stopped unexpectedly.");
    });
    state.replayRecorder = recorder;
    state.replayStream = stream;
    state.replayMimeType = mimeType;
    state.replaySupported = true;
    exportReplayButton.disabled = false;
    exportReplayButton.title = "Export the recent replay buffer.";
    recorder.start(1000);
  }

  function trimReplayBuffer() {
    state.replayChunks = trimReplayChunks(state.replayChunks, now(), replayBufferMs);
  }

  function getReplayBufferSeconds() {
    trimReplayBuffer();
    return getReplayBufferSecondsFromChunks(state.replayChunks);
  }

  function exportReplayVideo() {
    if (!state.replaySupported) {
      startReplayBuffer();
    }
    if (!state.replaySupported || !state.replayRecorder) {
      toast("Video export is not supported in this browser.");
      return;
    }
    exportReplayButton.disabled = true;
    exportReplayButton.textContent = "Preparing";
    if (state.replayRecorder.state === "recording") {
      state.replayRecorder.requestData();
    }
    windowRef.setTimeout(() => {
      trimReplayBuffer();
      if (!state.replayChunks.length) {
        exportReplayButton.disabled = false;
        exportReplayButton.textContent = "Export";
        toast("Replay buffer is still warming up.");
        return;
      }
      const blob = new BlobCtor(
        state.replayChunks.map((chunk) => chunk.blob),
        { type: state.replayMimeType || "video/webm" }
      );
      if (state.replayObjectUrl) {
        urlRef.revokeObjectURL(state.replayObjectUrl);
      }
      state.replayObjectUrl = urlRef.createObjectURL(blob);
      renderReplayDownload(state.replayObjectUrl, blob.size);
      exportReplayButton.disabled = false;
      exportReplayButton.textContent = "Export";
      recordMission("replayExport", 1);
      recordChallenge("replayExport", 1);
      toast(getReplayReadyToast(getReplayBufferSeconds()));
    }, 180);
  }

  function renderReplayDownload(url, size) {
    replayStrip.innerHTML = "";
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = getReplayDownloadName(dateNow());
    link.textContent = getReplayDownloadText(size);
    link.style.color = "#98f17f";
    link.style.fontWeight = "700";
    replayStrip.appendChild(link);
    replayStrip.classList.add("replay-strip--visible");
  }

  function exportSaveSnapshot() {
    saveGame();
    const snapshot = createSaveSnapshot(createSavePayload(), new Date().toISOString());
    const blob = new BlobCtor([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = urlRef.createObjectURL(blob);
    replayStrip.innerHTML = "";
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = getSaveDownloadName(dateNow());
    link.textContent = getSaveDownloadText(blob.size);
    link.style.color = "#98f17f";
    link.style.fontWeight = "700";
    replayStrip.appendChild(link);
    replayStrip.classList.add("replay-strip--visible");
    toast("Save export ready.");
    windowRef.setTimeout(() => urlRef.revokeObjectURL(url), 60000);
  }

  async function importSaveSnapshot(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedSave = extractImportedSave(parsed);
      const migrated = migrateSave(importedSave);
      writeJson(storageKey, migrated);
      toast("Save imported. Reloading.");
      windowRef.location.reload();
    } catch {
      toast("Save import failed. Use a Buddy Lab JSON save.");
    }
  }

  return {
    exportReplayVideo,
    exportSaveSnapshot,
    getReplayBufferSeconds,
    importSaveSnapshot,
    renderReplayDownload,
    showReplay,
    startReplayBuffer,
    trimReplayBuffer
  };
}
