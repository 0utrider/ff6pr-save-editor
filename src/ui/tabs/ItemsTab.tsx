import { useState } from "preact/hooks";
import { SubTabBar } from "../components/SubTabBar.tsx";
import type { TabDef } from "../components/TabBar.tsx";
import { ItemsTable } from "../components/ItemsTable.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as items from "../../data/items.ts";
import type { SaveFile } from "../../model/saveFile.ts";

type SubTabKey = "items" | "quest";

const SUB_TABS: TabDef<SubTabKey>[] = [
  { key: "items", label: "Items", emoji: "🧪" },
  { key: "quest", label: "Quest Items", emoji: "🗝️" },
];

export function ItemsTab({ save }: { save: SaveFile }) {
  const [sub, setSub] = useState<SubTabKey>("items");
  const forceUpdate = useForceUpdate();

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={sub} onSelect={setSub} />
      {sub === "items" ? (
        <ItemsTable
          inventory={save.userData.normalInventory}
          resolveName={(id) => items.normalById(id)?.name}
          onChange={forceUpdate}
        />
      ) : (
        <ItemsTable
          inventory={save.userData.importantInventory}
          resolveName={(id) => items.importantById(id)?.name}
          onChange={forceUpdate}
        />
      )}
    </div>
  );
}
