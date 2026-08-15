import { NumberField } from "../components/NumberField.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as levelGrowth from "../../data/levelGrowth.ts";
import type { Character } from "../../model/character.ts";
import styles from "./RosterStats.module.css";

export function RosterStats({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();
  const stats = character.stats;

  return (
    <div>
      <div class={styles.section}>
        <p class={styles.sectionTitle}>Core</p>
        <div class={styles.grid}>
          <NumberField
            label="Level"
            value={stats.additionalLevel}
            min={levelGrowth.MinLevel}
            max={levelGrowth.MaxLevel}
            onChange={(v) => {
              character.setLevel(v);
              forceUpdate();
            }}
          />
          <NumberField
            label="Current HP"
            value={stats.currentHp}
            onChange={(v) => {
              stats.currentHp = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Current MP"
            value={stats.currentMp}
            onChange={(v) => {
              stats.currentMp = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Max HP bonus"
            value={stats.additionalMaxHp}
            onChange={(v) => {
              stats.additionalMaxHp = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Max MP bonus"
            value={stats.additionalMaxMp}
            onChange={(v) => {
              stats.additionalMaxMp = v;
              forceUpdate();
            }}
          />
        </div>
      </div>

      <div class={styles.section}>
        <p class={styles.sectionTitle}>Attributes</p>
        <div class={styles.grid}>
          <NumberField
            label="Power bonus"
            value={stats.additionalPower}
            onChange={(v) => {
              stats.additionalPower = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Vitality bonus"
            value={stats.additionalVitality}
            onChange={(v) => {
              stats.additionalVitality = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Agility bonus"
            value={stats.additionalAgility}
            onChange={(v) => {
              stats.additionalAgility = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Intelligence bonus"
            value={stats.additionalIntelligence}
            onChange={(v) => {
              stats.additionalIntelligence = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Spirit bonus"
            value={stats.additionalSpirit}
            onChange={(v) => {
              stats.additionalSpirit = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Luck bonus"
            value={stats.additionalLuck}
            onChange={(v) => {
              stats.additionalLuck = v;
              forceUpdate();
            }}
          />
        </div>
      </div>

      <div class={styles.section}>
        <p class={styles.sectionTitle}>Battle</p>
        <div class={styles.grid}>
          <NumberField
            label="Attack bonus"
            value={stats.additionalAttack}
            onChange={(v) => {
              stats.additionalAttack = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Defense bonus"
            value={stats.additionalDefense}
            onChange={(v) => {
              stats.additionalDefense = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Magic bonus"
            value={stats.additionalMagic}
            onChange={(v) => {
              stats.additionalMagic = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Magic defense bonus"
            value={stats.additionalMagicDefense}
            onChange={(v) => {
              stats.additionalMagicDefense = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Evasion rate bonus"
            value={stats.additionalEvasionRate}
            onChange={(v) => {
              stats.additionalEvasionRate = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Magic evasion rate bonus"
            value={stats.additionalMagicEvasionRate}
            onChange={(v) => {
              stats.additionalMagicEvasionRate = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Critical rate bonus"
            value={stats.additionalCriticalRate}
            onChange={(v) => {
              stats.additionalCriticalRate = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Accuracy rate bonus"
            value={stats.additionalAccuracyRate}
            onChange={(v) => {
              stats.additionalAccuracyRate = v;
              forceUpdate();
            }}
          />
        </div>
      </div>
    </div>
  );
}
