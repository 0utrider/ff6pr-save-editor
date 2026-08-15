// Per-level growth for party members (Pixel Remaster). Exp is the CUMULATIVE
// experience required to reach that level; hp/mp are the level-derived
// portion of max HP/MP, on top of the character base in characterBaseStats.
// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/LevelGrowth.cs
// (MIT); FF wiki "Final Fantasy VI stats" level evolution table.
//
// The game recomputes level from experience after each battle, so any edit
// to a character's level must set currentExp to match, or the level reverts
// on the next battle (with a spurious "Level Up" message).

export interface LevelRow {
  level: number;
  hp: number;
  mp: number;
  exp: number;
}

export const MinLevel = 1;
export const MaxLevel = 99;

export const Rows: LevelRow[] = [
  { level: 1, hp: 0, mp: 0, exp: 0 },
  { level: 2, hp: 11, mp: 4, exp: 32 },
  { level: 3, hp: 23, mp: 8, exp: 96 },
  { level: 4, hp: 37, mp: 13, exp: 208 },
  { level: 5, hp: 54, mp: 18, exp: 400 },
  { level: 6, hp: 74, mp: 24, exp: 672 },
  { level: 7, hp: 96, mp: 30, exp: 1056 },
  { level: 8, hp: 120, mp: 37, exp: 1552 },
  { level: 9, hp: 146, mp: 45, exp: 2184 },
  { level: 10, hp: 173, mp: 53, exp: 2976 },
  { level: 11, hp: 201, mp: 62, exp: 3936 },
  { level: 12, hp: 231, mp: 71, exp: 5080 },
  { level: 13, hp: 266, mp: 81, exp: 6432 },
  { level: 14, hp: 305, mp: 91, exp: 7992 },
  { level: 15, hp: 349, mp: 101, exp: 9784 },
  { level: 16, hp: 399, mp: 111, exp: 11840 },
  { level: 17, hp: 453, mp: 121, exp: 14152 },
  { level: 18, hp: 510, mp: 132, exp: 16736 },
  { level: 19, hp: 571, mp: 143, exp: 19616 },
  { level: 20, hp: 636, mp: 154, exp: 22832 },
  { level: 21, hp: 703, mp: 165, exp: 26360 },
  { level: 22, hp: 772, mp: 176, exp: 30232 },
  { level: 23, hp: 844, mp: 188, exp: 34456 },
  { level: 24, hp: 920, mp: 200, exp: 39056 },
  { level: 25, hp: 999, mp: 212, exp: 44072 },
  { level: 26, hp: 1081, mp: 224, exp: 49464 },
  { level: 27, hp: 1167, mp: 236, exp: 55288 },
  { level: 28, hp: 1257, mp: 249, exp: 61568 },
  { level: 29, hp: 1352, mp: 262, exp: 68304 },
  { level: 30, hp: 1451, mp: 275, exp: 75496 },
  { level: 31, hp: 1551, mp: 288, exp: 83184 },
  { level: 32, hp: 1652, mp: 301, exp: 91384 },
  { level: 33, hp: 1754, mp: 315, exp: 100088 },
  { level: 34, hp: 1856, mp: 329, exp: 109344 },
  { level: 35, hp: 1959, mp: 343, exp: 119136 },
  { level: 36, hp: 2063, mp: 357, exp: 129504 },
  { level: 37, hp: 2169, mp: 371, exp: 140464 },
  { level: 38, hp: 2276, mp: 386, exp: 152008 },
  { level: 39, hp: 2384, mp: 401, exp: 164184 },
  { level: 40, hp: 2494, mp: 416, exp: 176976 },
  { level: 41, hp: 2605, mp: 431, exp: 190416 },
  { level: 42, hp: 2718, mp: 446, exp: 204520 },
  { level: 43, hp: 2832, mp: 462, exp: 219320 },
  { level: 44, hp: 2948, mp: 478, exp: 234808 },
  { level: 45, hp: 3065, mp: 494, exp: 251000 },
  { level: 46, hp: 3184, mp: 510, exp: 267936 },
  { level: 47, hp: 3304, mp: 526, exp: 285600 },
  { level: 48, hp: 3426, mp: 543, exp: 304040 },
  { level: 49, hp: 3551, mp: 560, exp: 323248 },
  { level: 50, hp: 3679, mp: 577, exp: 343248 },
  { level: 51, hp: 3809, mp: 593, exp: 364064 },
  { level: 52, hp: 3940, mp: 608, exp: 385696 },
  { level: 53, hp: 4073, mp: 622, exp: 408160 },
  { level: 54, hp: 4207, mp: 635, exp: 431488 },
  { level: 55, hp: 4343, mp: 647, exp: 455680 },
  { level: 56, hp: 4480, mp: 658, exp: 480776 },
  { level: 57, hp: 4619, mp: 668, exp: 506760 },
  { level: 58, hp: 4761, mp: 677, exp: 533680 },
  { level: 59, hp: 4905, mp: 685, exp: 561528 },
  { level: 60, hp: 5050, mp: 692, exp: 590320 },
  { level: 61, hp: 5197, mp: 698, exp: 620096 },
  { level: 62, hp: 5345, mp: 703, exp: 650840 },
  { level: 63, hp: 5495, mp: 708, exp: 682600 },
  { level: 64, hp: 5647, mp: 714, exp: 715368 },
  { level: 65, hp: 5800, mp: 720, exp: 749160 },
  { level: 66, hp: 5955, mp: 727, exp: 784016 },
  { level: 67, hp: 6111, mp: 734, exp: 819920 },
  { level: 68, hp: 6269, mp: 741, exp: 856920 },
  { level: 69, hp: 6429, mp: 749, exp: 895016 },
  { level: 70, hp: 6591, mp: 757, exp: 934208 },
  { level: 71, hp: 6751, mp: 765, exp: 974536 },
  { level: 72, hp: 6906, mp: 773, exp: 1016000 },
  { level: 73, hp: 7057, mp: 781, exp: 1058640 },
  { level: 74, hp: 7202, mp: 788, exp: 1102456 },
  { level: 75, hp: 7342, mp: 795, exp: 1147456 },
  { level: 76, hp: 7478, mp: 802, exp: 1193648 },
  { level: 77, hp: 7610, mp: 808, exp: 1241080 },
  { level: 78, hp: 7736, mp: 814, exp: 1289744 },
  { level: 79, hp: 7856, mp: 820, exp: 1339672 },
  { level: 80, hp: 7973, mp: 826, exp: 1390872 },
  { level: 81, hp: 8086, mp: 831, exp: 1443368 },
  { level: 82, hp: 8196, mp: 836, exp: 1497160 },
  { level: 83, hp: 8304, mp: 841, exp: 1552264 },
  { level: 84, hp: 8409, mp: 846, exp: 1608712 },
  { level: 85, hp: 8511, mp: 851, exp: 1666512 },
  { level: 86, hp: 8611, mp: 856, exp: 1725688 },
  { level: 87, hp: 8709, mp: 861, exp: 1786240 },
  { level: 88, hp: 8804, mp: 867, exp: 1848184 },
  { level: 89, hp: 8896, mp: 873, exp: 1911552 },
  { level: 90, hp: 8986, mp: 879, exp: 1976352 },
  { level: 91, hp: 9074, mp: 885, exp: 2042608 },
  { level: 92, hp: 9161, mp: 891, exp: 2110320 },
  { level: 93, hp: 9246, mp: 898, exp: 2179504 },
  { level: 94, hp: 9329, mp: 906, exp: 2250192 },
  { level: 95, hp: 9411, mp: 915, exp: 2322392 },
  { level: 96, hp: 9491, mp: 925, exp: 2396128 },
  { level: 97, hp: 9574, mp: 936, exp: 2471400 },
  { level: 98, hp: 9660, mp: 948, exp: 2548224 },
  { level: 99, hp: 9748, mp: 961, exp: 2637112 },
];

export function expForLevel(level: number): number {
  const clamped = Math.min(MaxLevel, Math.max(MinLevel, level));
  return Rows[clamped - 1].exp;
}

export function levelForExp(exp: number): number {
  let level = MinLevel;
  for (const r of Rows) {
    if (exp >= r.exp) level = r.level;
  }
  return level;
}
