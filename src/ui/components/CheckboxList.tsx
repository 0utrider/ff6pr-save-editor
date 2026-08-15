import { useMemo, useState } from "preact/hooks";
import styles from "./CheckboxList.module.css";

export interface CheckboxListItem {
  id: number;
  name: string;
}

interface CheckboxListProps {
  items: CheckboxListItem[];
  isChecked: (id: number) => boolean;
  onToggle: (id: number) => void;
  onSetAll?: (ids: number[], checked: boolean) => void;
  showFilter?: boolean;
  filterPlaceholder?: string;
}

// The "✅ ID Name" list pattern shared by Skills sub-tabs, Espers, Veldt,
// and Roster > Magic. Filter and All/None always act on the full,
// unfiltered `items` list (per HANDOFF: a user narrowing the list with a
// search shouldn't have a bulk action silently do less than its label
// says).
export function CheckboxList({
  items,
  isChecked,
  onToggle,
  onSetAll,
  showFilter = true,
  filterPlaceholder = "Filter by name or id…",
}: CheckboxListProps) {
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || String(i.id).includes(q));
  }, [items, filter]);

  const allIds = useMemo(() => items.map((i) => i.id), [items]);
  const checkedCount = useMemo(() => items.filter((i) => isChecked(i.id)).length, [items, isChecked]);

  return (
    <div>
      <div class={styles.toolbar}>
        {showFilter && (
          <input
            class={styles.filterInput}
            type="text"
            placeholder={filterPlaceholder}
            value={filter}
            onInput={(e) => setFilter(e.currentTarget.value)}
          />
        )}
        <span class={styles.count}>
          {checkedCount} / {items.length}
        </span>
        {onSetAll && (
          <>
            <button type="button" class={styles.bulkButton} onClick={() => onSetAll(allIds, true)}>
              Select all
            </button>
            <button type="button" class={styles.bulkButton} onClick={() => onSetAll(allIds, false)}>
              Clear all
            </button>
          </>
        )}
      </div>
      <div class={styles.list}>
        {visible.length === 0 && <div class={styles.empty}>No entries match "{filter}".</div>}
        {visible.map((item) => {
          const checked = isChecked(item.id);
          return (
            <label key={item.id} class={styles.row}>
              <input
                type="checkbox"
                class={styles.checkbox}
                checked={checked}
                onChange={() => onToggle(item.id)}
              />
              <span class={styles.id}>{item.id}</span>
              <span class={styles.name}>{item.name || "—"}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
