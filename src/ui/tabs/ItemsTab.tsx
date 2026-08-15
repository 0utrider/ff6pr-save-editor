import { useState } from "preact/hooks";
import { SubTabBar } from "../components/SubTabBar.tsx";
import type { TabDef } from "../components/TabBar.tsx";
import { ItemsTable } from "../components/ItemsTable.tsx";
import { ItemReferenceList } from "../components/ItemReferenceList.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as items from "../../data/items.ts";
import type { SaveFile } from "../../model/saveFile.ts";
import styles from "./ItemsTab.module.css";

type SubTabKey = "items" | "quest";

const SUB_TABS: TabDef<SubTabKey>[] = [
  { key: "items", label: "Items", emoji: "🧪" },
  { key: "quest", label: "Quest Items", emoji: "🗝️" },
];

export function ItemsTab({ save }: { save: SaveFile }) {
  const [sub, setSub] = useState<SubTabKey>("items");
  const forceUpdate = useForceUpdate();

  const catalog = sub === "items" ? items.Normal : items.Important;
  const inventory = sub === "items" ? save.userData.normalInventory : save.userData.importantInventory;

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={sub} onSelect={setSub} />
      <div class={styles.layout}>
        <div class={styles.editable}>
          <ItemsTable
            inventory={inventory}
            resolveName={(id) => catalog.find((i) => i.id === id)?.name}
            onChange={forceUpdate}
          />
        </div>
        <div class={styles.reference}>
          <ItemReferenceList items={catalog} />
        </div>
      </div>
    </div>
  );
}
