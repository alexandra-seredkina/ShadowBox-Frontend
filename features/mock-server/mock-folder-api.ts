import type { FolderApi } from "@/features/folder/api/folder-api";
import type { Folder } from "@/features/folder/api/folder-schemas";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { findSessionAccount, loadMockState, newId, saveMockState, type MockState, type StoredAccount } from "./mock-state";

/** API.md §7: the limit counts custom folders only. */
const MAX_CUSTOM_FOLDERS = 50;

type Session = { readonly state: MockState; readonly stored: StoredAccount };

function openSession(): Session | null {
  const state = loadMockState();
  const stored = findSessionAccount(state);
  return stored ? { state, stored } : null;
}

/** `unreadCount` is always current, as the server counts it per request. */
function withUnreadCount(stored: StoredAccount, folder: Folder): Folder {
  const unreadCount = stored.messages.filter((message) => message.folderId === folder.id && !message.isRead).length;
  return { ...folder, unreadCount };
}

const unauthenticated = (): Promise<never> => mockFail({ status: 401, code: "UNAUTHENTICATED" });
const notFound = (): Promise<never> => mockFail({ status: 404, code: "NOT_FOUND" });
const isSystem = (): Promise<never> => mockFail({ status: 422, code: "FOLDER_IS_SYSTEM" });

/** `/folders` on the shared mock server, following API.md §7 including error codes. */
export const mockFolderApi: FolderApi = {
  async listFolders() {
    const session = openSession();
    if (!session) return unauthenticated();
    const { stored } = session;
    return mockRespond(stored.folders.map((folder) => withUnreadCount(stored, folder)));
  },

  async createFolder(encryptedName) {
    const session = openSession();
    if (!session) return unauthenticated();
    const customCount = session.stored.folders.filter((folder) => folder.kind === "custom").length;
    if (customCount >= MAX_CUSTOM_FOLDERS) return mockFail({ status: 422, code: "FOLDER_LIMIT_EXCEEDED" });
    const folder: Folder = { id: newId(), kind: "custom", systemRole: null, encryptedName, unreadCount: 0 };
    session.stored.folders.push(folder);
    saveMockState(session.state);
    return mockRespond(folder);
  },

  async renameFolder(id, encryptedName) {
    const session = openSession();
    if (!session) return unauthenticated();
    const folder = session.stored.folders.find((candidate) => candidate.id === id);
    if (!folder) return notFound();
    if (folder.kind === "system") return isSystem();
    const renamed: Folder = { ...folder, encryptedName };
    session.stored.folders = session.stored.folders.map((candidate) => (candidate.id === id ? renamed : candidate));
    saveMockState(session.state);
    return mockRespond(withUnreadCount(session.stored, renamed));
  },

  async deleteFolder(id) {
    const session = openSession();
    if (!session) return unauthenticated();
    const { state, stored } = session;
    const folder = stored.folders.find((candidate) => candidate.id === id);
    if (!folder) return notFound();
    if (folder.kind === "system") return isSystem();
    const inbox = stored.folders.find((candidate) => candidate.systemRole === "inbox");
    stored.folders = stored.folders.filter((candidate) => candidate.id !== id);
    if (inbox) {
      stored.messages = stored.messages.map((message) => (message.folderId === id ? { ...message, folderId: inbox.id } : message));
    }
    stored.aliases = stored.aliases.map((alias) => (alias.folderId === id ? { ...alias, folderId: null } : alias));
    saveMockState(state);
    return mockRespond(undefined);
  },
};
