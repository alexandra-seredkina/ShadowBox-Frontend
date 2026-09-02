import sodium from "libsodium-wrappers-sumo";

export type Sodium = typeof sodium;

/** libsodium compiles its WebAssembly on first use; every crypto call goes through here. */
export async function loadSodium(): Promise<Sodium> {
  await sodium.ready;
  return sodium;
}

/** API.md §1.3: binary data is base64url without padding. */
export function toBase64Url(lib: Sodium, bytes: Uint8Array): string {
  return lib.to_base64(bytes, lib.base64_variants.URLSAFE_NO_PADDING);
}

export function fromBase64Url(lib: Sodium, text: string): Uint8Array {
  return lib.from_base64(text, lib.base64_variants.URLSAFE_NO_PADDING);
}
