"use client";

import { useState, type ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import type { FolderOption } from "@/features/folder/model/folder-option";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import { useToast } from "@/shared/ui/toast";
import type { MessageChange } from "../model/message-row";
import type { MessageList, MessageListState } from "../model/use-message-list";
import { useMessageSearch } from "../model/use-message-search";
import { DeleteMessagesDialog } from "./delete-messages-dialog";
import { LoadMore } from "./load-more";
import type { MailMessages } from "./mail-messages";
import { MessageListItem } from "./message-list-item";
import { MessageSearch } from "./message-search";
import { MessageToolbar } from "./message-toolbar";
import { useSelection } from "./use-selection";

type MessageRowsProps = {
  readonly list: MessageList;
  readonly state: Extract<MessageListState, { kind: "ready" }>;
  readonly folder: FolderOption;
  readonly folders: readonly FolderOption[];
  readonly locale: Locale;
  readonly messages: MailMessages;
};

export function MessageRows({ list, state, folder, folders, locale, messages }: MessageRowsProps): ReactElement {
  const text = messages.mail;
  const [searchQuery, setSearchQuery] = useState("");
  const filteredRows = useMessageSearch(state.rows, searchQuery);
  const selection = useSelection(filteredRows.map((row) => row.summary.id));
  const showToast = useToast();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const describe = (failure: unknown): string => describeErrorWith(failure, { specific: text.errors, common: messages.errors });

  async function change(next: MessageChange): Promise<string | null> {
    setIsBusy(true);
    setError(null);
    try {
      const processed = await list.apply(selection.ids, next);
      selection.clear();
      showToast(toastFor(next, processed, text.toasts));
      return null;
    } catch (failure) {
      return describe(failure);
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteForever(): Promise<string | null> {
    const failure = await change({ action: "delete" });
    if (failure === null) setIsDeleteOpen(false);
    return failure;
  }

  return (
    <div className="grid gap-3">
      <MessageToolbar
        folder={folder}
        folders={folders}
        selectedCount={selection.ids.length}
        loadedCount={state.rows.length}
        isBusy={isBusy}
        messages={messages}
        onSelectAll={selection.setAll}
        onChange={(next) => void change(next).then(setError)}
        onDeleteForever={() => setIsDeleteOpen(true)}
      />
      <FormError message={error} />
      <MessageSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
        placeholder={text.searchPlaceholder}
        count={filteredRows.length}
      />
      {filteredRows.length === 0 && searchQuery ? (
        <p className="py-8 text-center text-sm text-steel">{text.noResults}</p>
      ) : (
        <ul aria-label={text.listLabel} className="-mx-2 sm:-mx-3">
          {filteredRows.map((row) => (
            <MessageListItem
              key={row.summary.id}
              row={row}
              locale={locale}
              messages={text}
              isSelected={selection.has(row.summary.id)}
              onToggle={() => selection.toggle(row.summary.id)}
            />
          ))}
        </ul>
      )}
      {state.loadMoreError ? <FormError message={describe(state.loadMoreError)} /> : null}
      {state.nextCursor === null ? (
        <p className="py-6 text-center text-sm text-steel">{text.end}</p>
      ) : (
        <LoadMore
          isLoading={state.isLoadingMore}
          labels={{ loadMore: text.loadMore, loadingMore: text.loadingMore, loading: messages.common.loading }}
          onLoadMore={list.loadMore}
        />
      )}
      <DeleteMessagesDialog
        key={isDeleteOpen ? "delete-messages-open" : "delete-messages-closed"}
        isOpen={isDeleteOpen}
        count={selection.ids.length}
        messages={text.delete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={deleteForever}
      />
    </div>
  );
}

function toastFor(change: MessageChange, processed: number, toasts: MailMessages["mail"]["toasts"]): string {
  switch (change.action) {
    case "markRead":
      return toasts.markRead;
    case "markUnread":
      return toasts.markUnread;
    case "move":
      return formatMessage(toasts.moved, { count: processed });
    case "delete":
      return formatMessage(toasts.deleted, { count: processed });
  }
}
