import type { Messages } from "@/shared/i18n/messages";
import type { FolderOption } from "./folder-option";

export function folderName(option: FolderOption, messages: Messages["folders"]): string {
  if (option.systemRole !== null) return messages.system[option.systemRole];
  return option.name.kind === "text" ? option.name.text : messages.unreadable;
}

/** `folderId: null` means the inbox (API.md §6), so the picker offers the inbox under that value. */
export function destinationName(
  folderId: string | null,
  folders: readonly FolderOption[],
  messages: Messages["folders"],
): string {
  const option = folders.find((folder) => folder.id === folderId);
  return option === undefined || option.systemRole === "inbox" ? messages.system.inbox : folderName(option, messages);
}
