export function formatProgress(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

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
    const coverageIds = ["rope2", "liquid2", "bowling2", "beach3", "punch2", "prop4", "bead6", "dart4", "cork4", "plunger4", "star4", "spark5", "frost5", "goo5", "pulse5", "confetti5", "boombox4", "wheel3", "export1"];
    const coverageMission = missionPool.find((mission) => mission.id === coverageIds[state.missionCycle % coverageIds.length]);
    state.missionCycle += 1;
    const shuffled = missionPool
      .filter((mission) => mission.id !== coverageMission.id)
      .sort(() => random() - 0.5);
    state.missions = [coverageMission, ...shuffled.slice(0, 2)].map((mission) => ({
      ...mission,
      progress: 0,
      completed: false,
      uniqueTags: new Set()
    }));
    renderMissions();
    toast("Mission cards refreshed.");
  }

  function renderMissions() {
    missionList.innerHTML = "";
    state.missions.forEach((mission) => {
      const pct = Math.min(100, (mission.progress / mission.target) * 100);
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
    const mode = challengeModes[modeId] || challengeModes.free;
    state.challenge.mode = modeId in challengeModes ? modeId : "free";
    state.challenge.progress = 0;
    state.challenge.timeLeft = mode.duration;
    state.challenge.completed = false;
    state.challenge.startedAt = now();
    state.challenge.lastResult = null;
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
    state.challenge.timeLeft = Math.max(0, state.challenge.timeLeft - delta / 1000);
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
    state.challenge.progress = Math.min(mode.target, state.challenge.progress + amount);
    if (state.challenge.progress >= mode.target) {
      state.challenge.completed = true;
      state.cash += mode.reward;
      state.xp += Math.round(mode.reward * 0.6);
      finishChallenge(true);
      feedback.play("unlock", 1);
      pulse([35, 40, 55]);
      saveGame();
    }
  }

  function finishChallenge(success) {
    const mode = getChallengeMode();
    const elapsed = Math.max(0, (now() - state.challenge.startedAt) / 1000);
    const previousBest = state.challenge.bests[state.challenge.mode];
    const isBest = success && (!previousBest || elapsed < previousBest.elapsed);
    if (isBest) {
      state.challenge.bests[state.challenge.mode] = {
        elapsed,
        completedAt: dateNow()
      };
    }
    state.challenge.lastResult = {
      mode: state.challenge.mode,
      name: mode.name,
      success,
      elapsed,
      reward: success ? mode.reward : 0,
      isBest
    };
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
    return challengeModes[state.challenge.mode] || challengeModes.free;
  }

  function getChallengeLabel() {
    const mode = getChallengeMode();
    if (state.challenge.mode === "free") {
      return "Free";
    }
    const progress = `${formatProgress(state.challenge.progress)}/${mode.target}`;
    if (state.challenge.completed) {
      const best = state.challenge.bests[state.challenge.mode];
      return best ? `${mode.name} ${best.elapsed.toFixed(1)}s` : `${mode.name} done`;
    }
    return `${progress} ${Math.ceil(state.challenge.timeLeft)}s`;
  }

  function recordMission(event, amount) {
    let changed = false;
    state.missions.forEach((mission) => {
      if (mission.completed || mission.event !== event) {
        return;
      }
      mission.progress = Math.min(mission.target, mission.progress + amount);
      changed = true;
      if (mission.progress >= mission.target) {
        mission.completed = true;
        state.cash += mission.reward;
        state.xp += Math.round(mission.reward * 0.5);
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
