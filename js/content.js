export const TOOL_DEFS = [
  { id: "hand", name: "Open Hand", icon: "H", category: "Utility", cost: 0, description: "Grab, drag, flick, throw, and quick-tap to tickle." },
  { id: "ball", name: "Ball", icon: "O", category: "Props", cost: 0, description: "Drag to aim and release a springy projectile." },
  { id: "beachball", name: "Beach Ball", icon: "o", category: "Props", cost: 280, description: "A big light prop with floaty bounce and soft impacts." },
  { id: "bowling", name: "Bowling Ball", icon: "8", category: "Props", cost: 340, description: "A heavy rolling ball with satisfying blunt impacts." },
  { id: "brick", name: "Foam Brick", icon: "B", category: "Props", cost: 220, description: "A dense rectangular throw with blunt combo scoring." },
  { id: "glove", name: "Boxing Glove", icon: "P", category: "Props", cost: 390, description: "A padded punch projectile for quick slapstick knockbacks." },
  { id: "fan", name: "Fan", icon: ">", category: "Force", cost: 120, description: "Hold to push bodies in a cone and juggle for cash." },
  { id: "paintball", name: "Paintball", icon: "*", category: "Projectiles", cost: 260, description: "Fast shots that tint skin and reward accuracy." },
  { id: "foamdart", name: "Foam Dart", icon: "D", category: "Projectiles", cost: 760, description: "Aim and release a soft dart that sticks on hit." },
  { id: "corkpopper", name: "Cork Popper", icon: "C", category: "Projectiles", cost: 540, description: "Aim and release a stubby cork that pops Buddy back on impact." },
  { id: "plunger", name: "Plunger Shot", icon: "U", category: "Projectiles", cost: 880, description: "Aim and release a suction-cup projectile that tugs Buddy on hit." },
  { id: "starshot", name: "Star Launcher", icon: "S", category: "Projectiles", cost: 1040, description: "Aim and release a spinning foam star that bumps Buddy into a twirl." },
  { id: "rubber", name: "Rubber Blaster", icon: ":", category: "Projectiles", cost: 640, description: "Hold and sweep to fire a stream of bouncy rubber pellets." },
  { id: "heatcone", name: "Heat Cone", icon: "^", category: "Elemental", cost: 980, description: "Hold to warm Buddy with a reduced-flash ember cone." },
  { id: "sparkwand", name: "Spark Wand", icon: "Z", category: "Elemental", cost: 1180, description: "Hold near Buddy to chain short shock arcs from the cursor." },
  { id: "frostpuff", name: "Frost Puff", icon: "F", category: "Elemental", cost: 1260, description: "Hold to chill Buddy with a reduced-flash frost mist." },
  { id: "goomist", name: "Goo Mist", icon: "M", category: "Elemental", cost: 1320, description: "Hold to coat Buddy in slippery green goo." },
  { id: "pulsebeam", name: "Pulse Beam", icon: "|", category: "Elemental", cost: 1460, description: "Hold a narrow low-flash energy beam on Buddy for a steady push." },
  { id: "grenade", name: "Grenade", icon: "G", category: "Explosives", cost: 460, description: "Timed radial impulse with camera shake." },
  { id: "trampoline", name: "Trampoline", icon: "_", category: "Builders", cost: 720, description: "Place a bouncy pad for airborne combos." },
  { id: "anvil", name: "Stage Weight", icon: "A", category: "Props", cost: 1180, description: "A heavy overhead drop for big slapstick impacts." },
  { id: "rope", name: "Elastic Rope", icon: "R", category: "Builders", cost: 0, description: "Attach a ceiling tether to the nearest limb." },
  { id: "water", name: "Water Fill", icon: "W", category: "Liquids", cost: 0, description: "Click to set water height; click near the floor to drain." },
  { id: "gift", name: "Gift Box", icon: "+", category: "Nice", cost: 920, description: "Spend a little cash to cheer up the buddy." },
  { id: "confetti", name: "Confetti Popper", icon: "!", category: "Nice", cost: 1080, description: "Place a popper that showers confetti and gives Buddy a cheerful bump." },
  { id: "boombox", name: "Boombox", icon: "J", category: "Nice", cost: 1240, description: "Place a speaker that plays upbeat pulses, music notes, and happy motion." },
  { id: "tesla", name: "Tesla Coil", icon: "T", category: "Energy", cost: 1350, description: "Drop a coil that shocks nearby limbs in pulses." },
  { id: "blackhole", name: "Black Hole", icon: "@", category: "Force", cost: 2100, description: "Hold to pull everything into orbital chaos." }
];

