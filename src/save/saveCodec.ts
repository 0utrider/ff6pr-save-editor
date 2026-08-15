import { stripBom, addBom, base64Decode, base64Encode, concatBytes } from "./framing.ts";
import { inflateRaw, deflateRaw } from "./compression.ts";
import { addZeroPadding } from "./padding.ts";
import { cbcEncrypt, cbcDecrypt } from "./cbc.ts";
import { SAVE_KEY, SAVE_IV } from "./constants.ts";

const textDecoder = new TextDecoder("utf-8");
const textEncoder = new TextEncoder();
const CRLF = new Uint8Array([0x0d, 0x0a]);

export async function decryptSave(fileBytes: Uint8Array): Promise<string> {
  const stripped = stripBom(fileBytes);
  const base64Text = textDecoder.decode(stripped);
  const ciphertext = base64Decode(base64Text);
  const padded = cbcDecrypt(ciphertext, SAVE_KEY, SAVE_IV);
  // No explicit zero-padding strip — see padding.ts for why. DEFLATE is
  // self-terminating, so inflating the still-padded buffer is correct and
  // avoids the ambiguous-trailing-zero-byte edge case.
  const inflated = await inflateRaw(padded);
  return textDecoder.decode(inflated);
}

export async function encryptSave(json: string): Promise<Uint8Array> {
  const utf8 = textEncoder.encode(json);
  const deflated = await deflateRaw(utf8);
  const padded = addZeroPadding(deflated);
  const ciphertext = cbcEncrypt(padded, SAVE_KEY, SAVE_IV);
  const base64Bytes = textEncoder.encode(base64Encode(ciphertext));
  return concatBytes(addBom(base64Bytes), CRLF);
}
