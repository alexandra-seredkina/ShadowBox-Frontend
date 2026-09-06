import { z } from "zod";
import { DecryptionFailedError } from "./crypto-errors";
import { fromBase64Url, loadSodium, toBase64Url } from "./sodium";

export type KeyPair = {
  readonly publicKey: Uint8Array;
  readonly privateKey: Uint8Array;
};

/** `encryptedPrivateKey` / `recoveryEncryptedPrivateKey` in API.md §3. */
export const encryptedKeySchema = z.strictObject({
  nonce: z.string().min(1),
  ciphertext: z.string().min(1),
});

export type EncryptedKey = z.infer<typeof encryptedKeySchema>;

export async function generateKeyPair(): Promise<KeyPair> {
  const sodium = await loadSodium();
  const { publicKey, privateKey } = sodium.crypto_box_keypair();
  return { publicKey, privateKey };
}

/**
 * XChaCha20-Poly1305 over the raw 32-byte X25519 private key, no associated data (API.md §3).
 * The nonce is a parameter only so the test vectors in API.md §11.3 can pin it.
 */
export async function encryptPrivateKeyWithNonce(params: {
  readonly privateKey: Uint8Array;
  readonly key: Uint8Array;
  readonly nonce: Uint8Array;
}): Promise<EncryptedKey> {
  const sodium = await loadSodium();
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(params.privateKey, null, null, params.nonce, params.key);
  return { nonce: toBase64Url(sodium, params.nonce), ciphertext: toBase64Url(sodium, ciphertext) };
}

export async function encryptPrivateKey(privateKey: Uint8Array, key: Uint8Array): Promise<EncryptedKey> {
  const sodium = await loadSodium();
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  return encryptPrivateKeyWithNonce({ privateKey, key, nonce });
}

/** @throws DecryptionFailedError on a wrong key, which is what a wrong password looks like. */
export async function decryptKeyPair(params: {
  readonly publicKey: string;
  readonly encryptedPrivateKey: EncryptedKey;
  readonly key: Uint8Array;
}): Promise<KeyPair> {
  const sodium = await loadSodium();
  const { nonce, ciphertext } = params.encryptedPrivateKey;
  let privateKey: Uint8Array;
  try {
    privateKey = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      fromBase64Url(sodium, ciphertext),
      null,
      fromBase64Url(sodium, nonce),
      params.key,
    );
  } catch (error) {
    throw new DecryptionFailedError({ cause: error });
  }
  const publicKey = fromBase64Url(sodium, params.publicKey);
  if (!sodium.memcmp(sodium.crypto_scalarmult_base(privateKey), publicKey)) {
    sodium.memzero(privateKey);
    throw new DecryptionFailedError();
  }
  return { publicKey, privateKey };
}
