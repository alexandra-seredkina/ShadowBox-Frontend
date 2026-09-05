import { REGISTRATION_KDF, type KdfParams } from "@/features/crypto/model/kdf";
import { fromBase64Url, loadSodium, toBase64Url } from "@/features/crypto/model/sodium";
import { countLeadingZeroBits } from "@/features/crypto/pow/pow-search";
import type { PowSolution } from "@/features/crypto/pow/solve-pow";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { findLoginIssue, normalizeLogin } from "../model/credentials";
import type { AuthApi } from "./auth-api";
import type { Account, Alias, Keys, PowPurpose } from "./auth-schemas";
import { loadMockState, saveMockState, type MockState } from "./mock-auth-state";

const POW_DIFFICULTY = 20;
const POW_TTL_MS = 5 * 60 * 1000;
const POW_REQUIRED_AFTER = 5;
const LOCKED_AFTER = 10;
const LOCK_SECONDS = 15 * 60;
const RESERVED_LOGINS = new Set(["admin", "abuse", "postmaster", "security", "support", "noreply", "root"]);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function invalidLogin(raw: string): Promise<never> | null {
  const issue = findLoginIssue(raw);
  return issue === null ? null : mockFail({ status: 400, code: "VALIDATION_FAILED", details: [{ path: "login", issue }] });
}

async function isPowValid(state: MockState, solution: PowSolution, purpose: PowPurpose): Promise<boolean> {
  const challenge = state.challenges[solution.challengeId];
  delete state.challenges[solution.challengeId];
  if (!challenge || challenge.purpose !== purpose || Date.now() >= challenge.expiresAt) return false;
  const sodium = await loadSodium();
  const prefix = fromBase64Url(sodium, challenge.prefix);
  const nonce = new TextEncoder().encode(solution.nonce);
  const message = new Uint8Array(prefix.length + nonce.length);
  message.set(prefix);
  message.set(nonce, prefix.length);
  return countLeadingZeroBits(sodium.crypto_hash_sha256(message)) >= challenge.difficulty;
}

function newAccount(login: string): Account {
  return {
    login,
    createdAt: today(),
    settings: { ipBinding: true },
    limits: { maxActiveAliases: 20, activeAliases: 1, maxMessageBytes: 26_214_400 },
  };
}

function newAlias(): Alias {
  const localPart = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  return {
    id: crypto.randomUUID(),
    address: `${localPart}@shadowbox.test`,
    kind: "permanent",
    status: "active",
    encryptedLabel: null,
    folderId: null,
    expiresAt: null,
    createdAt: today(),
    lastReceivedAt: null,
  };
}

function keysOf(state: MockState, login: string): Keys | null {
  const stored = state.accounts[login];
  return stored ? { publicKey: stored.publicKey, encryptedPrivateKey: stored.encryptedPrivateKey, kdf: stored.kdf } : null;
}

/**
 * In-browser stand-in for the `/auth/*` endpoints, following API.md including error codes.
 * Its "database" lives in sessionStorage so that `/unlock` can be tried after a reload; it holds
 * only what the real server would hold (no password, no decrypted keys).
 */
export const mockAuthApi: AuthApi = {
  async requestPow(purpose) {
    const sodium = await loadSodium();
    const state = loadMockState();
    const challengeId = crypto.randomUUID();
    const prefix = toBase64Url(sodium, sodium.randombytes_buf(16));
    const expiresAt = Date.now() + POW_TTL_MS;
    state.challenges[challengeId] = { purpose, prefix, difficulty: POW_DIFFICULTY, expiresAt };
    saveMockState(state);
    return mockRespond({ challengeId, prefix, difficulty: POW_DIFFICULTY, expiresAt: new Date(expiresAt).toISOString() });
  },

  async prelogin(raw) {
    const failure = invalidLogin(raw);
    if (failure) return failure;
    const login = normalizeLogin(raw);
    const stored = loadMockState().accounts[login];
    if (stored) return mockRespond(stored.kdf);
    const sodium = await loadSodium();
    const decoySalt = sodium.crypto_generichash(16, `mock-decoy:${login}`, null);
    const kdf: KdfParams = { ...REGISTRATION_KDF, salt: toBase64Url(sodium, decoySalt) };
    return mockRespond(kdf);
  },

  async register(request, idempotencyKey) {
    const failure = invalidLogin(request.login);
    if (failure) return failure;
    const login = normalizeLogin(request.login);
    const { opsLimit, memLimitBytes } = request.kdf;
    if (opsLimit !== REGISTRATION_KDF.opsLimit || memLimitBytes !== REGISTRATION_KDF.memLimitBytes) {
      return mockFail({ status: 400, code: "VALIDATION_FAILED", details: [{ path: "kdf.opsLimit", issue: "invalid_value" }] });
    }
    if (RESERVED_LOGINS.has(login)) return mockFail({ status: 422, code: "LOGIN_RESERVED" });

    const state = loadMockState();
    const replay = state.idempotency[idempotencyKey];
    if (replay) {
      state.sessionLogin = replay.login;
      saveMockState(state);
      return mockRespond(replay.response);
    }
    const isPowOk = await isPowValid(state, request.pow, "register");
    saveMockState(state);
    if (!isPowOk) return mockFail({ status: 400, code: "POW_INVALID" });
    if (state.accounts[login]) return mockFail({ status: 409, code: "LOGIN_TAKEN" });

    const response = { account: newAccount(login), firstAlias: newAlias() };
    state.accounts[login] = {
      authKey: request.authKey,
      kdf: request.kdf,
      publicKey: request.keys.publicKey,
      encryptedPrivateKey: request.keys.encryptedPrivateKey,
      account: response.account,
    };
    state.idempotency[idempotencyKey] = { login, response };
    state.sessionLogin = login;
    saveMockState(state);
    return mockRespond(response, 600);
  },

  async login(request) {
    const failure = invalidLogin(request.login);
    if (failure) return failure;
    const login = normalizeLogin(request.login);
    const state = loadMockState();
    const failures = state.failures[login] ?? 0;
    if (failures >= LOCKED_AFTER) return mockFail({ status: 423, code: "ACCOUNT_LOCKED", retryAfterSeconds: LOCK_SECONDS });
    if (failures >= POW_REQUIRED_AFTER) {
      if (!request.pow) return mockFail({ status: 428, code: "POW_REQUIRED" });
      const isPowOk = await isPowValid(state, request.pow, "login");
      saveMockState(state);
      if (!isPowOk) return mockFail({ status: 400, code: "POW_INVALID" });
    }

    const stored = state.accounts[login];
    const keys = keysOf(state, login);
    if (!stored || !keys || stored.authKey !== request.authKey) {
      state.failures[login] = failures + 1;
      saveMockState(state);
      return mockFail({ status: 401, code: "INVALID_CREDENTIALS", latencyMs: 600 });
    }
    delete state.failures[login];
    state.sessionLogin = login;
    saveMockState(state);
    return mockRespond({ account: stored.account, keys }, 600);
  },

  async logout() {
    const state = loadMockState();
    state.sessionLogin = null;
    saveMockState(state);
    return mockRespond(undefined);
  },

  async loadSession() {
    const state = loadMockState();
    const login = state.sessionLogin;
    const stored = login === null ? undefined : state.accounts[login];
    const keys = login === null ? null : keysOf(state, login);
    if (!stored || !keys) return mockFail({ status: 401, code: "UNAUTHENTICATED" });
    return mockRespond({ account: stored.account, keys, session: { id: "mock-session", reauthUntil: null } });
  },
};
