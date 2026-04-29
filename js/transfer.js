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
    replayStrip.textContent = state.replayLog
      .slice(-8)
      .map((event) => `${event.text} +$${event.value}`)
      .join("  |  ") + (seconds > 0 ? `  |  video buffer ${seconds.toFixed(0)}s` : "");
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
    const cutoff = now() - replayBufferMs;
    state.replayChunks = state.replayChunks.filter((chunk) => chunk.time >= cutoff);
  }

  function getReplayBufferSeconds() {
    trimReplayBuffer();
    if (!state.replayChunks.length) {
      return 0;
    }
    const oldest = state.replayChunks[0].time;
    const newest = state.replayChunks[state.replayChunks.length - 1].time;
    return Math.max(0, (newest - oldest) / 1000);
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
      toast(`Recent ${Math.max(1, Math.round(getReplayBufferSeconds()))}s replay ready.`);
    }, 180);
  }

  function renderReplayDownload(url, size) {
    replayStrip.innerHTML = "";
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = `buddy-lab-replay-${dateNow()}.webm`;
    link.textContent = `Recent replay ready (${Math.max(1, Math.round(size / 1024))} KB)`;
    link.style.color = "#98f17f";
    link.style.fontWeight = "700";
    replayStrip.appendChild(link);
    replayStrip.classList.add("replay-strip--visible");
  }

  function exportSaveSnapshot() {
    saveGame();
    const snapshot = {
      app: "Buddy Lab 2026",
      type: "progression-save",
      exportedAt: new Date().toISOString(),
      save: createSavePayload()
    };
    const blob = new BlobCtor([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = urlRef.createObjectURL(blob);
    replayStrip.innerHTML = "";
    const link = documentRef.createElement("a");
    link.href = url;
    link.download = `buddy-lab-save-${dateNow()}.json`;
    link.textContent = `Save snapshot ready (${Math.max(1, Math.round(blob.size / 1024))} KB)`;
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
      const importedSave = parsed.save || parsed;
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
