// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/Bushido.cs (MIT).

export interface BushidoInfo {
  id: number;
  name: string;
}

export const FirstId = 124;
export const LastId = 131;
export const ContentIdOffset = 330;
export const OwnerCharacterName = "Cyan";

export const All: BushidoInfo[] = [
  { id: 124, name: "Fang" },
  { id: 125, name: "Sky" },
  { id: 126, name: "Tiger" },
  { id: 127, name: "Flurry" },
  { id: 128, name: "Dragon" },
  { id: 129, name: "Eclipse" },
  { id: 130, name: "Tempest" },
  { id: 131, name: "Oblivion" },
];

export function byId(id: number): BushidoInfo | undefined {
  return All.find((b) => b.id === id);
}

export function nameFor(id: number): string {
  return byId(id)?.name ?? `#${id}`;
}
