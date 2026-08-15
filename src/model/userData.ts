import type { JsonObject } from "../save/nestedJson.ts";
import { unwrap, rewrap } from "../save/nestedJson.ts";
import { Inventory } from "./inventory.ts";
import { Character } from "./character.ts";

export class UserData {
  readonly node: JsonObject;
  readonly characters: Character[];
  readonly normalInventory: Inventory;
  readonly importantInventory: Inventory;
  readonly warehouseInventory: Inventory;
  readonly ownedEsperIds: Set<number>;

  private readonly ownedCharsRoot: JsonObject;
  private readonly espersRoot: JsonObject;

  constructor(node: JsonObject) {
    this.node = node;

    // Inventory must be constructed BEFORE characters — Equipment needs a
    // reference to it to compute slot counts at commit time.
    this.normalInventory = new Inventory(node, "normalOwnedItemList");
    this.importantInventory = new Inventory(node, "importantOwendItemList");
    this.warehouseInventory = new Inventory(node, "warehouseItemList");

    this.ownedCharsRoot = unwrap(node, "ownedCharacterList") as JsonObject;
    const target = this.ownedCharsRoot.target as string[];
    this.characters = target.map((s, i) => new Character(JSON.parse(s) as JsonObject, target, i, this.normalInventory));

    this.espersRoot = unwrap(node, "ownedMagicStoneList") as JsonObject;
    this.ownedEsperIds = new Set((this.espersRoot.target as number[]) ?? []);
  }

  get gil(): number {
    return (this.node.owendGil as number) ?? 0;
  }
  set gil(v: number) {
    this.node.owendGil = v;
  }

  get totalGil(): number {
    return (this.node.totalGil as number) ?? 0;
  }
  set totalGil(v: number) {
    this.node.totalGil = v;
  }

  get steps(): number {
    return (this.node.steps as number) ?? 0;
  }
  set steps(v: number) {
    this.node.steps = v;
  }

  get battleCount(): number {
    return (this.node.battleCount as number) ?? 0;
  }
  set battleCount(v: number) {
    this.node.battleCount = v;
  }

  get monstersKilledCount(): number {
    return (this.node.monstersKilledCount as number) ?? 0;
  }
  set monstersKilledCount(v: number) {
    this.node.monstersKilledCount = v;
  }

  commit(): void {
    // Dedupe BEFORE character commit so Equipment.commit's count-mirroring
    // sees the merged stacks. Equipped items absent from inventory entirely
    // are legitimate game state (slot count simply defaults to 1) — never
    // "repair" them by injecting an inventory entry.
    this.normalInventory.mergeDuplicates();

    for (const c of this.characters) c.commit();
    this.normalInventory.commit();
    this.importantInventory.commit();
    this.warehouseInventory.commit();
    rewrap(this.node, "ownedCharacterList");

    this.espersRoot.target = [...this.ownedEsperIds].sort((a, b) => a - b);
    rewrap(this.node, "ownedMagicStoneList");
  }
}
