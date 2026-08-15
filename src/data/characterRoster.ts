// Canonical character roster, id-indexed to match the game's DEFAULT
// recruitment order.
//
// Identify characters by jobId, never by `id` or the save's `name` string.
// `name` is localised (a save made in Chinese, Japanese, etc. stores it in
// that language) and player-renameable. `id` looks stable but ISN'T: this
// table's ids assume the default Three Scenarios recruitment order, and a
// real save can diverge from it — confirmed twice in practice: a real save
// had Gau at id 25 (this table says id 24 = Gau) and Cyan at id 23 (this
// table says id 22 = Cyan; id 23 here is a mystery NPC). Code that used
// `forId(saveCharacterId)` to find "the real Gau" silently returned the
// wrong character both times. Use `forJobId` instead, which is what every
// call site in this codebase now does — this table's own `id` field is
// kept only because the shape needs SOME primary key, not because it's
// safe to use as one.
//
// jobId is unique among playable characters but not against NPCs sharing a
// job (Mog shares job 11 with nine NPC moogles, who also appear as full
// character entries in real saves) — see forJobId for how that's handled.
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
export const SkillOwnerJobId = {
  Rages: 12, // Gau
  Bushido: 3, // Cyan
  Lore: 8, // Strago
  Blitz: 6, // Sabin
  Dance: 11, // Mog
  Slot: 10, // Setzer
} as const;

// Unsafe for identifying a specific save's character — see file header.
// Kept for callers that genuinely want "the default-order roster slot"
// (e.g. checking whether an id is a documented gap).
export function forId(id: number): RosterEntry | undefined {
  return All.find((r) => r.id === id);
}

// The safe lookup: given a jobId read from an actual save character,
// returns the non-NPC roster entry for it (excludes the NPC collisions
// noted above — Mog's job is shared by nine NPC moogles, none of which
// this should ever resolve to).
export function forJobId(jobId: number): RosterEntry | undefined {
  return All.find((r) => r.jobId === jobId && !r.isNpc);
}