export const TOOL_EFFECT_AUDIT = {
  hand: { cosmetic: "buddy contact highlight and classic cursor affordance", visual: "grab stroke, tickle burst, ragdoll motion", scoring: ["throw", "tickle", "hand"], coverage: "browser hand flick and wall recovery" },
  ball: { cosmetic: "ball-basic round prop metadata", visual: "springy thrown ball body", scoring: ["throw", "blunt", "toy"], coverage: "browser ball launch scoring" },
  beachball: { cosmetic: "beach-ball-striped prop metadata", visual: "striped beach ball overlay", scoring: ["beachball", "propVariant"], coverage: "browser prop throw regression" },
  bowling: { cosmetic: "bowling-classic prop metadata", visual: "highlight and finger-hole overlay", scoring: ["bowling", "propVariant"], coverage: "browser prop throw regression" },
  brick: { cosmetic: "foam-brick-lined prop metadata", visual: "mortar and chip overlay", scoring: ["throw", "object"], coverage: "browser prop throw regression" },
  glove: { cosmetic: "glove-laced prop metadata", visual: "cuff and lace overlay", scoring: ["punch", "propVariant"], coverage: "browser prop throw regression" },
  fan: { cosmetic: "tool field cone", visual: "cyan force cone and wind replay tag", scoring: ["wind", "force"], coverage: "browser toolEffects fan" },
  paintball: { cosmetic: "paintball-splat projectile metadata", visual: "paint decal and skin tint", scoring: ["paintball", "paint"], coverage: "browser toolEffects paintball" },
  foamdart: { cosmetic: "foam-dart projectile metadata", visual: "tip, fin, and sticky body state", scoring: ["dart", "dartHit", "foamDart"], coverage: "browser toolEffects foamdart" },
  corkpopper: { cosmetic: "cork-popper projectile metadata", visual: "ring, fleck, and cap overlay", scoring: ["cork", "corkHit", "corkPopper"], coverage: "browser toolEffects corkpopper" },
  plunger: { cosmetic: "plunger-shot projectile metadata", visual: "suction cup overlay and temporary suction body status", scoring: ["plunger", "plungerHit", "suction"], coverage: "browser toolEffects plunger and Suction Drill challenge" },
  starshot: { cosmetic: "star-shot projectile metadata", visual: "spinning foam star overlay and temporary twirl body status", scoring: ["star", "starHit", "starShot"], coverage: "browser toolEffects starshot and Spin Drill challenge" },
  rubber: { cosmetic: "rubber-pellet rotating variant metadata", visual: "striped/dotted pellet variants and burst HUD", scoring: ["rubber", "beadCannon"], coverage: "browser toolEffects rubber and Bead Cannon challenge" },
  heatcone: { cosmetic: "reduced-flash ember field", visual: "orange cone particles and fear mood", scoring: ["heat", "elemental"], coverage: "browser toolEffects heatcone" },
  sparkwand: { cosmetic: "cursor arc field", visual: "yellow bolt particles and stun impulse", scoring: ["spark", "sparkWand"], coverage: "browser Spark Drill regression" },
  frostpuff: { cosmetic: "temporary frost body status", visual: "blue mist and chilled body overlay", scoring: ["frost", "frostPuff", "cold"], coverage: "browser Frost Test regression" },
  goomist: { cosmetic: "temporary goo body status", visual: "green mist and slippery body overlay", scoring: ["goo", "gooMist", "slippery"], coverage: "browser Slip Test regression" },
  pulsebeam: { cosmetic: "temporary pulse body status", visual: "narrow low-flash yellow beam", scoring: ["pulse", "pulseBeam", "light"], coverage: "browser Pulse Check regression" },
  grenade: { cosmetic: "grenade-shell prop metadata", visual: "timed body, burst particles, camera shake", scoring: ["armed", "explosion"], coverage: "browser toolEffects grenade" },
  trampoline: { cosmetic: "trampoline-pad builder metadata", visual: "cyan static pad with high restitution", scoring: ["build", "builder"], coverage: "browser toolEffects trampoline" },
  anvil: { cosmetic: "stage-weight-anvil prop metadata", visual: "bevel, shadow, and stamp overlay", scoring: ["throw", "heavy"], coverage: "browser prop throw regression" },
  rope: { cosmetic: "elastic rope constraint line", visual: "ceiling tether and constraint physics", scoring: ["tether", "builder", "force"], coverage: "browser toolEffects rope" },
  water: { cosmetic: "liquid room fill", visual: "water/slime/oil band with buoyancy", scoring: ["liquid", "builder"], coverage: "browser liquid use and Liquid Control challenge" },
  gift: { cosmetic: "gift-box prop metadata", visual: "gift body and happy mood", scoring: ["gift", "happy"], coverage: "browser toolEffects gift" },
  confetti: { cosmetic: "confetti-popper prop metadata", visual: "popper body, colored confetti particles, and cheerful bump", scoring: ["confetti", "happy", "nice"], coverage: "browser toolEffects confetti and Cheer Check challenge" },
  boombox: { cosmetic: "boombox speaker prop metadata", visual: "speaker body, music-note particles, and rhythmic happy pulses", scoring: ["boombox", "music", "happy", "nice"], coverage: "browser toolEffects boombox and Groove Check challenge" },
  tesla: { cosmetic: "tesla-coil prop metadata", visual: "coil body and bolt particles", scoring: ["shock", "stun"], coverage: "browser toolEffects tesla" },
  blackhole: { cosmetic: "gravity ring field", visual: "dark pull ring and green orbit arc", scoring: ["gravity", "force"], coverage: "browser toolEffects blackhole" }
};

