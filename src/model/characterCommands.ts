import type { JsonObject } from "../save/nestedJson.ts";
import { unwrap, rewrap } from "../save/nestedJson.ts";

// Wraps a character's commandList (battle command slots). FFVI characters
// have 8 slots, each holding a command id (see data/commands.ts).
// Editing these can soft-lock the game if assigned to characters who don't
// legitimately own the command (e.g. Magitek on a non-Magitek-Knight
// character) — the UI must restrict the picker per character.
export class CharacterCommands {
  slots: number[];

  // Snapshot of slot values at load time — the UI's picker uses this as the
  // allowed-command set (plus universal safe commands) to avoid cross-class
  // assignments that would corrupt the save.
  readonly originalSlots: readonly number[];

  private readonly characterNode: JsonObject;

  constructor(characterNode: JsonObject) {
    this.characterNode = characterNode;
    const list = unwrap(characterNode, "commandList") as JsonObject;
    const loaded = [...(list.target as number[])];
    this.slots = loaded;
    this.originalSlots = Object.freeze([...loaded]);
  }

  resetToOriginal(): void {
    this.slots = [...this.originalSlots];
  }

  commit(): void {
    this.characterNode.commandList = { target: [...this.slots] };
    rewrap(this.characterNode, "commandList");
  }
}
