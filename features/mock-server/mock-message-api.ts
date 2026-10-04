import type { MessageApi } from "@/features/message/api/message-api";
import {
  MAX_BATCH_IDS,
  MESSAGE_PAGE_LIMIT,
  type BatchRequest,
  type MessageScope,
  type MessageSummary,
} from "@/features/message/api/message-schemas";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { newestFirst, type SortKey } from "./mock-mail-delivery";
import { findSessionAccount, loadMockState, saveMockState, type MockState, type StoredAccount, type StoredMessage } from "./mock-state";

const MAX_PAGE_LIMIT = 100;
const MAX_LABELS_PER_MESSAGE = 50;

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

function hasLabels(stored: StoredAccount, labelIds: readonly string[]): boolean {
  return labelIds.every((labelId) => stored.labels.some((label) => label.id === labelId));
}

function scopeKey(scope: MessageScope): string {
  switch (scope.kind) {
    case "folder":
      return `f:${scope.folderId}`;
    case "label":
      return `l:${scope.labelId}`;
    case "starred":
      return "s";
  }
}

function isOwnScope(stored: StoredAccount, scope: MessageScope): boolean {
  switch (scope.kind) {
    case "folder":
      return hasFolder(stored, scope.folderId);
    case "label":
      return hasLabels(stored, [scope.labelId]);
    case "starred":
      return true;
  }
}

/** Views across folders leave the trash out. */
function isInScope(stored: StoredAccount, message: StoredMessage, scope: MessageScope): boolean {
  const trash = stored.folders.find((folder) => folder.systemRole === "trash");
  switch (scope.kind) {
    case "folder":
      return message.folderId === scope.folderId;
    case "label":
      return message.labelIds.includes(scope.labelId) && message.folderId !== trash?.id;
    case "starred":
      return message.isStarred && message.folderId !== trash?.id;
  }
}

/** The cursor is opaque to the client; the mock packs the scope and the last item's sort key into it. */
function encodeCursor(scope: MessageScope, message: StoredMessage): string {
  return btoa(JSON.stringify([scopeKey(scope), message.receivedAt, message.id]));
}

function decodeCursor(cursor: string, scope: MessageScope): SortKey | null {
  try {
    const value: unknown = JSON.parse(atob(cursor));
    if (!Array.isArray(value) || value[0] !== scopeKey(scope)) return null;
    if (typeof value[1] !== "string" || typeof value[2] !== "string") return null;
    return { receivedAt: value[1], id: value[2] };
  } catch {
    return null;
  }
}

/** Applies `change` to the account's messages with these ids; returns how many it touched. */
function updateMessages(
  stored: StoredAccount,
  ids: ReadonlySet<string>,
  change: (message: StoredMessage) => StoredMessage,
): number {
  let processed = 0;
  stored.messages = stored.messages.map((message) => {
    if (!ids.has(message.id)) return message;
    processed += 1;
    return change(message);
  });
  return processed;
}

/** What a batch action does to one message; null for a delete. */
function batchChange(request: BatchRequest): ((message: StoredMessage) => StoredMessage) | null {
  switch (request.action) {
    case "markRead":
    case "markUnread":
      return (message) => ({ ...message, isRead: request.action === "markRead" });
    case "star":
    case "unstar":
      return (message) => ({ ...message, isStarred: request.action === "star" });
    case "move":
      return (message) => ({ ...message, folderId: request.folderId });
    case "label":
      return (message) => ({
        ...message,
        labelIds: message.labelIds.includes(request.labelId) ? message.labelIds : [...message.labelIds, request.labelId],
      });
    case "unlabel":
      return (message) => ({ ...message, labelIds: message.labelIds.filter((labelId) => labelId !== request.labelId) });
    case "delete":
      return null;
  }
}

function isBatchTargetOwn(stored: StoredAccount, request: BatchRequest): boolean {
  if (request.action === "move") return hasFolder(stored, request.folderId);
  if (request.action === "label" || request.action === "unlabel") return hasLabels(stored, [request.labelId]);
  return true;
}

/** Labels keep their creation order on a message, as the server returns them. */
function inLabelOrder(stored: StoredAccount, labelIds: readonly string[]): string[] {
  return stored.labels.map((label) => label.id).filter((id) => labelIds.includes(id));
}

/** `/messages` on the shared mock server, following API.md §8 including error codes. */
export const mockMessageApi: MessageApi = {
  async listMessages({ scope, cursor, limit = MESSAGE_PAGE_LIMIT }) {
    const session = openSession();
    if (!session) return unauthenticated();
    const { stored } = session;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) return invalid("limit", "invalid_value");
    if (!isOwnScope(stored, scope)) return notFound();
    const after = cursor === null ? null : decodeCursor(cursor, scope);
    if (cursor !== null && after === null) return invalid("cursor", "invalid_format");

    const inScope = stored.messages.filter((message) => isInScope(stored, message, scope));
    const rest = after === null ? inScope : inScope.filter((message) => newestFirst(after, message) < 0);
    const page = rest.slice(0, limit);
    const last = page.at(-1);
    const nextCursor = rest.length > limit && last ? encodeCursor(scope, last) : null;
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
    const { stored } = session;
    if (request.labelIds !== undefined) {
      const isDistinct = new Set(request.labelIds).size === request.labelIds.length;
      if (!isDistinct || request.labelIds.length > MAX_LABELS_PER_MESSAGE) return invalid("labelIds", "invalid_format");
      if (!hasLabels(stored, request.labelIds)) return notFound();
    }
    if (request.folderId !== undefined && !hasFolder(stored, request.folderId)) return notFound();
    const changed = updateMessages(stored, new Set([id]), (message) => ({
      ...message,
      ...request,
      labelIds: request.labelIds === undefined ? message.labelIds : inLabelOrder(stored, request.labelIds),
    }));
    if (changed === 0) return notFound();
    saveMockState(session.state);
    const message = findMessage(stored, id);
    return message ? mockRespond(summaryOf(message)) : notFound();
  },

  async batch(request) {
    const session = openSession();
    if (!session) return unauthenticated();
    if (request.ids.length < 1 || request.ids.length > MAX_BATCH_IDS) return invalid("ids", "invalid_value");
    const { stored } = session;
    if (!isBatchTargetOwn(stored, request)) return notFound();
    const ids = new Set(request.ids);
    const change = batchChange(request);
    let processed: number;
    if (change === null) {
      const before = stored.messages.length;
      stored.messages = stored.messages.filter((message) => !ids.has(message.id));
      processed = before - stored.messages.length;
    } else {
      processed = updateMessages(stored, ids, change);
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
