import type { FolderApi } from "@/features/folder/api/folder-api";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { findSessionAccount, loadMockState } from "./mock-state";

export const mockFolderApi: FolderApi = {
  async listFolders() {
    const stored = findSessionAccount(loadMockState());
    if (!stored) return mockFail({ status: 401, code: "UNAUTHENTICATED" });
    return mockRespond(stored.folders);
  },
};
