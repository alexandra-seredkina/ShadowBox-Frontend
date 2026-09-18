import { z } from "zod";
import { accountSchema, type Account } from "@/features/auth/api/auth-schemas";
import { mockAccountApi } from "@/features/mock-server/mock-account-api";
import { selectApi } from "@/shared/api/client";
import { requestEmpty, requestJson } from "@/shared/api/http-client";

/** API.md §4. */
export const sessionInfoSchema = z.object({
  id: z.string(),
  isCurrent: z.boolean(),
  device: z.string(),
  createdAt: z.iso.date(),
  lastActiveAt: z.iso.date(),
  isIpBound: z.boolean(),
});

export type SessionInfo = z.infer<typeof sessionInfoSchema>;

const sessionListSchema = z.object({ items: z.array(sessionInfoSchema) });

/** `/account` and `/sessions` from API.md §4–5. Every method rejects with `ApiError`. */
export type AccountApi = {
  readonly loadAccount: () => Promise<Account>;
  readonly setIpBinding: (ipBinding: boolean) => Promise<Account>;
  /** 🔒 reauth. Irreversible: addresses are revoked, keys and mail are deleted. */
  readonly deleteAccount: () => Promise<void>;
  readonly listSessions: () => Promise<readonly SessionInfo[]>;
  /** Ending the current session signs out, like `/auth/logout`. */
  readonly endSession: (id: string) => Promise<void>;
  readonly endOtherSessions: () => Promise<void>;
};

const httpAccountApi: AccountApi = {
  loadAccount: () => requestJson("/account", accountSchema),
  setIpBinding: (ipBinding) => requestJson("/account/settings", accountSchema, { method: "PATCH", body: { ipBinding } }),
  deleteAccount: () => requestEmpty("/account", { method: "DELETE" }),
  listSessions: async () => (await requestJson("/sessions", sessionListSchema)).items,
  endSession: (id) => requestEmpty(`/sessions/${encodeURIComponent(id)}`, { method: "DELETE" }),
  endOtherSessions: () => requestEmpty("/sessions", { method: "DELETE" }),
};

export const accountApi: AccountApi = selectApi({ http: httpAccountApi, mock: mockAccountApi });
