import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { getUnlockedKeys, lockKeys } from "@/features/crypto/model/key-store";
import { loadMockState, resetMockState, saveMockState } from "@/features/mock-server/mock-state";
import {
  registerTestAccount,
  snapshotMockServer,
  TEST_PASSWORD,
} from "@/features/mock-server/testing/register-test-account";
import { ApiError } from "@/shared/api/api-error";
import { authApi } from "../api/auth-api";
import { signIn, signOut, unlock } from "./sign-in";

vi.mock("@/shared/config/public-env", () => ({ publicEnv: { apiMode: "mock" } }));
vi.mock("@/shared/api/mock-server", () => import("@/features/mock-server/testing/instant-mock-server"));
vi.mock("@/features/crypto/pow/solve-pow", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import("@/features/mock-server/testing/inline-solve-pow")),
}));

const noProgress = (): void => undefined;

let registeredPublicKey: Uint8Array;
let restoreMockServer: () => void;

async function failSignIn(login: string, times: number): Promise<void> {
  for (let attempt = 0; attempt < times; attempt += 1) {
    await signIn({ login, password: "wrong password!!", onPowProgress: noProgress }).catch(() => undefined);
  }
}

// Sign up once per file: every Argon2id run with 64 MiB is real and slow.
beforeAll(async () => {
  resetMockState();
  registeredPublicKey = new Uint8Array((await registerTestAccount("kage")).publicKey);
  restoreMockServer = snapshotMockServer();
});

beforeEach(() => {
  restoreMockServer();
});

afterEach(async () => {
  await lockKeys();
});

describe("auth flows on the mock API", { timeout: 20_000 }, () => {
  it("starts a session with the keys created at sign-up", async () => {
    const session = await authApi.loadSession();

    expect(session.account.login).toBe("kage");
    expect(Buffer.from(session.keys.publicKey, "base64url")).toEqual(Buffer.from(registeredPublicKey));
  });

  it("unlocks after a reload with the same password", async () => {
    await unlock(TEST_PASSWORD);

    expect(getUnlockedKeys()?.publicKey).toEqual(registeredPublicKey);
  });

  it("refuses to unlock with a wrong password", async () => {
    await expect(unlock("not the password")).rejects.toBeInstanceOf(DecryptionFailedError);
  });

  it("signs out and back in", async () => {
    await signOut();

    await expect(authApi.loadSession()).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    await expect(signIn({ login: "KAGE", password: TEST_PASSWORD, onPowProgress: noProgress })).resolves.toMatchObject({
      login: "kage",
    });
    expect(getUnlockedKeys()?.publicKey).toEqual(registeredPublicKey);
  });

  it("answers the same way for a wrong password and an unknown login", async () => {
    await signOut();

    const wrongPassword = signIn({ login: "kage", password: "wrong password!!", onPowProgress: noProgress });
    const unknownLogin = signIn({ login: "nobody", password: TEST_PASSWORD, onPowProgress: noProgress });

    await expect(wrongPassword).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    await expect(unknownLogin).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("rejects a taken login", async () => {
    await expect(registerTestAccount("kage")).rejects.toMatchObject({ code: "LOGIN_TAKEN" });
  });

  it("solves proof-of-work when the server asks for it after failed attempts", async () => {
    await signOut();
    await failSignIn("kage", 5);

    await expect(signIn({ login: "kage", password: TEST_PASSWORD, onPowProgress: noProgress })).resolves.toMatchObject({
      login: "kage",
    });
  });

  it("locks the login after ten failures, even for the right password", async () => {
    await signOut();
    const state = loadMockState();
    state.failures["kage"] = 10;
    saveMockState(state);

    const attempt = signIn({ login: "kage", password: TEST_PASSWORD, onPowProgress: noProgress });

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({ code: "ACCOUNT_LOCKED", retryAfterSeconds: 900 });
  });
});
