import { useMemo } from "preact/hooks";
import { Dropdown, type DropdownOption } from "../components/Dropdown.tsx";
import { WarningBanner } from "../components/WarningBanner.tsx";
import { useForceUpdate } from "../hooks.ts";
import * as items from "../../data/items.ts";
import * as equipmentData from "../../model/equipment.ts";
import type { Character } from "../../model/character.ts";
import type { Inventory } from "../../model/inventory.ts";
import styles from "./RosterStats.module.css";

function optionsFor(category: items.ItemCategory, emptyId: number): DropdownOption[] {
  return [
    { value: emptyId, label: "(empty)" },
    ...items.Normal.filter((i) => i.category === category).map((i) => ({ value: i.id, label: i.name })),
  ];
}

const SHIELD_ITEMS = items.Normal.filter((i) => i.category === "Shield");
const WEAPON_ITEMS = items.Normal.filter((i) => i.category === "Weapon");
const HELMET_OPTIONS = optionsFor("Helmet", equipmentData.EmptyHelmetId);
const ARMOR_OPTIONS = optionsFor("Armor", equipmentData.EmptyArmorId);
const RELIC_OPTIONS = optionsFor("Relic", equipmentData.EmptyRelicId);

// Genji Glove: lets a character dual-wield a weapon in the off-hand slot
// instead of a shield. Gauntlet: doubles the equipped weapon's power but
// makes the character two-hand it, so the off-hand slot should stay empty.
const GENJI_GLOVE_ID = 308;
const GAUNTLET_ID = 307;

function isWeapon(itemId: number): boolean {
  return items.normalById(itemId)?.category === "Weapon";
}

interface RosterEquipmentProps {
  character: Character;
  inventory: Inventory;
}

export function RosterEquipment({ character, inventory }: RosterEquipmentProps) {
  const forceUpdate = useForceUpdate();
  const equipment = character.equipment;

  // Slot counts are synced to inventory only at commit() time (save), but
  // we still want the qty column to reflect right away if the user also
  // edited inventory — recompute lazily rather than cache.
  const inventoryCount = useMemo(
    () => (itemId: number) => inventory.stacks.filter((s) => s.itemId === itemId).reduce((n, s) => n + s.count, 0),
    [inventory],
  );

  const hasGenjiGlove = equipment.relic1 === GENJI_GLOVE_ID || equipment.relic2 === GENJI_GLOVE_ID;
  const hasGauntlet = equipment.relic1 === GAUNTLET_ID || equipment.relic2 === GAUNTLET_ID;
  const offhandIsEmpty = equipment.shield === equipmentData.EmptyWeaponShieldId;

  const offhandOptions: DropdownOption[] = [
    { value: equipmentData.EmptyWeaponShieldId, label: "(empty)" },
    ...SHIELD_ITEMS.map((i) => ({ value: i.id, label: i.name })),
    ...WEAPON_ITEMS.map((i) => ({ value: i.id, label: `${i.name} (needs Genji Glove)`, disabled: !hasGenjiGlove })),
  ];

  const slots: Array<{
    key: "weapon" | "shield" | "armor" | "helmet" | "relic1" | "relic2";
    label: string;
    options: DropdownOption[];
  }> = [
    { key: "weapon", label: "Weapon", options: optionsFor("Weapon", equipmentData.EmptyWeaponShieldId) },
    { key: "shield", label: "Off-hand", options: offhandOptions },
    { key: "helmet", label: "Helmet", options: HELMET_OPTIONS },
    { key: "armor", label: "Armor", options: ARMOR_OPTIONS },
    { key: "relic1", label: "Relic 1", options: RELIC_OPTIONS },
    { key: "relic2", label: "Relic 2", options: RELIC_OPTIONS },
  ];

  return (
    <div>
      {isWeapon(equipment.shield) && !hasGenjiGlove && (
        <WarningBanner>
          A weapon is equipped off-hand without a Genji Glove in either relic slot — dual-wielding
          needs one. This may not work correctly in-game.
        </WarningBanner>
      )}
      {hasGauntlet && !offhandIsEmpty && (
        <WarningBanner>
          A Gauntlet is equipped, which makes this character two-hand their weapon — the off-hand
          slot should be empty. Having both may not work correctly in-game.
        </WarningBanner>
      )}
      <div class={styles.grid}>
        {slots.map((slot) => (
          <div key={slot.key}>
            <Dropdown
              label={`${slot.label} (${inventoryCount(equipment[slot.key])} in inventory)`}
              value={equipment[slot.key]}
              options={slot.options}
              onChange={(v) => {
                equipment[slot.key] = Number(v);
                forceUpdate();
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
