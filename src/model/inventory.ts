import type { JsonObject } from "../save/nestedJson.ts";
import { unwrap, rewrap } from "../save/nestedJson.ts";

export const MaxStackCount = 99;

// Known crash-triggering item ids — dropped on write regardless of source.
const CrashItemIds = new Set([184, 243]);

export interface ItemStack {
  itemId: number;
  count: number;
}

// Generic over (parentNode, key) — used for normalOwnedItemList,
// importantOwendItemList (sic), and warehouseItemList, all the same shape.
export class Inventory {
  stacks: ItemStack[];
  private readonly parentNode: JsonObject;
  private readonly parentKey: string;

  constructor(parentNode: JsonObject, parentKey: string) {
    this.parentNode = parentNode;
    this.parentKey = parentKey;
    const wrapperNode = unwrap(parentNode, parentKey) as JsonObject;
    // Each element of `target` is itself a JSON-encoded string (nested-json
    // pattern), not a plain object — needs its own parse.
    const target = (wrapperNode.target as string[]) ?? [];
    this.stacks = target.map((s) => {
      const o = JSON.parse(s) as { contentId: number; count: number };
      return { itemId: o.contentId, count: o.count };
    });
  }

  set(index: number, itemId: number, count: number): void {
    this.stacks[index] = { itemId, count };
  }

  add(itemId: number, count: number): void {
    const existing = this.stacks.findIndex((s) => s.itemId === itemId);
    if (existing >= 0) {
      this.stacks[existing] = {
        itemId,
        count: Math.min(MaxStackCount, this.stacks[existing].count + count),
      };
    } else {
      this.stacks.push({ itemId, count: Math.min(MaxStackCount, count) });
    }
  }

  removeAt(index: number): void {
    this.stacks.splice(index, 1);
  }

  clear(): void {
    this.stacks = [];
  }

  // Merges duplicate contentId stacks in place (first-seen order, counts
  // summed and capped). The game rejects saves with duplicate inventory
  // entries, and equipment count validation reads per-item totals — so
  // duplicates must never reach disk.
  mergeDuplicates(): void {
    const merged: ItemStack[] = [];
    const indexById = new Map<number, number>();
    for (const s of this.stacks) {
      const at = indexById.get(s.itemId);
      if (at !== undefined) {
        merged[at] = { itemId: s.itemId, count: Math.min(MaxStackCount, merged[at].count + s.count) };
      } else {
        indexById.set(s.itemId, merged.length);
        merged.push({ ...s });
      }
    }
    this.stacks = merged;
  }

  commit(): void {
    this.mergeDuplicates();
    const target = this.stacks
      .filter((s) => s.itemId !== 0 && s.count !== 0 && !CrashItemIds.has(s.itemId))
      .map((s) => JSON.stringify({ contentId: s.itemId, count: s.count }));
    this.parentNode[this.parentKey] = { target };
    rewrap(this.parentNode, this.parentKey);
  }
}
