import type { Alias } from "@/features/alias/api/alias-schemas";
import type { Account, PowPurpose, RegisterResponse } from "@/features/auth/api/auth-schemas";
import type { KdfParams } from "@/features/crypto/model/kdf";
import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import type { EncryptedKey } from "@/features/crypto/model/key-pair";
import type { Folder } from "@/features/folder/api/folder-schemas";
import type { MessageSummary } from "@/features/message/api/message-schemas";

const STORAGE_KEY = "shadowbox-mock-server";

export type StoredAccount = {
  readonly authKey: string;
  readonly kdf: KdfParams;
  readonly publicKey: string;
  readonly encryptedPrivateKey: EncryptedKey;
  account: Account;
  aliases: Alias[];
  folders: Folder[];
  /** Newest first, as `GET /messages` returns them. */
  messages: StoredMessage[];
  /** Stands in for D-009 sender hashes: senders this account has had mail from. */
  knownSenders: string[];
};

export type StoredMessage = MessageSummary & {
  /** `GET /messages/{id}/content`: the raw MIME sealed for the account. */
  readonly body: EncryptedBlob;
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
  /** Idempotency-Key → original response, per endpoint. */
  registerReplays: Record<string, { readonly login: string; readonly response: RegisterResponse }>;
  aliasReplays: Record<string, { readonly request: string; readonly alias: Alias }>;
  failures: Record<string, number>;
  /** Stands in for the HttpOnly session cookie. */
  sessionLogin: string | null;
  /** Epoch milliseconds until which 🔒 actions are allowed. */
  reauthUntil: number | null;
};

function emptyState(): MockState {
  return {
    accounts: {},
    challenges: {},
    registerReplays: {},
    aliasReplays: {},
    failures: {},
    sessionLogin: null,
    reauthUntil: null,
  };
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
    const state = { ...emptyState(), ...(JSON.parse(raw) as Partial<MockState>) };
    // Accounts saved before the mock had mail start with an empty mailbox.
    for (const stored of Object.values(state.accounts)) {
      stored.messages ??= [];
      stored.knownSenders ??= [];
    }
    return state;
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

/** `Account` as the server reports it: the active alias count is always current. */
export function accountView(stored: StoredAccount): Account {
  const activeAliases = stored.aliases.filter((alias) => alias.status === "active").length;
  return { ...stored.account, limits: { ...stored.account.limits, activeAliases } };
}

/** The signed-in account, or null when the request would get 401 UNAUTHENTICATED. */
export function findSessionAccount(state: MockState): StoredAccount | null {
  return state.sessionLogin === null ? null : (state.accounts[state.sessionLogin] ?? null);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Server-side ids are UUIDv7; the mock only needs them to be unique and unguessable. */
export function newId(): string {
  return crypto.randomUUID();
}
