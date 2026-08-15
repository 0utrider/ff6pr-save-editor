// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/Espers.cs (MIT).

export interface EsperInfo {
  id: number;
  name: string;
}

export const FirstId = 62;
export const LastId = 88;

export const All: EsperInfo[] = [
  { id: 62, name: "Ramuh" },
  { id: 63, name: "Kirin" },
  { id: 64, name: "Siren" },
  { id: 65, name: "Cait Sith" },
  { id: 66, name: "Ifrit" },
  { id: 67, name: "Shiva" },
  { id: 68, name: "Unicorn" },
  { id: 69, name: "Maduin" },
  { id: 70, name: "Catoblepas" },
  { id: 71, name: "Phantom" },
  { id: 72, name: "Carbuncle" },
  { id: 73, name: "Bismark" },
  { id: 74, name: "Golem" },
  { id: 75, name: "Zona Seeker" },
  { id: 76, name: "Seraph" },
  { id: 77, name: "Quetzalli" },
  { id: 78, name: "Fenrir" },
  { id: 79, name: "Valigarmanda" },
  { id: 80, name: "Midgardsormr" },
  { id: 81, name: "Lakshmi" },
  { id: 82, name: "Alexander" },
  { id: 83, name: "Phoenix" },
  { id: 84, name: "Odin" },
  { id: 85, name: "Bahamut" },
  { id: 86, name: "Ragnarok" },
  { id: 87, name: "Crusader" },
  { id: 88, name: "Raiden" },
];

export function byId(id: number): EsperInfo | undefined {
  return All.find((e) => e.id === id);
}

export function nameFor(id: number): string {
  return id === 0 ? "(none)" : (byId(id)?.name ?? `#${id}`);
}
