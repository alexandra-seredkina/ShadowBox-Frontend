import type { KeyPair } from "@/features/crypto/model/key-pair";
import { openText, type SealedText } from "@/features/crypto/model/sealed-text";
import { folderNameSchema, type Folder, type SystemRole } from "../api/folder-schemas";

/** A folder ready for a picker: system folders are named by the UI, custom ones are decrypted. */
export type FolderOption = {
  readonly id: string;
  readonly systemRole: SystemRole | null;
  readonly name: SealedText;
};

export async function toFolderOption(folder: Folder, keyPair: KeyPair): Promise<FolderOption> {
  const name = await openText({
    blob: folder.encryptedName,
    keyPair,
    schema: folderNameSchema,
    pick: (value) => value.name,
  });
  return { id: folder.id, systemRole: folder.systemRole, name };
}

/** Where mail for an alias can go: inbox (`folderId: null`) and custom folders, not spam or trash. */
export function isAliasDestination(option: FolderOption): boolean {
  return option.systemRole === null || option.systemRole === "inbox";
}
