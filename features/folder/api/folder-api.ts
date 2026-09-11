import { mockFolderApi } from "@/features/mock-server/mock-folder-api";
import { selectApi } from "@/shared/api/client";
import { requestJson } from "@/shared/api/http-client";
import { folderListSchema, type Folder } from "./folder-schemas";

/** `/folders` from API.md §7; only the list so far, the rest comes with folder management. */
export type FolderApi = {
  readonly listFolders: () => Promise<readonly Folder[]>;
};

const httpFolderApi: FolderApi = {
  listFolders: async () => (await requestJson("/folders", folderListSchema)).items,
};

export const folderApi: FolderApi = selectApi({ http: httpFolderApi, mock: mockFolderApi });
