import { shopCatalog, type ShopItem } from "../data/shop";

export class ShopSystem {
  readonly catalog: ShopItem[];
  readonly unlocked = new Set<string>();

  constructor(catalog: ShopItem[] = shopCatalog) {
    this.catalog = catalog;
    catalog.filter((item) => item.price === 0).forEach((item) => this.unlocked.add(item.id));
  }

  canBuy(id: string, cash: number): boolean {
    const item = this.catalog.find((entry) => entry.id === id);
    return Boolean(item && cash >= item.price && !this.unlocked.has(id));
  }

  buy(id: string, cash: number): number {
    const item = this.catalog.find((entry) => entry.id === id);
    if (!item || !this.canBuy(id, cash)) {
      return cash;
    }
    this.unlocked.add(id);
    return cash - item.price;
  }
}
