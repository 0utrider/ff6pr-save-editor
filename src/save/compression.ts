// The game writes raw DEFLATE (no zlib header/checksum). CompressionStream /
// DecompressionStream with 'deflate-raw' matches exactly, and is available
// as a global in both browsers and Node 18+ — no polyfill needed either side.

export async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  // Re-wrap in a fresh ArrayBuffer-backed copy: a subarray view (e.g. from
  // stripBom) can carry a wider ArrayBufferLike generic than Blob accepts.
  const stream = new Blob([new Uint8Array(bytes)])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(bytes)])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
