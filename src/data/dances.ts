// Not in any upstream data table — HANDOFF.md flagged this as unresolved.
// Confirmed two ways: (1) a real save's Mog character has a clean 164-171
// contiguous block in abilityList with contentId = abilityId + 330, matching
// the general skill offset; (2) KiameV/final-fantasy-vi-save-editor's
// models/consts/pr/dances.go independently has the same ids/offset, with
// these Pixel-Remaster-localized names (differ from the SNES-era English
// names — e.g. "Wind Song" -> "Wind Rhapsody").

export interface DanceInfo {
  id: number;
  name: string;
}

export const FirstId = 164;
export const LastId = 171;
export const ContentIdOffset = 330;
export const OwnerCharacterName = "Mog";

export const All: DanceInfo[] = [
  { id: 164, name: "Wind Rhapsody" },
  { id: 165, name: "Forest Nocturne" },
  { id: 166, name: "Desert Lullaby" },
  { id: 167, name: "Love Serenade" },
  { id: 168, name: "Earth Blues" },
  { id: 169, name: "Water Harmony" },
  { id: 170, name: "Twilight Requiem" },
  { id: 171, name: "Snowman Rondo" },
];

export function byId(id: number): DanceInfo | undefined {
  return All.find((d) => d.id === id);
}

export function nameFor(id: number): string {
  return byId(id)?.name ?? `#${id}`;
}
