import { skinDefinitions, type SkinDefinition } from "../data/skins";

export class SkinSystem {
  readonly skins: SkinDefinition[];
  readonly unlocked = new Set<string>(["classic"]);
  equipped = "classic";

  constructor(skins: SkinDefinition[] = skinDefinitions) {
    this.skins = skins;
  }

  equip(id: string): boolean {
    if (!this.unlocked.has(id)) {
      return false;
    }
    this.equipped = id;
    return true;
  }
}
