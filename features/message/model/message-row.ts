import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { openJson } from "@/features/crypto/model/encrypted-blob";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { messagePreviewSchema, type MessagePreview, type MessageScope, type MessageSummary } from "../api/message-schemas";

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
  | { readonly action: "markRead" | "markUnread" | "star" | "unstar" | "delete" }
  | { readonly action: "move"; readonly folderId: string }
  | { readonly action: "label" | "unlabel"; readonly labelId: string };

/** One message after `change`; null when it is deleted. */
export function summaryAfter(summary: MessageSummary, change: MessageChange): MessageSummary | null {
  switch (change.action) {
    case "markRead":
    case "markUnread":
      return { ...summary, isRead: change.action === "markRead" };
    case "star":
    case "unstar":
      return { ...summary, isStarred: change.action === "star" };
    case "move":
      return { ...summary, folderId: change.folderId };
    case "label":
      return summary.labelIds.includes(change.labelId) ? summary : { ...summary, labelIds: [...summary.labelIds, change.labelId] };
    case "unlabel":
      return { ...summary, labelIds: summary.labelIds.filter((labelId) => labelId !== change.labelId) };
    case "delete":
      return null;
  }
}

/** Per folder: how unread counts move when one message goes from `before` to `after` (null: deleted). */
export function unreadShift(before: MessageSummary, after: MessageSummary | null): Map<string, number> {
  const delta = new Map<string, number>();
  const add = (folderId: string, value: number): void => {
    delta.set(folderId, (delta.get(folderId) ?? 0) + value);
  };
  if (!before.isRead) add(before.folderId, -1);
  if (after !== null && !after.isRead) add(after.folderId, 1);
  return delta;
}

/** Per folder: how its unread count changes when `change` is applied to these rows. */
export function unreadDelta(rows: readonly MessageRow[], change: MessageChange): Map<string, number> {
  const delta = new Map<string, number>();
  for (const { summary } of rows) {
    for (const [folderId, value] of unreadShift(summary, summaryAfter(summary, change))) {
      delta.set(folderId, (delta.get(folderId) ?? 0) + value);
    }
  }
  return delta;
}

/** Whether a message belongs in the list it is shown in; cross-folder views leave the trash out. */
export function isInScope(summary: MessageSummary, scope: MessageScope, trashId: string | null): boolean {
  switch (scope.kind) {
    case "folder":
      return summary.folderId === scope.folderId;
    case "label":
      return summary.labelIds.includes(scope.labelId) && summary.folderId !== trashId;
    case "starred":
      return summary.isStarred && summary.folderId !== trashId;
  }
}

/** Rows that stay in the open list after `change`, updated. */
export function applyChange(params: {
  readonly rows: readonly MessageRow[];
  readonly ids: ReadonlySet<string>;
  readonly change: MessageChange;
  readonly scope: MessageScope;
  readonly trashId: string | null;
}): MessageRow[] {
  const { rows, ids, change, scope, trashId } = params;
  return rows.flatMap((row) => {
    if (!ids.has(row.summary.id)) return [row];
    const after = summaryAfter(row.summary, change);
    return after !== null && isInScope(after, scope, trashId) ? [{ ...row, summary: after }] : [];
  });
}
