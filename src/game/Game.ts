import { toolDefinitions } from "../data/tools";
import { skinDefinitions } from "../data/skins";
import { SaveManager } from "../save/SaveManager";

export interface GameOptions {
  cleanRoom: boolean;
  runtimeModule: string;
}

export class Game {
  readonly options: GameOptions;
  readonly saveManager = new SaveManager();

  constructor(options: GameOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    this.attachProjectMetadata();
    // The current gameplay engine is a clean-room JavaScript runtime that is being migrated into src/.
    // @ts-ignore: the legacy runtime is intentionally kept as plain JS during the incremental TS migration.
    await import("../../main.js");
  }

  private attachProjectMetadata(): void {
    window.__buddyLabProject = {
      cleanRoom: this.options.cleanRoom,
      toolCount: toolDefinitions.length,
      skinCount: skinDefinitions.length,
      saveKey: this.saveManager.key,
      source: "TypeScript/Vite shell with clean-room local runtime"
    };
  }
}
