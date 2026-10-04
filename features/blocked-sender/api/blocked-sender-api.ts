import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { mockBlockedSenderApi } from "@/features/mock-server/mock-blocked-sender-api";
import { selectApi } from "@/shared/api/client";
import { requestEmpty, requestJson } from "@/shared/api/http-client";
import { blockedSenderListSchema, blockedSenderSchema, type BlockedSender } from "./blocked-sender-schemas";

/** `/blocked-senders` from API.md §8.1. Every method rejects with `ApiError`. */
export type BlockedSenderApi = {
  readonly listBlocked: () => Promise<readonly BlockedSender[]>;
  /** The server hashes `address` and keeps only the sealed copy; blocking twice returns the first entry. */
  readonly block: (address: string, encryptedAddress: EncryptedBlob) => Promise<BlockedSender>;
  readonly unblock: (id: string) => Promise<void>;
};

const httpBlockedSenderApi: BlockedSenderApi = {
  listBlocked: async () => (await requestJson("/blocked-senders", blockedSenderListSchema)).items,

  block: (address, encryptedAddress) =>
    requestJson("/blocked-senders", blockedSenderSchema, { method: "POST", body: { address, encryptedAddress } }),

  unblock: (id) => requestEmpty(`/blocked-senders/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const blockedSenderApi: BlockedSenderApi = selectApi({ http: httpBlockedSenderApi, mock: mockBlockedSenderApi });
