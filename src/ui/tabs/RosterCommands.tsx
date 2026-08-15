import { useMemo } from "preact/hooks";
import { Dropdown } from "../components/Dropdown.tsx";
import { WarningBanner } from "../components/WarningBanner.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as commandsData from "../../data/commands.ts";
import type { Character } from "../../model/character.ts";
import styles from "./RosterStats.module.css";

// Generic commands considered safe on any character regardless of class —
// everything else is only offered if the character's own save data already
// has it in one of its slots (see HANDOFF: assigning a command a character
// doesn't legitimately own can soft-lock the game).
const UNIVERSAL_SAFE_IDS = [
  commandsData.NoneId,
  1, // Attack
  2, // Defend
  3, // Items
  5, // Row
  6, // Skip
  26, // Magic
];

export function RosterCommands({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();
  const commands = character.commands;

  const options = useMemo(() => {
    const allowedIds = new Set([...UNIVERSAL_SAFE_IDS, ...commands.originalSlots]);
    return commandsData.All.filter((c) => allowedIds.has(c.id)).map((c) => ({ value: c.id, label: c.name }));
  }, [commands]);

  return (
    <div>
      <WarningBanner>
        Assigning a command a character doesn't own can crash the game — back up your save before
        editing these.
      </WarningBanner>
      <div class={styles.grid}>
        {commands.slots.map((commandId, index) => (
          <Dropdown
            key={index}
            label={`Slot ${index + 1}`}
            value={commandId}
            options={options}
            onChange={(v) => {
              commands.slots[index] = Number(v);
              forceUpdate();
            }}
          />
        ))}
      </div>
    </div>
  );
}
