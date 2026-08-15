// Many fields in the save JSON hold a JSON-encoded string instead of a
// nested object (userData, mapData, ownedCharacterList, abilityList, etc.),
// nested multiple levels deep. Every other module leans on this pattern.

export type JsonObject = Record<string, unknown>;

export function unwrap(obj: JsonObject, key: string): unknown {
  const raw = obj[key];
  if (typeof raw !== "string") {
    throw new Error(`nestedJson.unwrap: field "${key}" is not a JSON string (got ${typeof raw})`);
  }
  const parsed = JSON.parse(raw);
  obj[key] = parsed;
  return parsed;
}

export function rewrap(obj: JsonObject, key: string): void {
  obj[key] = JSON.stringify(obj[key]);
}
