const EMPTY_SALT = new Uint8Array(0);

/**
 * HKDF-SHA256 (RFC 5869) with an empty salt, which the RFC defines as HashLen zero bytes.
 * libsodium.js does not export its HKDF functions, so this is WebCrypto.
 */
export async function hkdfSha256(inputKey: Uint8Array, info: string, length: number): Promise<Uint8Array> {
  // WebCrypto wants a plain ArrayBuffer view; the copy is wiped as soon as the key is imported.
  const raw = new Uint8Array(inputKey);
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveBits"]);
  } finally {
    raw.fill(0);
  }
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: EMPTY_SALT, info: new TextEncoder().encode(info) },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}
