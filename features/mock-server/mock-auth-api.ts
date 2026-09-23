import type { AuthApi } from "@/features/auth/api/auth-api";
import type { Account, Keys, PowPurpose } from "@/features/auth/api/auth-schemas";
import { findLoginIssue, normalizeLogin } from "@/features/auth/model/credentials";
import { REGISTRATION_KDF, type KdfParams } from "@/features/crypto/model/kdf";
import { fromBase64Url, loadSodium, toBase64Url } from "@/features/crypto/model/sodium";
import { countLeadingZeroBits } from "@/features/crypto/pow/pow-search";
import type { PowSolution } from "@/features/crypto/pow/solve-pow";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { deliverMail } from "./mock-mail-delivery";
import { newAlias, systemFolders } from "./mock-records";
import { sampleMailbox } from "./mock-sample-mail";
import {
  accountView,
  findSessionAccount,
  loadMockState,
  saveMockState,
  today,
  type MockState,
  type StoredAccount,
} from "./mock-state";

const POW_DIFFICULTY = 20;
const POW_TTL_MS = 5 * 60 * 1000;
const REAUTH_WINDOW_MS = 5 * 60 * 1000;
const POW_REQUIRED_AFTER = 5;
const LOCKED_AFTER = 10;
const LOCK_SECONDS = 15 * 60;
const RESERVED_LOGINS = new Set(["admin", "abuse", "postmaster", "security", "support", "noreply", "root"]);

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

function keysOf(stored: StoredAccount): Keys {
  return { publicKey: stored.publicKey, encryptedPrivateKey: stored.encryptedPrivateKey, kdf: stored.kdf };
}

function startSession(state: MockState, login: string): void {
  state.sessionLogin = login;
  state.reauthUntil = null;
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
    const replay = state.registerReplays[idempotencyKey];
    if (replay) {
      startSession(state, replay.login);
      saveMockState(state);
      return mockRespond(replay.response);
    }
    const isPowOk = await isPowValid(state, request.pow, "register");
    saveMockState(state);
    if (!isPowOk) return mockFail({ status: 400, code: "POW_INVALID" });
    if (state.accounts[login]) return mockFail({ status: 409, code: "LOGIN_TAKEN" });

    const response = { account: newAccount(login), firstAlias: newAlias({ kind: "permanent", ttl: null }) };
    const stored: StoredAccount = {
      authKey: request.authKey,
      kdf: request.kdf,
      publicKey: request.keys.publicKey,
      encryptedPrivateKey: request.keys.encryptedPrivateKey,
      account: response.account,
      aliases: [response.firstAlias],
      folders: systemFolders(),
      messages: [],
      knownSenders: [],
    };
    // There is no SMTP in the browser: the mock account starts with mail already delivered.
    for (const { mail, receivedAt } of sampleMailbox(Date.now())) {
      await deliverMail({ stored, aliasId: response.firstAlias.id, mail, receivedAt });
    }
    state.accounts[login] = stored;
    state.registerReplays[idempotencyKey] = { login, response };
    startSession(state, login);
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
    if (!stored || stored.authKey !== request.authKey) {
      state.failures[login] = failures + 1;
      saveMockState(state);
      return mockFail({ status: 401, code: "INVALID_CREDENTIALS", latencyMs: 600 });
    }
    delete state.failures[login];
    startSession(state, login);
    saveMockState(state);
    return mockRespond({ account: accountView(stored), keys: keysOf(stored) }, 600);
  },

  async logout() {
    const state = loadMockState();
    state.sessionLogin = null;
    state.reauthUntil = null;
    saveMockState(state);
    return mockRespond(undefined);
  },

  async loadSession() {
    const state = loadMockState();
    const stored = findSessionAccount(state);
    if (!stored) return mockFail({ status: 401, code: "UNAUTHENTICATED" });
    const reauthUntil =
      state.reauthUntil !== null && state.reauthUntil > Date.now() ? new Date(state.reauthUntil).toISOString() : null;
    return mockRespond({ account: accountView(stored), keys: keysOf(stored), session: { id: "mock-session", reauthUntil } });
  },

  async reauth(authKey) {
    const state = loadMockState();
    const stored = findSessionAccount(state);
    if (!stored) return mockFail({ status: 401, code: "UNAUTHENTICATED" });
    if (stored.authKey !== authKey) return mockFail({ status: 401, code: "INVALID_CREDENTIALS", latencyMs: 600 });
    state.reauthUntil = Date.now() + REAUTH_WINDOW_MS;
    saveMockState(state);
    return mockRespond(undefined, 600);
  },
};
