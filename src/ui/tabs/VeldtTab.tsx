import { useMemo } from "preact/hooks";
import { CheckboxList } from "../components/CheckboxList.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as veldtFormations from "../../data/veldtFormations.ts";
import type { SaveFile } from "../../model/saveFile.ts";

export function VeldtTab({ save }: { save: SaveFile }) {
  const forceUpdate = useForceUpdate();
  const veldt = save.veldt;

  const items = useMemo(
    () => veldtFormations.Names.map((name, index) => ({ id: index, name: name || "—" })),
    [],
  );

  if (!veldt) {
    return <p>This save has no map data — Veldt encounter flags aren't available for it.</p>;
  }

  return (
    <CheckboxList
      items={items}
      isChecked={(index) => veldt.encounters[index] ?? false}
      onToggle={(index) => {
        veldt.encounters[index] = !veldt.encounters[index];
        forceUpdate();
      }}
      onSetAll={(ids, checked) => {
        for (const id of ids) veldt.encounters[id] = checked;
        forceUpdate();
      }}
      filterPlaceholder="Filter by monster or id…"
    />
  );
}
