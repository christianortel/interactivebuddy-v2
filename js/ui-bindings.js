export function getHudBindings(documentRef = document) {
  return {
    cash: documentRef.getElementById("cash"),
    xp: documentRef.getElementById("xp"),
    combo: documentRef.getElementById("combo"),
    mood: documentRef.getElementById("mood"),
    challenge: documentRef.getElementById("challenge"),
    power: documentRef.getElementById("power"),
    powerReadout: documentRef.getElementById("powerReadout"),
    comboFill: documentRef.getElementById("comboFill"),
    face: documentRef.getElementById("buddyFace"),
    fpsCounter: documentRef.getElementById("fpsCounter"),
    toast: documentRef.getElementById("toast"),
    replayStrip: documentRef.getElementById("replayStrip"),
    radialWheel: documentRef.getElementById("radialWheel"),
    toolRail: documentRef.getElementById("toolRail"),
    toolName: documentRef.getElementById("toolName"),
    toolDescription: documentRef.getElementById("toolDescription"),
    toolMeta: documentRef.getElementById("toolMeta"),
    shopGrid: documentRef.getElementById("shopGrid"),
    missionList: documentRef.getElementById("missionList"),
    itemMenu: documentRef.getElementById("itemMenu"),
    skinMenu: documentRef.getElementById("skinMenu")
  };
}

export function getControlBindings(documentRef = document) {
  return {
    reset: documentRef.getElementById("reset"),
    replay: documentRef.getElementById("replay"),
    resetMenu: documentRef.getElementById("resetMenuButton"),
    saveScene: documentRef.getElementById("saveSceneButton"),
    loadScene: documentRef.getElementById("loadSceneButton"),
    exportSave: documentRef.getElementById("exportSaveButton"),
    importSave: documentRef.getElementById("importSaveButton"),
    importSkinPack: documentRef.getElementById("importSkinPackButton"),
    saveImportInput: documentRef.getElementById("saveImportInput"),
    skinPackImportInput: documentRef.getElementById("skinPackImportInput"),
    exportReplay: documentRef.getElementById("exportReplay"),
    newBuddy: documentRef.getElementById("newBuddyButton"),
    ceiling: documentRef.getElementById("ceilingButton"),
    slowMo: documentRef.getElementById("slowMoButton"),
    gravityModes: documentRef.querySelectorAll ? [...documentRef.querySelectorAll(".gravity-mode-button")] : [],
    fpsCounter: documentRef.getElementById("fpsCounterButton"),
    missionMenu: documentRef.getElementById("missionButton"),
    challengeMode: documentRef.getElementById("challengeMode"),
    refreshMissions: documentRef.getElementById("refreshMissions"),
    shopButton: documentRef.getElementById("shopButton"),
    reducedFlash: documentRef.getElementById("reducedFlash"),
    goreToggle: documentRef.getElementById("goreToggle"),
    audioToggle: documentRef.getElementById("audioToggle"),
    hapticsToggle: documentRef.getElementById("hapticsToggle"),
    assetPack: documentRef.getElementById("assetPack"),
    roomPreview: documentRef.getElementById("roomPreview"),
    audioPack: documentRef.getElementById("audioPack"),
    liquidType: documentRef.getElementById("liquidType")
  };
}
