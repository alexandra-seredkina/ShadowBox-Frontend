import type { KdfParams } from "@/features/crypto/model/kdf";
import type { EncryptedKey } from "@/features/crypto/model/key-pair";
import type { Account, PowPurpose, RegisterResponse } from "./auth-schemas";

const STORAGE_KEY = "shadowbox-mock-auth";

type StoredAccount = {
  readonly authKey: string;
  readonly kdf: KdfParams;
  readonly publicKey: string;
  readonly encryptedPrivateKey: EncryptedKey;
  readonly account: Account;
};

type StoredChallenge = {
  readonly purpose: PowPurpose;
  readonly prefix: string;
  readonly difficulty: number;
  /** Epoch milliseconds. */
  readonly expiresAt: number;
};

/** What a real server would keep in its database, nothing more. */
export type MockState = {
  accounts: Record<string, StoredAccount>;
  challenges: Record<string, StoredChallenge>;
  idempotency: Record<string, { readonly login: string; readonly response: RegisterResponse }>;
  failures: Record<string, number>;
  /** Stands in for the HttpOnly session cookie. */
  sessionLogin: string | null;
};

function emptyState(): MockState {
  return { accounts: {}, challenges: {}, idempotency: {}, failures: {}, sessionLogin: null };
}

/** Outside a browser (unit tests) the mock server keeps its state in memory instead. */
let memoryCopy: string | null = null;

function readRaw(): string | null {
  return typeof window === "undefined" ? memoryCopy : window.sessionStorage.getItem(STORAGE_KEY);
}

export function loadMockState(): MockState {
  const raw = readRaw();
  if (!raw) return emptyState();
  // Mock-only data written by this module; a broken value just resets the mock server.
  try {
    return { ...emptyState(), ...(JSON.parse(raw) as Partial<MockState>) };
  } catch {
    return emptyState();
  }
}

export function saveMockState(state: MockState): void {
  const raw = JSON.stringify(state);
  if (typeof window === "undefined") memoryCopy = raw;
  else window.sessionStorage.setItem(STORAGE_KEY, raw);
}

export function resetMockState(): void {
  memoryCopy = null;
  if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
}
