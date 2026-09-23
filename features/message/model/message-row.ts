import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { openJson } from "@/features/crypto/model/encrypted-blob";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { messagePreviewSchema, type MessagePreview, type MessageSummary } from "../api/message-schemas";

/** A message ready for the list: the preview is decrypted here, in the browser. */
export type MessageRow = {
  readonly summary: MessageSummary;
  /** Null when the preview was not sealed for this key pair or was damaged. */
  readonly preview: MessagePreview | null;
  /** The address it came to is temporary (API.md §8 takes this from `Alias.kind`). */
  readonly isToTemporaryAlias: boolean;
};

export async function openPreview(summary: MessageSummary, keyPair: KeyPair): Promise<MessagePreview | null> {
  try {
    const parsed = messagePreviewSchema.safeParse(await openJson(summary.encryptedPreview, keyPair));
    return parsed.success ? parsed.data : null;
  } catch (error) {
    if (error instanceof DecryptionFailedError || error instanceof SyntaxError) return null;
    throw error;
  }
}

export async function toMessageRow(params: {
  readonly summary: MessageSummary;
  readonly keyPair: KeyPair;
  readonly temporaryAliasIds: ReadonlySet<string>;
}): Promise<MessageRow> {
  const { summary, keyPair, temporaryAliasIds } = params;
  return {
    summary,
    preview: await openPreview(summary, keyPair),
    isToTemporaryAlias: summary.aliasId !== null && temporaryAliasIds.has(summary.aliasId),
  };
}

/** What a batch action does to the selected messages (API.md §8 `POST /messages/batch`). */
export type MessageChange =
  | { readonly action: "markRead" | "markUnread" | "delete" }
  | { readonly action: "move"; readonly folderId: string };

/** Unread state and folder of one message after `change`; null when it is deleted. */
function placeAfter(summary: MessageSummary, change: MessageChange): { folderId: string; isRead: boolean } | null {
  switch (change.action) {
    case "markRead":
      return { folderId: summary.folderId, isRead: true };
    case "markUnread":
      return { folderId: summary.folderId, isRead: false };
    case "move":
      return { folderId: change.folderId, isRead: summary.isRead };
    case "delete":
      return null;
  }
}

/** Per folder: how its unread count changes when `change` is applied to these rows. */
export function unreadDelta(rows: readonly MessageRow[], change: MessageChange): Map<string, number> {
  const delta = new Map<string, number>();
  const add = (folderId: string, value: number): void => {
    delta.set(folderId, (delta.get(folderId) ?? 0) + value);
  };
  for (const { summary } of rows) {
    const after = placeAfter(summary, change);
    if (!summary.isRead) add(summary.folderId, -1);
    if (after !== null && !after.isRead) add(after.folderId, 1);
  }
  return delta;
}

/** Rows that stay in the open folder after `change`, updated. */
export function applyChange(rows: readonly MessageRow[], ids: ReadonlySet<string>, change: MessageChange): MessageRow[] {
  return rows.flatMap((row) => {
    if (!ids.has(row.summary.id)) return [row];
    const after = placeAfter(row.summary, change);
    if (after === null || after.folderId !== row.summary.folderId) return [];
    return [{ ...row, summary: { ...row.summary, isRead: after.isRead } }];
  });
}
