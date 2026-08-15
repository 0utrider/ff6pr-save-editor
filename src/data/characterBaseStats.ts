// Raw base stats per playable character (Pixel Remaster). Stats other than
// HP/MP do NOT grow with level — only equipment and magicite boost them.
// HP/MP grow per level (see levelGrowth.ts).
// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/CharacterBaseStats.cs
// (MIT); FF wiki "Final Fantasy VI stats".

import * as characterRoster from "./characterRoster.ts";

export interface RawStats {
  hp: number;
  mp: number;
  strength: number;
  speed: number;
  stamina: number;
  magic: number;
  attack: number;
  defense: number;
  evasion: number;
  magicDefense: number;
  magicEvasion: number;
  escapeSuccess: number;
}

export const ByName: Record<string, RawStats> = {
  Terra: { hp: 40, mp: 16, strength: 31, speed: 33, stamina: 28, magic: 39, attack: 12, defense: 42, evasion: 5, magicDefense: 33, magicEvasion: 7, escapeSuccess: 4 },
  Locke: { hp: 48, mp: 7, strength: 37, speed: 40, stamina: 31, magic: 28, attack: 14, defense: 46, evasion: 15, magicDefense: 23, magicEvasion: 2, escapeSuccess: 5 },
  Cyan: { hp: 53, mp: 5, strength: 40, speed: 28, stamina: 33, magic: 25, attack: 25, defense: 48, evasion: 6, magicDefense: 20, magicEvasion: 1, escapeSuccess: 3 },
  Shadow: { hp: 51, mp: 6, strength: 39, speed: 38, stamina: 30, magic: 33, attack: 23, defense: 47, evasion: 28, magicDefense: 25, magicEvasion: 9, escapeSuccess: 5 },
  Edgar: { hp: 49, mp: 6, strength: 39, speed: 30, stamina: 34, magic: 29, attack: 20, defense: 50, evasion: 4, magicDefense: 22, magicEvasion: 1, escapeSuccess: 4 },
  Sabin: { hp: 58, mp: 3, strength: 47, speed: 37, stamina: 39, magic: 28, attack: 26, defense: 53, evasion: 12, magicDefense: 21, magicEvasion: 4, escapeSuccess: 4 },
  Celes: { hp: 44, mp: 15, strength: 34, speed: 34, stamina: 31, magic: 36, attack: 16, defense: 44, evasion: 7, magicDefense: 31, magicEvasion: 9, escapeSuccess: 4 },
  Strago: { hp: 35, mp: 13, strength: 28, speed: 25, stamina: 19, magic: 34, attack: 10, defense: 33, evasion: 6, magicDefense: 27, magicEvasion: 7, escapeSuccess: 3 },
  Relm: { hp: 37, mp: 18, strength: 26, speed: 34, stamina: 22, magic: 44, attack: 11, defense: 35, evasion: 13, magicDefense: 30, magicEvasion: 9, escapeSuccess: 5 },
  Setzer: { hp: 46, mp: 9, strength: 36, speed: 32, stamina: 32, magic: 29, attack: 18, defense: 48, evasion: 9, magicDefense: 26, magicEvasion: 1, escapeSuccess: 4 },
  Mog: { hp: 39, mp: 16, strength: 29, speed: 36, stamina: 26, magic: 35, attack: 16, defense: 52, evasion: 10, magicDefense: 36, magicEvasion: 12, escapeSuccess: 5 },
  Gau: { hp: 45, mp: 10, strength: 44, speed: 38, stamina: 36, magic: 34, attack: 99, defense: 44, evasion: 21, magicDefense: 34, magicEvasion: 18, escapeSuccess: 5 },
  Gogo: { hp: 36, mp: 12, strength: 25, speed: 30, stamina: 20, magic: 26, attack: 13, defense: 39, evasion: 10, magicDefense: 25, magicEvasion: 6, escapeSuccess: 4 },
  Umaro: { hp: 60, mp: 0, strength: 57, speed: 33, stamina: 46, magic: 37, attack: 47, defense: 89, evasion: 8, magicDefense: 68, magicEvasion: 5, escapeSuccess: 3 },
  Banon: { hp: 46, mp: 16, strength: 10, speed: 24, stamina: 11, magic: 32, attack: 6, defense: 56, evasion: 36, magicDefense: 51, magicEvasion: 32, escapeSuccess: 2 },
  Leo: { hp: 50, mp: 10, strength: 52, speed: 38, stamina: 41, magic: 36, attack: 60, defense: 63, evasion: 22, magicDefense: 41, magicEvasion: 21, escapeSuccess: 3 },
};

// Look up by the save's character id, NOT by its `name` field: `name` is
// localised (Chinese, Japanese, etc.) and player-editable in-game, so it
// cannot be matched against these English keys. See characterRoster.ts.
export function forId(characterId: number): RawStats | undefined {
  const entry = characterRoster.forId(characterId);
  return entry ? ByName[entry.englishName] : undefined;
}
