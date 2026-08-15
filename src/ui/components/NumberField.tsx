import type { JSX } from "preact";
import styles from "./NumberField.module.css";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  return (
    <label class={styles.wrap}>
      <span class={styles.label}>{label}</span>
      <input
        class={styles.input}
        type="number"
        value={value}
        min={min}
        max={max}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
          const n = Number(e.currentTarget.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
    </label>
  );
}
