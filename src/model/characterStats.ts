import type { JsonObject } from "../save/nestedJson.ts";
import { rewrap } from "../save/nestedJson.ts";

// Wraps a character's `parameter` node. Field names keep the save's own
// "addtional*" (sic) spelling verbatim — "Ability" in this vocabulary means
// "Magic" everywhere (addtionalAbilityDefense = magic defense).
export class CharacterStats {
  readonly node: JsonObject;
  private readonly characterNode: JsonObject;

  constructor(node: JsonObject, characterNode: JsonObject) {
    this.node = node;
    this.characterNode = characterNode;
  }

  private get(key: string): number {
    return (this.node[key] as number) ?? 0;
  }

  private set(key: string, value: number): void {
    this.node[key] = value;
  }

  get currentHp(): number {
    return this.get("currentHP");
  }
  set currentHp(v: number) {
    this.set("currentHP", v);
  }

  get currentMp(): number {
    return this.get("currentMP");
  }
  set currentMp(v: number) {
    this.set("currentMP", v);
  }

  get additionalLevel(): number {
    return this.get("addtionalLevel");
  }
  set additionalLevel(v: number) {
    this.set("addtionalLevel", v);
  }

  get additionalMaxHp(): number {
    return this.get("addtionalMaxHp");
  }
  set additionalMaxHp(v: number) {
    this.set("addtionalMaxHp", v);
  }

  get additionalMaxMp(): number {
    return this.get("addtionalMaxMp");
  }
  set additionalMaxMp(v: number) {
    this.set("addtionalMaxMp", v);
  }

  get additionalPower(): number {
    return this.get("addtionalPower");
  }
  set additionalPower(v: number) {
    this.set("addtionalPower", v);
  }

  get additionalVitality(): number {
    return this.get("addtionalVitality");
  }
  set additionalVitality(v: number) {
    this.set("addtionalVitality", v);
  }

  get additionalAgility(): number {
    return this.get("addtionalAgility");
  }
  set additionalAgility(v: number) {
    this.set("addtionalAgility", v);
  }

  get additionalIntelligence(): number {
    return this.get("addtionalIntelligence");
  }
  set additionalIntelligence(v: number) {
    this.set("addtionalIntelligence", v);
  }

  get additionalSpirit(): number {
    return this.get("addtionalSpirit");
  }
  set additionalSpirit(v: number) {
    this.set("addtionalSpirit", v);
  }

  get additionalAttack(): number {
    return this.get("addtionalAttack");
  }
  set additionalAttack(v: number) {
    this.set("addtionalAttack", v);
  }

  get additionalDefense(): number {
    return this.get("addtionalDefense");
  }
  set additionalDefense(v: number) {
    this.set("addtionalDefense", v);
  }

  get additionalMagic(): number {
    return this.get("addtionalMagic");
  }
  set additionalMagic(v: number) {
    this.set("addtionalMagic", v);
  }

  get additionalLuck(): number {
    return this.get("addtionalLuck");
  }
  set additionalLuck(v: number) {
    this.set("addtionalLuck", v);
  }

  get additionalAccuracyRate(): number {
    return this.get("addtionalAccuracyRate");
  }
  set additionalAccuracyRate(v: number) {
    this.set("addtionalAccuracyRate", v);
  }

  get additionalEvasionRate(): number {
    return this.get("addtionalEvasionRate");
  }
  set additionalEvasionRate(v: number) {
    this.set("addtionalEvasionRate", v);
  }

  get additionalCriticalRate(): number {
    return this.get("addtionalCriticalRate");
  }
  set additionalCriticalRate(v: number) {
    this.set("addtionalCriticalRate", v);
  }

  get additionalMagicDefense(): number {
    return this.get("addtionalAbilityDefense");
  }
  set additionalMagicDefense(v: number) {
    this.set("addtionalAbilityDefense", v);
  }

  get additionalMagicEvasionRate(): number {
    return this.get("addtionalAbilityEvasionRate");
  }
  set additionalMagicEvasionRate(v: number) {
    this.set("addtionalAbilityEvasionRate", v);
  }

  commit(): void {
    rewrap(this.characterNode, "parameter");
  }
}
