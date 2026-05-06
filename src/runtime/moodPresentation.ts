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

export function getMoodFace(mood: RuntimeMood | string): string {
  return moodFaces[mood] || moodFaces.Calm;
}

export function getMoodHudPresentation(mood: RuntimeMood | string): { mood: string; face: string } {
  return {
    mood,
    face: getMoodFace(mood)
  };
}
