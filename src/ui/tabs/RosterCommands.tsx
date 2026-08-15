import { useMemo } from "preact/hooks";
import { Dropdown } from "../components/Dropdown.tsx";
import { WarningBanner } from "../components/WarningBanner.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as commandsData from "../../data/commands.ts";
import * as characterRoster from "../../data/characterRoster.ts";
import type { Character } from "../../model/character.ts";
import styles from "./RosterStats.module.css";

// Each class's signature command, by jobId — starred in the picker as a
// hint, not a restriction. The user asked for the full command list to
// stay selectable for every character (mods can change what a character
// legitimately owns), just with their own class command marked.
const CLASS_COMMAND_ID_BY_JOB_ID: Record<number, number> = {
  [characterRoster.SkillOwnerJobId.Bushido]: 12, // Bushido (Cyan)
  [characterRoster.SkillOwnerJobId.Blitz]: 15, // Blitz (Sabin)
  [characterRoster.SkillOwnerJobId.Lore]: 17, // Lore (Strago)
  [characterRoster.SkillOwnerJobId.Slot]: 20, // Slot (Setzer)
  [characterRoster.SkillOwnerJobId.Dance]: 22, // Dance (Mog)
  [characterRoster.SkillOwnerJobId.Rages]: 23, // Rage (Gau)
};

export function RosterCommands({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();
  const commands = character.commands;
  const classCommandId = CLASS_COMMAND_ID_BY_JOB_ID[character.jobId];

  const options = useMemo(
    () =>
      commandsData.All.map((c) => ({
        value: c.id,
        label: c.id === classCommandId ? `⭐ ${c.name}` : c.name,
      })),
    [classCommandId],
  );

  return (
    <div>
      <WarningBanner>
        Assigning a command a character doesn't legitimately own can crash the game — back up your
        save before editing these. The whole command list is available here (some players use it
        to test mods), not just what this character would normally have.
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
