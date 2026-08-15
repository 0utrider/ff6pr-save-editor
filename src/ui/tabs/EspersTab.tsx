import { CheckboxList } from "../components/CheckboxList.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as espers from "../../data/espers.ts";
import type { SaveFile } from "../../model/saveFile.ts";

export function EspersTab({ save }: { save: SaveFile }) {
  const forceUpdate = useForceUpdate();
  const owned = save.userData.ownedEsperIds;

  return (
    <CheckboxList
      items={espers.All}
      isChecked={(id) => owned.has(id)}
      onToggle={(id) => {
        if (owned.has(id)) owned.delete(id);
        else owned.add(id);
        forceUpdate();
      }}
      onSetAll={(ids, checked) => {
        for (const id of ids) {
          if (checked) owned.add(id);
          else owned.delete(id);
        }
        forceUpdate();
      }}
      showFilter={false}
    />
  );
}
