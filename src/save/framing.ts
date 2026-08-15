const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

export function stripBom(bytes: Uint8Array): Uint8Array {
  if (bytes.length >= 3 && bytes[0] === BOM[0] && bytes[1] === BOM[1] && bytes[2] === BOM[2]) {
    return bytes.subarray(3);
  }
  return bytes;
}

export function addBom(bytes: Uint8Array): Uint8Array {
  return concatBytes(BOM, bytes);
}

export function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

// Base64 decode is padding-tolerant: the file on disk sometimes has trailing
// `=` stripped, so re-pad to a multiple of 4 before decoding.
export function base64Decode(text: string): Uint8Array {
  const trimmed = text.trim();
  const padded = trimmed + "=".repeat((4 - (trimmed.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// The game's own parser rejects unpadded base64 on read, so always keep `=`.
export function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
