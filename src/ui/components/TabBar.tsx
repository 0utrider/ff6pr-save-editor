import styles from "./TabBar.module.css";

export interface TabDef<K extends string> {
  key: K;
  label: string;
  emoji: string;
}

interface TabBarProps<K extends string> {
  tabs: TabDef<K>[];
  active: K;
  onSelect: (key: K) => void;
}

// Top-level tab row. Active tab gets the ▶ cursor glyph — the same
// selection vocabulary used by CheckboxList rows — so "you are here" reads
// consistently across the whole app.
export function TabBar<K extends string>({ tabs, active, onSelect }: TabBarProps<K>) {
  return (
    <div class={styles.bar} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          class={tab.key === active ? styles.tabActive : styles.tab}
          onClick={() => onSelect(tab.key)}
        >
          {tab.key === active && <span class={styles.cursor}>▶</span>}
          <span class={styles.emoji}>{tab.emoji}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
