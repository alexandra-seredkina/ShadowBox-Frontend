import type { LabelApi } from "@/features/label/api/label-api";
import type { Label } from "@/features/label/api/label-schemas";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { findSessionAccount, loadMockState, newId, saveMockState, type MockState, type StoredAccount } from "./mock-state";

/** API.md §7.1. */
const MAX_LABELS = 50;

type Session = { readonly state: MockState; readonly stored: StoredAccount };

function openSession(): Session | null {
  const state = loadMockState();
  const stored = findSessionAccount(state);
  return stored ? { state, stored } : null;
}

/** Unread labelled messages outside the trash, counted per request as the server does. */
function withUnreadCount(stored: StoredAccount, label: Omit<Label, "unreadCount">): Label {
  const trash = stored.folders.find((folder) => folder.systemRole === "trash");
  const unreadCount = stored.messages.filter(
    (message) => message.labelIds.includes(label.id) && !message.isRead && message.folderId !== trash?.id,
  ).length;
  return { ...label, unreadCount };
}

const unauthenticated = (): Promise<never> => mockFail({ status: 401, code: "UNAUTHENTICATED" });
const notFound = (): Promise<never> => mockFail({ status: 404, code: "NOT_FOUND" });

/** `/labels` on the shared mock server, following API.md §7.1 including error codes. */
export const mockLabelApi: LabelApi = {
  async listLabels() {
    const session = openSession();
    if (!session) return unauthenticated();
    const { stored } = session;
    return mockRespond(stored.labels.map((label) => withUnreadCount(stored, label)));
  },

  async createLabel(encryptedName) {
    const session = openSession();
    if (!session) return unauthenticated();
    if (session.stored.labels.length >= MAX_LABELS) return mockFail({ status: 422, code: "LABEL_LIMIT_EXCEEDED" });
    const label = { id: newId(), encryptedName };
    session.stored.labels.push(label);
    saveMockState(session.state);
    return mockRespond({ ...label, unreadCount: 0 });
  },

  async renameLabel(id, encryptedName) {
    const session = openSession();
    if (!session) return unauthenticated();
    const { stored } = session;
    if (!stored.labels.some((label) => label.id === id)) return notFound();
    stored.labels = stored.labels.map((label) => (label.id === id ? { ...label, encryptedName } : label));
    saveMockState(session.state);
    return mockRespond(withUnreadCount(stored, { id, encryptedName }));
  },

  async deleteLabel(id) {
    const session = openSession();
    if (!session) return unauthenticated();
    const { stored } = session;
    if (!stored.labels.some((label) => label.id === id)) return notFound();
    stored.labels = stored.labels.filter((label) => label.id !== id);
    stored.messages = stored.messages.map((message) => ({ ...message, labelIds: message.labelIds.filter((labelId) => labelId !== id) }));
    stored.aliases = stored.aliases.map((alias) => ({ ...alias, labelIds: alias.labelIds.filter((labelId) => labelId !== id) }));
    saveMockState(session.state);
    return mockRespond(undefined);
  },
};
