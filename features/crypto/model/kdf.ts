import { z } from "zod";
import { hkdfSha256 } from "./hkdf";
import { loadSodium, fromBase64Url, toBase64Url } from "./sodium";

const KEY_BYTES = 32;
const AUTH_KEY_INFO = "shadowbox/auth/v1";
const ENC_KEY_INFO = "shadowbox/enc/v1";

/**
 * The only parameters `/auth/register` accepts (API.md §3, `/auth/prelogin`).
 * Every account shares them; only the salt differs.
 */
export const REGISTRATION_KDF = {
  algorithm: "argon2id13",
  opsLimit: 3,
  memLimitBytes: 67_108_864,
} as const;

export const kdfParamsSchema = z.strictObject({
  algorithm: z.literal("argon2id13"),
  salt: z.string().min(1),
  opsLimit: z.number().int().positive(),
  memLimitBytes: z.number().int().positive(),
});

export type KdfParams = z.infer<typeof kdfParamsSchema>;

export type DerivedKeys = {
  /** Sent to the server as `authKey`, base64url. */
  readonly authKey: string;
  /** Never leaves the browser: it decrypts the private key. */
  readonly encKey: Uint8Array;
};

/** Fresh salt and the fixed cost parameters for a new account. */
export async function createRegistrationKdf(): Promise<KdfParams> {
  const sodium = await loadSodium();
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  return { ...REGISTRATION_KDF, salt: toBase64Url(sodium, salt) };
}

/**
 * master = Argon2id(NFKC(password)), authKey and encKey = HKDF-SHA256(master, info).
 * NFKC keeps the same password typed on different keyboards byte-identical.
 */
export async function deriveKeys(password: string, kdf: KdfParams): Promise<DerivedKeys> {
  const sodium = await loadSodium();
  const master = sodium.crypto_pwhash(
    KEY_BYTES,
    new TextEncoder().encode(password.normalize("NFKC")),
    fromBase64Url(sodium, kdf.salt),
    kdf.opsLimit,
    kdf.memLimitBytes,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
  try {
    const [authKey, encKey] = await Promise.all([
      hkdfSha256(master, AUTH_KEY_INFO, KEY_BYTES),
      hkdfSha256(master, ENC_KEY_INFO, KEY_BYTES),
    ]);
    const encodedAuthKey = toBase64Url(sodium, authKey);
    sodium.memzero(authKey);
    return { authKey: encodedAuthKey, encKey };
  } finally {
    sodium.memzero(master);
  }
}
