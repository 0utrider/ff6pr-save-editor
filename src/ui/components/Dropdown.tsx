import type { JSX } from "preact";
import styles from "./Dropdown.module.css";

export interface DropdownOption {
  value: number | string;
  label: string;
}

interface DropdownProps {
  label?: string;
  value: number | string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  class?: string;
}

export function Dropdown({ label, value, options, onChange, class: className }: DropdownProps) {
  const select = (
    <select
      class={className ? `${styles.select} ${className}` : styles.select}
      value={String(value)}
      onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => onChange(e.currentTarget.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <label class={styles.label}>
      {label}
      {select}
    </label>
  );
}
