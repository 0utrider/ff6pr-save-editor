// Hardcoded key/IV for the save format's Rijndael-256-CBC layer, verified
// against SaveCrypto.cs. Not a secret in any meaningful sense (it ships in
// the game binary) — just the fixed parameters this format requires.

export const BLOCK_SIZE = 32; // 256-bit block

export const SAVE_KEY = new Uint8Array([
  97, 9, 7, 0, 185, 195, 184, 185, 66, 21, 153, 231, 156, 165, 123, 135, 190,
  169, 50, 211, 121, 123, 173, 118, 99, 237, 77, 222, 10, 148, 60, 197,
]);

export const SAVE_IV = new Uint8Array([
  2, 36, 249, 119, 31, 219, 110, 14, 59, 213, 8, 215, 183, 149, 191, 46, 12,
  189, 23, 105, 66, 104, 10, 99, 123, 18, 188, 98, 115, 219, 46, 187,
]);
