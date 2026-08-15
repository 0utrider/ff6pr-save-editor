// The decrypted plaintext is DEFLATE-compressed data zero-padded up to a
// 32-byte CBC block boundary (required so encryption has a block-aligned
// input — CBC can't operate on a partial block).
//
// This padding MUST be stripped before inflating — verified against a real
// browser (Chromium), not just Node. A previous version of this file
// skipped stripping on the theory that DEFLATE is self-terminating and
// DecompressionStream would just ignore trailing garbage; that held in
// Node's zlib binding but not in Chromium's DecompressionStream, which
// throws on trailing bytes after the real end-of-stream marker (surfaces
// as an opaque "TypeError: Failed to fetch" via Response.arrayBuffer(),
// not a decompression-specific error — misleading unless you trace it back
// with a page.evaluate probe, which is what caught this). Every real save
// in gamesaves/ loads correctly through this stricter path.
//
// The exact-scan algorithm below is ported from HANDOFF.md, verified
// against SaveCrypto.cs. It's bounded to the last 32-byte block, not a
// naive TrimEnd(0) over the whole buffer, which matters: a naive trim
// would eat into legitimate DEFLATE data that happens to end in zero bytes
// further back. It still has one known residual edge case — if the real
// compressed stream's own last byte is legitimately 0x00 immediately
// adjacent to the padding, the scan can't distinguish that byte from
// padding and strips one real byte too many. That ambiguity is inherent to
// a zero-byte padding scheme (not fixable without an out-of-band length,
// which this format doesn't carry) and matches the real game's own
// behavior — not something introduced by this port. saveCodec.ts's
// inflateSkippingPadding treats this function's result as a first guess
// and self-corrects against it by retrying inflate, so the edge case
// doesn't need to be perfectly solved here.

import { BLOCK_SIZE } from "./constants.ts";

export function stripZeroPadding(data: Uint8Array): Uint8Array {
  const minEnd = data.length - BLOCK_SIZE + 1;
  let offset = data.length;
  while (offset > minEnd) {
    offset -= 1;
    if (data[offset] !== 0) {
      return data.subarray(0, offset + 1);
    }
  }
  // Whole last block was zero — keep exactly one byte's worth of margin.
  return data.subarray(0, minEnd);
}

export function addZeroPadding(data: Uint8Array): Uint8Array {
  const count = BLOCK_SIZE - (((data.length + BLOCK_SIZE - 1) % BLOCK_SIZE) + 1);
  if (count === 0) return data;
  const out = new Uint8Array(data.length + count);
  out.set(data, 0);
  return out;
}
