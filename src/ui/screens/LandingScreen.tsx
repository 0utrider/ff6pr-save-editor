import { useRef, useState } from "preact/hooks";
import type { JSX } from "preact";
import { WindowFrame } from "../components/WindowFrame.tsx";
import { SaveFile } from "../../model/saveFile.ts";
import styles from "./LandingScreen.module.css";

interface LandingScreenProps {
  onLoaded: (save: SaveFile, filename: string) => void;
}

export function LandingScreen({ onLoaded }: LandingScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const save = await SaveFile.load(bytes);
      onLoaded(save, file.name);
    } catch (err) {
      console.error("Failed to load save file:", err, (err as Error)?.stack);
      setError("This doesn't look like a FFVI Pixel Remaster save file. Pick a different file and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: JSX.TargetedDragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) void loadFile(file);
  }

  return (
    <div class={styles.page}>
      <div class={styles.wordmark}>FF6PR 💾 SAVE EDITOR</div>
      <p class={styles.subtitle}>Edit a Final Fantasy VI Pixel Remaster save entirely from your browser.</p>
      <WindowFrame class={styles.card}>
        <div
          class={dragActive ? `${styles.dropZone} ${styles.dropZoneActive}` : styles.dropZone}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div class={styles.dropIcon}>📁</div>
          <div class={styles.dropLabel}>
            {loading ? "Reading save file…" : "Drop a save file here, or click to browse"}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          class={styles.fileInput}
          onChange={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            const file = e.currentTarget.files?.[0];
            if (file) void loadFile(file);
          }}
        />
        {error && <div class={styles.error}>{error}</div>}
      </WindowFrame>

      <details class={styles.instructions}>
        <summary class={styles.instructionsToggle}>📖 Instructions</summary>
        <div class={styles.instructionsBody}>
          <p>
            <strong>Windows</strong>
            <br />
            <code class={styles.path}>Documents\My Games\FINAL FANTASY VI PR\Steam\&lt;your Steam ID&gt;\</code>
          </p>
          <p>
            <strong>Steam Deck</strong>
            <br />
            Same file, under the Proton prefix — switch to Desktop Mode and open a file manager to:
            <br />
            <code class={styles.path}>
              ~/.local/share/Steam/steamapps/compatdata/&lt;FF6PR's App ID&gt;/pfx/drive_c/users/steamuser/Documents/My
              Games/FINAL FANTASY VI PR/Steam/&lt;your Steam ID&gt;/
            </code>
            <br />
            Find the App ID via Steam → right-click the game → Properties, or look it up on SteamDB.
          </p>
          <p>
            Inside that folder, look for files with gibberish, random-character names — the actual save
            data is around 50 KB or larger. Ignore anything close to 1 KB; those are just metadata, not
            the save itself.
          </p>
        </div>
      </details>
    </div>
  );
}
