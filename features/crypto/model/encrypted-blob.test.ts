import { describe, expect, it } from "vitest";
import { DecryptionFailedError } from "./crypto-errors";
import { encryptedBlobSchema, openBlob, openJson, sealBlob, sealJson } from "./encrypted-blob";
import { generateKeyPair } from "./key-pair";

const PLAINTEXT = new TextEncoder().encode("Subject: hello\r\n\r\nbody");

function flipFirstByte(base64Url: string): string {
  const bytes = Buffer.from(base64Url, "base64url");
  bytes[0] = (bytes[0] ?? 0) ^ 1;
  return bytes.toString("base64url");
}

describe("EncryptedBlob v1", () => {
  it("opens with the recipient key pair", async () => {
    const keyPair = await generateKeyPair();

    const blob = await sealBlob(PLAINTEXT, keyPair.publicKey);

    expect(await openBlob(blob, keyPair)).toEqual(PLAINTEXT);
  });

  it("follows the API.md §1.4 shape and field sizes", async () => {
    const keyPair = await generateKeyPair();

    const blob = await sealBlob(PLAINTEXT, keyPair.publicKey);

    expect(encryptedBlobSchema.parse(blob)).toEqual(blob);
    expect(blob).toMatchObject({ v: 1, alg: "x25519-xchacha20poly1305" });
    expect(blob.sealedKey).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(Buffer.from(blob.sealedKey, "base64url")).toHaveLength(32 + 48);
    expect(Buffer.from(blob.nonce, "base64url")).toHaveLength(24);
    expect(Buffer.from(blob.ciphertext, "base64url")).toHaveLength(PLAINTEXT.length + 16);
  });

  it("cannot be opened by another key pair", async () => {
    const recipient = await generateKeyPair();
    const stranger = await generateKeyPair();

    const blob = await sealBlob(PLAINTEXT, recipient.publicKey);

    await expect(openBlob(blob, stranger)).rejects.toBeInstanceOf(DecryptionFailedError);
  });

  it("detects a modified ciphertext", async () => {
    const keyPair = await generateKeyPair();
    const blob = await sealBlob(PLAINTEXT, keyPair.publicKey);

    await expect(openBlob({ ...blob, ciphertext: flipFirstByte(blob.ciphertext) }, keyPair)).rejects.toBeInstanceOf(
      DecryptionFailedError,
    );
  });

  it("round-trips UTF-8 JSON metadata", async () => {
    const keyPair = await generateKeyPair();

    const blob = await sealJson({ label: "Магазины" }, keyPair.publicKey);

    expect(await openJson(blob, keyPair)).toEqual({ label: "Магазины" });
  });

  it("rejects an unknown format version", () => {
    const result = encryptedBlobSchema.safeParse({
      v: 2,
      alg: "x25519-xchacha20poly1305",
      sealedKey: "a",
      nonce: "a",
      ciphertext: "a",
    });

    expect(result.success).toBe(false);
  });
});
