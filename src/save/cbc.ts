import { makeCipher } from "./rijndael256.ts";
import { BLOCK_SIZE } from "./constants.ts";

// Plaintext/ciphertext must already be block-aligned — padding is this
// format's own custom zero-pad (padding.ts), applied *before* encryption
// and stripped *after* decryption, never delegated to the library's own
// auto-pad-on-encrypt behavior. That keeps padding fully spec-driven instead
// of silently depending on library internals matching our assumptions.

export function cbcEncrypt(plaintext: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
  assertBlockAligned("plaintext", plaintext);
  assertBlockSize("IV", iv);
  const cipher = makeCipher(key, "cbc");
  return new Uint8Array(cipher.encrypt(plaintext, BLOCK_SIZE, iv));
}

export function cbcDecrypt(ciphertext: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
  assertBlockAligned("ciphertext", ciphertext);
  assertBlockSize("IV", iv);
  const cipher = makeCipher(key, "cbc");
  return new Uint8Array(cipher.decrypt(ciphertext, BLOCK_SIZE, iv));
}

function assertBlockAligned(label: string, data: Uint8Array): void {
  if (data.length % BLOCK_SIZE !== 0) {
    throw new Error(`${label} length (${data.length}) must be a multiple of ${BLOCK_SIZE} bytes`);
  }
}

function assertBlockSize(label: string, data: Uint8Array): void {
  if (data.length !== BLOCK_SIZE) {
    throw new Error(`${label} must be exactly ${BLOCK_SIZE} bytes, got ${data.length}`);
  }
}
