import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { mockMessageApi } from "@/features/mock-server/mock-message-api";
import { selectApi } from "@/shared/api/client";
import { requestEmpty, requestJson } from "@/shared/api/http-client";
import {
  MESSAGE_PAGE_LIMIT,
  batchResultSchema,
  messageContentSchema,
  messagePageSchema,
  messageSummarySchema,
  type BatchRequest,
  type ListMessagesRequest,
  type MessagePage,
  type MessageSummary,
  type UpdateMessageRequest,
} from "./message-schemas";

/** `/messages` from API.md §8. Every method rejects with `ApiError`. */
export type MessageApi = {
  /** Newest first; pass the previous page's `nextCursor` to continue. */
  readonly listMessages: (request: ListMessagesRequest) => Promise<MessagePage>;
  readonly loadMessage: (id: string) => Promise<MessageSummary>;
  /** The whole raw MIME, sealed; can be tens of megabytes. */
  readonly loadContent: (id: string) => Promise<EncryptedBlob>;
  readonly updateMessage: (id: string, request: UpdateMessageRequest) => Promise<MessageSummary>;
  /** Ids that are not ours are skipped silently; `processed` counts the rest. */
  readonly batch: (request: BatchRequest) => Promise<number>;
  /** Forever: the ciphertext is gone. Moving to the trash is `updateMessage` instead. */
  readonly deleteMessage: (id: string) => Promise<void>;
};

function messagePath(id: string): string {
  return `/messages/${encodeURIComponent(id)}`;
}

const httpMessageApi: MessageApi = {
  listMessages: ({ folderId, cursor, limit = MESSAGE_PAGE_LIMIT }) => {
    const query = new URLSearchParams({ folderId, limit: String(limit) });
    if (cursor !== null) query.set("cursor", cursor);
    return requestJson(`/messages?${query.toString()}`, messagePageSchema);
  },

  loadMessage: (id) => requestJson(messagePath(id), messageSummarySchema),

  loadContent: async (id) => (await requestJson(`${messagePath(id)}/content`, messageContentSchema)).body,

  updateMessage: (id, request) => requestJson(messagePath(id), messageSummarySchema, { method: "PATCH", body: request }),

  batch: async (request) =>
    (await requestJson("/messages/batch", batchResultSchema, { method: "POST", body: request })).processed,

  deleteMessage: (id) => requestEmpty(messagePath(id), { method: "DELETE" }),
};

export const messageApi: MessageApi = selectApi({ http: httpMessageApi, mock: mockMessageApi });
