import { deriveKeys, type KdfParams } from "@/features/crypto/model/kdf";
import { decryptKeyPair } from "@/features/crypto/model/key-pair";
import { lockKeys, storeUnlockedKeys } from "@/features/crypto/model/key-store";
import { loadSodium } from "@/features/crypto/model/sodium";
import { solvePow } from "@/features/crypto/pow/solve-pow";
import { ApiError } from "@/shared/api/api-error";
import { authApi } from "../api/auth-api";
import type { Account, Keys, LoginResponse } from "../api/auth-schemas";
import { normalizeLogin } from "./credentials";

type ProgressListener = (progress: number) => void;

/** Decrypts the private key with the password-derived key and keeps it in memory only. */
async function unlockKeys(encKey: Uint8Array, keys: Keys): Promise<void> {
  const sodium = await loadSodium();
  try {
    const keyPair = await decryptKeyPair({
      publicKey: keys.publicKey,
      encryptedPrivateKey: keys.encryptedPrivateKey,
      key: encKey,
    });
    await storeUnlockedKeys(keyPair);
  } finally {
    sodium.memzero(encKey);
  }
}

async function loginWithOptionalPow(
  login: string,
  authKey: string,
  onPowProgress: ProgressListener,
): Promise<LoginResponse> {
  try {
    return await authApi.login({ login, authKey });
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== "POW_REQUIRED") throw error;
  }
  const challenge = await authApi.requestPow("login");
  const pow = await solvePow(challenge, { onProgress: onPowProgress });
  return authApi.login({ login, authKey, pow });
}

/** `/login`: prelogin → Argon2id → login (with proof-of-work when the server asks) → unlock keys. */
export async function signIn(params: {
  readonly login: string;
  readonly password: string;
  readonly onPowProgress: ProgressListener;
}): Promise<Account> {
  const login = normalizeLogin(params.login);
  const kdf: KdfParams = await authApi.prelogin(login);
  const { authKey, encKey } = await deriveKeys(params.password, kdf);
  let response: LoginResponse;
  try {
    response = await loginWithOptionalPow(login, authKey, params.onPowProgress);
  } catch (error) {
    (await loadSodium()).memzero(encKey);
    throw error;
  }
  await unlockKeys(encKey, response.keys);
  return response.account;
}

/**
 * `/unlock`: the session survived a reload but the keys did not (D-005).
 * A wrong password shows up as `DecryptionFailedError`; the server is not asked.
 */
export async function unlock(password: string): Promise<Account> {
  const { account, keys } = await authApi.loadSession();
  const { encKey } = await deriveKeys(password, keys.kdf);
  await unlockKeys(encKey, keys);
  return account;
}

export async function signOut(): Promise<void> {
  await lockKeys();
  await authApi.logout();
}
