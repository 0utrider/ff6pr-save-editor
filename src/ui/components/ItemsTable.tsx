import type { JSX } from "preact";
import type { Inventory } from "../../model/inventory.ts";
import styles from "./ItemsTable.module.css";

interface ItemsTableProps {
  inventory: Inventory;
  resolveName: (id: number) => string | undefined;
  onChange: () => void;
}

// Editable id+qty rows with live name resolution — the pattern for a list
// too long (274+ items) to reasonably show as a dropdown or checkbox list.
// Dedup/crash-id cleanup happens at save time (Inventory.commit()), not
// here, so mid-edit state (including a not-yet-valid id) stays visible
// exactly as typed.
export function ItemsTable({ inventory, resolveName, onChange }: ItemsTableProps) {
  const addRow = () => {
    inventory.stacks.push({ itemId: 0, count: 1 });
    onChange();
  };

  const editId = (index: number, id: number) => {
    inventory.set(index, id, inventory.stacks[index].count);
    onChange();
  };

  const editCount = (index: number, count: number) => {
    inventory.set(index, inventory.stacks[index].itemId, count);
    onChange();
  };

  const remove = (index: number) => {
    inventory.removeAt(index);
    onChange();
  };

  return (
    <div>
      <div class={styles.toolbar}>
        <button type="button" class={styles.addButton} onClick={addRow}>
          + Add item
        </button>
      </div>
      <div class={styles.table}>
        <div class={styles.headerRow}>
          <span>ID</span>
          <span>Item</span>
          <span>Qty</span>
          <span />
        </div>
        {inventory.stacks.length === 0 && <div class={styles.empty}>No items.</div>}
        {inventory.stacks.map((stack, index) => {
          const name = resolveName(stack.itemId);
          return (
            <div class={styles.row} key={index}>
              <input
                class={styles.idInput}
                type="number"
                value={stack.itemId}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
                  const n = Number(e.currentTarget.value);
                  if (!Number.isNaN(n)) editId(index, n);
                }}
              />
              <span class={name ? styles.name : `${styles.name} ${styles.unknown}`}>
                {name ?? "Unknown item"}
              </span>
              <input
                class={styles.qtyInput}
                type="number"
                value={stack.count}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
                  const n = Number(e.currentTarget.value);
                  if (!Number.isNaN(n)) editCount(index, n);
                }}
              />
              <button
                type="button"
                class={styles.removeButton}
                aria-label={`Remove row ${index}`}
                onClick={() => remove(index)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
