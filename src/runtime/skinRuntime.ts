export interface RuntimeSkinDefinition {
  id: string;
  color: string;
  accent: string;
  texture?: string;
  textureScale?: number;
}

export interface SkinPhysicsProfile {
  density: number;
  frictionAir: number;
  restitution: number;
  label: string;
}

export interface BaseBodyPhysics {
  density: number;
  frictionAir: number;
  restitution: number;
}

export interface AppliedSkinPhysics extends BaseBodyPhysics {
  label: string;
}

export interface SkinBodyRender {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  sprite: Record<string, never> | {
    texture: string;
    xScale: number;
    yScale: number;
  };
}

export interface ClassicPartShape {
  width: number;
  height: number;
  radius?: number;
}

export interface ClassicPartRenderGeometry {
  radius: number;
  gradientFocusX: number;
  gradientFocusY: number;
  gradientInnerRadius: number;
  gradientOuterRadius: number;
  lineWidth: number;
  highlightX: number;
  highlightY: number;
  highlightRadiusX: number;
  highlightRadiusY: number;
}

export interface ClassicFaceRenderGeometry {
  eyeLeftX: number;
  eyeRightX: number;
  eyeY: number;
  dotEyeRadius: number;
  xEyeSize: number;
  useXEyes: boolean;
  mouthX: number;
  mouthY: number;
  mouthRadius: number;
  mouthStartAngle: number;
  mouthEndAngle: number;
}

export const skinPhysicsProfiles: Record<string, SkinPhysicsProfile> = {
  classic: { density: 1, frictionAir: 1, restitution: 1, label: "standard" },
  robot: { density: 1.45, frictionAir: 1.35, restitution: 0.72, label: "robot-heavy" },
  gelatin: { density: 0.82, frictionAir: 0.72, restitution: 1.75, label: "gelatin-bouncy" },
  astronaut: { density: 0.9, frictionAir: 0.55, restitution: 1.12, label: "astronaut-float" },
  "classic-arcade:moon-boot": { density: 0.96, frictionAir: 0.82, restitution: 1.46, label: "moon-boot-spring" }
};

export function getRuntimeSkin<TSkin extends RuntimeSkinDefinition>(skins: TSkin[], selectedSkinId: string): TSkin {
  if (skins.length === 0) {
    throw new Error("Runtime skin catalog is empty.");
  }
  return skins.find((skin) => skin.id === selectedSkinId) || skins[0];
}

export function getRuntimeSkinPhysics(skinId: string): SkinPhysicsProfile {
  return skinPhysicsProfiles[skinId] || skinPhysicsProfiles.classic;
}

export function getSkinBodyRender(skin: RuntimeSkinDefinition, bodyLabel: string): SkinBodyRender {
  return {
    fillStyle: skin.color,
    strokeStyle: skin.accent,
    lineWidth: bodyLabel === "buddy_head" ? 2 : 1,
    sprite: getSkinSpriteRender(skin)
  };
}

export function getSkinSpriteRender(skin: RuntimeSkinDefinition): SkinBodyRender["sprite"] {
  if (!skin.texture) {
    return {};
  }
  const scale = skin.textureScale || 0.72;
  return {
    texture: skin.texture,
    xScale: scale,
    yScale: scale
  };
}

export function getAppliedSkinPhysics(base: BaseBodyPhysics, physics: SkinPhysicsProfile): AppliedSkinPhysics {
  return {
    density: base.density * physics.density,
    frictionAir: base.frictionAir * physics.frictionAir,
    restitution: base.restitution * physics.restitution,
    label: physics.label
  };
}

export function getClassicPartRenderGeometry(part: ClassicPartShape, isHead: boolean): ClassicPartRenderGeometry {
  const radius = part.radius || Math.min(part.width, part.height) / 2;
  return {
    radius,
    gradientFocusX: -part.width * 0.22,
    gradientFocusY: -part.height * 0.28,
    gradientInnerRadius: Math.max(1, radius * 0.08),
    gradientOuterRadius: Math.max(part.width, part.height) * 0.72,
    lineWidth: isHead ? 1.6 : 1.2,
    highlightX: -part.width * 0.17,
    highlightY: -part.height * 0.23,
    highlightRadiusX: Math.max(2, radius * 0.28),
    highlightRadiusY: Math.max(1.6, radius * 0.13)
  };
}

export function getClassicFaceRenderGeometry(radius: number, mood: string, face: string): ClassicFaceRenderGeometry {
  const surprisedMoods = ["Afraid", "Surprised", "Curious"];
  const sadMoods = ["Stunned", "Sad"];
  const useXEyes = face === "x_x";
  const mouthY = surprisedMoods.includes(mood)
    ? radius * 0.28
    : sadMoods.includes(mood)
      ? radius * 0.36
      : radius * 0.1;
  const mouthRadius = surprisedMoods.includes(mood)
    ? radius * 0.13
    : sadMoods.includes(mood)
      ? radius * 0.28
      : radius * 0.34;
  const mouthStartAngle = surprisedMoods.includes(mood)
    ? 0
    : sadMoods.includes(mood)
      ? Math.PI * 1.12
      : 0.28;
  const mouthEndAngle = surprisedMoods.includes(mood)
    ? Math.PI * 2
    : sadMoods.includes(mood)
      ? Math.PI * 1.88
      : Math.PI - 0.28;
  return {
    eyeLeftX: -radius * 0.32,
    eyeRightX: radius * 0.32,
    eyeY: -radius * 0.1,
    dotEyeRadius: radius * 0.055,
    xEyeSize: radius * 0.1,
    useXEyes,
    mouthX: 0,
    mouthY,
    mouthRadius,
    mouthStartAngle,
    mouthEndAngle
  };
}
