// Canonical character roster keyed by the save's `id` field.
//
// Identify characters by Id, never by the save's `name` string: `name` holds
// the LOCALISED name (a save made in Chinese, Japanese, etc. stores it in
// that language) and the player can also rename characters in-game. Id is
// stable across both.
//
// Id is unique; JobId is not (Mog shares job 11 with the nine NPC moogles,
// and Wedge/Biggs share job 18), so Id is the correct key for lookups.
// Ids 21 and 31 are intentionally absent from THIS roster table (gaps in
// the upstream reference). But id 21 has been observed in a real save's
// ownedCharacterList as an extra entry: jobId 11 ("Mog"), near-empty stats,
// all-placeholder equipment, no abilities — a game-internal padding/
// template row, not a playable roster slot. So `forId` returning undefined
// does not necessarily mean corrupt data; callers that iterate
// ownedCharacterList should tolerate an unresolvable id rather than assume
// every entry maps to a known character.
//
// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/CharacterRoster.cs
// (MIT), itself sourced from KiameV/final-fantasy-vi-save-editor.

export interface RosterEntry {
  id: number;
  jobId: number;
  englishName: string;
  isNpc: boolean;
}

export const All: RosterEntry[] = [
  { id: 1, jobId: 1, englishName: "Terra", isNpc: false },
  { id: 2, jobId: 18, englishName: "Wedge", isNpc: false },
  { id: 3, jobId: 18, englishName: "Biggs", isNpc: false },
  // Kefka is absent from the Go reference's table but appears in real saves
  // as id 4 / job 21 (observed in Pixel Remaster saves from the opening
  // sequence).
  { id: 4, jobId: 21, englishName: "Kefka", isNpc: true },
  { id: 5, jobId: 2, englishName: "Locke", isNpc: false },
  { id: 6, jobId: 11, englishName: "Moglin", isNpc: true },
  { id: 7, jobId: 11, englishName: "Mogret", isNpc: true },
  { id: 8, jobId: 11, englishName: "Moggie", isNpc: true },
  { id: 9, jobId: 11, englishName: "Molulu", isNpc: true },
  { id: 10, jobId: 11, englishName: "Moghan", isNpc: true },
  { id: 11, jobId: 11, englishName: "Moguel", isNpc: true },
  { id: 12, jobId: 11, englishName: "Mogsy", isNpc: true },
  { id: 13, jobId: 11, englishName: "Mogwin", isNpc: true },
  { id: 14, jobId: 11, englishName: "Mugmug", isNpc: true },
  { id: 15, jobId: 11, englishName: "Cosmog", isNpc: true },
  { id: 16, jobId: 11, englishName: "Mog", isNpc: false },
  { id: 17, jobId: 5, englishName: "Edgar", isNpc: false },
  { id: 18, jobId: 6, englishName: "Sabin", isNpc: false },
  { id: 19, jobId: 4, englishName: "Shadow", isNpc: false },
  { id: 20, jobId: 15, englishName: "Banon", isNpc: false },
  { id: 22, jobId: 3, englishName: "Cyan", isNpc: false },
  { id: 23, jobId: 17, englishName: "??????", isNpc: true },
  { id: 24, jobId: 12, englishName: "Gau", isNpc: false },
  { id: 25, jobId: 7, englishName: "Celes", isNpc: false },
  { id: 26, jobId: 10, englishName: "Setzer", isNpc: false },
  { id: 27, jobId: 20, englishName: "Maduin", isNpc: true },
  { id: 28, jobId: 8, englishName: "Strago", isNpc: false },
  { id: 29, jobId: 9, englishName: "Relm", isNpc: false },
  { id: 30, jobId: 16, englishName: "Leo", isNpc: false },
  { id: 32, jobId: 14, englishName: "Umaro", isNpc: false },
  { id: 33, jobId: 13, englishName: "Gogo", isNpc: false },
];

// Skill-owner job ids — which skill list a character has, not identity.
// jobId is NOT unique (see file header), so only use it for this lookup.
export const SkillOwnerJobId = {
  Rages: 12, // Gau
  Bushido: 3, // Cyan
  Lore: 8, // Strago
  Blitz: 6, // Sabin
  Dance: 11, // Mog
  Slot: 10, // Setzer
} as const;

export function forId(id: number): RosterEntry | undefined {
  return All.find((r) => r.id === id);
}
