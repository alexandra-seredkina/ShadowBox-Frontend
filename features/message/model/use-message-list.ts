"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { aliasApi } from "@/features/alias/api/alias-api";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { messageApi } from "../api/message-api";
import type { MessagePage } from "../api/message-schemas";
import { applyChange, toMessageRow, unreadDelta, type MessageChange, type MessageRow } from "./message-row";
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

/**
 * One folder's messages, newest first, loaded page by page as the user scrolls.
 * `onUnreadChange` hears how folder counts moved, so the sidebar stays right without a refetch.
 */
export function useMessageList(folderId: string, onUnreadChange: (delta: ReadonlyMap<string, number>) => void): MessageList {
  const [state, setState] = useState<MessageListState>({ kind: "loading" });
  const aliasIds = useRef<ReadonlySet<string>>(new Set());
  const isLoadingMore = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([loadTemporaryAliasIds(), messageApi.listMessages({ scope: { kind: "folder", folderId }, cursor: null })])
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
  }, [folderId]);

  const cursor = state.kind === "ready" ? state.nextCursor : null;

  const loadMore = useCallback(() => {
    if (cursor === null || isLoadingMore.current) return;
    isLoadingMore.current = true;
    setState((current) => (current.kind === "ready" ? { ...current, isLoadingMore: true, loadMoreError: null } : current));
    messageApi
      .listMessages({ scope: { kind: "folder", folderId }, cursor })
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
  }, [folderId, cursor]);

  const rows = state.kind === "ready" ? state.rows : null;

  const apply = useCallback(
    async (ids: readonly string[], change: MessageChange) => {
      const selected = new Set(ids);
      const affected = (rows ?? []).filter((row) => selected.has(row.summary.id));
      const processed = await runBatch(ids, change);
      setState((current) => (current.kind === "ready" ? { ...current, rows: applyChange(current.rows, selected, change) } : current));
      onUnreadChange(unreadDelta(affected, change));
      return processed;
    },
    [rows, onUnreadChange],
  );

  return { state, loadMore, apply };
}
