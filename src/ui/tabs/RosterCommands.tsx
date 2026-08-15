import { useMemo } from "preact/hooks";
import { Dropdown } from "../components/Dropdown.tsx";
import { WarningBanner } from "../components/WarningBanner.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as commandsData from "../../data/commands.ts";
import type { Character } from "../../model/character.ts";
import type { Equipment } from "../../model/equipment.ts";
import styles from "./RosterStats.module.css";

const BRIGANDS_GLOVE_ID = 306; // upgrades Locke's Steal to Mug
const FAKE_MUSTACHE_ID = 314; // upgrades Relm's Sketch to Control

// Each class's signature command, by jobId — starred in the picker as a
// hint, not a restriction (the full list stays selectable for everyone —
// mods can grant commands legitimately). Locke and Relm's default command
// changes if the relic that upgrades it is equipped. Umaro, Leo, and NPCs
// don't have a signature player command, so they're absent here.
function classCommandId(jobId: number, equipment: Equipment): number | undefined {
  const hasRelic = (itemId: number) => equipment.relic1 === itemId || equipment.relic2 === itemId;

  switch (jobId) {
    case 1: return 8; // Terra: Trance
    case 2: return hasRelic(BRIGANDS_GLOVE_ID) ? 11 : 10; // Locke: Mug w/ Brigand's Glove, else Steal
    case 3: return 12; // Cyan: Bushido
    case 4: return 13; // Shadow: Throw
    case 5: return 14; // Edgar: Tools
    case 6: return 15; // Sabin: Blitz
    case 7: return 16; // Celes: Runic
    case 8: return 17; // Strago: Lore
    case 9: return hasRelic(FAKE_MUSTACHE_ID) ? 19 : 18; // Relm: Control w/ Fake Mustache, else Sketch
    case 10: return 20; // Setzer: Slot
    case 11: return 22; // Mog: Dance
    case 12: return 23; // Gau: Rage
    case 13: return 25; // Gogo: Mimic
    case 15: return 27; // Banon: Pray
    default: return undefined;
  }
}

export function RosterCommands({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();
  const commands = character.commands;
  const starredId = classCommandId(character.jobId, character.equipment);

  const options = useMemo(
    () =>
      commandsData.All.map((c) => ({
        value: c.id,
        label: c.id === starredId ? `⭐ ${c.name}` : c.name,
      })),
    [starredId],
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
