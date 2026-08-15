// The decrypted plaintext is DEFLATE-compressed data zero-padded up to a
// 32-byte CBC block boundary (required so encryption has a block-aligned
// input — CBC can't operate on a partial block).
//
// On decode we deliberately do NOT try to strip this padding back off
// before inflating. HANDOFF.md documents an exact scan-based strip
// algorithm ("trim trailing zero bytes, but only within the last block"),
// ported and tested here — but it has a real data-corruption edge case:
// when the real compressed stream's own last byte is legitimately 0x00
// (which raw DEFLATE's own trailing bit-alignment padding makes fairly
// common, not rare), the scan can't distinguish that from our added
// padding and eats one real byte too many, truncating the stream and
// making DecompressionStream throw "unexpected end of file". Confirmed by
// testing against real save data — hit on the very first edited file.
//
// DEFLATE is self-terminating (the bitstream's own final-block + end-of-
// block marker tells the decompressor where real data ends), so
// DecompressionStream('deflate-raw') correctly ignores whatever zero
// padding trails after it — verified against all files in gamesaves/.
// Skipping the strip step sidesteps the ambiguity entirely instead of
// trying to out-guess it.

import { BLOCK_SIZE } from "./constants.ts";

export function addZeroPadding(data: Uint8Array): Uint8Array {
  const count = BLOCK_SIZE - (((data.length + BLOCK_SIZE - 1) % BLOCK_SIZE) + 1);
  if (count === 0) return data;
  const out = new Uint8Array(data.length + count);
  out.set(data, 0);
  return out;
}
