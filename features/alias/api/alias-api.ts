import { mockAliasApi } from "@/features/mock-server/mock-alias-api";
import { selectApi } from "@/shared/api/client";
import { requestEmpty, requestJson } from "@/shared/api/http-client";
import { aliasListSchema, aliasSchema, type Alias, type CreateAliasRequest, type UpdateAliasRequest } from "./alias-schemas";

/** `/aliases` from API.md §6. Every method rejects with `ApiError`. */
export type AliasApi = {
  readonly listAliases: () => Promise<readonly Alias[]>;
  readonly createAlias: (request: CreateAliasRequest, idempotencyKey: string) => Promise<Alias>;
  readonly updateAlias: (id: string, request: UpdateAliasRequest) => Promise<Alias>;
  /** Revokes the address forever; permanent ones need a fresh reauth (403 REAUTH_REQUIRED). */
  readonly revokeAlias: (id: string) => Promise<void>;
};

const httpAliasApi: AliasApi = {
  listAliases: async () => (await requestJson("/aliases", aliasListSchema)).items,

  createAlias: (request, idempotencyKey) =>
    requestJson("/aliases", aliasSchema, { method: "POST", body: request, idempotencyKey }),

  updateAlias: (id, request) =>
    requestJson(`/aliases/${encodeURIComponent(id)}`, aliasSchema, { method: "PATCH", body: request }),

  revokeAlias: (id) => requestEmpty(`/aliases/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const aliasApi: AliasApi = selectApi({ http: httpAliasApi, mock: mockAliasApi });
