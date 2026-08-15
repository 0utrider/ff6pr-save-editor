import type { JsonObject } from "../save/nestedJson.ts";
import { rewrap } from "../save/nestedJson.ts";
import type { Inventory } from "./inventory.ts";

export const WeaponKey = 1;
export const ShieldKey = 2;
export const ArmorKey = 3;
export const HelmetKey = 4;
export const Relic1Key = 5;
export const Relic2Key = 6;

// Empty placeholders the game expects per slot type. Armor/Helmet ids here
// are NOT swapped relative to a commonly-cited Go reference's constants —
// this ordering is verified against that reference's own save-writer code,
// which is authoritative over its separate constants file.
export const EmptyWeaponShieldId = 93;
export const EmptyHelmetId = 198;
export const EmptyArmorId = 199;
export const EmptyRelicId = 200;

export function isEmptyPlaceholder(itemId: number): boolean {
  return (
    itemId === 0 ||
    itemId === EmptyWeaponShieldId ||
    itemId === 197 ||
    itemId === EmptyHelmetId ||
    itemId === EmptyArmorId ||
    itemId === EmptyRelicId
  );
}

export class Equipment {
  private readonly slotItemIds = new Map<number, number>();
  private readonly characterNode: JsonObject;
  private readonly inventory: Inventory;

  constructor(equipNode: JsonObject, characterNode: JsonObject, inventory: Inventory) {
    this.characterNode = characterNode;
    this.inventory = inventory;

    const keys = equipNode.keys as number[];
    const values = equipNode.values as string[];
    for (let i = 0; i < keys.length; i++) {
      const obj = JSON.parse(values[i]) as { contentId: number; count: number };
      this.slotItemIds.set(keys[i], obj.contentId);
    }
  }

  getSlot(slotKey: number): number {
    return this.slotItemIds.get(slotKey) ?? 0;
  }

  setSlot(slotKey: number, itemId: number): void {
    this.slotItemIds.set(slotKey, itemId);
  }

  get equippedItemIds(): number[] {
    return [...this.slotItemIds.values()];
  }

  get weapon(): number {
    return this.getSlot(WeaponKey);
  }
  set weapon(v: number) {
    this.setSlot(WeaponKey, v);
  }

  get shield(): number {
    return this.getSlot(ShieldKey);
  }
  set shield(v: number) {
    this.setSlot(ShieldKey, v);
  }

  get armor(): number {
    return this.getSlot(ArmorKey);
  }
  set armor(v: number) {
    this.setSlot(ArmorKey, v);
  }

  get helmet(): number {
    return this.getSlot(HelmetKey);
  }
  set helmet(v: number) {
    this.setSlot(HelmetKey, v);
  }

  get relic1(): number {
    return this.getSlot(Relic1Key);
  }
  set relic1(v: number) {
    this.setSlot(Relic1Key, v);
  }

  get relic2(): number {
    return this.getSlot(Relic2Key);
  }
  set relic2(v: number) {
    this.setSlot(Relic2Key, v);
  }

  // Rebuilds equipmentList at commit time, with each slot's `count`
  // mirroring the current inventory count of that item. The game validates
  // this: a mismatch (e.g. count=1 in the slot but count=3 in inventory)
  // causes the save to be rejected as corrupted. Default to 1 if the item
  // isn't in inventory at all — legitimate for a worn-but-not-stocked item,
  // don't "fix" it by injecting a phantom inventory entry.
  commit(): void {
    const keys: number[] = [];
    const values: string[] = [];
    for (const slotKey of [...this.slotItemIds.keys()].sort((a, b) => a - b)) {
      const itemId = this.slotItemIds.get(slotKey)!;
      let count = this.inventory.stacks
        .filter((s) => s.itemId === itemId)
        .reduce((sum, s) => sum + s.count, 0);
      if (count === 0) count = 1;
      keys.push(slotKey);
      values.push(JSON.stringify({ contentId: itemId, count }));
    }
    this.characterNode.equipmentList = { keys, values };
    rewrap(this.characterNode, "equipmentList");
  }
}
