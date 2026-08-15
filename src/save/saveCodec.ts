import { stripBom, addBom, base64Decode, base64Encode, concatBytes } from "./framing.ts";
import { inflateRaw, deflateRaw } from "./compression.ts";
import { addZeroPadding, stripZeroPadding } from "./padding.ts";
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
  const inflated = await inflateSkippingPadding(padded);
  return textDecoder.decode(inflated);
}

// stripZeroPadding's scan-based guess is right the overwhelming majority of
// the time, but it can't distinguish a real trailing zero byte from padding
// when they're contiguous, and over-strips in that case (see padding.ts).
// Real DEFLATE data doesn't parse if truncated even one byte short, so
// treat the guess as a starting point and grow the candidate one byte at a
// time until inflate actually succeeds — self-correcting instead of
// trying to perfectly guess the boundary up front. Stripping is required
// in real browsers (Chromium's DecompressionStream rejects trailing
// garbage after the DEFLATE end marker) — Node's zlib binding is lenient
// about it, which is why this needed a real-browser test to surface.
async function inflateSkippingPadding(padded: Uint8Array): Promise<Uint8Array> {
  const guess = stripZeroPadding(padded);
  for (let len = guess.length; len <= padded.length; len++) {
    try {
      return await inflateRaw(padded.subarray(0, len));
    } catch {
      // Over-stripped into real compressed data — include one more byte.
    }
  }
  throw new Error("decryptSave: could not locate the end of the compressed data after removing padding");
}

export async function encryptSave(json: string): Promise<Uint8Array> {
  const utf8 = textEncoder.encode(json);
  const deflated = await deflateRaw(utf8);
  const padded = addZeroPadding(deflated);
  const ciphertext = cbcEncrypt(padded, SAVE_KEY, SAVE_IV);
  const base64Bytes = textEncoder.encode(base64Encode(ciphertext));
  return concatBytes(addBom(base64Bytes), CRLF);
}