export const DEFAULT_SKIN_DEFS = [
  { id: "classic", name: "Classic Buddy", cost: 0, color: "#d6ded9", accent: "#f5faf7", description: "Soft gray lab-room original." },
  { id: "neon", name: "Neon Mascot", cost: 180, color: "#99f17f", accent: "#55d9cf", description: "Brighter reactions and glow-tinted impacts." },
  { id: "robot", name: "Robot", cost: 520, color: "#aeb7bd", accent: "#5ee0ff", description: "Heavier body with stiffer-looking panels." },
  { id: "gelatin", name: "Gelatin Blob", cost: 780, color: "#9be7ff", accent: "#f1ff8b", description: "Squishier color pass for slapstick bounce." },
  { id: "astronaut", name: "Astronaut", cost: 1220, color: "#f3f4ef", accent: "#ff8d66", description: "Clean white suit for zero-gravity experiments." }
];

export const DEFAULT_AUDIO_PACKS = {
  classic: { name: "Classic", master: 0.22, pitch: 1, toneWave: "triangle", impactWave: "triangle", zapWave: "square", noiseFilter: 1, decay: 1 },
  arcade: { name: "Arcade", master: 0.2, pitch: 1.28, toneWave: "square", impactWave: "square", zapWave: "square", noiseFilter: 1.18, decay: 0.78 },
  sciFi: { name: "Sci-Fi", master: 0.19, pitch: 0.86, toneWave: "sawtooth", impactWave: "sawtooth", zapWave: "sawtooth", noiseFilter: 1.42, decay: 1.22 },
  soft: { name: "Soft", master: 0.14, pitch: 0.92, toneWave: "sine", impactWave: "sine", zapWave: "triangle", noiseFilter: 0.72, decay: 1.35 }
};

export const LIQUID_TYPES = {
  water: { name: "Water", fill: "#55d9cf", stroke: "#baf7ff", alpha: 0.34, buoyancy: 1, dragX: 1, dragY: 1, angularDamping: 1, mood: "Curious" },
  slime: { name: "Slime", fill: "#98f17f", stroke: "#e4ffd5", alpha: 0.42, buoyancy: 0.72, dragX: 2.35, dragY: 2.1, angularDamping: 2.4, mood: "Surprised" },
  oil: { name: "Oil", fill: "#2d3430", stroke: "#ffc857", alpha: 0.46, buoyancy: 0.55, dragX: 0.38, dragY: 0.42, angularDamping: 0.35, mood: "Afraid" }
};

