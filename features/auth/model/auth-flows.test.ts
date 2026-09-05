import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { getUnlockedKeys, lockKeys } from "@/features/crypto/model/key-store";
import { fromBase64Url, loadSodium } from "@/features/crypto/model/sodium";
import { searchPowNonce } from "@/features/crypto/pow/pow-search";
import type { PowChallenge, PowSolution } from "@/features/crypto/pow/solve-pow";
import { ApiError } from "@/shared/api/api-error";
import { authApi } from "../api/auth-api";
import { loadMockState, resetMockState, saveMockState } from "../api/mock-auth-state";
import { completeRegistration, prepareRegistration } from "./register";
import { signIn, signOut, unlock } from "./sign-in";

vi.mock("@/shared/config/public-env", () => ({ publicEnv: { apiMode: "mock" } }));

// No latency: tests must not depend on real time.
vi.mock("@/shared/api/mock-server", async () => {
  const errors = await import("@/shared/api/api-error");
  return {
    mockRespond: async <T>(value: T): Promise<T> => structuredClone(value),
    mockFail: async (failure: { status: number; code: string; retryAfterSeconds?: number }): Promise<never> => {
      throw new errors.ApiError(failure);
    },
  };
});

// Web Workers do not exist in Node; solve on the same thread with the same search.
vi.mock("@/features/crypto/pow/solve-pow", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/crypto/pow/solve-pow")>();
  return {
    ...original,
    solvePow: async (challenge: PowChallenge): Promise<PowSolution> => {
      const sodium = await loadSodium();
      const nonce = searchPowNonce({
        prefix: fromBase64Url(sodium, challenge.prefix),
        difficulty: challenge.difficulty,
        start: 0,
        attempts: 2 ** 26,
        sha256: (message) => sodium.crypto_hash_sha256(message),
      });
      if (nonce === null) throw new Error("no nonce");
      return { challengeId: challenge.challengeId, nonce };
    },
  };
});

const PASSWORD = "correct horse battery staple";
const noProgress = (): void => undefined;

async function register(login: string): Promise<void> {
  const { prepared, ticket } = await prepareRegistration({ login, password: PASSWORD, onProgress: noProgress });
  await completeRegistration({ prepared, ticket, onPowProgress: noProgress });
}

async function failSignIn(login: string, times: number): Promise<void> {
  for (let attempt = 0; attempt < times; attempt += 1) {
    await signIn({ login, password: "wrong password!!", onPowProgress: noProgress }).catch(() => undefined);
  }
}

beforeEach(() => {
  resetMockState();
});

afterEach(async () => {
  await lockKeys();
});

// Argon2id with 64 MiB runs for real in every sign-in.
describe("auth flows on the mock API", { timeout: 20_000 }, () => {
  it("registers, keeps the keys in memory and starts a session", async () => {
    await register("kage");

    expect(getUnlockedKeys()).not.toBeNull();
    await expect(authApi.loadSession()).resolves.toMatchObject({ account: { login: "kage" } });
  });

  it("unlocks after a reload with the same password", async () => {
    await register("kage");
    const publicKey = getUnlockedKeys()?.publicKey;
    await lockKeys();

    await unlock(PASSWORD);

    expect(getUnlockedKeys()?.publicKey).toEqual(publicKey);
  });

  it("refuses to unlock with a wrong password", async () => {
    await register("kage");
    await lockKeys();

    await expect(unlock("not the password")).rejects.toBeInstanceOf(DecryptionFailedError);
  });

  it("signs out and back in", async () => {
    await register("kage");
    await signOut();

    await expect(authApi.loadSession()).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    await expect(signIn({ login: "KAGE", password: PASSWORD, onPowProgress: noProgress })).resolves.toMatchObject({
      login: "kage",
    });
    expect(getUnlockedKeys()).not.toBeNull();
  });

  it("answers the same way for a wrong password and an unknown login", async () => {
    await register("kage");
    await signOut();

    const wrongPassword = signIn({ login: "kage", password: "wrong password!!", onPowProgress: noProgress });
    const unknownLogin = signIn({ login: "nobody", password: PASSWORD, onPowProgress: noProgress });

    await expect(wrongPassword).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    await expect(unknownLogin).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("rejects a taken login", async () => {
    await register("kage");

    await expect(register("kage")).rejects.toMatchObject({ code: "LOGIN_TAKEN" });
  });

  it("solves proof-of-work when the server asks for it after failed attempts", async () => {
    await register("kage");
    await signOut();
    await failSignIn("kage", 5);

    await expect(signIn({ login: "kage", password: PASSWORD, onPowProgress: noProgress })).resolves.toMatchObject({
      login: "kage",
    });
  });

  it("locks the login after ten failures, even for the right password", async () => {
    await register("kage");
    await signOut();
    const state = loadMockState();
    state.failures["kage"] = 10;
    saveMockState(state);

    const attempt = signIn({ login: "kage", password: PASSWORD, onPowProgress: noProgress });

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({ code: "ACCOUNT_LOCKED", retryAfterSeconds: 900 });
  });
});
