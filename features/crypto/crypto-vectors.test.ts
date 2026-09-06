import { createHash } from "node:crypto";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { describe, expect, it } from "vitest";
import { openJson, sealBlobWith } from "./model/encrypted-blob";
import { deriveKeys, REGISTRATION_KDF } from "./model/kdf";
import { decryptKeyPair, encryptPrivateKeyWithNonce } from "./model/key-pair";
import { recoveryKeyFromPhrase } from "./model/recovery-phrase";
import { countLeadingZeroBits, searchPowNonce } from "./pow/pow-search";

// API.md §11: the same values the backend checks with sodium-native. Change only together with API.md.

function bytes(base64Url: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64Url, "base64url"));
}

function base64Url(value: Uint8Array): string {
  return Buffer.from(value).toString("base64url");
}

function sha256(message: Uint8Array): Uint8Array {
  return new Uint8Array(createHash("sha256").update(message).digest());
}

const POW = {
  prefix: "AAECAwQFBgcICQoLDA0ODw",
  difficulty: 20,
  validNonce: "1227078",
  invalidNonce: "1227077",
};

const KDF = {
  password: "Ｋage-пароль-2026",
  salt: "EBESExQVFhcYGRobHB0eHw",
  authKey: "0V2yYh-cMoaKSGVEOyknpWbtBVfG1LQmG91VrXV7KUM",
  encKey: "GUbmeoA1Xq7cJPpXbBapSF4Um4wYxQX9S8uHUOqfmAA",
};

const KEYS = {
  publicKey: "zE8s22ld12bzQRjrZ7mGUv7R2LxJwzCxGbv6imSYk3g",
  privateKey: "ledZX8ieUv393OnGpD102_YEcCXuBGLS0XLotqKEHa4",
  nonce: "ICEiIyQlJicoKSorLC0uLzAxMjM0NTY3",
  ciphertext: "nC0PG_IpAmnKHCWI9sq8LbIdt9KRas1w1ZKI5vvwAjBoFeRAgiz-22t941m9pTM8",
  recoveryEntropy: "gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp8",
  recoveryKey: "dtUvviCN03mNnTAHSh9nQhyX-f589qtXgKTICB4DcPk",
  recoveryNonce: "QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZX",
  recoveryCiphertext: "tfwZRPGqejcBlqW2wuXATtv5wcY2FCouJLPtVqk0xlcbRDYDG9cfDqyWW1IlqPBK",
};

const BLOB = {
  plaintext: '{"label":"Магазины"}',
  contentKey: "YGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8",
  nonce: "oKGio6SlpqeoqaqrrK2ur7CxsrO0tba3",
  ciphertext: "BosPwyfhiZKa-FF2p4EvxpxqYEh14fTvibB1BIJmnJD0Uj4GVfz3txltOvc",
  sealed: {
    v: 1,
    alg: "x25519-xchacha20poly1305",
    sealedKey:
      "B2yvsSUTSrvY75JLGl2eQHbTevCM7a_w10t_I5DeUENMXPA0pZ-3Aa3H35BvUjs0uMVNlNvNIjwIXiww2VQMYVMi2n4-c8CKT9DT7b8xtAE",
    nonce: "oKGio6SlpqeoqaqrrK2ur7CxsrO0tba3",
    ciphertext: "BosPwyfhiZKa-FF2p4EvxpxqYEh14fTvibB1BIJmnJD0Uj4GVfz3txltOvc",
  },
} as const;

const keyPair = { publicKey: bytes(KEYS.publicKey), privateKey: bytes(KEYS.privateKey) };

describe("API.md §11.1 proof-of-work", () => {
  it("finds the smallest valid nonce", () => {
    const nonce = searchPowNonce({ prefix: bytes(POW.prefix), difficulty: POW.difficulty, start: 0, attempts: 2_000_000, sha256 });

    expect(nonce).toBe(POW.validNonce);
  });

  it("rejects the invalid nonce", () => {
    const nonce = searchPowNonce({
      prefix: bytes(POW.prefix),
      difficulty: POW.difficulty,
      start: Number(POW.invalidNonce),
      attempts: 1,
      sha256,
    });

    expect(nonce).toBeNull();
    expect(countLeadingZeroBits(sha256(new Uint8Array([...bytes(POW.prefix), ...Buffer.from(POW.invalidNonce)])))).toBe(0);
  });
});

describe("API.md §11.2 KDF", () => {
  it("derives authKey and encKey from the full-width password", async () => {
    const keys = await deriveKeys(KDF.password, { ...REGISTRATION_KDF, salt: KDF.salt });

    expect(keys.authKey).toBe(KDF.authKey);
    expect(base64Url(keys.encKey)).toBe(KDF.encKey);
  });
});

describe("API.md §11.3 key pair and encrypted private keys", () => {
  it("encrypts the private key with encKey to the expected ciphertext", async () => {
    const encrypted = await encryptPrivateKeyWithNonce({
      privateKey: bytes(KEYS.privateKey),
      key: bytes(KDF.encKey),
      nonce: bytes(KEYS.nonce),
    });

    expect(encrypted).toEqual({ nonce: KEYS.nonce, ciphertext: KEYS.ciphertext });
  });

  it("decrypts the expected ciphertext back into the key pair", async () => {
    const restored = await decryptKeyPair({
      publicKey: KEYS.publicKey,
      encryptedPrivateKey: { nonce: KEYS.nonce, ciphertext: KEYS.ciphertext },
      key: bytes(KDF.encKey),
    });

    expect(base64Url(restored.privateKey)).toBe(KEYS.privateKey);
  });

  it("derives the recovery key from the phrase entropy and encrypts with it", async () => {
    const words = entropyToMnemonic(bytes(KEYS.recoveryEntropy), wordlist).split(" ");

    const recoveryKey = await recoveryKeyFromPhrase(words);
    const encrypted = await encryptPrivateKeyWithNonce({
      privateKey: bytes(KEYS.privateKey),
      key: recoveryKey,
      nonce: bytes(KEYS.recoveryNonce),
    });

    expect(base64Url(recoveryKey)).toBe(KEYS.recoveryKey);
    expect(encrypted.ciphertext).toBe(KEYS.recoveryCiphertext);
  });
});

describe("API.md §11.4 EncryptedBlob v1", () => {
  it("produces the expected ciphertext for a pinned content key and nonce", async () => {
    const blob = await sealBlobWith({
      plaintext: new TextEncoder().encode(BLOB.plaintext),
      publicKey: keyPair.publicKey,
      contentKey: bytes(BLOB.contentKey),
      nonce: bytes(BLOB.nonce),
    });

    expect(blob.ciphertext).toBe(BLOB.ciphertext);
    expect(await openJson(blob, keyPair)).toEqual(JSON.parse(BLOB.plaintext));
  });

  it("opens the blob sealed by the backend", async () => {
    expect(await openJson(BLOB.sealed, keyPair)).toEqual({ label: "Магазины" });
  });
});
