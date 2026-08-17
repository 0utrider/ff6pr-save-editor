import type { JsonObject } from "../save/nestedJson.ts";
import { unwrap, rewrap } from "../save/nestedJson.ts";
import { decryptSave, encryptSave } from "../save/saveCodec.ts";
import { UserData } from "./userData.ts";
import { VeldtEncounters } from "./veldtEncounters.ts";

export class SaveFile {
  readonly top: JsonObject;
  readonly userData: UserData;
  readonly mapData: JsonObject | null;
  readonly veldt: VeldtEncounters | null;

  private constructor(top: JsonObject, userData: UserData, mapData: JsonObject | null, veldt: VeldtEncounters | null) {
    this.top = top;
    this.userData = userData;
    this.mapData = mapData;
    this.veldt = veldt;
  }

  get slotId(): number {
    return (this.top.id as number) ?? -1;
  }

  get timestamp(): string | undefined {
    return this.top.timeStamp as string | undefined;
  }

  // In seconds — see UserData.playTime for why this reads from userData
  // rather than the top-level field HANDOFF documented.
  get playTime(): number {
    return this.userData.playTime;
  }

  isSlotFile(): boolean {
    return "id" in this.top && "pictureData" in this.top;
  }

  static async load(fileBytes: Uint8Array): Promise<SaveFile> {
    const json = await decryptSave(fileBytes);
    const top = JSON.parse(json) as JsonObject;
    const userDataNode = unwrap(top, "userData") as JsonObject;
    const userData = new UserData(userDataNode);

    let mapData: JsonObject | null = null;
    let veldt: VeldtEncounters | null = null;
    if ("mapData" in top) {
      mapData = unwrap(top, "mapData") as JsonObject;
      veldt = new VeldtEncounters(mapData);
    }

    return new SaveFile(top, userData, mapData, veldt);
  }

  // Returns the encrypted bytes ready to write out. No filesystem write API
  // in the browser — the UI triggers a Blob download with these bytes
  // rather than saving in place.
  async save(): Promise<Uint8Array> {
    // Re-point both slots at the live nodes before stringifying — save()
    // can be called more than once per loaded file (download, keep
    // editing, download again), and after the first call these slots
    // already hold strings, so rewrapping them directly would double- (or
    // triple-, etc.) encode instead of capturing the current edits. This
    // was a real, reproducible bug: it bloats the file and crashes the
    // game on load.
    this.userData.commit();
    this.top.userData = this.userData.node;
    rewrap(this.top, "userData");

    if (this.mapData) {
      this.veldt?.commit();
      this.top.mapData = this.mapData;
      rewrap(this.top, "mapData");
    }

    const json = JSON.stringify(this.top);
    return encryptSave(json);
  }
}
