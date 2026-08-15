import { Dropdown } from "../components/Dropdown.tsx";
import { CheckboxList } from "../components/CheckboxList.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as spells from "../../data/spells.ts";
import * as espers from "../../data/espers.ts";
import type { Character } from "../../model/character.ts";

const ESPER_OPTIONS = [
  { value: 0, label: "(none)" },
  ...espers.All.map((e) => ({ value: e.id, label: e.name })),
];

export function RosterMagic({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();

  return (
    <div>
      <Dropdown
        label="Equipped Esper"
        value={character.equippedEsperId}
        options={ESPER_OPTIONS}
        onChange={(v) => {
          character.equippedEsperId = Number(v);
          forceUpdate();
        }}
      />
      <div style={{ height: "0.9rem" }} />
      <CheckboxList
        items={spells.All}
        isChecked={(id) => character.abilities.knowsAbility(id)}
        onToggle={(id) => {
          if (character.abilities.knowsAbility(id)) character.abilities.forgetSpell(id);
          else character.abilities.learnSpell(id);
          forceUpdate();
        }}
        onSetAll={(ids, checked) => {
          for (const id of ids) {
            if (checked) character.abilities.learnSpell(id);
            else character.abilities.forgetSpell(id);
          }
          forceUpdate();
        }}
      />
    </div>
  );
}
