export interface PurchasableItem {
  id: string;
  name: string;
  cost: number;
  category?: string;
  color?: string;
  accent?: string;
  texture?: string;
}

export interface ShopCategoryOption {
  id: string;
  label: string;
  active: boolean;
  count: number;
}

export interface CategorizedShopItem extends PurchasableItem {
  kind: "tool" | "skin";
  category?: string;
  shopCategory: string;
}

export interface ToolPurchaseDecision {
  status: "owned" | "insufficient" | "purchased";
  cash: number;
  missing: number;
  message: string;
}

export interface SkinPurchaseDecision extends ToolPurchaseDecision {
  selectedSkin: string;
}

export interface SkinShopPreviewPresentation {
  visible: boolean;
  className: string;
  swatchClassName: string;
  headClassName: string;
  bodyClassName: string;
  faceClassName: string;
  ariaLabel: string;
  color: string;
  accent: string;
  texture: string;
}

export interface ShopItemPresentation {
  className: string;
  category: string;
  owned: string;
  active: string;
  ariaCurrent: string;
}

export function resolveToolPurchase(tool: PurchasableItem, cash: number, owned: boolean): ToolPurchaseDecision {
  if (owned) {
    return {
      status: "owned",
      cash,
      missing: 0,
      message: `${tool.name} already unlocked.`
    };
  }
  if (cash < tool.cost) {
    return {
      status: "insufficient",
      cash,
      missing: tool.cost - cash,
      message: `Need $${tool.cost - cash} more for ${tool.name}.`
    };
  }
  return {
    status: "purchased",
    cash: cash - tool.cost,
    missing: 0,
    message: `${tool.name} unlocked.`
  };
}

export function resolveSkinPurchase(skin: PurchasableItem, cash: number, owned: boolean): SkinPurchaseDecision {
  if (owned) {
    return {
      status: "owned",
      cash,
      missing: 0,
      selectedSkin: skin.id,
      message: `${skin.name} equipped.`
    };
  }
  if (cash < skin.cost) {
    return {
      status: "insufficient",
      cash,
      missing: skin.cost - cash,
      selectedSkin: "",
      message: `Need $${skin.cost - cash} more for ${skin.name}.`
    };
  }
  return {
    status: "purchased",
    cash: cash - skin.cost,
    missing: 0,
    selectedSkin: skin.id,
    message: `${skin.name} unlocked.`
  };
}

export function getShopItemButtonState(kind: "tool" | "skin", owned: boolean, active: boolean): {
  text: string;
  disabled: boolean;
} {
  if (active) {
    return { text: "Equipped", disabled: true };
  }
  if (owned) {
    return kind === "tool"
      ? { text: "Owned", disabled: true }
      : { text: "Equip", disabled: false };
  }
  return { text: "Buy", disabled: false };
}

export function getShopItemPresentation(item: { shopCategory?: string }, owned: boolean, active: boolean): ShopItemPresentation {
  const classNames = ["shop-item"];
  if (owned) {
    classNames.push("shop-item--owned");
  }
  if (active) {
    classNames.push("shop-item--active");
  }
  return {
    className: classNames.join(" "),
    category: item.shopCategory || "tools",
    owned: String(owned),
    active: String(active),
    ariaCurrent: active ? "true" : ""
  };
}

export function getShopItemCategory(item: { kind: "tool" | "skin"; category?: string }): string {
  if (item.kind === "skin") {
    return "skins";
  }
  return normalizeShopCategory(item.category || "tools");
}

export function normalizeShopCategory(category: string): string {
  return String(category || "tools").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "tools";
}

export function getShopCategoryLabel(categoryId: string): string {
  if (categoryId === "all") {
    return "All";
  }
  if (categoryId === "skins") {
    return "Skins";
  }
  return categoryId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getShopCategoryOptions(items: CategorizedShopItem[], activeCategory = "all"): ShopCategoryOption[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    counts.set(item.shopCategory, (counts.get(item.shopCategory) || 0) + 1);
  });
  const categories = ["all", ...Array.from(counts.keys())];
  const active = categories.includes(activeCategory) ? activeCategory : "all";
  return categories.map((id) => ({
    id,
    label: getShopCategoryLabel(id),
    active: id === active,
    count: id === "all" ? items.length : counts.get(id) || 0
  }));
}

export function shouldShowShopItem(item: CategorizedShopItem, activeCategory = "all"): boolean {
  return activeCategory === "all" || item.shopCategory === activeCategory;
}

export function getSkinShopPreviewPresentation(item: { kind?: string; name?: string; color?: string; accent?: string; texture?: string }): SkinShopPreviewPresentation {
  if (item.kind !== "skin") {
    return {
      visible: false,
      className: "",
      swatchClassName: "",
      headClassName: "",
      bodyClassName: "",
      faceClassName: "",
      ariaLabel: "",
      color: "",
      accent: "",
      texture: ""
    };
  }
  const color = typeof item.color === "string" && item.color.trim() ? item.color.trim() : "#d6ded9";
  const accent = typeof item.accent === "string" && item.accent.trim() ? item.accent.trim() : "#f5faf7";
  const texture = typeof item.texture === "string" && item.texture.trim() ? item.texture.trim() : "";
  return {
    visible: true,
    className: "shop-skin-preview",
    swatchClassName: `shop-skin-preview__swatch${texture ? " shop-skin-preview__swatch--textured" : ""}`,
    headClassName: "shop-skin-preview__head",
    bodyClassName: "shop-skin-preview__body",
    faceClassName: "shop-skin-preview__face",
    ariaLabel: `${item.name || "Skin"} preview`,
    color,
    accent,
    texture
  };
}
