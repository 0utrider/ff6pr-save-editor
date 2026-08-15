// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/Blitzes.cs (MIT).

export interface BlitzInfo {
  id: number;
  name: string;
}

export const FirstId = 132;
export const LastId = 139;
export const ContentIdOffset = 330;
export const OwnerCharacterName = "Sabin";

export const All: BlitzInfo[] = [
  { id: 132, name: "Raging Fist" },
  { id: 133, name: "Aura Cannon" },
  { id: 134, name: "Meteor Strike" },
  { id: 135, name: "Rising Phoenix" },
  { id: 136, name: "Chakra" },
  { id: 137, name: "Razor Gale" },
  { id: 138, name: "Soul Spiral" },
  { id: 139, name: "Phantom Rush" },
];

export function byId(id: number): BlitzInfo | undefined {
  return All.find((b) => b.id === id);
}

export function nameFor(id: number): string {
  return byId(id)?.name ?? `#${id}`;
}
