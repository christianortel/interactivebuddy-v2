export interface PurchasableItem {
  id: string;
  name: string;
  cost: number;
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
