"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { aliasApi } from "@/features/alias/api/alias-api";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { messageApi } from "../api/message-api";
import type { MessagePage, MessageScope, MessageSummary } from "../api/message-schemas";
import { applyChange, isInScope, toMessageRow, unreadDelta, type MessageChange, type MessageRow } from "./message-row";
import { runBatch } from "./run-batch";

export type MessageListState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | {
      readonly kind: "ready";
      readonly rows: readonly MessageRow[];
      readonly nextCursor: string | null;
      readonly isLoadingMore: boolean;
      readonly loadMoreError: unknown;
    };

export type MessageList = {
  readonly state: MessageListState;
  readonly loadMore: () => void;
  /** Applies a batch action to these messages; resolves with how many the server changed. */
  readonly apply: (ids: readonly string[], change: MessageChange) => Promise<number>;
  /** The open message changed on its own (PATCH): keeps its row in step or drops it. */
  readonly replace: (summary: MessageSummary) => void;
  /** The open message was deleted for good. */
  readonly remove: (id: string) => void;
  readonly reload: () => void;
};

function requireKeys(): KeyPair {
  const keys = getUnlockedKeys();
  // The app gate only renders mail screens with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  return keys;
}

async function loadTemporaryAliasIds(): Promise<ReadonlySet<string>> {
  const aliases = await aliasApi.listAliases();
  return new Set(aliases.filter((alias) => alias.kind === "temporary").map((alias) => alias.id));
}

function decryptPage(page: MessagePage, temporaryAliasIds: ReadonlySet<string>): Promise<MessageRow[]> {
  const keyPair = requireKeys();
  return Promise.all(page.items.map((summary) => toMessageRow({ summary, keyPair, temporaryAliasIds })));
}

/** A scope as a string, so a new object for the same scope does not reload the list. */
function scopeKey(scope: MessageScope): string {
  switch (scope.kind) {
    case "folder":
      return `folder:${scope.folderId}`;
    case "label":
      return `label:${scope.labelId}`;
    case "starred":
      return "starred:";
  }
}

function scopeFromKey(key: string): MessageScope {
  const separator = key.indexOf(":");
  const kind = key.slice(0, separator);
  const id = key.slice(separator + 1);
  if (kind === "folder") return { kind: "folder", folderId: id };
  if (kind === "label") return { kind: "label", labelId: id };
  return { kind: "starred" };
}

/**
 * One list of messages, newest first, loaded page by page as the user scrolls.
 * `onUnreadChange` hears how folder counts moved, so the sidebar stays right without a refetch.
 */
export function useMessageList(params: {
  readonly scope: MessageScope;
  readonly trashId: string | null;
  readonly onUnreadChange: (delta: ReadonlyMap<string, number>) => void;
}): MessageList {
  const { trashId, onUnreadChange } = params;
  const key = scopeKey(params.scope);
  const scope = useMemo(() => scopeFromKey(key), [key]);
  const [state, setState] = useState<MessageListState>({ kind: "loading" });
  const [version, setVersion] = useState(0);
  const aliasIds = useRef<ReadonlySet<string>>(new Set());
  const isLoadingMore = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([loadTemporaryAliasIds(), messageApi.listMessages({ scope, cursor: null })])
      .then(async ([temporaryAliasIds, page]) => {
        aliasIds.current = temporaryAliasIds;
        return { rows: await decryptPage(page, temporaryAliasIds), nextCursor: page.nextCursor };
      })
      .then(
        ({ rows, nextCursor }) => {
          if (isCurrent) setState({ kind: "ready", rows, nextCursor, isLoadingMore: false, loadMoreError: null });
        },
        (error: unknown) => {
          if (isCurrent) setState({ kind: "failed", error });
        },
      );
    return () => {
      isCurrent = false;
    };
  }, [scope, version]);

  const cursor = state.kind === "ready" ? state.nextCursor : null;

  const loadMore = useCallback(() => {
    if (cursor === null || isLoadingMore.current) return;
    isLoadingMore.current = true;
    setState((current) => (current.kind === "ready" ? { ...current, isLoadingMore: true, loadMoreError: null } : current));
    messageApi
      .listMessages({ scope, cursor })
      .then(async (page) => ({ rows: await decryptPage(page, aliasIds.current), nextCursor: page.nextCursor }))
      .then(
        ({ rows, nextCursor }) => {
          setState((current) =>
            current.kind === "ready" ? { ...current, rows: [...current.rows, ...rows], nextCursor, isLoadingMore: false } : current,
          );
        },
        (error: unknown) => {
          setState((current) => (current.kind === "ready" ? { ...current, isLoadingMore: false, loadMoreError: error } : current));
        },
      )
      .finally(() => {
        isLoadingMore.current = false;
      });
  }, [scope, cursor]);

  const rows = state.kind === "ready" ? state.rows : null;

  const apply = useCallback(
    async (ids: readonly string[], change: MessageChange) => {
      const selected = new Set(ids);
      const affected = (rows ?? []).filter((row) => selected.has(row.summary.id));
      const processed = await runBatch(ids, change);
      setState((current) =>
        current.kind === "ready"
          ? { ...current, rows: applyChange({ rows: current.rows, ids: selected, change, scope, trashId }) }
          : current,
      );
      onUnreadChange(unreadDelta(affected, change));
      return processed;
    },
    [rows, onUnreadChange, scope, trashId],
  );

  const replace = useCallback(
    (summary: MessageSummary) => {
      setState((current) => {
        if (current.kind !== "ready") return current;
        const rows = current.rows.flatMap((row) => {
          if (row.summary.id !== summary.id) return [row];
          return isInScope(summary, scope, trashId) ? [{ ...row, summary }] : [];
        });
        return { ...current, rows };
      });
    },
    [scope, trashId],
  );

  const remove = useCallback((id: string) => {
    setState((current) => (current.kind === "ready" ? { ...current, rows: current.rows.filter((row) => row.summary.id !== id) } : current));
  }, []);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { state, loadMore, apply, replace, remove, reload };
}
