import { CheckboxList } from "../components/CheckboxList.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as spells from "../../data/spells.ts";
import type { Character } from "../../model/character.ts";

export function RosterMagic({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();

  return (
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
  );
}
