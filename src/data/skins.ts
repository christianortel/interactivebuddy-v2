export interface SkinDefinition {
  id: string;
  name: string;
  price: number;
  color: string;
  accent: string;
  description: string;
}

export const skinDefinitions: SkinDefinition[] = [
  { id: "classic", name: "Classic Lab Buddy", price: 0, color: "#d6ded9", accent: "#f5faf7", description: "Simple segmented gray character." },
  { id: "neon", name: "Neon Mascot", price: 180, color: "#99f17f", accent: "#55d9cf", description: "Bright arcade palette." },
  { id: "robot", name: "Robot Suit", price: 520, color: "#aeb7bd", accent: "#5ee0ff", description: "Heavier panel look." },
  { id: "gelatin", name: "Gelatin Suit", price: 780, color: "#9be7ff", accent: "#f1ff8b", description: "Bouncy translucent palette." },
  { id: "astronaut", name: "Space Suit", price: 1220, color: "#f3f4ef", accent: "#ff8d66", description: "Floaty white suit." }
];
