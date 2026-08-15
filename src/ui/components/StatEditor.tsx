import type { JSX } from "preact";
import styles from "./StatEditor.module.css";

interface StatEditorProps {
  label: string;
  base: number;
  bonus: number;
  onBaseChange: (v: number) => void;
  onBonusChange: (v: number) => void;
  // HP/MP only: the character's current (not max) value, shown bigger and
  // alongside the total since the two are read together at a glance.
  current?: number;
  onCurrentChange?: (v: number) => void;
}

// Total = base + bonus, shown reactively. Only `bonus` is part of the save
// (the character's `addtional*` field) — `base` is a local reference value
// (defaults from data/characterBaseStats.ts) purely to make the total
// meaningful; editing it never touches the save file, since the game
// computes base stats itself and doesn't store them per-character.
export function StatEditor({ label, base, bonus, onBaseChange, onBonusChange, current, onCurrentChange }: StatEditorProps) {
  const total = base + bonus;

  function numberInput(value: number, onChange: (v: number) => void, className: string): JSX.Element {
    return (
      <input
        class={className}
        type="number"
        value={value}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
          const n = Number(e.currentTarget.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
    );
  }

  return (
    <div class={styles.block}>
      <p class={styles.label}>{label}</p>
      <div class={styles.totalRow}>
        {current !== undefined && onCurrentChange && (
          <div class={styles.currentWrap}>
            <span class={styles.subLabel}>Current</span>
            {numberInput(current, onCurrentChange, styles.currentInput)}
          </div>
        )}
        <div class={styles.totalWrap}>
          <span class={styles.subLabel}>{current !== undefined ? "Max" : "Total"}</span>
          <div class={styles.total}>{total}</div>
        </div>
      </div>
      <div class={styles.subInputs}>
        <label class={styles.subField}>
          <span class={styles.subLabel}>Base</span>
          {numberInput(base, onBaseChange, styles.subInput)}
        </label>
        <label class={styles.subField}>
          <span class={styles.subLabel}>Bonus</span>
          {numberInput(bonus, onBonusChange, styles.subInput)}
        </label>
      </div>
    </div>
  );
}
