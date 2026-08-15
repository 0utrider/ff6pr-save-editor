import { useState } from "preact/hooks";
import { NumberField } from "../components/NumberField.tsx";
import { StatEditor } from "../components/StatEditor.tsx";
import { WarningBanner } from "../components/WarningBanner.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as levelGrowth from "../../data/levelGrowth.ts";
import * as characterBaseStats from "../../data/characterBaseStats.ts";
import type { Character } from "../../model/character.ts";
import styles from "./RosterStats.module.css";

// Verified against real in-game values (see characterBaseStats.ts): total
// = this base value + the save's stored bonus field, for every stat below
// except Attack, which needed UNARMED_ATTACK_BONUS added on top too.
// Callers pass a fresh RosterStats per character (keyed by character.id in
// RosterTab), so this local base state naturally resets on character
// switch instead of needing an effect to resync it.
function defaultBase(jobId: number) {
  const b = characterBaseStats.forJobId(jobId);
  return {
    hp: b?.hp ?? 0,
    mp: b?.mp ?? 0,
    strength: b?.strength ?? 0,
    stamina: b?.stamina ?? 0,
    speed: b?.speed ?? 0,
    magic: b?.magic ?? 0,
    attack: (b?.attack ?? 0) + characterBaseStats.UNARMED_ATTACK_BONUS,
    defense: b?.defense ?? 0,
    evasion: b?.evasion ?? 0,
    magicDefense: b?.magicDefense ?? 0,
    magicEvasion: b?.magicEvasion ?? 0,
  };
}

export function RosterStats({ character }: { character: Character }) {
  const forceUpdate = useForceUpdate();
  const stats = character.stats;
  const [base, setBase] = useState(() => defaultBase(character.jobId));

  function setBaseField(key: keyof ReturnType<typeof defaultBase>) {
    return (v: number) => setBase((b) => ({ ...b, [key]: v }));
  }

  return (
    <div>
      <WarningBanner>
        These bonus values are what's actually stored in the save — pushing them far past normal
        gear bonuses can produce stats the game doesn't expect and may behave oddly in-game. The
        "Base" numbers are a local reference only (from a static stat table, not the save) and are
        never written to the file; edit them freely if you know a more accurate value for this
        character.
      </WarningBanner>

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
          <StatEditor
            label="Max HP"
            base={base.hp}
            bonus={stats.additionalMaxHp}
            onBaseChange={setBaseField("hp")}
            onBonusChange={(v) => {
              stats.additionalMaxHp = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Max MP"
            base={base.mp}
            bonus={stats.additionalMaxMp}
            onBaseChange={setBaseField("mp")}
            onBonusChange={(v) => {
              stats.additionalMaxMp = v;
              forceUpdate();
            }}
          />
        </div>
      </div>

      <div class={styles.section}>
        <p class={styles.sectionTitle}>Attributes</p>
        <div class={styles.grid}>
          <StatEditor
            label="Power (Strength)"
            base={base.strength}
            bonus={stats.additionalPower}
            onBaseChange={setBaseField("strength")}
            onBonusChange={(v) => {
              stats.additionalPower = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Vitality (Stamina)"
            base={base.stamina}
            bonus={stats.additionalVitality}
            onBaseChange={setBaseField("stamina")}
            onBonusChange={(v) => {
              stats.additionalVitality = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Agility (Speed)"
            base={base.speed}
            bonus={stats.additionalAgility}
            onBaseChange={setBaseField("speed")}
            onBonusChange={(v) => {
              stats.additionalAgility = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Magic"
            base={base.magic}
            bonus={stats.additionalMagic}
            onBaseChange={setBaseField("magic")}
            onBonusChange={(v) => {
              stats.additionalMagic = v;
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
        <p class={styles.sectionNote}>
          Intelligence/Spirit/Luck have no known base-stat equivalent yet (not part of the visible
          FF6PR stat screen we've cross-referenced) — shown as raw bonus values only.
        </p>
      </div>

      <div class={styles.section}>
        <p class={styles.sectionTitle}>Battle</p>
        <div class={styles.grid}>
          <StatEditor
            label="Attack"
            base={base.attack}
            bonus={stats.additionalAttack}
            onBaseChange={setBaseField("attack")}
            onBonusChange={(v) => {
              stats.additionalAttack = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Defense"
            base={base.defense}
            bonus={stats.additionalDefense}
            onBaseChange={setBaseField("defense")}
            onBonusChange={(v) => {
              stats.additionalDefense = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Magic defense"
            base={base.magicDefense}
            bonus={stats.additionalMagicDefense}
            onBaseChange={setBaseField("magicDefense")}
            onBonusChange={(v) => {
              stats.additionalMagicDefense = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Evasion rate"
            base={base.evasion}
            bonus={stats.additionalEvasionRate}
            onBaseChange={setBaseField("evasion")}
            onBonusChange={(v) => {
              stats.additionalEvasionRate = v;
              forceUpdate();
            }}
          />
          <StatEditor
            label="Magic evasion rate"
            base={base.magicEvasion}
            bonus={stats.additionalMagicEvasionRate}
            onBaseChange={setBaseField("magicEvasion")}
            onBonusChange={(v) => {
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
        <p class={styles.sectionNote}>
          Attack's base includes a +{characterBaseStats.UNARMED_ATTACK_BONUS} unarmed-combat
          constant confirmed against 2 characters so far — treat as a working hypothesis, not as
          certain as the other stats here.
        </p>
      </div>
    </div>
  );
}
