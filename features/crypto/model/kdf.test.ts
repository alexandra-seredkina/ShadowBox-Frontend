import { argon2Sync, hkdfSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hkdfSha256 } from "./hkdf";
import { createRegistrationKdf, deriveKeys, REGISTRATION_KDF, type KdfParams } from "./kdf";

const SALT = "AAECAwQFBgcICQoLDA0ODw";
const SALT_BYTES = Uint8Array.from({ length: 16 }, (_, index) => index);
const FAST_KDF: KdfParams = { algorithm: "argon2id13", salt: SALT, opsLimit: 1, memLimitBytes: 8 * 1024 * 1024 };

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

describe("hkdfSha256", () => {
  it("matches RFC 5869 test case 3 (empty salt and info)", async () => {
    const okm = await hkdfSha256(new Uint8Array(22).fill(0x0b), "", 42);

    expect(Buffer.from(okm).toString("hex")).toBe(
      "8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8",
    );
  });
});

describe("deriveKeys", () => {
  it("matches an independent Argon2id + HKDF implementation with the registration parameters", async () => {
    const password = "correct horse battery staple";
    const master = argon2Sync("argon2id", {
      message: password,
      nonce: SALT_BYTES,
      parallelism: 1,
      tagLength: 32,
      memory: REGISTRATION_KDF.memLimitBytes / 1024,
      passes: REGISTRATION_KDF.opsLimit,
    });
    const expectedAuthKey = new Uint8Array(hkdfSync("sha256", master, new Uint8Array(0), "shadowbox/auth/v1", 32));
    const expectedEncKey = new Uint8Array(hkdfSync("sha256", master, new Uint8Array(0), "shadowbox/enc/v1", 32));

    const keys = await deriveKeys(password, { ...REGISTRATION_KDF, salt: SALT });

    expect(keys.authKey).toBe(toBase64Url(expectedAuthKey));
    expect(keys.encKey).toEqual(expectedEncKey);
  });

  it("derives different sign-in and encryption keys", async () => {
    const keys = await deriveKeys("correct horse battery staple", FAST_KDF);

    expect(keys.authKey).not.toBe(toBase64Url(keys.encKey));
  });

  it("treats full-width and ASCII spellings of a password as the same password", async () => {
    const ascii = await deriveKeys("Password-1234", FAST_KDF);
    const fullWidth = await deriveKeys("Ｐａｓｓｗｏｒｄ－１２３４", FAST_KDF);

    expect(fullWidth.authKey).toBe(ascii.authKey);
  });

  it("depends on the salt", async () => {
    const first = await deriveKeys("correct horse battery staple", FAST_KDF);
    const second = await deriveKeys("correct horse battery staple", { ...FAST_KDF, salt: "DwAAAAAAAAAAAAAAAAAAAA" });

    expect(second.authKey).not.toBe(first.authKey);
  });
});

describe("createRegistrationKdf", () => {
  it("uses exactly the parameters the server accepts and a fresh 16-byte salt", async () => {
    const first = await createRegistrationKdf();
    const second = await createRegistrationKdf();

    expect(first).toMatchObject({ algorithm: "argon2id13", opsLimit: 3, memLimitBytes: 67_108_864 });
    expect(Buffer.from(first.salt, "base64url")).toHaveLength(16);
    expect(second.salt).not.toBe(first.salt);
  });
});
