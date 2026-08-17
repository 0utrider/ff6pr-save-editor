import type { JsonObject } from "../save/nestedJson.ts";
import { unwrap, rewrap } from "../save/nestedJson.ts";

export interface AbilityEntry {
  abilityId: number;
  contentId: number;
  skillLevel: number;
}

export const MagicCategoryKey = 7;
// General default offset for skill-list abilities (Bushido/Blitz/Lore all
// use +330 — see their data tables). Rages are the one exception (+168),
// so callers of learnSkill must pass rages.ContentIdOffset explicitly.
export const ContentIdOffset = 330;

interface CategoryWrapper {
  target: string[];
}

// abilityList/abilityDictionary both hold JSON-string-encoded entries
// (nested-json pattern), and abilityDictionary nests a further level: each
// category's `values[i]` is itself a JSON string wrapping ANOTHER
// {target: [...]} whose entries are also JSON strings. This class parses
// and re-serializes those strings directly rather than routing every level
// through nestedJson.unwrap/rewrap, since the shapes here are ad hoc arrays
// of strings rather than named object fields.
export class CharacterAbilities {
  private readonly abilityListNode: JsonObject;
  private readonly abilityDictNode: JsonObject;
  private readonly characterNode: JsonObject;

  constructor(abilityListNode: JsonObject, abilityDictNode: JsonObject, characterNode: JsonObject) {
    this.abilityListNode = abilityListNode;
    this.abilityDictNode = abilityDictNode;
    this.characterNode = characterNode;
  }

  private get listTarget(): string[] {
    return this.abilityListNode.target as string[];
  }

  allAbilities(): AbilityEntry[] {
    return this.listTarget.map((s) => JSON.parse(s) as AbilityEntry);
  }

  // Rages, Lores, Bushidos, Blitzes, Dances — abilityList-only, different
  // offsets per type (see Data/*.cs id ranges).
  learnedSkillsInRange(fromId: number, toId: number): AbilityEntry[] {
    return this.allAbilities().filter(
      (a) => a.abilityId >= fromId && a.abilityId <= toId && a.skillLevel >= 100,
    );
  }

  learnedMagic(): AbilityEntry[] {
    const cat = this.findCategory(MagicCategoryKey);
    return cat ? cat.target.map((s) => JSON.parse(s) as AbilityEntry) : [];
  }

  knowsAbility(abilityId: number): boolean {
    return this.allAbilities().some((a) => a.abilityId === abilityId && a.skillLevel >= 100);
  }

  learnSkill(abilityId: number, contentIdOffset: number): void {
    const target = this.listTarget;
    for (let i = 0; i < target.length; i++) {
      const ab = JSON.parse(target[i]) as AbilityEntry;
      if (ab.abilityId === abilityId) {
        ab.skillLevel = 100;
        target[i] = JSON.stringify(ab);
        return;
      }
    }
    target.push(JSON.stringify({ abilityId, contentId: abilityId + contentIdOffset, skillLevel: 100 }));
  }

  forgetSkill(abilityId: number): void {
    this.forgetEverywhere(abilityId);
  }

  // Clears every record of an ability the character owns.
  //
  // Setting skillLevel to 0 in abilityList is NOT enough on its own: the
  // game also keeps learned abilities in abilityDictionary (merged in, not
  // rebuilt) and in two ownership-order arrays on the character node. All
  // three places must be scrubbed or the ability stays visible in-game
  // after being "unlearned" in the editor — this was reported exactly this
  // way for Rages (tick added it, untick didn't remove it; issue #8).
  //
  // Dictionary categories are scrubbed across ALL of them, not one known
  // key: skill category ids (unlike Magic's 7) are not documented.
  forgetEverywhere(abilityId: number): void {
    let contentId = -1;

    const target = this.listTarget;
    for (let i = 0; i < target.length; i++) {
      const ab = JSON.parse(target[i]) as AbilityEntry;
      if (ab.abilityId !== abilityId) continue;
      contentId = ab.contentId;
      ab.skillLevel = 0;
      target[i] = JSON.stringify(ab);
      break;
    }

    this.removeFromAllDictionaryCategories(abilityId);
    if (contentId < 0) contentId = abilityId + ContentIdOffset;
    this.removeFromOwnershipOrder(contentId);
  }

