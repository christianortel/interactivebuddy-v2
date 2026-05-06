import {
  advanceChallengeProgress,
  advanceMissionProgress,
  chooseRuntimeMissions,
  createChallengeResult,
  createChallengeStartState,
  decrementChallengeTime,
  formatProgress,
  getChallengeLabel as getChallengeLabelText,
  getChallengeModeId,
  getChallengeReward,
  getMissionProgressPercent,
  getMissionReward
} from "../src/runtime/challengeState.ts";

export { formatProgress };

export function createChallengeController({
  state,
  missionPool,
  challengeModes,
  challengeSelect,
  missionList,
  replayStrip,
  toast,
  saveGame,
  updateHud,
  feedback,
  pulse,
  documentRef = document,
  random = Math.random,
  now = () => performance.now(),
  dateNow = () => Date.now()
}) {
  function chooseMissions() {
    const selected = chooseRuntimeMissions(missionPool, state.missionCycle, random);
    state.missionCycle = selected.missionCycle;
    state.missions = selected.missions;
    renderMissions();
    toast("Mission cards refreshed.");
  }

  function renderMissions() {
    missionList.innerHTML = "";
    state.missions.forEach((mission) => {
      const pct = getMissionProgressPercent(mission.progress, mission.target);
      const element = documentRef.createElement("article");
      element.className = "mission";
      element.dataset.missionId = mission.id;
      element.innerHTML = `
        <strong>${mission.title}</strong>
        <span>${mission.description}</span>
        <div class="progress"><b style="width: ${pct}%"></b></div>
        <span>${mission.completed ? `Complete +$${mission.reward}` : `${formatProgress(mission.progress)} / ${mission.target}`}</span>
      `;
      missionList.appendChild(element);
    });
  }

  function startChallenge(modeId, announce = true) {
    const next = createChallengeStartState(challengeModes, modeId, now());
    const mode = challengeModes[next.mode] || challengeModes.free;
    Object.assign(state.challenge, next);
    challengeSelect.value = state.challenge.mode;
    if (announce) {
      toast(state.challenge.mode === "free" ? "Free Play enabled." : `${mode.name} started.`);
    }
    updateHud();
    saveGame();
  }

  function updateChallengeTimer(delta) {
    const mode = getChallengeMode();
    if (state.challenge.mode === "free" || state.challenge.completed || mode.duration <= 0) {
      return;
    }
    state.challenge.timeLeft = decrementChallengeTime(state.challenge.timeLeft, delta);
    if (state.challenge.timeLeft === 0) {
      state.challenge.completed = true;
      finishChallenge(false);
    }
  }

  function recordChallenge(event, amount = 1) {
    const mode = getChallengeMode();
    if (state.challenge.mode === "free" || state.challenge.completed || mode.event !== event) {
      return;
    }
    state.challenge.progress = advanceChallengeProgress(state.challenge.progress, amount, mode.target);
    if (state.challenge.progress >= mode.target) {
      state.challenge.completed = true;
      const reward = getChallengeReward(mode.reward);
      state.cash += reward.cash;
      state.xp += reward.xp;
      finishChallenge(true);
      feedback.play("unlock", 1);
      pulse([35, 40, 55]);
      saveGame();
    }
  }

  function finishChallenge(success) {
    const mode = getChallengeMode();
    const previousBest = state.challenge.bests[state.challenge.mode];
    const finished = createChallengeResult({
      modeId: state.challenge.mode,
      mode,
      success,
      startedAt: state.challenge.startedAt,
      now: now(),
      previousBest,
      completedAt: dateNow()
    });
    if (finished.best) {
      state.challenge.bests[state.challenge.mode] = finished.best;
    }
    state.challenge.lastResult = finished.result;
    showChallengeResult(state.challenge.lastResult);
    toast(success ? `${mode.name} complete. +$${mode.reward}` : `${mode.name} expired. Try again from Modes.`);
  }

  function showChallengeResult(result) {
    replayStrip.innerHTML = "";
    const summary = documentRef.createElement("span");
    const status = result.success ? "Complete" : "Expired";
    const best = result.isBest ? " | New best" : "";
    summary.textContent = `${result.name}: ${status} in ${result.elapsed.toFixed(1)}s${best}`;
    replayStrip.appendChild(summary);
    replayStrip.classList.add("replay-strip--visible");
  }

  function getChallengeMode() {
    return challengeModes[getChallengeModeId(challengeModes, state.challenge.mode)] || challengeModes.free;
  }

  function getChallengeLabel() {
    const mode = getChallengeMode();
    return getChallengeLabelText({
      modeId: state.challenge.mode,
      mode,
      progress: state.challenge.progress,
      timeLeft: state.challenge.timeLeft,
      completed: state.challenge.completed,
      best: state.challenge.bests[state.challenge.mode]
    });
  }

  function recordMission(event, amount) {
    let changed = false;
    state.missions.forEach((mission) => {
      if (mission.completed || mission.event !== event) {
        return;
      }
      mission.progress = advanceMissionProgress(mission.progress, amount, mission.target);
      changed = true;
      if (mission.progress >= mission.target) {
        mission.completed = true;
        const reward = getMissionReward(mission.reward);
        state.cash += reward.cash;
        state.xp += reward.xp;
        toast(`${mission.title} complete. +$${mission.reward}`);
        saveGame();
      }
    });
    if (changed) {
      renderMissions();
    }
  }

  return {
    chooseMissions,
    finishChallenge,
    getChallengeLabel,
    getChallengeMode,
    recordChallenge,
    recordMission,
    renderMissions,
    showChallengeResult,
    startChallenge,
    updateChallengeTimer
  };
}
