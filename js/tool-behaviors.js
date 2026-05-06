const INSTANT_PLACEMENT_TOOLS = new Set(["firecracker", "grenade", "mine", "stickybomb", "largebomb", "trampoline", "platform", "bumper", "conveyor", "gift", "moneydrop", "treat", "confetti", "boombox", "tesla", "rope", "water"]);
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
    plugin: {
      cosmetic: {
        type: "ball-basic",
        shine: "#ffffff",
        rim: "#678279"
      }
    },
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
    plugin: {
      cosmetic: {
        type: "paintball-splat",
        color
      }
    },
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

export function createPlungerBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 38, 16, {
    chamfer: { radius: 6 },
    restitution: 0.22,
    friction: 0.48,
    density: 0.00125,
    label: "prop_plunger",
    plugin: {
      cosmetic: {
        type: "plunger-shot",
        cup: "#e46e5f",
        handle: "#c58a55",
        ring: "#5c2f28"
      }
    },
    render: { fillStyle: "#c58a55", strokeStyle: "#5c2f28", lineWidth: 2 }
  });
}

export function createStarBody(Bodies, position) {
  return Bodies.polygon(position.x, position.y, 5, 15, {
    restitution: 0.42,
    friction: 0.34,
    density: 0.001,
    label: "prop_star",
    plugin: {
      cosmetic: {
        type: "star-shot",
        core: "#fff4b8",
        stripe: "#55d9cf",
        rim: "#d8902f"
      }
    },
    render: { fillStyle: "#ffd06a", strokeStyle: "#d8902f", lineWidth: 2 }
  });
}

export function createCannonballBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 18, {
    restitution: 0.22,
    friction: 0.52,
    density: 0.0058,
    label: "prop_cannonball",
    plugin: {
      cosmetic: {
        type: "cannonball-iron",
        shine: "#73838a",
        scuff: "#171d20"
      }
    },
    render: { fillStyle: "#2f383d", strokeStyle: "#c6d4d7", lineWidth: 2 }
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

export function createCrateBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 52, 52, {
    chamfer: { radius: 4 },
    restitution: 0.28,
    friction: 0.78,
    density: 0.0028,
    label: "prop_crate",
    plugin: {
      cosmetic: {
        type: "crate-cross",
        plank: "#b87745",
        edge: "#5b3824",
        nail: "#f6d39b"
      }
    },
    render: { fillStyle: "#9c6238", strokeStyle: "#5b3824", lineWidth: 3 }
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
    plugin: {
      cosmetic: {
        type: "grenade-shell",
        pin: "#ffc857",
        band: "#1d2724"
      }
    },
    render: { fillStyle: "#40504b", strokeStyle: "#b7c2bc", lineWidth: 1 }
  });
}

export function createFirecrackerBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 18, 42, {
    chamfer: { radius: 4 },
    restitution: 0.38,
    friction: 0.62,
    density: 0.0012,
    label: "prop_firecracker",
    plugin: {
      cosmetic: {
        type: "firecracker-tube",
        fuse: "#f1ff8b",
        stripe: "#fff4d7",
        spark: "#ffc857"
      }
    },
    render: { fillStyle: "#d94e45", strokeStyle: "#64211f", lineWidth: 2 }
  });
}

export function createMineBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 21, {
    restitution: 0.18,
    friction: 0.86,
    density: 0.0044,
    label: "prop_mine",
    plugin: {
      cosmetic: {
        type: "mine-button",
        button: "#ff7161",
        tooth: "#b9c5c4",
        shell: "#202a2a"
      }
    },
    render: { fillStyle: "#202a2a", strokeStyle: "#b9c5c4", lineWidth: 2 }
  });
}

export function createStickyBombBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 16, {
    restitution: 0.1,
    friction: 0.94,
    density: 0.0028,
    label: "prop_stickybomb",
    plugin: {
      cosmetic: {
        type: "sticky-bomb",
        pad: "#98f17f",
        fuse: "#ffc857",
        shell: "#293333"
      }
    },
    render: { fillStyle: "#293333", strokeStyle: "#98f17f", lineWidth: 3 }
  });
}

export function createLargeBombBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 31, {
    restitution: 0.2,
    friction: 0.72,
    density: 0.0068,
    label: "prop_largebomb",
    plugin: {
      cosmetic: {
        type: "large-cartoon-bomb",
        fuse: "#f1ff8b",
        cap: "#5b6a6b",
        shine: "#73838a"
      }
    },
    render: { fillStyle: "#1f2829", strokeStyle: "#c6d4d7", lineWidth: 3 }
  });
}

