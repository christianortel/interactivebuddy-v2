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
      button.textContent = active ? "Equipped" : owned ? (item.kind === "skin" ? "Equip" : "Owned") : "Buy";
      button.disabled = active || (owned && item.kind === "tool");
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
    if (state.unlockedTools.has(toolId)) {
      selectTool(toolId);
      return;
    }
    if (state.cash < tool.cost) {
      toast(`Need $${tool.cost - state.cash} more for ${tool.name}.`);
      return;
    }
    state.cash -= tool.cost;
    state.unlockedTools.add(toolId);
    toast(`${tool.name} unlocked.`);
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
    if (!state.unlockedSkins.has(skinId)) {
      if (state.cash < skin.cost) {
        toast(`Need $${skin.cost - state.cash} more for ${skin.name}.`);
        return;
      }
      state.cash -= skin.cost;
      state.unlockedSkins.add(skinId);
      toast(`${skin.name} unlocked.`);
      feedback.play("unlock", 1);
      pulse([35, 35, 45]);
    }
    state.selectedSkin = skinId;
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
