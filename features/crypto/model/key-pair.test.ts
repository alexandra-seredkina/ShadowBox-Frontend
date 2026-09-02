import { describe, expect, it } from "vitest";
import { DecryptionFailedError } from "./crypto-errors";
import { decryptKeyPair, encryptPrivateKey, generateKeyPair } from "./key-pair";

const KEY = new Uint8Array(32).fill(7);
const OTHER_KEY = new Uint8Array(32).fill(8);

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

describe("encryptPrivateKey / decryptKeyPair", () => {
  it("restores the key pair with the same key", async () => {
    const keyPair = await generateKeyPair();
    const encryptedPrivateKey = await encryptPrivateKey(keyPair.privateKey, KEY);

    const restored = await decryptKeyPair({ publicKey: toBase64Url(keyPair.publicKey), encryptedPrivateKey, key: KEY });

    expect(restored.privateKey).toEqual(keyPair.privateKey);
    expect(restored.publicKey).toEqual(keyPair.publicKey);
  });

  it("uses a 24-byte nonce and a 32-byte key plus a 16-byte tag", async () => {
    const keyPair = await generateKeyPair();

    const { nonce, ciphertext } = await encryptPrivateKey(keyPair.privateKey, KEY);

    expect(Buffer.from(nonce, "base64url")).toHaveLength(24);
    expect(Buffer.from(ciphertext, "base64url")).toHaveLength(48);
  });

  it("rejects a wrong key", async () => {
    const keyPair = await generateKeyPair();
    const encryptedPrivateKey = await encryptPrivateKey(keyPair.privateKey, KEY);

    await expect(
      decryptKeyPair({ publicKey: toBase64Url(keyPair.publicKey), encryptedPrivateKey, key: OTHER_KEY }),
    ).rejects.toBeInstanceOf(DecryptionFailedError);
  });

  it("rejects a private key that does not belong to the public key", async () => {
    const keyPair = await generateKeyPair();
    const stranger = await generateKeyPair();
    const encryptedPrivateKey = await encryptPrivateKey(keyPair.privateKey, KEY);

    await expect(
      decryptKeyPair({ publicKey: toBase64Url(stranger.publicKey), encryptedPrivateKey, key: KEY }),
    ).rejects.toBeInstanceOf(DecryptionFailedError);
  });
});
