import { NumberField } from "../components/NumberField.tsx";
import type { SaveFile } from "../../model/saveFile.ts";
import styles from "./OtherTab.module.css";

interface OtherTabProps {
  save: SaveFile;
  // The header shows playtime too — use the parent's force-update instead
  // of a local one so editing it here refreshes the header immediately.
  onChange: () => void;
}

export function OtherTab({ save, onChange: forceUpdate }: OtherTabProps) {
  const userData = save.userData;

  const totalSeconds = userData.playTime;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  function setHours(h: number) {
    userData.playTime = Math.max(0, h) * 3600 + minutes * 60;
    forceUpdate();
  }

  function setMinutes(m: number) {
    userData.playTime = hours * 3600 + Math.max(0, Math.min(59, m)) * 60;
    forceUpdate();
  }

  return (
    <div>
      <div class={styles.section}>
        <p class={styles.sectionTitle}>Play Time</p>
        <div class={styles.row}>
          <NumberField label="Hours" value={hours} min={0} onChange={setHours} />
          <NumberField label="Minutes" value={minutes} min={0} max={59} onChange={setMinutes} />
        </div>
      </div>

      <div class={styles.section}>
        <p class={styles.sectionTitle}>Steps</p>
        <div class={styles.row}>
          <NumberField
            label="Steps taken"
            value={userData.steps}
            min={0}
            onChange={(v) => {
              userData.steps = v;
              forceUpdate();
            }}
          />
        </div>
      </div>
    </div>
  );
}