export const MISSION_POOL = [
  { id: "impact10", title: "Lab Warmup", description: "Score 10 impact events.", target: 10, event: "impact", reward: 80 },
  { id: "juggle3", title: "Air Time", description: "Keep Buddy airborne for 3 seconds total.", target: 3, event: "airborneSecond", reward: 120 },
  { id: "variety5", title: "Variety Test", description: "Use 5 different scoring tags.", target: 5, event: "uniqueTag", reward: 150 },
  { id: "happy4", title: "Comic Relief", description: "Trigger happy or tickle reactions 4 times.", target: 4, event: "happy", reward: 110 },
  { id: "explode3", title: "Shockwave Study", description: "Land 3 explosion scores.", target: 3, event: "explosion", reward: 170 },
  { id: "cash500", title: "Grant Funding", description: "Earn $500 during this session.", target: 500, event: "cash", reward: 130 },
  { id: "rope2", title: "Tether Lab", description: "Attach 2 elastic ropes.", target: 2, event: "tether", reward: 120 },
  { id: "liquid2", title: "Fluid Test", description: "Set or score with liquids 2 times.", target: 2, event: "liquid", reward: 140 },
  { id: "bowling2", title: "Lane Test", description: "Throw the Bowling Ball 2 times.", target: 2, event: "bowling", reward: 125 },
  { id: "beach3", title: "Beach Rally", description: "Launch the Beach Ball 3 times.", target: 3, event: "beachball", reward: 135 },
  { id: "punch2", title: "Glove Work", description: "Launch the Boxing Glove 2 times.", target: 2, event: "punch", reward: 125 },
  { id: "prop4", title: "Prop Variants", description: "Use Beach Ball, Bowling Ball, or Boxing Glove 4 times.", target: 4, event: "propVariant", reward: 180 },
  { id: "bead6", title: "Bead Cannon", description: "Fire 6 Rubber Blaster pellets.", target: 6, event: "beadCannon", reward: 150 },
  { id: "dart4", title: "Dart Board", description: "Stick 4 Foam Darts.", target: 4, event: "foamDart", reward: 165 },
  { id: "cork4", title: "Cork Shots", description: "Land 4 Cork Popper hits.", target: 4, event: "corkPopper", reward: 155 },
  { id: "plunger4", title: "Suction Drill", description: "Land 4 Plunger Shot hits.", target: 4, event: "plungerShot", reward: 170 },
  { id: "star4", title: "Spin Drill", description: "Land 4 Star Launcher hits.", target: 4, event: "starShot", reward: 175 },
  { id: "spark5", title: "Spark Drill", description: "Land 5 Spark Wand arcs.", target: 5, event: "sparkWand", reward: 175 },
  { id: "frost5", title: "Frost Test", description: "Land 5 Frost Puff chills.", target: 5, event: "frostPuff", reward: 175 },
  { id: "goo5", title: "Slip Test", description: "Land 5 Goo Mist coats.", target: 5, event: "goo", reward: 180 },
  { id: "pulse5", title: "Pulse Check", description: "Hold 5 Pulse Beam hits.", target: 5, event: "pulseBeam", reward: 185 },
  { id: "confetti5", title: "Cheer Check", description: "Pop confetti 5 times.", target: 5, event: "confetti", reward: 150 },
  { id: "boombox4", title: "Groove Check", description: "Score 4 Boombox music pulses.", target: 4, event: "boombox", reward: 165 },
  { id: "wheel3", title: "Quick Picker", description: "Open the radial tool wheel 3 times.", target: 3, event: "radialWheel", reward: 90 },
  { id: "export1", title: "Clip It", description: "Export one replay clip.", target: 1, event: "replayExport", reward: 160 }
];

export const CHALLENGE_MODES = {
  free: { name: "Free", description: "No challenge timer. Experiment freely.", event: "", target: 0, duration: 0, reward: 0 },
  juggle: { name: "Juggle Lab", description: "Earn 8 airborne score events before time runs out.", event: "airborne", target: 8, duration: 60, reward: 240 },
  tether: { name: "Tether Tricks", description: "Attach 2 elastic ropes before time runs out.", event: "tether", target: 2, duration: 45, reward: 180 },
  liquid: { name: "Liquid Control", description: "Trigger 3 liquid events before time runs out.", event: "liquid", target: 3, duration: 50, reward: 210 },
  props: { name: "Prop Tricks", description: "Use Beach Ball, Bowling Ball, or Boxing Glove 4 times before time runs out.", event: "propVariant", target: 4, duration: 45, reward: 230 },
  bead: { name: "Bead Cannon", description: "Fire 6 Rubber Blaster pellets before time runs out.", event: "beadCannon", target: 6, duration: 35, reward: 220 },
  suction: { name: "Suction Drill", description: "Land 4 Plunger Shot hits before time runs out.", event: "plungerShot", target: 4, duration: 35, reward: 230 },
  spin: { name: "Spin Drill", description: "Land 4 Star Launcher hits before time runs out.", event: "starShot", target: 4, duration: 35, reward: 235 },
  spark: { name: "Spark Drill", description: "Land 5 Spark Wand arcs before time runs out.", event: "sparkWand", target: 5, duration: 35, reward: 240 },
  frost: { name: "Frost Test", description: "Land 5 Frost Puff chills before time runs out.", event: "frostPuff", target: 5, duration: 35, reward: 240 },
  goo: { name: "Slip Test", description: "Land 5 Goo Mist coats before time runs out.", event: "goo", target: 5, duration: 35, reward: 245 },
  pulse: { name: "Pulse Check", description: "Hold 5 Pulse Beam hits before time runs out.", event: "pulseBeam", target: 5, duration: 35, reward: 250 },
  cheer: { name: "Cheer Check", description: "Pop 5 Confetti Poppers before time runs out.", event: "confetti", target: 5, duration: 35, reward: 210 },
  groove: { name: "Groove Check", description: "Score 4 Boombox music pulses before time runs out.", event: "boombox", target: 4, duration: 35, reward: 225 },
  export: { name: "Clip Export", description: "Export 1 replay clip before time runs out.", event: "replayExport", target: 1, duration: 35, reward: 260 }
};
