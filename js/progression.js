import { getShopCategoryOptions, getShopItemButtonState, getShopItemCategory, getShopItemPresentation, getSkinShopPreviewPresentation, shouldShowShopItem, resolveSkinPurchase, resolveToolPurchase } from "../src/runtime/progressionState.ts";

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
  let activeCategory = "all";

  function renderShop() {
    shopGrid.innerHTML = "";
    const skinDefs = getSkinDefs();
    const unlocks = [
      ...toolDefs.filter((tool) => tool.cost > 0).map((tool) => ({ ...tool, kind: "tool" })),
      ...skinDefs.filter((skin) => skin.cost > 0).map((skin) => ({ ...skin, kind: "skin" }))
    ].map((item) => ({
      ...item,
      shopCategory: getShopItemCategory(item)
    }));

    const categoryTabs = document.createElement("div");
    categoryTabs.className = "shop-tabs";
    getShopCategoryOptions(unlocks, activeCategory).forEach((category) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = `shop-tab${category.active ? " shop-tab--active" : ""}`;
      tab.dataset.category = category.id;
      tab.setAttribute("aria-pressed", String(category.active));
      tab.textContent = `${category.label} ${category.count}`;
      tab.addEventListener("click", () => {
        activeCategory = category.id;
        renderShop();
      });
      categoryTabs.appendChild(tab);
    });
    shopGrid.appendChild(categoryTabs);

    unlocks.filter((item) => shouldShowShopItem(item, activeCategory)).forEach((item) => {
      const owned = item.kind === "tool" ? state.unlockedTools.has(item.id) : state.unlockedSkins.has(item.id);
      const active = item.kind === "skin" && state.selectedSkin === item.id;
      const itemView = getShopItemPresentation(item, owned, active);
      const element = document.createElement("article");
      element.className = itemView.className;
      element.dataset.category = itemView.category;
      element.dataset.owned = itemView.owned;
      element.dataset.active = itemView.active;
      if (itemView.ariaCurrent) {
        element.setAttribute("aria-current", itemView.ariaCurrent);
      }
      appendSkinPreview(element, item);
      const title = document.createElement("strong");
      title.textContent = item.name;
      const description = document.createElement("span");
      description.textContent = item.description;
      const price = document.createElement("span");
      price.textContent = owned ? "Owned" : `$${item.cost}`;
      element.appendChild(title);
      element.appendChild(description);
      element.appendChild(price);
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

  function appendSkinPreview(element, item) {
    const previewView = getSkinShopPreviewPresentation(item);
    if (!previewView.visible) {
      return;
    }
    const preview = document.createElement("div");
    preview.className = previewView.className;
    preview.setAttribute("aria-label", previewView.ariaLabel);
    const swatch = document.createElement("span");
    swatch.className = previewView.swatchClassName;
    swatch.style.backgroundColor = previewView.color;
    swatch.style.borderColor = previewView.accent;
    if (previewView.texture) {
      swatch.style.backgroundImage = `url(${JSON.stringify(previewView.texture)})`;
    }
    const head = document.createElement("i");
    head.className = previewView.headClassName;
    head.style.backgroundColor = previewView.accent;
    const body = document.createElement("i");
    body.className = previewView.bodyClassName;
    body.style.backgroundColor = previewView.color;
    body.style.borderColor = previewView.accent;
    const face = document.createElement("b");
    face.className = previewView.faceClassName;
    face.textContent = ":)";
    preview.appendChild(swatch);
    preview.appendChild(body);
    preview.appendChild(head);
    preview.appendChild(face);
    element.appendChild(preview);
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
    getActiveCategory: () => activeCategory,
    setActiveCategory: (category) => {
      activeCategory = category;
      renderShop();
    },
    renderShop
  };
}
