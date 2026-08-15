import { useMemo, useState } from "preact/hooks";
import styles from "./ItemReferenceList.module.css";

interface ReferenceItem {
  id: number;
  name: string;
}

interface ItemReferenceListProps {
  items: ReferenceItem[];
}

// A read-only, searchable id→name lookup, kept separate from the editable
// inventory table (and pinned via CSS position:sticky) so it stays visible
// while the user scrolls a long inventory to fill in ids by hand.
export function ItemReferenceList({ items }: ItemReferenceListProps) {
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || String(i.id).includes(q));
  }, [items, filter]);

  return (
    <div class={styles.panel}>
      <div class={styles.header}>
        <p class={styles.title}>Reference — {items.length} items</p>
        <input
          class={styles.filterInput}
          type="text"
          placeholder="Filter…"
          value={filter}
          onInput={(e) => setFilter(e.currentTarget.value)}
        />
      </div>
      <div class={styles.list}>
        {visible.length === 0 && <div class={styles.empty}>No matches.</div>}
        {visible.map((item) => (
          <div class={styles.row} key={item.id}>
            <span class={styles.id}>{item.id}</span>
            <span class={styles.name}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
