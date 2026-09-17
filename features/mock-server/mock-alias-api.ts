import type { AliasApi } from "@/features/alias/api/alias-api";
import type { Alias } from "@/features/alias/api/alias-schemas";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { newAlias } from "./mock-records";
import { accountView, findSessionAccount, loadMockState, saveMockState, type MockState, type StoredAccount } from "./mock-state";

type Session = { readonly state: MockState; readonly stored: StoredAccount };

function openSession(): Session | null {
  const state = loadMockState();
  const stored = findSessionAccount(state);
  if (!stored) return null;
  // Stands in for the server's expiry job: an expired address is revoked and disappears.
  stored.aliases = stored.aliases.filter((alias) => alias.expiresAt === null || Date.parse(alias.expiresAt) > Date.now());
  return { state, stored };
}

function hasFolder(stored: StoredAccount, folderId: string | null | undefined): boolean {
  return folderId === null || folderId === undefined || stored.folders.some((folder) => folder.id === folderId);
}

/** API.md §6: only `active` addresses count towards the limit. */
function isAtActiveLimit(stored: StoredAccount): boolean {
  const { activeAliases, maxActiveAliases } = accountView(stored).limits;
  return activeAliases >= maxActiveAliases;
}

const unauthenticated = (): Promise<never> => mockFail({ status: 401, code: "UNAUTHENTICATED" });
const notFound = (): Promise<never> => mockFail({ status: 404, code: "NOT_FOUND" });

/** `/aliases` on the shared mock server, following API.md §6 including error codes. */
export const mockAliasApi: AliasApi = {
  async listAliases() {
    const session = openSession();
    if (!session) return unauthenticated();
    saveMockState(session.state);
    return mockRespond(session.stored.aliases);
  },

  async createAlias(request, idempotencyKey) {
    const session = openSession();
    if (!session) return unauthenticated();
    const { state, stored } = session;
    const replay = state.aliasReplays[idempotencyKey];
    if (replay) {
      return replay.request === JSON.stringify(request)
        ? mockRespond(replay.alias)
        : mockFail({ status: 409, code: "IDEMPOTENCY_CONFLICT" });
    }
    if (!hasFolder(stored, request.folderId)) return notFound();
    if (isAtActiveLimit(stored)) return mockFail({ status: 422, code: "ALIAS_LIMIT_EXCEEDED" });

    const alias = newAlias({
      kind: request.kind,
      ttl: request.kind === "temporary" ? request.ttl : null,
      encryptedLabel: request.encryptedLabel,
      folderId: request.folderId,
    });
    stored.aliases.unshift(alias);
    state.aliasReplays[idempotencyKey] = { request: JSON.stringify(request), alias };
    saveMockState(state);
    return mockRespond(alias);
  },

  async updateAlias(id, request) {
    const session = openSession();
    if (!session) return unauthenticated();
    const index = session.stored.aliases.findIndex((alias) => alias.id === id);
    const current = session.stored.aliases[index];
    if (!current || !hasFolder(session.stored, request.folderId)) return notFound();
    const isEnabling = request.status === "active" && current.status === "disabled";
    if (isEnabling && isAtActiveLimit(session.stored)) return mockFail({ status: 422, code: "ALIAS_LIMIT_EXCEEDED" });
    const updated: Alias = { ...current, ...request };
    session.stored.aliases[index] = updated;
    saveMockState(session.state);
    return mockRespond(updated);
  },

  async revokeAlias(id) {
    const session = openSession();
    if (!session) return unauthenticated();
    const { state, stored } = session;
    const alias = stored.aliases.find((candidate) => candidate.id === id);
    if (!alias) return notFound();
    const isReauthFresh = state.reauthUntil !== null && state.reauthUntil > Date.now();
    if (alias.kind === "permanent" && !isReauthFresh) return mockFail({ status: 403, code: "REAUTH_REQUIRED" });
    stored.aliases = stored.aliases.filter((candidate) => candidate.id !== id);
    saveMockState(state);
    return mockRespond(undefined);
  },
};
