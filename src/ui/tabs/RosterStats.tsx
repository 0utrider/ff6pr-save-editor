import { NumberField } from "../components/NumberField.tsx";
import { Dropdown } from "../components/Dropdown.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as espers from "../../data/espers.ts";
import * as levelGrowth from "../../data/levelGrowth.ts";
import type { Character } from "../../model/character.ts";
import styles from "./RosterStats.module.css";

const ESPER_OPTIONS = [
  { value: 0, label: "(none)" },
  ...espers.All.map((e) => ({ value: e.id, label: e.name })),
];

export function RosterStats({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();
  const stats = character.stats;
  const level = levelGrowth.levelForExp(character.currentExp);

  return (
    <div>
      <div class={styles.section}>
        <p class={styles.sectionTitle}>Core</p>
        <div class={styles.grid}>
          <NumberField
            label="Level"
            value={level}
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
          <Dropdown
            label="Equipped Esper"
            value={character.equippedEsperId}
            options={ESPER_OPTIONS}
            onChange={(v) => {
              character.equippedEsperId = Number(v);
              forceUpdate();
            }}
          />
        </div>
      </div>

      <div class={styles.section}>
        <p class={styles.sectionTitle}>Attributes</p>
        <div class={styles.grid}>
          <NumberField
            label="Power"
            value={stats.additionalPower}
            onChange={(v) => {
              stats.additionalPower = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Vitality"
            value={stats.additionalVitality}
            onChange={(v) => {
              stats.additionalVitality = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Agility"
            value={stats.additionalAgility}
            onChange={(v) => {
              stats.additionalAgility = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Intelligence"
            value={stats.additionalIntelligence}
            onChange={(v) => {
              stats.additionalIntelligence = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Spirit"
            value={stats.additionalSpirit}
            onChange={(v) => {
              stats.additionalSpirit = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Luck"
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
            label="Attack"
            value={stats.additionalAttack}
            onChange={(v) => {
              stats.additionalAttack = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Defense"
            value={stats.additionalDefense}
            onChange={(v) => {
              stats.additionalDefense = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Magic"
            value={stats.additionalMagic}
            onChange={(v) => {
              stats.additionalMagic = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Magic defense"
            value={stats.additionalMagicDefense}
            onChange={(v) => {
              stats.additionalMagicDefense = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Evasion rate"
            value={stats.additionalEvasionRate}
            onChange={(v) => {
              stats.additionalEvasionRate = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Magic evasion rate"
            value={stats.additionalMagicEvasionRate}
            onChange={(v) => {
              stats.additionalMagicEvasionRate = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Critical rate"
            value={stats.additionalCriticalRate}
            onChange={(v) => {
              stats.additionalCriticalRate = v;
              forceUpdate();
            }}
          />
          <NumberField
            label="Accuracy rate"
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
