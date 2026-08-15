import type { JsonObject } from "../save/nestedJson.ts";

// Wraps top.mapData.beastFieldEncountExchangeFlags — a flat array of ints
// (0 or 1), one per monster formation in the game (see
// data/veldtFormations.ts for names, index-matched). A "1" means that
// formation is unlocked on the Veldt. Lives in top-level mapData, not
// userData like most other game state, and (unlike most fields) is a plain
// array here, not itself JSON-string-wrapped.
export class VeldtEncounters {
  encounters: boolean[];
  private readonly mapData: JsonObject;

  constructor(mapData: JsonObject) {
    this.mapData = mapData;
    const arr = (mapData.beastFieldEncountExchangeFlags as number[]) ?? [];
    this.encounters = arr.map((v) => v === 1);
  }

  get totalCount(): number {
    return this.encounters.length;
  }

  get seenCount(): number {
    return this.encounters.filter(Boolean).length;
  }

  markAllSeen(): void {
    this.encounters = this.encounters.map(() => true);
  }

  clearAll(): void {
    this.encounters = this.encounters.map(() => false);
  }

  commit(): void {
    this.mapData.beastFieldEncountExchangeFlags = this.encounters.map((b) => (b ? 1 : 0));
  }
}
