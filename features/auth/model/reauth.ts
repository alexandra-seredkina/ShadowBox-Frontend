import { deriveKeys } from "@/features/crypto/model/kdf";
import { loadSodium } from "@/features/crypto/model/sodium";
import { ApiError } from "@/shared/api/api-error";
import { authApi } from "../api/auth-api";

/** Proves the password again for 🔒 actions (API.md §1.2): only `authKey` goes to the server. */
export async function reauthenticate(password: string): Promise<void> {
  const { keys } = await authApi.loadSession();
  const { authKey, encKey } = await deriveKeys(password, keys.kdf);
  (await loadSodium()).memzero(encKey);
  await authApi.reauth(authKey);
}

export function isReauthRequired(error: unknown): boolean {
  return error instanceof ApiError && error.code === "REAUTH_REQUIRED";
}
