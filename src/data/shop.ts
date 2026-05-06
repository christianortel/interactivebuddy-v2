import { skinDefinitions } from "./skins";
import { toolDefinitions } from "./tools";

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  kind: "tool" | "skin";
}

export const shopCatalog: ShopItem[] = [
  ...toolDefinitions.map((tool) => ({
    id: tool.id,
    name: tool.name,
    category: tool.category,
    price: tool.price,
    kind: "tool" as const
  })),
  ...skinDefinitions.map((skin) => ({
    id: skin.id,
    name: skin.name,
    category: "skins",
    price: skin.price,
    kind: "skin" as const
  }))
];
