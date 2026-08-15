import type { ComponentChildren } from "preact";
import styles from "./WarningBanner.module.css";

export function WarningBanner({ children }: { children: ComponentChildren }) {
  return (
    <div class={styles.banner} role="alert">
      <span class={styles.icon}>⚠</span>
      <span>{children}</span>
    </div>
  );
}
