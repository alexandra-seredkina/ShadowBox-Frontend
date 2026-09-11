import { powChallengeSchema } from "@/features/crypto/pow/solve-pow";
import { requestEmpty, requestJson } from "@/shared/api/http-client";
import type { AuthApi } from "./auth-api";
import {
  loginResponseSchema,
  preloginResponseSchema,
  registerResponseSchema,
  sessionResponseSchema,
} from "./auth-schemas";

export const httpAuthApi: AuthApi = {
  requestPow: (purpose) => requestJson("/auth/pow", powChallengeSchema, { method: "POST", body: { purpose } }),

  prelogin: async (login) => {
    const { kdf } = await requestJson("/auth/prelogin", preloginResponseSchema, { method: "POST", body: { login } });
    return kdf;
  },

  register: (request, idempotencyKey) =>
    requestJson("/auth/register", registerResponseSchema, { method: "POST", body: request, idempotencyKey }),

  login: (request) => requestJson("/auth/login", loginResponseSchema, { method: "POST", body: request }),

  logout: () => requestEmpty("/auth/logout", { method: "POST", body: {} }),

  loadSession: () => requestJson("/auth/session", sessionResponseSchema),

  reauth: (authKey) => requestEmpty("/auth/reauth", { method: "POST", body: { authKey } }),
};
