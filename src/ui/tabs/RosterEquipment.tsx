import { useMemo } from "preact/hooks";
import { Dropdown, type DropdownOption } from "../components/Dropdown.tsx";
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

const WEAPON_OPTIONS = optionsFor("Weapon", equipmentData.EmptyWeaponShieldId);
const SHIELD_OPTIONS = optionsFor("Shield", equipmentData.EmptyWeaponShieldId);
const HELMET_OPTIONS = optionsFor("Helmet", equipmentData.EmptyHelmetId);
const ARMOR_OPTIONS = optionsFor("Armor", equipmentData.EmptyArmorId);
const RELIC_OPTIONS = optionsFor("Relic", equipmentData.EmptyRelicId);

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

  const slots: Array<{
    key: "weapon" | "shield" | "armor" | "helmet" | "relic1" | "relic2";
    label: string;
    options: DropdownOption[];
  }> = [
    { key: "weapon", label: "Weapon", options: WEAPON_OPTIONS },
    { key: "shield", label: "Shield", options: SHIELD_OPTIONS },
    { key: "helmet", label: "Helmet", options: HELMET_OPTIONS },
    { key: "armor", label: "Armor", options: ARMOR_OPTIONS },
    { key: "relic1", label: "Relic 1", options: RELIC_OPTIONS },
    { key: "relic2", label: "Relic 2", options: RELIC_OPTIONS },
  ];

  return (
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
  );
}
