import { useMemo } from "preact/hooks";
import type { JSX } from "preact";
import styles from "./Dropdown.module.css";

export interface DropdownOption {
  value: number | string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  label?: string;
  value: number | string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  class?: string;
}

export function Dropdown({ label, value, options, onChange, class: className }: DropdownProps) {
  // If the current value isn't one of the known options — a mod added an
  // item/id this build doesn't have a name for — show the raw id instead
  // of silently falling back to some other option or a blank selection.
  const effectiveOptions = useMemo(() => {
    const known = options.some((o) => String(o.value) === String(value));
    if (known) return options;
    return [{ value, label: `#${value}` }, ...options];
  }, [options, value]);

  const select = (
    <select
      class={className ? `${styles.select} ${className}` : styles.select}
      value={String(value)}
      onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => onChange(e.currentTarget.value)}
    >
      {effectiveOptions.map((opt) => (
        <option key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
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
