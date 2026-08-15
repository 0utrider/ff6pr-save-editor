import styles from "./SubTabBar.module.css";
import type { TabDef } from "./TabBar.tsx";

interface SubTabBarProps<K extends string> {
  tabs: TabDef<K>[];
  active: K;
  onSelect: (key: K) => void;
}

export function SubTabBar<K extends string>({ tabs, active, onSelect }: SubTabBarProps<K>) {
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
          <span>{tab.emoji}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
