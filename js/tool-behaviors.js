const INSTANT_PLACEMENT_TOOLS = new Set(["grenade", "trampoline", "gift", "tesla", "rope", "water"]);
const PAINT_COLORS = ["#ff7161", "#ffc857", "#98f17f", "#55d9cf", "#e7a8ff"];
export const RUBBER_PELLET_VARIANTS = [
  { id: "charcoal-lime", fill: "#2f3a40", stroke: "#f1ff8b", stripe: "#f1ff8b", dot: "#111719" },
  { id: "safety-orange", fill: "#ff8d66", stroke: "#61291f", stripe: "#fff0b5", dot: "#61291f" },
  { id: "mint-blue", fill: "#55d9cf", stroke: "#123a3b", stripe: "#e8f7f4", dot: "#123a3b" }
];

export function isInstantPlacementTool(toolId) {
  return INSTANT_PLACEMENT_TOOLS.has(toolId);
}

export function randomPaintColor(random = Math.random) {
  return PAINT_COLORS[Math.floor(random() * PAINT_COLORS.length)];
}

export function getRubberPelletVariant(index = 0) {
  return RUBBER_PELLET_VARIANTS[Math.abs(index) % RUBBER_PELLET_VARIANTS.length];
}

export function createBallBody(Bodies, position, radius) {
  return Bodies.circle(position.x, position.y, radius, {
    restitution: 0.82,
    friction: 0.14,
    density: 0.0015,
    label: "prop_ball",
    render: { fillStyle: "#e8f7f4", strokeStyle: "#678279", lineWidth: 2 }
  });
}

export function createBeachBallBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 30, {
    restitution: 0.92,
    friction: 0.09,
    frictionAir: 0.018,
    density: 0.00072,
    label: "prop_beachball",
    plugin: {
      cosmetic: {
        type: "beach-ball-striped",
        colors: ["#f7fbff", "#ff7161", "#55d9cf", "#ffc857"],
        seam: "#31545a"
      }
    },
    render: { fillStyle: "#f7fbff", strokeStyle: "#31545a", lineWidth: 2 }
  });
}

export function createBowlingBallBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 25, {
    restitution: 0.32,
    friction: 0.46,
    density: 0.0065,
    label: "prop_bowling",
    plugin: {
      cosmetic: {
        type: "bowling-classic",
        highlight: "#6f8790",
        hole: "#111719"
      }
    },
    render: { fillStyle: "#344148", strokeStyle: "#d7e5e1", lineWidth: 2 }
  });
}

export function createPaintballBody(Bodies, position, color = randomPaintColor()) {
  return Bodies.circle(position.x, position.y, 7, {
    restitution: 0.18,
    friction: 0.3,
    density: 0.0006,
    label: "prop_paintball",
    render: { fillStyle: color }
  });
}

export function createFoamDartBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 32, 8, {
    chamfer: { radius: 3 },
    restitution: 0.08,
    friction: 0.36,
    density: 0.00075,
    label: "prop_foamdart",
    plugin: {
      cosmetic: {
        type: "foam-dart",
        tip: "#ffc857",
        fin: "#55d9cf",
        stripe: "#f1ff8b"
      }
    },
    render: { fillStyle: "#e8f7f4", strokeStyle: "#31545a", lineWidth: 1 }
  });
}

export function createCorkBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 28, 14, {
    chamfer: { radius: 6 },
    restitution: 0.54,
    friction: 0.5,
    density: 0.00105,
    label: "prop_cork",
    plugin: {
      cosmetic: {
        type: "cork-popper",
        ring: "#7a4a2e",
        fleck: "#4b2d1f",
        cap: "#f6d39b"
      }
    },
    render: { fillStyle: "#c58a55", strokeStyle: "#5d3824", lineWidth: 1 }
  });
}

export function createRubberPelletBody(Bodies, position, variantIndex = 0) {
  const variant = getRubberPelletVariant(variantIndex);
  return Bodies.circle(position.x, position.y, 6, {
    restitution: 0.68,
    friction: 0.22,
    density: 0.0009,
    label: "prop_rubber",
    plugin: {
      cosmetic: {
        type: "rubber-pellet",
        variant: variant.id,
        stripe: variant.stripe,
        dot: variant.dot
      }
    },
    render: { fillStyle: variant.fill, strokeStyle: variant.stroke, lineWidth: 1 }
  });
}

export function createBoxingGloveBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 46, 34, {
    chamfer: { radius: 15 },
    restitution: 0.48,
    friction: 0.38,
    density: 0.0028,
    label: "prop_glove",
    plugin: {
      cosmetic: {
        type: "glove-laced",
        cuff: "#f4e6d5",
        lace: "#fff4d7",
        seam: "#8f2e38"
      }
    },
    render: { fillStyle: "#e85d64", strokeStyle: "#7a2630", lineWidth: 2 }
  });
}

export function createBrickBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 44, 24, {
    restitution: 0.24,
    friction: 0.72,
    density: 0.0032,
    label: "prop_brick",
    plugin: {
      cosmetic: {
        type: "foam-brick-lined",
        mortar: "#ffd1a8",
        chip: "#9e432f"
      }
    },
    render: { fillStyle: "#d86f52", strokeStyle: "#7b392e", lineWidth: 2 }
  });
}

export function createAnvilBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 74, 38, {
    restitution: 0.12,
    friction: 0.92,
    density: 0.009,
    label: "prop_anvil",
    plugin: {
      cosmetic: {
        type: "stage-weight-anvil",
        bevel: "#b9c5c4",
        shadow: "#1f2829",
        stamp: "#f1ff8b"
      }
    },
    render: { fillStyle: "#3d4748", strokeStyle: "#b9c5c4", lineWidth: 3 }
  });
}

export function createGrenadeBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 14, {
    restitution: 0.42,
    friction: 0.9,
    density: 0.004,
    label: "prop_grenade",
    render: { fillStyle: "#40504b", strokeStyle: "#b7c2bc", lineWidth: 1 }
  });
}

export function createTrampolineBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 150, 16, {
    isStatic: true,
    restitution: 1.35,
    friction: 0.08,
    label: "trampoline",
    render: { fillStyle: "#55d9cf", strokeStyle: "#102018", lineWidth: 2 }
  });
}

export function createGiftBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 34, 34, {
    restitution: 0.36,
    friction: 0.6,
    density: 0.0012,
    label: "prop_gift",
    render: { fillStyle: "#ffc857", strokeStyle: "#e46e5f", lineWidth: 3 }
  });
}

export function createTeslaBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 34, 58, {
    restitution: 0.25,
    friction: 0.8,
    density: 0.0022,
    label: "prop_tesla",
    render: { fillStyle: "#27322f", strokeStyle: "#55d9cf", lineWidth: 3 }
  });
}
