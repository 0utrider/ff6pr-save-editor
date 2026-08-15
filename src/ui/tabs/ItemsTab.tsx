import { useState } from "preact/hooks";
import { SubTabBar } from "../components/SubTabBar.tsx";
import type { TabDef } from "../components/TabBar.tsx";
import { ItemsTable } from "../components/ItemsTable.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as items from "../../data/items.ts";
import type { SaveFile } from "../../model/saveFile.ts";

type SubTabKey = "items" | "quest" | "warehouse";

const SUB_TABS: TabDef<SubTabKey>[] = [
  { key: "items", label: "Items", emoji: "🧪" },
  { key: "quest", label: "Quest Items", emoji: "🗝️" },
  { key: "warehouse", label: "Warehouse", emoji: "📦" },
];

export function ItemsTab({ save }: { save: SaveFile }) {
  const [sub, setSub] = useState<SubTabKey>("items");
  const forceUpdate = useForceUpdate();

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={sub} onSelect={setSub} />
      {sub === "items" && (
        <ItemsTable
          inventory={save.userData.normalInventory}
          resolveName={(id) => items.normalById(id)?.name}
          onChange={forceUpdate}
        />
      )}
      {sub === "quest" && (
        <ItemsTable
          inventory={save.userData.importantInventory}
          resolveName={(id) => items.importantById(id)?.name}
          onChange={forceUpdate}
        />
      )}
      {sub === "warehouse" && (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 0 }}>
            Empty in every real save seen so far, including yours — its in-game meaning is
            unconfirmed (even the upstream reference project never built UI for it). Add an item
            here, download the save, and load it in-game to see what actually happens.
          </p>
          <ItemsTable
            inventory={save.userData.warehouseInventory}
            resolveName={(id) => items.normalById(id)?.name}
            onChange={forceUpdate}
          />
        </>
      )}
    </div>
  );
}
