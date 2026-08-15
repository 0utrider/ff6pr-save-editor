import { useState } from "preact/hooks";
import { SubTabBar } from "../components/SubTabBar.tsx";
import type { TabDef } from "../components/TabBar.tsx";
import { Dropdown } from "../components/Dropdown.tsx";
import { RosterStats } from "./RosterStats.tsx";
import { RosterMagic } from "./RosterMagic.tsx";
import { RosterEquipment } from "./RosterEquipment.tsx";
import { RosterCommands } from "./RosterCommands.tsx";
import type { SaveFile } from "../../model/saveFile.ts";

type SubTabKey = "stats" | "magic" | "equipment" | "commands";

const SUB_TABS: TabDef<SubTabKey>[] = [
  { key: "stats", label: "Stats", emoji: "📊" },
  { key: "magic", label: "Magic", emoji: "✨" },
  { key: "equipment", label: "Equipment", emoji: "🛡️" },
  { key: "commands", label: "Commands", emoji: "🎮" },
];

export function RosterTab({ save }: { save: SaveFile }) {
  const characters = save.userData.characters;
  const [characterId, setCharacterId] = useState<number>(characters[0]?.id ?? -1);
  const [sub, setSub] = useState<SubTabKey>("stats");

  const character = characters.find((c) => c.id === characterId) ?? characters[0];
  if (!character) return <p>No characters in this save.</p>;

  return (
    <div>
      <Dropdown
        label="Character"
        value={character.id}
        options={characters.map((c) => ({ value: c.id, label: `${c.name} (id ${c.id})` }))}
        onChange={(v) => setCharacterId(Number(v))}
      />
      <div style={{ height: "0.9rem" }} />
      <SubTabBar tabs={SUB_TABS} active={sub} onSelect={setSub} />
      {sub === "stats" && <RosterStats key={character.id} character={character} />}
      {sub === "magic" && <RosterMagic character={character} />}
      {sub === "equipment" && <RosterEquipment character={character} inventory={save.userData.normalInventory} />}
      {sub === "commands" && <RosterCommands character={character} />}
    </div>
  );
}
