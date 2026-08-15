import { describe, test, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { decryptSave, encryptSave } from "./saveCodec.ts";
import { unwrap, rewrap, type JsonObject } from "./nestedJson.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const gamesavesDir = path.join(projectRoot, "gamesaves");

// The one real save directory the user dropped in for testing (name varies:
// "<date> <steam id>"), containing 14 encrypted slot/meta files with no
// file extension.
const saveDir = path.join(gamesavesDir, readdirSync(gamesavesDir)[0]);
const saveFilenames = readdirSync(saveDir);

interface DecodedFile {
  filename: string;
  path: string;
  originalBytes: Uint8Array;
  json: string;
  parsed: unknown;
}

// Decrypt every real save file once up front (top-level await, ESM test
// file) so both the per-file round-trip tests and the "find the main slot
// file" logic share the same decoded data instead of re-decrypting.
const decoded: DecodedFile[] = await Promise.all(
  saveFilenames.map(async (filename): Promise<DecodedFile> => {
    const filePath = path.join(saveDir, filename);
    const originalBytes = new Uint8Array(readFileSync(filePath));
    const json = await decryptSave(originalBytes);
    let parsed: unknown = undefined;
    try {
      parsed = JSON.parse(json);
    } catch {
      // handled by the "decrypts to valid UTF-8 JSON" test below
    }
    return { filename, path: filePath, originalBytes, json, parsed };
  }),
);

const mainSlotFile = decoded.find((f) => {
  const obj = f.parsed as JsonObject | undefined;
  return !!obj && typeof obj === "object" && "id" in obj && "pictureData" in obj;
});

describe("save codec, against real save data", () => {
  test(`found save files in ${saveDir}`, () => {
    expect(saveFilenames.length).toBeGreaterThan(0);
  });

  for (const file of decoded) {
    describe(`file: ${file.filename}`, () => {
      test("decrypts to valid UTF-8 JSON", () => {
        expect(file.parsed).not.toBeUndefined();
      });

      // NOT a byte-identical ciphertext comparison against the original
      // file: raw DEFLATE isn't canonical across implementations (.NET's
      // DeflateStream vs Node/browser zlib can compress the same bytes to
      // different-but-valid streams), so re-encrypting unchanged JSON
      // legitimately produces different ciphertext bytes. The real
      // invariant is that our own encrypt/decrypt pair round-trips the
      // decrypted JSON exactly.
      test("unchanged round-trip preserves JSON exactly", async () => {
        const reEncrypted = await encryptSave(file.json);
        const roundTrippedJson = await decryptSave(reEncrypted);
        expect(roundTrippedJson).toBe(file.json);
      });
    });
  }
});

describe("edit round-trip on the main slot file", () => {
  test("a real save slot file (id + pictureData) was found", () => {
    expect(mainSlotFile).not.toBeUndefined();
  });

  test("decrypt -> edit userData.owendGil -> re-encrypt -> decrypt survives intact", async () => {
    if (!mainSlotFile) throw new Error("no main slot file found (id + pictureData)");

    const save = JSON.parse(mainSlotFile.json) as JsonObject;

    const userData = unwrap(save, "userData") as JsonObject;
    expect(userData.ownedCharacterList).toBeDefined();
    expect(userData.ownedMagicStoneList).toBeDefined();
    expect(userData.normalOwnedItemList).toBeDefined();

    const originalGil = userData.owendGil;
    expect(typeof originalGil).toBe("number");
    const editedGil = (originalGil as number) + 12345;
    userData.owendGil = editedGil;

    rewrap(save, "userData");
    const editedJson = JSON.stringify(save);

    const reEncrypted = await encryptSave(editedJson);
    const roundTrippedJson = await decryptSave(reEncrypted);
    const roundTripped = JSON.parse(roundTrippedJson) as JsonObject;
    const roundTrippedUserData = unwrap(roundTripped, "userData") as JsonObject;

    const originalUserData = unwrap(JSON.parse(mainSlotFile.json) as JsonObject, "userData") as JsonObject;

    expect(roundTrippedUserData.owendGil).toBe(editedGil);
    expect(roundTrippedUserData.ownedCharacterList).toEqual(originalUserData.ownedCharacterList);
    expect(roundTripped.timeStamp).toBe(save.timeStamp);
  });
});
