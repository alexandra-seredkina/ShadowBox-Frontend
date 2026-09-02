import { z } from "zod";
import { DecryptionFailedError } from "./crypto-errors";
import type { KeyPair } from "./key-pair";
import { fromBase64Url, loadSodium, toBase64Url } from "./sodium";

/** API.md §1.4. */
export const encryptedBlobSchema = z.strictObject({
  v: z.literal(1),
  alg: z.literal("x25519-xchacha20poly1305"),
  sealedKey: z.string().min(1),
  nonce: z.string().min(1),
  ciphertext: z.string().min(1),
});

export type EncryptedBlob = z.infer<typeof encryptedBlobSchema>;

/** Random content key under XChaCha20-Poly1305; the key itself goes into `crypto_box_seal`. */
export async function sealBlob(plaintext: Uint8Array, publicKey: Uint8Array): Promise<EncryptedBlob> {
  const sodium = await loadSodium();
  const contentKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  try {
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, null, null, nonce, contentKey);
    return {
      v: 1,
      alg: "x25519-xchacha20poly1305",
      sealedKey: toBase64Url(sodium, sodium.crypto_box_seal(contentKey, publicKey)),
      nonce: toBase64Url(sodium, nonce),
      ciphertext: toBase64Url(sodium, ciphertext),
    };
  } finally {
    sodium.memzero(contentKey);
  }
}

/** @throws DecryptionFailedError if the blob was not sealed for this key pair or was altered. */
export async function openBlob(blob: EncryptedBlob, keyPair: KeyPair): Promise<Uint8Array> {
  const sodium = await loadSodium();
  try {
    const contentKey = sodium.crypto_box_seal_open(
      fromBase64Url(sodium, blob.sealedKey),
      keyPair.publicKey,
      keyPair.privateKey,
    );
    try {
      return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        fromBase64Url(sodium, blob.ciphertext),
        null,
        fromBase64Url(sodium, blob.nonce),
        contentKey,
      );
    } finally {
      sodium.memzero(contentKey);
    }
  } catch (error) {
    throw new DecryptionFailedError({ cause: error });
  }
}

/** Metadata (alias labels, folder names, previews) is UTF-8 JSON inside the blob. */
export async function sealJson(value: unknown, publicKey: Uint8Array): Promise<EncryptedBlob> {
  return sealBlob(new TextEncoder().encode(JSON.stringify(value)), publicKey);
}

/** The caller validates the result with its own schema. */
export async function openJson(blob: EncryptedBlob, keyPair: KeyPair): Promise<unknown> {
  const plaintext = await openBlob(blob, keyPair);
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext));
}
