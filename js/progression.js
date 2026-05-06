import { getShopItemButtonState, resolveSkinPurchase, resolveToolPurchase } from "../src/runtime/progressionState.ts";

export function createProgressionController({
  state,
  toolDefs,
  getSkinDefs,
  shopGrid,
  getTool,
  selectTool,
  buildToolUi,
  buildMenus,
  updateHud,
  saveGame,
  applySkin,
  toast,
  feedback,
  pulse
}) {
  function renderShop() {
    shopGrid.innerHTML = "";
    const skinDefs = getSkinDefs();
    const unlocks = [
      ...toolDefs.filter((tool) => tool.cost > 0).map((tool) => ({ ...tool, kind: "tool" })),
      ...skinDefs.filter((skin) => skin.cost > 0).map((skin) => ({ ...skin, kind: "skin" }))
    ];

    unlocks.forEach((item) => {
      const owned = item.kind === "tool" ? state.unlockedTools.has(item.id) : state.unlockedSkins.has(item.id);
      const active = item.kind === "skin" && state.selectedSkin === item.id;
      const element = document.createElement("article");
      element.className = "shop-item";
      element.innerHTML = `
        <strong>${item.name}</strong>
        <span>${item.description}</span>
        <span>${owned ? "Owned" : `$${item.cost}`}</span>
      `;
      const button = document.createElement("button");
      button.type = "button";
      const buttonState = getShopItemButtonState(item.kind, owned, active);
      button.textContent = buttonState.text;
      button.disabled = buttonState.disabled;
      button.addEventListener("click", () => {
        if (item.kind === "tool") {
          buyTool(item.id);
        } else {
          buyOrSelectSkin(item.id);
        }
      });
      element.appendChild(button);
      shopGrid.appendChild(element);
    });
  }

  function buyTool(toolId) {
    const tool = getTool(toolId);
    const decision = resolveToolPurchase(tool, state.cash, state.unlockedTools.has(toolId));
    if (decision.status === "owned") {
      selectTool(toolId);
      return;
    }
    if (decision.status === "insufficient") {
      toast(decision.message);
      return;
    }
    state.cash = decision.cash;
    state.unlockedTools.add(toolId);
    toast(decision.message);
    feedback.play("unlock", 1);
    pulse([35, 35, 45]);
    buildToolUi();
    buildMenus();
    renderShop();
    selectTool(toolId);
    updateHud();
    saveGame();
  }

  function buyOrSelectSkin(skinId) {
    const skin = getSkinDefs().find((candidate) => candidate.id === skinId);
    if (!skin) {
      return;
    }
    const decision = resolveSkinPurchase(skin, state.cash, state.unlockedSkins.has(skinId));
    if (decision.status === "insufficient") {
      toast(decision.message);
      return;
    }
    if (decision.status === "purchased") {
      state.cash = decision.cash;
      state.unlockedSkins.add(skinId);
      toast(decision.message);
      feedback.play("unlock", 1);
      pulse([35, 35, 45]);
    }
    state.selectedSkin = decision.selectedSkin;
    applySkin();
    buildMenus();
    renderShop();
    updateHud();
    saveGame();
  }

  return {
    buyTool,
    buyOrSelectSkin,
    renderShop
  };
}
