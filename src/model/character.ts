import type { JsonObject } from "../save/nestedJson.ts";
import { unwrap } from "../save/nestedJson.ts";
import { CharacterStats } from "./characterStats.ts";
import { CharacterAbilities } from "./characterAbilities.ts";
import { CharacterCommands } from "./characterCommands.ts";
import { Equipment } from "./equipment.ts";
import type { Inventory } from "./inventory.ts";
import * as levelGrowth from "../data/levelGrowth.ts";

export class Character {
  readonly node: JsonObject;
  readonly stats: CharacterStats;
  readonly abilities: CharacterAbilities;
  readonly equipment: Equipment;
  readonly commands: CharacterCommands;

  private readonly parentArray: string[];
  private readonly indexInParent: number;

  constructor(node: JsonObject, parentArray: string[], indexInParent: number, inventory: Inventory) {
    this.node = node;
    this.parentArray = parentArray;
    this.indexInParent = indexInParent;

    this.stats = new CharacterStats(unwrap(node, "parameter") as JsonObject, node);
    this.abilities = new CharacterAbilities(
      unwrap(node, "abilityList") as JsonObject,
      unwrap(node, "abilityDictionary") as JsonObject,
      node,
    );
    this.equipment = new Equipment(unwrap(node, "equipmentList") as JsonObject, node, inventory);
    this.commands = new CharacterCommands(node);
  }

  // The save-slot roster id — shifts based on Three Scenarios recruitment
  // order. Do NOT use this to identify which character owns a skill list;
  // use jobId (see data/characterRoster.ts).
  get id(): number {
    return (this.node.id as number) ?? -1;
  }

  // Localized display name, player-renameable in-game — never use for
  // identity. See data/characterRoster.ts.
  get name(): string {
    return (this.node.name as string) ?? "";
  }

  get jobId(): number {
    return (this.node.jobId as number) ?? 0;
  }
  set jobId(v: number) {
    this.node.jobId = v;
  }

  get currentExp(): number {
    return (this.node.currentExp as number) ?? 0;
  }
  set currentExp(v: number) {
    this.node.currentExp = v;
  }

  get equippedEsperId(): number {
    return (this.node.magicStoneId as number) ?? 0;
  }
  set equippedEsperId(v: number) {
    this.node.magicStoneId = v;
  }

  // Level and experience must stay consistent: the game recalculates level
  // from currentExp after every battle, so a level written on its own is
  // silently discarded (and the player sees a spurious "Level Up" as it
  // resets). Always set both together.
  setLevel(level: number): void {
    const clamped = Math.min(levelGrowth.MaxLevel, Math.max(levelGrowth.MinLevel, level));
    this.stats.additionalLevel = clamped;
    this.currentExp = levelGrowth.expForLevel(clamped);
  }

  commit(): void {
    this.stats.commit();
    this.abilities.commit();
    this.equipment.commit();
    this.commands.commit();
    this.parentArray[this.indexInParent] = JSON.stringify(this.node);
  }
}
