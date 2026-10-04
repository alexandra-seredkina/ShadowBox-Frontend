import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { mockLabelApi } from "@/features/mock-server/mock-label-api";
import { selectApi } from "@/shared/api/client";
import { requestEmpty, requestJson } from "@/shared/api/http-client";
import { labelListSchema, labelSchema, type Label } from "./label-schemas";

/** `/labels` from API.md §7.1. Every method rejects with `ApiError`. */
export type LabelApi = {
  readonly listLabels: () => Promise<readonly Label[]>;
  readonly createLabel: (encryptedName: EncryptedBlob) => Promise<Label>;
  readonly renameLabel: (id: string, encryptedName: EncryptedBlob) => Promise<Label>;
  /** Taken off messages and addresses; the messages stay. */
  readonly deleteLabel: (id: string) => Promise<void>;
};

function labelPath(id: string): string {
  return `/labels/${encodeURIComponent(id)}`;
}

const httpLabelApi: LabelApi = {
  listLabels: async () => (await requestJson("/labels", labelListSchema)).items,

  createLabel: (encryptedName) => requestJson("/labels", labelSchema, { method: "POST", body: { encryptedName } }),

  renameLabel: (id, encryptedName) => requestJson(labelPath(id), labelSchema, { method: "PATCH", body: { encryptedName } }),

  deleteLabel: (id) => requestEmpty(labelPath(id), { method: "DELETE" }),
};

export const labelApi: LabelApi = selectApi({ http: httpLabelApi, mock: mockLabelApi });
