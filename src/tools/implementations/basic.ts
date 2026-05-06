import type { ToolImplementation } from "../Tool";

export const basicImplementations: Pick<ToolImplementation, "definition">[] = [
  {
    definition: {
      id: "hand",
      name: "Hand",
      category: "basic",
      icon: "H",
      price: 0,
      hasPower: true,
      description: "Grab, drag, throw, poke, slap, and fling body parts."
    }
  }
];
