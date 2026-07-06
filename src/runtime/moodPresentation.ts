export type RuntimeMood =
  | "Calm"
  | "Curious"
  | "Happy"
  | "Afraid"
  | "Excited"
  | "Surprised"
  | "Stunned"
  | "Angry"
  | "Sad";

const moodFaces: Record<string, string> = {
  Calm: ":)",
  Curious: ":o",
  Happy: ":D",
  Afraid: ":/",
  Excited: ":>",
  Surprised: ":O",
  Stunned: "x_x",
  Angry: ">:("
};

const moodBubbles: Record<string, string> = {
  Curious: "?",
  Happy: "ha!",
  Afraid: "!",
  Excited: "wow!",
  Surprised: "?",
  Stunned: "x_x",
  Angry: "hey!",
  Sad: "..."
};

export interface ReactionBubbleInput {
  mood: RuntimeMood | string;
  timerMs: number;
  anchorX: number;
  anchorY: number;
  stageWidth: number;
  stageHeight: number;
  text?: string;
}

export interface ReactionBubblePresentation {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pointerX: number;
  alpha: number;
  radius: number;
}

export function getMoodFace(mood: RuntimeMood | string): string {
  return moodFaces[mood] || moodFaces.Calm;
}

export function getMoodBubbleText(mood: RuntimeMood | string, override = ""): string {
  const custom = override.trim();
  if (custom) {
    return custom.slice(0, 12);
  }
  return moodBubbles[mood] || "";
}

export function getReactionBubblePresentation(input: ReactionBubbleInput): ReactionBubblePresentation {
  const text = getMoodBubbleText(input.mood, input.text);
  const width = Math.max(32, text.length * 8 + 22);
  const height = 25;
  if (!text || input.timerMs <= 0) {
    return {
      visible: false,
      text,
      x: 0,
      y: 0,
      width,
      height,
      pointerX: width / 2,
      alpha: 0,
      radius: 7
    };
  }
  const margin = 10;
  const x = clampNumber(input.anchorX - width / 2, margin, input.stageWidth - width - margin);
  const y = clampNumber(input.anchorY - 58, margin, input.stageHeight - height - margin);
  const pointerX = clampNumber(input.anchorX - x, 9, width - 9);
  return {
    visible: true,
    text,
    x,
    y,
    width,
    height,
    pointerX,
    alpha: clampNumber(input.timerMs / 420, 0, 1),
    radius: 7
  };
}

export function getMoodHudPresentation(mood: RuntimeMood | string): { mood: string; face: string } {
  return {
    mood,
    face: getMoodFace(mood)
  };
}

function clampNumber(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}
