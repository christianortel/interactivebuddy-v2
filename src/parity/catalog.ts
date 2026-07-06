// Authoritative content catalog for Interactive Buddy v1.02 parity.
// Values measured from the reference artifact's defineItem data table (EV-0007).
// Do not edit values without an evidence record; see docs/CONTENT_INVENTORY.md.

export type MenuKind = "Items" | "Skins" | "Modes";

export interface CatalogEntry {
  /** Stable parity-matrix id, e.g. ITEM-EXPL-GRENADES */
  id: string;
  /** Exact display name from the reference data table */
  name: string;
  /** Top-level menu this entry belongs to */
  menu: MenuKind;
  /** Category (Items) or internal id (Skins/Modes) from the reference */
  group: string;
  /** Shop price in dollars (reference integers; display format is $X.XX) */
  price: number;
  /** True when the reference marks the entry owned on a clean save */
  startsOwned: boolean;
}

export const ITEMS: readonly CatalogEntry[] = [
  { id: "ITEM-HAND-NONE", name: "None", menu: "Items", group: "Hand", price: 0, startsOwned: true },
  { id: "ITEM-HAND-OPEN", name: "Open Hand", menu: "Items", group: "Hand", price: 0, startsOwned: true },
  { id: "ITEM-HAND-TICKLE", name: "Tickle", menu: "Items", group: "Hand", price: 0, startsOwned: true },
  { id: "ITEM-HAND-FIST", name: "Fist", menu: "Items", group: "Hand", price: 0, startsOwned: true },
  { id: "ITEM-EXPL-GRENADES", name: "Grenades", menu: "Items", group: "Explosives", price: 50, startsOwned: true },
  { id: "ITEM-EXPL-MOLOTOV", name: "Molotov Cocktails", menu: "Items", group: "Explosives", price: 60, startsOwned: false },
  { id: "ITEM-EXPL-MINES", name: "Mines", menu: "Items", group: "Explosives", price: 80, startsOwned: false },
  { id: "ITEM-EXPL-FLAME", name: "Flamethrower", menu: "Items", group: "Explosives", price: 100, startsOwned: false },
  { id: "ITEM-EXPL-MISSILES", name: "Missiles", menu: "Items", group: "Explosives", price: 100, startsOwned: false },
  { id: "ITEM-GOD-WEAKVORTEX", name: "Weak Gravity Vortex", menu: "Items", group: "God Powers", price: 20, startsOwned: true },
  { id: "ITEM-GOD-STRONGVORTEX", name: "Strong Gravity Vortex", menu: "Items", group: "God Powers", price: 30, startsOwned: false },
  { id: "ITEM-GOD-FIREBALLS", name: "Fireballs", menu: "Items", group: "God Powers", price: 40, startsOwned: false },
  { id: "ITEM-GOD-EXPLODEMOUSE", name: "Explode At Mouse", menu: "Items", group: "God Powers", price: 60, startsOwned: false },
  { id: "ITEM-GUNS-PISTOL", name: "Pistol", menu: "Items", group: "Guns", price: 60, startsOwned: false },
  { id: "ITEM-GUNS-SHOTGUN", name: "Shotgun", menu: "Items", group: "Guns", price: 100, startsOwned: false },
  { id: "ITEM-GUNS-MG", name: "Machine Gun", menu: "Items", group: "Guns", price: 140, startsOwned: false },
  { id: "ITEM-OBJ-BASEBALLS", name: "Baseballs", menu: "Items", group: "Objects", price: 15, startsOwned: true },
  { id: "ITEM-OBJ-RUBBER", name: "Rubber Balls", menu: "Items", group: "Objects", price: 20, startsOwned: false },
  { id: "ITEM-OBJ-BOWLING", name: "Bowling Balls", menu: "Items", group: "Objects", price: 40, startsOwned: false },
  { id: "ITEM-OBJ-INFANTS", name: "Infants", menu: "Items", group: "Objects", price: 60, startsOwned: false },
  { id: "ITEM-MISC-WIDEHOSE", name: "Wide Nozzle Hose", menu: "Items", group: "Miscellaneous", price: 15, startsOwned: false },
  { id: "ITEM-MISC-NARROWHOSE", name: "Narrow Nozzle Hose", menu: "Items", group: "Miscellaneous", price: 20, startsOwned: false },
  { id: "ITEM-MISC-FLAIL", name: "Medieval Flail", menu: "Items", group: "Miscellaneous", price: 40, startsOwned: false },
  { id: "ITEM-MISC-FIREHOSE", name: "Fire Hose", menu: "Items", group: "Miscellaneous", price: 60, startsOwned: false },
  { id: "ITEM-MISC-STUNGUN", name: "Stun Gun", menu: "Items", group: "Miscellaneous", price: 85, startsOwned: false },
  { id: "ITEM-SPEC-ORB", name: "Magical Orb", menu: "Items", group: "Special", price: 160, startsOwned: false },
  { id: "ITEM-SPEC-GRAVSHIFT", name: "Gravity Shifter", menu: "Items", group: "Special", price: 240, startsOwned: false },
  { id: "ITEM-SPEC-RADIO", name: "Radio", menu: "Items", group: "Special", price: 320, startsOwned: false }
];

