// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/Lores.cs (MIT).
// Skill-list abilities (Rages/Bushidos/Blitzes/Lores/Dances) live in
// abilityList only, with contentId = abilityId + ContentIdOffset — unlike
// spells, which are also duplicated into abilityDictionary.

export interface LoreInfo {
  id: number;
  name: string;
}

export const FirstId = 140;
export const LastId = 163;
export const ContentIdOffset = 330;
export const OwnerCharacterName = "Strago";

export const All: LoreInfo[] = [
  { id: 140, name: "Doom" },
  { id: 141, name: "Roulette" },
  { id: 142, name: "Tsunami" },
  { id: 143, name: "Aqua Breath" },
  { id: 144, name: "Aero" },
  { id: 145, name: "1000 Needles" },
  { id: 146, name: "Mighty Guard" },
  { id: 147, name: "Revenge Blast" },
  { id: 148, name: "White Wind" },
  { id: 149, name: "Lv. 5 Death" },
  { id: 150, name: "Lv. 4 Flare" },
  { id: 151, name: "Lv. 3 Confuse" },
  { id: 152, name: "Reflect ???" },
  { id: 153, name: "Lv. ? Holy" },
  { id: 154, name: "Traveler" },
  { id: 155, name: "Force Field" },
  { id: 156, name: "Dischord" },
  { id: 157, name: "Bad Breath" },
  { id: 158, name: "Transfusion" },
  { id: 159, name: "Rippler" },
  { id: 160, name: "Stone" },
  { id: 161, name: "Quasar" },
  { id: 162, name: "Grand Delta" },
  { id: 163, name: "Self-Destruct" },
];

export function byId(id: number): LoreInfo | undefined {
  return All.find((l) => l.id === id);
}

export function nameFor(id: number): string {
  return byId(id)?.name ?? `#${id}`;
}
