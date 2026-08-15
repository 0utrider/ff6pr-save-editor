import type { ComponentChildren, JSX } from "preact";
import styles from "./WindowFrame.module.css";

interface WindowFrameProps {
  children: ComponentChildren;
  class?: string;
  style?: JSX.CSSProperties;
}

// The signature element: a corner-notched panel evoking SNES dialogue-box
// chrome. Used for the top-level tab content area and the landing card —
// not for every small control, so it stays the one memorable motif.
export function WindowFrame({ children, class: className, style }: WindowFrameProps) {
  return (
    <div class={className ? `${styles.frame} ${className}` : styles.frame} style={style}>
      {children}
    </div>
  );
}
