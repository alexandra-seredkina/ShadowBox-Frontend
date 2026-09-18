import type { AccountApi } from "@/features/account/api/account-api";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { accountView, findSessionAccount, loadMockState, saveMockState, today } from "./mock-state";

const MOCK_SESSION_ID = "mock-session";

const unauthenticated = (): Promise<never> => mockFail({ status: 401, code: "UNAUTHENTICATED" });

/** `/account` and `/sessions` on the shared mock server. The mock knows one session: this tab. */
export const mockAccountApi: AccountApi = {
  async loadAccount() {
    const stored = findSessionAccount(loadMockState());
    return stored ? mockRespond(accountView(stored)) : unauthenticated();
  },

  async setIpBinding(ipBinding) {
    const state = loadMockState();
    const stored = findSessionAccount(state);
    if (!stored) return unauthenticated();
    stored.account = { ...stored.account, settings: { ...stored.account.settings, ipBinding } };
    saveMockState(state);
    return mockRespond(accountView(stored));
  },

  async deleteAccount() {
    const state = loadMockState();
    const login = state.sessionLogin;
    if (login === null || !state.accounts[login]) return unauthenticated();
    if (state.reauthUntil === null || state.reauthUntil <= Date.now()) {
      return mockFail({ status: 403, code: "REAUTH_REQUIRED" });
    }
    delete state.accounts[login];
    state.sessionLogin = null;
    state.reauthUntil = null;
    saveMockState(state);
    return mockRespond(undefined);
  },

  async listSessions() {
    const stored = findSessionAccount(loadMockState());
    if (!stored) return unauthenticated();
    const isIpBound = stored.account.settings.ipBinding;
    const day = today();
    return mockRespond([
      { id: MOCK_SESSION_ID, isCurrent: true, device: "Browser · OS", createdAt: day, lastActiveAt: day, isIpBound },
    ]);
  },

  async endSession(id) {
    const state = loadMockState();
    if (!findSessionAccount(state)) return unauthenticated();
    if (id !== MOCK_SESSION_ID) return mockFail({ status: 404, code: "NOT_FOUND" });
    state.sessionLogin = null;
    state.reauthUntil = null;
    saveMockState(state);
    return mockRespond(undefined);
  },

  async endOtherSessions() {
    return findSessionAccount(loadMockState()) ? mockRespond(undefined) : unauthenticated();
  },
};