export function createTrampolineBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 150, 16, {
    isStatic: true,
    restitution: 1.35,
    friction: 0.08,
    label: "trampoline",
    plugin: {
      cosmetic: {
        type: "trampoline-pad",
        bounce: "high",
        stripe: "#e8f7f4",
        spring: "#102018"
      }
    },
    render: { fillStyle: "#55d9cf", strokeStyle: "#102018", lineWidth: 2 }
  });
}

export function createPlatformBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 170, 18, {
    isStatic: true,
    restitution: 0.24,
    friction: 0.82,
    label: "platform",
    plugin: {
      cosmetic: {
        type: "platform-plank",
        stripe: "#f1ff8b",
        rivet: "#25322f"
      }
    },
    render: { fillStyle: "#60706a", strokeStyle: "#25322f", lineWidth: 2 }
  });
}

export function createBumperBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 28, {
    isStatic: true,
    restitution: 1.55,
    friction: 0.05,
    label: "bumper",
    plugin: {
      cosmetic: {
        type: "bumper-ring",
        ring: "#ff7161",
        core: "#fff4b8",
        bolt: "#31545a"
      }
    },
    render: { fillStyle: "#fff4b8", strokeStyle: "#ff7161", lineWidth: 4 }
  });
}

export function createConveyorBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 180, 20, {
    isStatic: true,
    restitution: 0.18,
    friction: 0.04,
    label: "conveyor",
    plugin: {
      conveyorSpeed: 0.0028,
      cosmetic: {
        type: "conveyor-belt",
        belt: "#263331",
        arrow: "#55d9cf",
        roller: "#f1ff8b"
      }
    },
    render: { fillStyle: "#263331", strokeStyle: "#55d9cf", lineWidth: 2 }
  });
}

export function createGiftBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 34, 34, {
    restitution: 0.36,
    friction: 0.6,
    density: 0.0012,
    label: "prop_gift",
    plugin: {
      cosmetic: {
        type: "gift-box",
        ribbon: "#e46e5f",
        bow: "#fff4d7"
      }
    },
    render: { fillStyle: "#ffc857", strokeStyle: "#e46e5f", lineWidth: 3 }
  });
}

export function createMoneyDropBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 42, 28, {
    chamfer: { radius: 8 },
    restitution: 0.42,
    friction: 0.42,
    density: 0.001,
    label: "prop_moneydrop",
    plugin: {
      cosmetic: {
        type: "money-drop",
        bill: "#98f17f",
        band: "#f1ff8b",
        ink: "#24452d"
      }
    },
    render: { fillStyle: "#98f17f", strokeStyle: "#24452d", lineWidth: 2 }
  });
}

export function createTreatBody(Bodies, position) {
  return Bodies.circle(position.x, position.y, 17, {
    restitution: 0.5,
    friction: 0.38,
    density: 0.0009,
    label: "prop_treat",
    plugin: {
      cosmetic: {
        type: "treat-cookie",
        chip: "#5d3824",
        icing: "#fff4d7",
        crumb: "#c58a55"
      }
    },
    render: { fillStyle: "#d89b5f", strokeStyle: "#7a4a2e", lineWidth: 2 }
  });
}

export function createConfettiPopperBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 44, 28, {
    chamfer: { radius: 8 },
    restitution: 0.24,
    friction: 0.66,
    density: 0.0017,
    label: "prop_confetti",
    plugin: {
      cosmetic: {
        type: "confetti-popper",
        rim: "#55d9cf",
        stripe: "#ffd06a",
        cap: "#e46e5f"
      }
    },
    render: { fillStyle: "#f6f1d0", strokeStyle: "#55d9cf", lineWidth: 3 }
  });
}

export function createBoomboxBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 58, 34, {
    chamfer: { radius: 7 },
    restitution: 0.28,
    friction: 0.72,
    density: 0.0021,
    label: "prop_boombox",
    plugin: {
      cosmetic: {
        type: "boombox",
        speaker: "#111719",
        cone: "#55d9cf",
        trim: "#ffc857",
        handle: "#f6f1d0"
      }
    },
    render: { fillStyle: "#39484d", strokeStyle: "#ffc857", lineWidth: 3 }
  });
}

export function createTeslaBody(Bodies, position) {
  return Bodies.rectangle(position.x, position.y, 34, 58, {
    restitution: 0.25,
    friction: 0.8,
    density: 0.0022,
    label: "prop_tesla",
    plugin: {
      cosmetic: {
        type: "tesla-coil",
        coil: "#55d9cf",
        core: "#f1ff8b"
      }
    },
    render: { fillStyle: "#27322f", strokeStyle: "#55d9cf", lineWidth: 3 }
  });
}
