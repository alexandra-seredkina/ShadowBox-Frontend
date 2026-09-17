import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { mockFolderApi } from "@/features/mock-server/mock-folder-api";
import { selectApi } from "@/shared/api/client";
import { requestEmpty, requestJson } from "@/shared/api/http-client";
import { folderListSchema, folderSchema, type Folder } from "./folder-schemas";

/** `/folders` from API.md §7. Every method rejects with `ApiError`. */
export type FolderApi = {
  readonly listFolders: () => Promise<readonly Folder[]>;
  readonly createFolder: (encryptedName: EncryptedBlob) => Promise<Folder>;
  readonly renameFolder: (id: string, encryptedName: EncryptedBlob) => Promise<Folder>;
  /** Mail moves to the inbox, aliases pointing here get `folderId: null`. */
  readonly deleteFolder: (id: string) => Promise<void>;
};

function folderPath(id: string): string {
  return `/folders/${encodeURIComponent(id)}`;
}

const httpFolderApi: FolderApi = {
  listFolders: async () => (await requestJson("/folders", folderListSchema)).items,

  createFolder: (encryptedName) => requestJson("/folders", folderSchema, { method: "POST", body: { encryptedName } }),

  renameFolder: (id, encryptedName) =>
    requestJson(folderPath(id), folderSchema, { method: "PATCH", body: { encryptedName } }),

  deleteFolder: (id) => requestEmpty(folderPath(id), { method: "DELETE" }),
};

export const folderApi: FolderApi = selectApi({ http: httpFolderApi, mock: mockFolderApi });