export const SKINS: readonly CatalogEntry[] = [
  { id: "SKIN-DEFAULT", name: "Buddy", menu: "Skins", group: "default", price: 0, startsOwned: true },
  { id: "SKIN-TELETUBBY", name: "Teletubby", menu: "Skins", group: "teletubby", price: 60, startsOwned: false },
  { id: "SKIN-MADDOX", name: "Maddox", menu: "Skins", group: "pirate", price: 60, startsOwned: false },
  { id: "SKIN-STRAWBERRY", name: "StrawberryClock", menu: "Skins", group: "strawberry", price: 60, startsOwned: false },
  { id: "SKIN-GOTH", name: "Gregor the Goth", menu: "Skins", group: "goth", price: 60, startsOwned: false },
  { id: "SKIN-REP", name: "Republican", menu: "Skins", group: "rep", price: 60, startsOwned: false },
  { id: "SKIN-DEM", name: "Democrat", menu: "Skins", group: "dem", price: 60, startsOwned: false },
  { id: "SKIN-MOORE", name: "Moore", menu: "Skins", group: "baby", price: 60, startsOwned: false },
  { id: "SKIN-GATES", name: "Gates", menu: "Skins", group: "gates", price: 60, startsOwned: false },
  { id: "SKIN-TOM", name: "Tom", menu: "Skins", group: "tom", price: 60, startsOwned: false },
  { id: "SKIN-NAP", name: "Napoleon", menu: "Skins", group: "nap", price: 60, startsOwned: false }
];

export const MODES: readonly CatalogEntry[] = [
  { id: "MODE-FPS", name: "FPS Counter", menu: "Modes", group: "fps", price: 0, startsOwned: true },
  { id: "MODE-OPENCEIL", name: "Open Ceiling", menu: "Modes", group: "openCeil", price: 0, startsOwned: true },
  { id: "MODE-LOWGRAV", name: "Low Gravity", menu: "Modes", group: "lowGrav", price: 20, startsOwned: false },
  { id: "MODE-NES", name: "NES Style Movement", menu: "Modes", group: "lag", price: 20, startsOwned: false },
  { id: "MODE-GORE", name: "Blood and Gore", menu: "Modes", group: "gore", price: 40, startsOwned: false },
  { id: "MODE-ALTPHYS", name: "Alternate Body Physics", menu: "Modes", group: "realPhysics", price: 40, startsOwned: false },
  { id: "MODE-QUAKE", name: "Earthquake", menu: "Modes", group: "earthquake", price: 40, startsOwned: false },
  { id: "MODE-DYNCAM", name: "Dynamic Camera", menu: "Modes", group: "dynCam", price: 40, startsOwned: false },
  { id: "MODE-PYRO", name: "Realistic Pyrotechnics", menu: "Modes", group: "pyroMode", price: 40, startsOwned: false },
  { id: "MODE-SCRIPT", name: "Scripting Engine Access...", menu: "Modes", group: "script", price: 400, startsOwned: false }
];

export const DEFAULT_ITEM_NAME = "Open Hand";
