import type { ComponentChildren } from "preact";
import styles from "./WarningBanner.module.css";

interface WarningBannerProps {
  children: ComponentChildren;
  tone?: "danger" | "info";
}

export function WarningBanner({ children, tone = "danger" }: WarningBannerProps) {
  const isInfo = tone === "info";
  return (
    <div class={isInfo ? styles.bannerInfo : styles.banner} role={isInfo ? "status" : "alert"}>
      <span class={isInfo ? styles.iconInfo : styles.icon}>{isInfo ? "ⓘ" : "⚠"}</span>
      <span>{children}</span>
    </div>
  );
}
