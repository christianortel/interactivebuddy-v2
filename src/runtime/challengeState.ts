export interface ChallengeMode {
  name: string;
  event: string;
  target: number;
  duration: number;
  reward: number;
}

export interface ChallengeStateShape {
  mode: string;
  progress: number;
  timeLeft: number;
  completed: boolean;
  startedAt: number;
  lastResult: ChallengeResult | null;
}

export interface ChallengeBest {
  elapsed: number;
  completedAt: number;
}

export interface ChallengeResult {
  mode: string;
  name: string;
  success: boolean;
  elapsed: number;
  reward: number;
  isBest: boolean;
}

export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  event: string;
  reward: number;
}

export interface RuntimeMission extends MissionDefinition {
  progress: number;
  completed: boolean;
  uniqueTags: Set<string>;
}

export const coverageMissionIds = [
  "rope2",
  "liquid2",
  "bowling2",
  "beach3",
  "punch2",
  "prop4",
  "bead6",
  "dart4",
  "cork4",
  "plunger4",
  "star4",
  "spark5",
  "frost5",
  "goo5",
  "pulse5",
  "confetti5",
  "boombox4",
  "wheel3",
  "export1"
];

export function formatProgress(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function chooseRuntimeMissions(
  missionPool: MissionDefinition[],
  missionCycle: number,
  random: () => number,
  coverageIds = coverageMissionIds,
  count = 3
): { missions: RuntimeMission[]; missionCycle: number } {
  if (missionPool.length === 0 || count <= 0) {
    return { missions: [], missionCycle: missionCycle + 1 };
  }
  const preferredId = coverageIds[missionCycle % coverageIds.length];
  const coverageMission = missionPool.find((mission) => mission.id === preferredId) || missionPool[missionCycle % missionPool.length];
  const shuffled = missionPool
    .filter((mission) => mission.id !== coverageMission.id)
    .sort(() => random() - 0.5);
  return {
    missions: [coverageMission, ...shuffled.slice(0, Math.max(0, count - 1))].map(createRuntimeMission),
    missionCycle: missionCycle + 1
  };
}

export function createRuntimeMission(mission: MissionDefinition): RuntimeMission {
  return {
    ...mission,
    progress: 0,
    completed: false,
    uniqueTags: new Set<string>()
  };
}

export function getMissionProgressPercent(progress: number, target: number): number {
  return Math.min(100, (progress / target) * 100);
}

export function advanceMissionProgress(progress: number, amount: number, target: number): number {
  return Math.min(target, progress + amount);
}

export function getMissionReward(reward: number): { cash: number; xp: number } {
  return {
    cash: reward,
    xp: Math.round(reward * 0.5)
  };
}

export function getChallengeModeId<TModes extends Record<string, ChallengeMode>>(modes: TModes, modeId: string): keyof TModes & string {
  return Object.prototype.hasOwnProperty.call(modes, modeId) ? modeId as keyof TModes & string : "free" as keyof TModes & string;
}

export function getChallengeModeOptionLabel(mode: ChallengeMode): string {
  return mode.name === "Free" ? "Free Play" : mode.name;
}

export function getChallengeModeOption(modeId: string, mode: ChallengeMode): { value: string; label: string } {
  return {
    value: modeId,
    label: getChallengeModeOptionLabel(mode)
  };
}

export function createChallengeStartState<TModes extends Record<string, ChallengeMode>>(
  modes: TModes,
  modeId: string,
  startedAt: number
): ChallengeStateShape {
  const normalizedModeId = getChallengeModeId(modes, modeId);
  const mode = modes[normalizedModeId] || modes.free;
  return {
    mode: normalizedModeId,
    progress: 0,
    timeLeft: mode.duration,
    completed: false,
    startedAt,
    lastResult: null
  };
}

export function decrementChallengeTime(timeLeft: number, deltaMs: number): number {
  return Math.max(0, timeLeft - deltaMs / 1000);
}

export function advanceChallengeProgress(progress: number, amount: number, target: number): number {
  return Math.min(target, progress + amount);
}

export function getChallengeReward(reward: number): { cash: number; xp: number } {
  return {
    cash: reward,
    xp: Math.round(reward * 0.6)
  };
}

export function createChallengeResult(options: {
  modeId: string;
  mode: ChallengeMode;
  success: boolean;
  startedAt: number;
  now: number;
  previousBest?: ChallengeBest;
  completedAt: number;
}): { result: ChallengeResult; best?: ChallengeBest } {
  const elapsed = Math.max(0, (options.now - options.startedAt) / 1000);
  const isBest = options.success && (!options.previousBest || elapsed < options.previousBest.elapsed);
  const best = isBest ? { elapsed, completedAt: options.completedAt } : undefined;
  return {
    result: {
      mode: options.modeId,
      name: options.mode.name,
      success: options.success,
      elapsed,
      reward: options.success ? options.mode.reward : 0,
      isBest
    },
    best
  };
}

export function getChallengeLabel(options: {
  modeId: string;
  mode: ChallengeMode;
  progress: number;
  timeLeft: number;
  completed: boolean;
  best?: ChallengeBest;
}): string {
  if (options.modeId === "free") {
    return "Free";
  }
  if (options.completed) {
    return options.best ? `${options.mode.name} ${options.best.elapsed.toFixed(1)}s` : `${options.mode.name} done`;
  }
  return `${formatProgress(options.progress)}/${options.mode.target} ${Math.ceil(options.timeLeft)}s`;
}
