export type BuddyPartId =
  | "head"
  | "torso"
  | "pelvis"
  | "leftUpperArm"
  | "leftLowerArm"
  | "leftHand"
  | "rightUpperArm"
  | "rightLowerArm"
  | "rightHand"
  | "leftUpperLeg"
  | "leftLowerLeg"
  | "leftFoot"
  | "rightUpperLeg"
  | "rightLowerLeg"
  | "rightFoot";

export interface BuddyPartSpec {
  id: BuddyPartId;
  label: string;
  width: number;
  height: number;
  radius?: number;
}

export const buddyPartSpecs: BuddyPartSpec[] = [
  { id: "head", label: "Head", width: 34, height: 34, radius: 17 },
  { id: "torso", label: "Torso", width: 36, height: 58 },
  { id: "pelvis", label: "Pelvis", width: 38, height: 24 },
  { id: "leftUpperArm", label: "Left upper arm", width: 14, height: 38 },
  { id: "leftLowerArm", label: "Left lower arm", width: 13, height: 35 },
  { id: "leftHand", label: "Left hand", width: 16, height: 16, radius: 8 },
  { id: "rightUpperArm", label: "Right upper arm", width: 14, height: 38 },
  { id: "rightLowerArm", label: "Right lower arm", width: 13, height: 35 },
  { id: "rightHand", label: "Right hand", width: 16, height: 16, radius: 8 },
  { id: "leftUpperLeg", label: "Left upper leg", width: 16, height: 42 },
  { id: "leftLowerLeg", label: "Left lower leg", width: 15, height: 40 },
  { id: "leftFoot", label: "Left foot", width: 24, height: 12 },
  { id: "rightUpperLeg", label: "Right upper leg", width: 16, height: 42 },
  { id: "rightLowerLeg", label: "Right lower leg", width: 15, height: 40 },
  { id: "rightFoot", label: "Right foot", width: 24, height: 12 }
];
