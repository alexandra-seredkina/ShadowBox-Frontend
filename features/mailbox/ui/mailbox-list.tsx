"use client";

import { useState, type ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { LabelOption } from "@/features/label/model/label-option";
import type { MessageChange } from "@/features/message/model/message-row";
import type { MessageList } from "@/features/message/model/use-message-list";
import { useMessageSearch } from "@/features/message/model/use-message-search";
import { DeleteMessagesDialog } from "@/features/message/ui/delete-messages-dialog";
import { LoadMore } from "@/features/message/ui/load-more";
import { MessageListItem } from "@/features/message/ui/message-list-item";
import { MessageToolbar, type LabelEdit } from "@/features/message/ui/message-toolbar";
import { useSelection } from "@/features/message/ui/use-selection";
import { formatMessage } from "@/shared/i18n/format-message";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { IconButton } from "@/shared/ui/icon-button";
import { MenuIcon, SearchIcon } from "@/shared/ui/icons";
import { Spinner } from "@/shared/ui/spinner";
import { useToast } from "@/shared/ui/toast";
import { useMailboxDrawer } from "./mailbox-drawer";
import type { MailboxMessages } from "./mailbox-messages";
import type { ResolvedMailbox } from "./mailbox-view";

type MailboxListProps = {
  readonly list: MessageList;
  readonly mailbox: ResolvedMailbox;
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  readonly openId: string | null;
  readonly pathname: string;
  readonly locale: Locale;
  readonly messages: MailboxMessages;
  readonly onApply: (ids: readonly string[], change: MessageChange) => Promise<number>;
  readonly onCreateLabel: () => void;
  /** Reloads the list and the counters beside it. */
  readonly onRefresh: () => void;
};

/** The list column: title and search, the bulk toolbar, then compact rows. */
export function MailboxList(props: MailboxListProps): ReactElement {
  const { list, mailbox, messages } = props;
  const [query, setQuery] = useState("");

  return (
    <>
      <ListHeader mailbox={mailbox} query={query} messages={messages} onQueryChange={setQuery} />
      {list.state.kind === "loading" ? (
        <p className="flex items-center justify-center gap-3 py-16 text-steel">
          <Spinner label={messages.common.loading} />
          {messages.mail.loading}
        </p>
      ) : list.state.kind === "failed" ? (
        <div className="p-4">
          <FormError message={describeErrorWith(list.state.error, { specific: messages.mail.errors, common: messages.errors })} />
        </div>
      ) : (
        <ListBody {...props} state={list.state} query={query} />
      )}
    </>
  );
}

type ListHeaderProps = {
  readonly mailbox: ResolvedMailbox;
  readonly query: string;
  readonly messages: MailboxMessages;
  readonly onQueryChange: (query: string) => void;
};

function ListHeader({ mailbox, query, messages, onQueryChange }: ListHeaderProps): ReactElement {
  const drawer = useMailboxDrawer();
  return (
    <div className="grid gap-3 border-b border-line px-3 pt-3 pb-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <IconButton label={messages.mailbox.openMenu} icon={<MenuIcon />} onClick={drawer.open} className="-ml-1.5 lg:hidden" />
        <h1 className="min-w-0 truncate font-display text-lg font-medium">{mailbox.title}</h1>
        {mailbox.unreadCount > 0 ? (
          <span className="shrink-0 font-mono text-xs text-fog">{formatMessage(messages.mailbox.unread, { count: mailbox.unreadCount })}</span>
        ) : null}
      </div>
      <label className="flex h-9 items-center gap-2 rounded-control border border-line bg-ink px-2.5 text-sm focus-within:border-fog">
        <SearchIcon className="size-4 text-fog" />
        <span className="sr-only">{messages.mail.searchPlaceholder}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={messages.mail.searchPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent text-paper outline-none placeholder:text-fog"
        />
      </label>
    </div>
  );
}

type ListBodyProps = MailboxListProps & {
  readonly state: Extract<MessageList["state"], { kind: "ready" }>;
  readonly query: string;
};

function ListBody(props: ListBodyProps): ReactElement {
  const { list, state, mailbox, folders, labels, openId, pathname, locale, messages, query, onApply } = props;
  const rows = useMessageSearch(state.rows, query);
  const selection = useSelection(rows.map((row) => row.summary.id));
  const showToast = useToast();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const selected = rows.filter((row) => selection.has(row.summary.id));
  const describe = (failure: unknown): string =>
    describeErrorWith(failure, { specific: { ...messages.mail.errors, ...messages.mailbox.errors }, common: messages.errors });

  async function run(ids: readonly string[], changes: readonly MessageChange[]): Promise<string | null> {
    setIsBusy(true);
    setError(null);
    try {
      let processed = 0;
      for (const change of changes) processed = await onApply(ids, change);
      if (changes[0]) showToast(toastFor(changes[0], processed, folders, messages));
      return null;
    } catch (failure) {
      const description = describe(failure);
      setError(description);
      return description;
    } finally {
      setIsBusy(false);
    }
  }

  function change(next: MessageChange): void {
    void run(selection.ids, [next]).then((failure) => {
      if (failure === null) selection.clear();
    });
  }

  function editLabels({ add, remove }: LabelEdit): void {
    const changes: MessageChange[] = [
      ...add.map((labelId) => ({ action: "label" as const, labelId })),
      ...remove.map((labelId) => ({ action: "unlabel" as const, labelId })),
    ];
    if (changes.length > 0) void run(selection.ids, changes);
  }

  async function deleteForever(): Promise<string | null> {
    const failure = await run(selection.ids, [{ action: "delete" }]);
    if (failure === null) {
      setIsDeleteOpen(false);
      selection.clear();
    }
    return failure;
  }

  return (
    <>
      <MessageToolbar
        folder={mailbox.folder}
        folders={folders}
        labels={labels}
        selectedLabelIds={selected.map((row) => row.summary.labelIds)}
        areAllStarred={selected.length > 0 && selected.every((row) => row.summary.isStarred)}
        selectedCount={selection.ids.length}
        loadedCount={rows.length}
        isBusy={isBusy}
        messages={{ toolbar: messages.mailbox.toolbar, folders: messages.folders, unnamedLabel: messages.mailbox.unnamedLabel }}
        onSelectAll={selection.setAll}
        onChange={change}
        onLabels={editLabels}
        onCreateLabel={props.onCreateLabel}
        onDeleteForever={() => setIsDeleteOpen(true)}
        onRefresh={props.onRefresh}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? (
          <div className="p-3">
            <FormError message={error} />
          </div>
        ) : null}
        {state.rows.length === 0 ? (
          <EmptyMailbox mailbox={mailbox} locale={locale} messages={messages} />
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-steel">{messages.mail.noResults}</p>
        ) : (
          <ul aria-label={messages.mail.listLabel}>
            {rows.map((row) => (
              <MessageListItem
                key={row.summary.id}
                row={row}
                href={`${pathname}?m=${encodeURIComponent(row.summary.id)}`}
                locale={locale}
                labels={labels}
                messages={{ row: messages.mailbox.row, mail: messages.mail, unnamedLabel: messages.mailbox.unnamedLabel }}
                isSelected={selection.has(row.summary.id)}
                isOpen={row.summary.id === openId}
                onToggle={() => selection.toggle(row.summary.id)}
                onToggleStar={() => void run([row.summary.id], [{ action: row.summary.isStarred ? "unstar" : "star" }])}
              />
            ))}
          </ul>
        )}
        {state.loadMoreError ? (
          <div className="p-3">
            <FormError message={describe(state.loadMoreError)} />
          </div>
        ) : null}
        {state.nextCursor !== null ? (
          <LoadMore
            isLoading={state.isLoadingMore}
            labels={{ loadMore: messages.mail.loadMore, loadingMore: messages.mail.loadingMore, loading: messages.common.loading }}
            onLoadMore={list.loadMore}
          />
        ) : state.rows.length > 0 ? (
          <p className="py-6 text-center font-mono text-xs text-fog">{messages.mail.end}</p>
        ) : null}
      </div>
      <DeleteMessagesDialog
        key={isDeleteOpen ? "delete-messages-open" : "delete-messages-closed"}
        isOpen={isDeleteOpen}
        count={selection.ids.length}
        messages={messages.mail.delete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={deleteForever}
      />
    </>
  );
}

function EmptyMailbox({ mailbox, locale, messages }: { readonly mailbox: ResolvedMailbox; readonly locale: Locale; readonly messages: MailboxMessages }): ReactElement {
  if (mailbox.scope.kind === "starred") return <EmptyState title={messages.mailbox.empty.starred.title} description={messages.mailbox.empty.starred.text} />;
  if (mailbox.scope.kind === "label") return <EmptyState title={messages.mailbox.empty.label.title} description={messages.mailbox.empty.label.text} />;
  const role = mailbox.folder?.systemRole ?? "custom";
  const empty = messages.mail.empty[role];
  return (
    <EmptyState
      title={empty.title}
      description={empty.text}
      action={
        role === "inbox" || role === "custom" ? (
          <ButtonLink variant="ghost" href={localizePath(locale, "/app/aliases")}>
            {messages.mail.empty.toAliases}
          </ButtonLink>
        ) : undefined
      }
    />
  );
}

function toastFor(change: MessageChange, processed: number, folders: readonly FolderOption[], messages: MailboxMessages): string {
  const toasts = messages.mailbox.toasts;
  switch (change.action) {
    case "markRead":
      return messages.mail.toasts.markRead;
    case "markUnread":
      return messages.mail.toasts.markUnread;
    case "star":
      return toasts.starred;
    case "unstar":
      return toasts.unstarred;
    case "label":
      return toasts.labelled;
    case "unlabel":
      return toasts.unlabelled;
    case "delete":
      return formatMessage(messages.mail.toasts.deleted, { count: processed });
    case "move": {
      const role = folders.find((folder) => folder.id === change.folderId)?.systemRole;
      const toast = role === "archive" ? toasts.archived : role === "spam" ? toasts.spam : role === "trash" ? toasts.trashed : messages.mail.toasts.moved;
      return formatMessage(toast, { count: processed });
    }
  }
}
