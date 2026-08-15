// Adapter over the `rijndael-js` library (MIT licensed, pure JS, no deps).
// Browser's native crypto.subtle only implements AES (Rijndael fixed to a
// 128-bit block) so it can't do this format's 256-bit-block variant.
//
// We only use this library for the raw block permutation via its documented
// 'cbc'-mode API — see cbc.ts, which owns all chaining/padding decisions
// rather than trusting a third-party wrapper's assumptions about them.

import RijndaelBlock from "rijndael-js";
import { BLOCK_SIZE } from "./constants.ts";

export { BLOCK_SIZE };

export function makeCipher(key: Uint8Array, mode: "ecb" | "cbc"): RijndaelBlock {
  if (key.length !== BLOCK_SIZE) {
    throw new Error(`Rijndael-256 key must be ${BLOCK_SIZE} bytes, got ${key.length}`);
  }
  return new RijndaelBlock(key, mode);
}
