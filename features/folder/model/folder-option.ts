import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { openText, sealText, type SealedText } from "@/features/crypto/model/sealed-text";
import { folderNameSchema, type Folder, type SystemRole } from "../api/folder-schemas";

export const FOLDER_NAME_MAX_LENGTH = 64;

const SYSTEM_ORDER: readonly SystemRole[] = ["inbox", "archive", "spam", "trash"];

/** A folder ready for the UI: system folders are named by the dictionary, custom ones are decrypted. */
export type FolderOption = {
  readonly id: string;
  readonly systemRole: SystemRole | null;
  readonly name: SealedText;
  readonly unreadCount: number;
};

export async function toFolderOption(folder: Folder, keyPair: KeyPair): Promise<FolderOption> {
  const name = await openText({
    blob: folder.encryptedName,
    keyPair,
    schema: folderNameSchema,
    pick: (value) => value.name,
  });
  return { id: folder.id, systemRole: folder.systemRole, name, unreadCount: folder.unreadCount };
}

export function sealFolderName(name: string, publicKey: Uint8Array): Promise<EncryptedBlob | null> {
  return sealText("name", name, publicKey);
}

/** Where mail for an alias can go: inbox (`folderId: null`) and custom folders, not spam or trash. */
export function isAliasDestination(option: FolderOption): boolean {
  return option.systemRole === null || option.systemRole === "inbox";
}

function sortKey(option: FolderOption): string {
  return option.name.kind === "text" ? option.name.text : "";
}

/** System folders first in a fixed order, then custom ones by name (the server cannot sort ciphertext). */
export function sortFolders(options: readonly FolderOption[], locale: string): FolderOption[] {
  const system = SYSTEM_ORDER.flatMap((role) => options.filter((option) => option.systemRole === role));
  const custom = options
    .filter((option) => option.systemRole === null)
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b), locale));
  return [...system, ...custom];
}

/** URL segment of a folder: the role for system folders (`/app/f/inbox`), the id for custom ones. */
export function folderSlug(option: FolderOption): string {
  return option.systemRole ?? option.id;
}

export function findFolderBySlug(options: readonly FolderOption[], slug: string): FolderOption | null {
  return options.find((option) => folderSlug(option) === slug) ?? null;
}
