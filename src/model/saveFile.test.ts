import { describe, test, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SaveFile } from "./saveFile.ts";
import * as rages from "../data/rages.ts";
import * as characterRoster from "../data/characterRoster.ts";
import * as levelGrowth from "../data/levelGrowth.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const gamesavesDir = path.join(projectRoot, "gamesaves");
const saveDir = path.join(gamesavesDir, readdirSync(gamesavesDir)[0]);
const saveFilenames = readdirSync(saveDir);

// Find the main slot file (id + pictureData) among the real save files.
const mainSlotFile = await (async () => {
  for (const filename of saveFilenames) {
    const bytes = new Uint8Array(readFileSync(path.join(saveDir, filename)));
    try {
      const save = await SaveFile.load(bytes);
      if (save.isSlotFile()) return { filename, bytes };
    } catch {
      // not a valid save-shaped JSON file (or this file isn't a slot file) — skip
    }
  }
  return null;
})();

describe("SaveFile, against real save data", () => {
  test("a main slot file (id + pictureData) was found", () => {
    expect(mainSlotFile).not.toBeNull();
  });

  test("loads characters with roster-resolvable ids/jobIds", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    expect(save.userData.characters.length).toBeGreaterThan(0);
    // ids 21/31 are documented as "gaps" in characterRoster.ts, but real
    // save data has shown id 21 CAN appear as an extra, near-empty "Mog"
    // entry (empty equipment/abilities, jobId 11) — a game-internal
    // padding/template row, not a playable roster slot. Tolerate exactly
    // that instead of assuming every id resolves.
    for (const c of save.userData.characters) {
      const entry = characterRoster.forId(c.id);
      if (!entry) {
        expect([21, 31], `character id ${c.id} not in characterRoster and not a known gap`).toContain(c.id);
      }
    }
  });

  test("unchanged round-trip through the model layer is structurally equal", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    const beforeJson = JSON.stringify(save.top);

    const reEncrypted = await save.save();
    const reloaded = await SaveFile.load(reEncrypted);
    const afterJson = JSON.stringify(reloaded.top);

    expect(JSON.parse(afterJson)).toEqual(JSON.parse(beforeJson));
  });

  test("Rage learn/forget on Gau scrubs abilityList, all abilityDictionary categories, and both ownership-order arrays", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    const gau = save.userData.characters.find((c) => c.jobId === characterRoster.SkillOwnerJobId.Rages);
    expect(gau, "no Gau (jobId 12) in this save").toBeDefined();
    if (!gau) return;

    const rageId = rages.All[0].id; // "Guard", id 800 — always valid
    const contentId = rageId + rages.ContentIdOffset;

    gau.abilities.learnSkill(rageId, rages.ContentIdOffset);
    expect(gau.abilities.knowsAbility(rageId)).toBe(true);

    gau.abilities.forgetEverywhere(rageId);
    expect(gau.abilities.knowsAbility(rageId)).toBe(false);

    // Not just abilityList — abilityDictionary (all categories) and both
    // ownership-order arrays must also be clear (the exact bug from issue #8).
    const rawNode = gau.node as Record<string, unknown>;
    const dict = rawNode.abilityDictionary as { keys: number[]; values: string[] };
    for (const v of dict.values) {
      const cat = JSON.parse(v) as { target: string[] };
      for (const s of cat.target) {
        expect((JSON.parse(s) as { abilityId: number }).abilityId).not.toBe(rageId);
      }
    }
    for (const key of ["additionOrderOwnedAbilityIds", "sortOrderOwnedAbilityIds"]) {
      if (!(key in rawNode)) continue;
      // forgetEverywhere rewraps this field back into a JSON string.
      const list = (JSON.parse(rawNode[key] as string) as { target: number[] }).target;
      expect(list).not.toContain(contentId);
    }
  });

  test("Equipment.commit syncs slot count to the deduped inventory total", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    const character = save.userData.characters[0];
    const itemId = 94; // Dagger — a real weapon id

    save.userData.normalInventory.set(0, itemId, 3);
    character.equipment.weapon = itemId;

    character.equipment.commit();

    // commit() rewraps equipmentList back into a JSON string.
    const equipNode = JSON.parse(character.node.equipmentList as string) as { keys: number[]; values: string[] };
    const weaponIdx = equipNode.keys.indexOf(1); // WeaponKey
    const weaponEntry = JSON.parse(equipNode.values[weaponIdx]) as { contentId: number; count: number };
    expect(weaponEntry.contentId).toBe(itemId);
    expect(weaponEntry.count).toBe(3);
  });

  test("Inventory dedupes stacks and drops crash item ids on commit", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    const inv = save.userData.normalInventory;

    inv.stacks = [
      { itemId: 5, count: 40 },
      { itemId: 5, count: 90 }, // duplicate — should merge and cap at 99
      { itemId: 184, count: 1 }, // crash id — should be dropped
      { itemId: 243, count: 1 }, // crash id — should be dropped
      { itemId: 0, count: 5 }, // zero id — should be dropped
    ];

    inv.commit();

    // commit() rewraps normalOwnedItemList back into a JSON string.
    const wrapper = JSON.parse(
      (save.userData.node as Record<string, unknown>).normalOwnedItemList as string,
    ) as { target: string[] };
    const parsed = wrapper.target.map((s) => JSON.parse(s) as { contentId: number; count: number });
    expect(parsed.find((p) => p.contentId === 5)?.count).toBe(99);
    expect(parsed.some((p) => p.contentId === 184)).toBe(false);
    expect(parsed.some((p) => p.contentId === 243)).toBe(false);
    expect(parsed.some((p) => p.contentId === 0)).toBe(false);
  });

  test("Character.setLevel(50) sets currentExp to match levelGrowth", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    const character = save.userData.characters[0];

    character.setLevel(50);

    expect(character.currentExp).toBe(levelGrowth.expForLevel(50));
    expect(character.stats.additionalLevel).toBe(50);
  });

  test("save() is idempotent — repeated calls on the same instance don't double-wrap nested JSON", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    // Regression test for a real bug: downloading, making another edit, and
    // downloading again (same SaveFile instance, no reload in between) used
    // to re-stringify already-stringified fields (userData, mapData,
    // parameter, abilityList, abilityDictionary, ownedCharacterList,
    // ownedMagicStoneList) on every extra save() call. The file grew ~1.5x
    // per extra save and crashed the game on loading the menu.
    const save = await SaveFile.load(mainSlotFile.bytes);

    const out1 = await save.save();
    save.userData.characters[0].stats.additionalPower = 77;
    const out2 = await save.save();
    save.userData.normalInventory.add(9999, 1);
    const out3 = await save.save();

    // Byte size should stay roughly flat across saves, not balloon with
    // each additional call (the bug produced >20% growth per extra save).
    expect(out2.length).toBeLessThan(out1.length * 1.1);
    expect(out3.length).toBeLessThan(out1.length * 1.1);

    // Every intervening edit must still be present in the final file —
    // fixing the double-wrap must not come at the cost of losing edits.
    const reloaded = await SaveFile.load(out3);
    expect(reloaded.userData.characters[0].stats.additionalPower).toBe(77);
    expect(reloaded.userData.normalInventory.stacks.some((s) => s.itemId === 9999)).toBe(true);
  });

  test("Veldt encounters mark-all/clear-all round-trip through save/reload", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found");
    const save = await SaveFile.load(mainSlotFile.bytes);
    if (!save.veldt) return; // this save has no mapData — skip

    save.veldt.markAllSeen();
    expect(save.veldt.encounters.every(Boolean)).toBe(true);

    const bytes = await save.save();
    const reloaded = await SaveFile.load(bytes);
    expect(reloaded.veldt?.encounters.every(Boolean)).toBe(true);

    reloaded.veldt?.clearAll();
    expect(reloaded.veldt?.encounters.every((b) => !b)).toBe(true);
  });
});
