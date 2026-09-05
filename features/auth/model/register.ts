import { createRegistrationKdf, deriveKeys } from "@/features/crypto/model/kdf";
import { encryptPrivateKey, generateKeyPair, type KeyPair } from "@/features/crypto/model/key-pair";
import { storeUnlockedKeys } from "@/features/crypto/model/key-store";
import { generateRecoveryPhrase } from "@/features/crypto/model/recovery-phrase";
import { loadSodium, toBase64Url } from "@/features/crypto/model/sodium";
import { solvePow, type PowSolution } from "@/features/crypto/pow/solve-pow";
import { ApiError } from "@/shared/api/api-error";
import { authApi } from "../api/auth-api";
import type { RegisterRequest, RegisterResponse } from "../api/auth-schemas";

type ProgressListener = (progress: number) => void;

/** Everything the browser builds before asking the server, plus what only the browser keeps. */
export type PreparedRegistration = {
  readonly request: Omit<RegisterRequest, "pow">;
  readonly recoveryWords: readonly string[];
  readonly keyPair: KeyPair;
};

/** A solved challenge and the Idempotency-Key that belongs to a request carrying it. */
export type RegistrationTicket = {
  readonly pow: PowSolution;
  readonly idempotencyKey: string;
};

async function buildKeys(login: string, password: string): Promise<PreparedRegistration> {
  const kdf = await createRegistrationKdf();
  const [derived, keyPair, phrase] = await Promise.all([
    deriveKeys(password, kdf),
    generateKeyPair(),
    generateRecoveryPhrase(),
  ]);
  const sodium = await loadSodium();
  try {
    const [encryptedPrivateKey, recoveryEncryptedPrivateKey] = await Promise.all([
      encryptPrivateKey(keyPair.privateKey, derived.encKey),
      encryptPrivateKey(keyPair.privateKey, phrase.key),
    ]);
    return {
      request: {
        login,
        authKey: derived.authKey,
        kdf,
        keys: { publicKey: toBase64Url(sodium, keyPair.publicKey), encryptedPrivateKey, recoveryEncryptedPrivateKey },
      },
      recoveryWords: phrase.words,
      keyPair,
    };
  } finally {
    sodium.memzero(derived.encKey);
    sodium.memzero(phrase.key);
  }
}

export async function solveRegistrationPow(onProgress: ProgressListener): Promise<RegistrationTicket> {
  const challenge = await authApi.requestPow("register");
  const pow = await solvePow(challenge, { onProgress });
  return { pow, idempotencyKey: crypto.randomUUID() };
}

/** Solves proof-of-work and derives keys at the same time; progress follows the proof-of-work. */
export async function prepareRegistration(params: {
  readonly login: string;
  readonly password: string;
  readonly onProgress: ProgressListener;
}): Promise<{ readonly prepared: PreparedRegistration; readonly ticket: RegistrationTicket }> {
  const [prepared, ticket] = await Promise.all([
    buildKeys(params.login, params.password),
    solveRegistrationPow(params.onProgress),
  ]);
  return { prepared, ticket };
}

function isPowRejected(error: unknown): boolean {
  return error instanceof ApiError && error.code === "POW_INVALID";
}

/**
 * Sends the registration. A challenge lives five minutes, and writing down the phrase can take
 * longer, so a rejected one is solved again once (with a new Idempotency-Key: the body changes).
 */
export async function completeRegistration(params: {
  readonly prepared: PreparedRegistration;
  readonly ticket: RegistrationTicket;
  readonly onPowProgress: ProgressListener;
}): Promise<RegisterResponse> {
  const send = (ticket: RegistrationTicket): Promise<RegisterResponse> =>
    authApi.register({ ...params.prepared.request, pow: ticket.pow }, ticket.idempotencyKey);

  let response: RegisterResponse;
  try {
    response = await send(params.ticket);
  } catch (error) {
    if (!isPowRejected(error)) throw error;
    response = await send(await solveRegistrationPow(params.onPowProgress));
  }
  await storeUnlockedKeys(params.prepared.keyPair);
  return response;
}
