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

  get playTime(): number {
    return (this.top.playTime as number) ?? 0;
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
    this.userData.commit();
    rewrap(this.top, "userData");

    if (this.mapData) {
      this.veldt?.commit();
      rewrap(this.top, "mapData");
    }

    const json = JSON.stringify(this.top);
    return encryptSave(json);
  }
}
