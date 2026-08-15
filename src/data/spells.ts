// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/Spells.cs (MIT).
// Spells live in abilityDictionary category 7 (see characterAbilities.MagicCategoryKey),
// unlike Rages/Bushidos/Blitzes/Lores which are abilityList-only.

export interface SpellInfo {
  id: number;
  name: string;
}

export const FirstId = 31;
export const LastId = 84;

export const All: SpellInfo[] = [
  { id: 31, name: "Cure" },
  { id: 32, name: "Cura" },
  { id: 33, name: "Curaga" },
  { id: 34, name: "Raise" },
  { id: 35, name: "Arise" },
  { id: 36, name: "Poisona" },
  { id: 37, name: "Esuna" },
  { id: 38, name: "Regen" },
  { id: 39, name: "Reraise" },
  { id: 40, name: "Fire" },
  { id: 41, name: "Blizzard" },
  { id: 42, name: "Thunder" },
  { id: 43, name: "Poison" },
  { id: 44, name: "Drain" },
  { id: 45, name: "Fira" },
  { id: 46, name: "Blizzara" },
  { id: 47, name: "Thundara" },
  { id: 48, name: "Bio" },
  { id: 49, name: "Firaga" },
  { id: 50, name: "Blizzaga" },
  { id: 51, name: "Thundaga" },
  { id: 52, name: "Break" },
  { id: 53, name: "Death" },
  { id: 54, name: "Holy" },
  { id: 55, name: "Flare" },
  { id: 56, name: "Gravity" },
  { id: 57, name: "Graviga" },
  { id: 58, name: "Banish" },
  { id: 59, name: "Meteor" },
  { id: 60, name: "Ultima" },
  { id: 61, name: "Quake" },
  { id: 62, name: "Tornado" },
  { id: 63, name: "Meltdown" },
  { id: 64, name: "Libra" },
  { id: 65, name: "Slow" },
  { id: 66, name: "Rasp" },
  { id: 67, name: "Silence" },
  { id: 68, name: "Protect" },
  { id: 69, name: "Sleep" },
  { id: 70, name: "Confuse" },
  { id: 71, name: "Haste" },
  { id: 72, name: "Stop" },
  { id: 73, name: "Berserk" },
  { id: 74, name: "Float" },
  { id: 75, name: "Imp" },
  { id: 76, name: "Reflect" },
  { id: 77, name: "Shell" },
  { id: 78, name: "Vanish" },
  { id: 79, name: "Hastega" },
  { id: 80, name: "Slowga" },
  { id: 81, name: "Osmose" },
  { id: 82, name: "Teleport" },
  { id: 83, name: "Quick" },
  { id: 84, name: "Dispel" },
];

export function byId(id: number): SpellInfo | undefined {
  return All.find((s) => s.id === id);
}

export function nameFor(id: number): string {
  return byId(id)?.name ?? `#${id}`;
}