  learnAbility(abilityId: number, categoryKey: number, contentId = -1): void {
    if (contentId < 0) contentId = abilityId + ContentIdOffset;

    const target = this.listTarget;
    let existing = false;
    for (let i = 0; i < target.length; i++) {
      const ab = JSON.parse(target[i]) as AbilityEntry;
      if (ab.abilityId === abilityId) {
        ab.skillLevel = 100;
        target[i] = JSON.stringify(ab);
        existing = true;
        break;
      }
    }
    if (!existing) {
      target.push(JSON.stringify({ abilityId, contentId, skillLevel: 100 }));
    }

    let cat = this.findCategory(categoryKey);
    if (!cat) {
      const keys = this.abilityDictNode.keys as number[];
      const values = this.abilityDictNode.values as string[];
      keys.push(categoryKey);
      values.push(JSON.stringify({ target: [] }));
      cat = { index: keys.length - 1, target: [] };
    }
    const inDict = cat.target.some((s) => (JSON.parse(s) as AbilityEntry).abilityId === abilityId);
    if (!inDict) {
      cat.target.push(JSON.stringify({ abilityId, contentId, skillLevel: 100 }));
      const values = this.abilityDictNode.values as string[];
      values[cat.index] = JSON.stringify({ target: cat.target });
    }
  }

  // categoryKey is unused: forgetEverywhere scrubs all categories, which
  // also covers abilities recorded under an unexpected one.
  forgetAbility(abilityId: number, _categoryKey: number): void {
    this.forgetEverywhere(abilityId);
  }

  learnSpell(spellId: number): void {
    this.learnAbility(spellId, MagicCategoryKey);
  }

  forgetSpell(spellId: number): void {
    this.forgetAbility(spellId, MagicCategoryKey);
  }

  private findCategory(key: number): { index: number; target: string[] } | undefined {
    const keys = this.abilityDictNode.keys as number[];
    const values = this.abilityDictNode.values as string[];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === key) {
        const catObj = JSON.parse(values[i]) as CategoryWrapper;
        return { index: i, target: catObj.target };
      }
    }
    return undefined;
  }

  private removeFromAllDictionaryCategories(abilityId: number): void {
    const keys = this.abilityDictNode.keys as number[];
    const values = this.abilityDictNode.values as string[];
    for (let i = 0; i < keys.length; i++) {
      const catObj = JSON.parse(values[i]) as CategoryWrapper;
      const before = catObj.target.length;
      catObj.target = catObj.target.filter((s) => (JSON.parse(s) as AbilityEntry).abilityId !== abilityId);
      if (catObj.target.length !== before) {
        values[i] = JSON.stringify(catObj);
      }
    }
  }

  // additionOrderOwnedAbilityIds/sortOrderOwnedAbilityIds hold contentIds
  // (not abilityIds) of abilities the character owns, in acquisition and
  // sort order. These go through nestedJson.unwrap, which mutates
  // characterNode[key] in place — so unlike the dictionary categories
  // above, we must unconditionally rewrap even when nothing was removed,
  // or the field is left as a live object instead of a JSON string.
  private removeFromOwnershipOrder(contentId: number): void {
    for (const key of ["additionOrderOwnedAbilityIds", "sortOrderOwnedAbilityIds"]) {
      if (!(key in this.characterNode)) continue;
      const node = unwrap(this.characterNode, key) as JsonObject;
      const list = node.target as number[] | undefined;
      if (!list) continue;
      node.target = list.filter((id) => id !== contentId);
      rewrap(this.characterNode, key);
    }
  }

  commit(): void {
    // Re-point both slots at the live nodes before stringifying — see the
    // matching comment in characterStats.ts: save() can run more than once
    // per loaded file, and after the first run these slots already hold
    // strings, so rewrapping them directly would double-encode instead of
    // capturing the current edits.
    this.characterNode.abilityList = this.abilityListNode;
    rewrap(this.characterNode, "abilityList");
    this.characterNode.abilityDictionary = this.abilityDictNode;
    rewrap(this.characterNode, "abilityDictionary");
  }
}
