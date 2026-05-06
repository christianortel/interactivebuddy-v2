import { Game } from "./game/Game";

const game = new Game({
  cleanRoom: true,
  runtimeModule: "../../main.js"
});

game.start().catch((error: unknown) => {
  console.error("Unable to start Buddy Lab runtime", error);
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = "Runtime failed to start. Check the console for details.";
  }
});
