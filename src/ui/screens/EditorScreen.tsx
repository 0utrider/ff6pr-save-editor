import { useState } from "preact/hooks";
import { TabBar, type TabDef } from "../components/TabBar.tsx";
import { WindowFrame } from "../components/WindowFrame.tsx";
import { RosterTab } from "../tabs/RosterTab.tsx";
import { ItemsTab } from "../tabs/ItemsTab.tsx";
import { SkillsTab } from "../tabs/SkillsTab.tsx";
import { EspersTab } from "../tabs/EspersTab.tsx";
import { VeldtTab } from "../tabs/VeldtTab.tsx";
import type { SaveFile } from "../../model/saveFile.ts";
import styles from "./EditorScreen.module.css";

type TabKey = "roster" | "items" | "skills" | "espers" | "veldt";

const TABS: TabDef<TabKey>[] = [
  { key: "roster", label: "Roster", emoji: "👥" },
  { key: "items", label: "Items", emoji: "🎒" },
  { key: "skills", label: "Skills", emoji: "⚔️" },
  { key: "espers", label: "Espers", emoji: "🔮" },
  { key: "veldt", label: "Veldt", emoji: "🐾" },
];

interface EditorScreenProps {
  save: SaveFile;
  filename: string;
}

export function EditorScreen({ save, filename }: EditorScreenProps) {
  const [tab, setTab] = useState<TabKey>("roster");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const bytes = await save.save();
      // Explicit type avoids the browser guessing a ".txt" extension for
      // an untyped blob — the real save file has no extension at all.
      const blob = new Blob([bytes as BlobPart], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "save_edited";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div class={styles.page}>
      <header class={styles.header}>
        <span class={styles.title}>FF6PR SAVE EDITOR</span>
        <span class={styles.meta}>
          {save.timestamp && <span>{save.timestamp}</span>}
          <span>{Math.round(save.playTime)}s playtime</span>
        </span>
        <button type="button" class={styles.downloadButton} onClick={handleDownload} disabled={downloading}>
          {downloading ? "Preparing…" : "Download edited save"}
        </button>
      </header>

      <TabBar tabs={TABS} active={tab} onSelect={setTab} />

      <div class={styles.content}>
        <WindowFrame class={styles.panel}>
          {tab === "roster" && <RosterTab save={save} />}
          {tab === "items" && <ItemsTab save={save} />}
          {tab === "skills" && <SkillsTab save={save} />}
          {tab === "espers" && <EspersTab save={save} />}
          {tab === "veldt" && <VeldtTab save={save} />}
        </WindowFrame>
      </div>
    </div>
  );
}
