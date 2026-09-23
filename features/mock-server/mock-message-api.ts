import type { MessageApi } from "@/features/message/api/message-api";
import { MAX_BATCH_IDS, MESSAGE_PAGE_LIMIT, type MessageSummary } from "@/features/message/api/message-schemas";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { newestFirst, type SortKey } from "./mock-mail-delivery";
import { findSessionAccount, loadMockState, saveMockState, type MockState, type StoredAccount, type StoredMessage } from "./mock-state";

const MAX_PAGE_LIMIT = 100;

type Session = { readonly state: MockState; readonly stored: StoredAccount };

function openSession(): Session | null {
  const state = loadMockState();
  const stored = findSessionAccount(state);
  return stored ? { state, stored } : null;
}

const unauthenticated = (): Promise<never> => mockFail({ status: 401, code: "UNAUTHENTICATED" });
const notFound = (): Promise<never> => mockFail({ status: 404, code: "NOT_FOUND" });
const invalid = (path: string, issue: string): Promise<never> =>
  mockFail({ status: 400, code: "VALIDATION_FAILED", details: [{ path, issue }] });

function summaryOf(message: StoredMessage): MessageSummary {
  const { body: _body, ...summary } = message;
  return summary;
}

function findMessage(stored: StoredAccount, id: string): StoredMessage | undefined {
  return stored.messages.find((message) => message.id === id);
}

function hasFolder(stored: StoredAccount, folderId: string): boolean {
  return stored.folders.some((folder) => folder.id === folderId);
}

/** The cursor is opaque to the client; the mock packs the last item's sort key into it. */
function encodeCursor(message: StoredMessage): string {
  return btoa(JSON.stringify([message.receivedAt, message.id]));
}

function decodeCursor(cursor: string): SortKey | null {
  try {
    const value: unknown = JSON.parse(atob(cursor));
    if (!Array.isArray(value) || typeof value[0] !== "string" || typeof value[1] !== "string") return null;
    return { receivedAt: value[0], id: value[1] };
  } catch {
    return null;
  }
}

/** Applies `change` to the account's messages with these ids; returns how many it touched. */
function updateMessages(stored: StoredAccount, ids: ReadonlySet<string>, change: Partial<MessageSummary>): number {
  let processed = 0;
  stored.messages = stored.messages.map((message) => {
    if (!ids.has(message.id)) return message;
    processed += 1;
    return { ...message, ...change };
  });
  return processed;
}

/** `/messages` on the shared mock server, following API.md §8 including error codes. */
export const mockMessageApi: MessageApi = {
  async listMessages({ folderId, cursor, limit = MESSAGE_PAGE_LIMIT }) {
    const session = openSession();
    if (!session) return unauthenticated();
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) return invalid("limit", "invalid_value");
    if (!hasFolder(session.stored, folderId)) return notFound();
    const after = cursor === null ? null : decodeCursor(cursor);
    if (cursor !== null && after === null) return invalid("cursor", "invalid_format");

    const inFolder = session.stored.messages.filter((message) => message.folderId === folderId);
    const rest = after === null ? inFolder : inFolder.filter((message) => newestFirst(after, message) < 0);
    const page = rest.slice(0, limit);
    const last = page.at(-1);
    const nextCursor = rest.length > limit && last ? encodeCursor(last) : null;
    return mockRespond({ items: page.map(summaryOf), nextCursor });
  },

  async loadMessage(id) {
    const session = openSession();
    if (!session) return unauthenticated();
    const message = findMessage(session.stored, id);
    return message ? mockRespond(summaryOf(message)) : notFound();
  },

  async loadContent(id) {
    const session = openSession();
    if (!session) return unauthenticated();
    const message = findMessage(session.stored, id);
    return message ? mockRespond(message.body) : notFound();
  },

  async updateMessage(id, request) {
    const session = openSession();
    if (!session) return unauthenticated();
    if (request.folderId !== undefined && !hasFolder(session.stored, request.folderId)) return notFound();
    if (updateMessages(session.stored, new Set([id]), request) === 0) return notFound();
    saveMockState(session.state);
    const message = findMessage(session.stored, id);
    return message ? mockRespond(summaryOf(message)) : notFound();
  },

  async batch(request) {
    const session = openSession();
    if (!session) return unauthenticated();
    if (request.ids.length < 1 || request.ids.length > MAX_BATCH_IDS) return invalid("ids", "invalid_value");
    const ids = new Set(request.ids);
    const { stored } = session;
    let processed: number;
    if (request.action === "delete") {
      const before = stored.messages.length;
      stored.messages = stored.messages.filter((message) => !ids.has(message.id));
      processed = before - stored.messages.length;
    } else if (request.action === "move") {
      if (!hasFolder(stored, request.folderId)) return notFound();
      processed = updateMessages(stored, ids, { folderId: request.folderId });
    } else {
      processed = updateMessages(stored, ids, { isRead: request.action === "markRead" });
    }
    saveMockState(session.state);
    return mockRespond(processed);
  },

  async deleteMessage(id) {
    const session = openSession();
    if (!session) return unauthenticated();
    const before = session.stored.messages.length;
    session.stored.messages = session.stored.messages.filter((message) => message.id !== id);
    if (session.stored.messages.length === before) return notFound();
    saveMockState(session.state);
    return mockRespond(undefined);
  },
};
