// Battle command IDs. Each character has 8 command slots in commandList.
// Editing these can soft-lock or crash the game if a character is given a
// command they don't actually own (e.g. Magitek on someone who isn't a
// Magitek Knight) — the UI must restrict the picker per character.
// Source: AnotherFFVIPRSaveEditor, Ffvi.SaveTool.Lib/Data/Commands.cs (MIT).

export interface CommandInfo {
  id: number;
  name: string;
}

export const NoneId = 4;

export const All: CommandInfo[] = [
  { id: 4, name: "[none]" },
  { id: 1, name: "Attack" },
  { id: 2, name: "Defend" },
  { id: 3, name: "Items" },
  { id: 5, name: "Row" },
  { id: 6, name: "Skip" },
  { id: 7, name: "Magitek" },
  { id: 8, name: "Trance" },
  { id: 9, name: "Revert" },
  { id: 10, name: "Steal" },
  { id: 11, name: "Mug" },
  { id: 12, name: "Bushido" },
  { id: 13, name: "Throw" },
  { id: 14, name: "Tools" },
  { id: 15, name: "Blitz" },
  { id: 16, name: "Runic" },
  { id: 17, name: "Lore" },
  { id: 18, name: "Sketch" },
  { id: 19, name: "Control" },
  { id: 20, name: "Slot" },
  { id: 21, name: "Gil Toss" },
  { id: 22, name: "Dance" },
  { id: 23, name: "Rage" },
  { id: 24, name: "Leap" },
  { id: 25, name: "Mimic" },
  { id: 26, name: "Magic" },
  { id: 27, name: "Pray" },
  { id: 28, name: "Shock" },
  { id: 29, name: "Possess" },
  { id: 30, name: "Jump" },
  { id: 31, name: "Dualcast" },
];

export function byId(id: number): CommandInfo | undefined {
  return All.find((c) => c.id === id);
}

export function nameFor(id: number): string {
  return byId(id)?.name ?? `#${id}`;
}
