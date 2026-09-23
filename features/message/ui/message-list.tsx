"use client";

import type { ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { findFolderBySlug, sortFolders, type FolderOption } from "@/features/folder/model/folder-option";
import { useFoldersContext } from "@/features/folder/ui/folders-context";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Spinner } from "@/shared/ui/spinner";
import { useMessageList } from "../model/use-message-list";
import type { MailMessages } from "./mail-messages";
import { MessageRows } from "./message-rows";

type MessageListProps = {
  readonly locale: Locale;
  /** `inbox`, `spam`, `trash` or a custom folder id, as in the URL. */
  readonly slug: string;
  readonly messages: MailMessages;
};

/** The open folder's mail. A missing folder is reported by the folder view around it. */
export function MessageList({ locale, slug, messages }: MessageListProps): ReactElement | null {
  const { state } = useFoldersContext();
  if (state.kind !== "ready") return null;
  const folder = findFolderBySlug(state.folders, slug);
  if (folder === null) return null;
  return (
    <FolderMessages
      key={folder.id}
      folder={folder}
      folders={sortFolders(state.folders, locale)}
      locale={locale}
      messages={messages}
    />
  );
}

type FolderMessagesProps = Omit<MessageListProps, "slug"> & {
  readonly folder: FolderOption;
  readonly folders: readonly FolderOption[];
};

function FolderMessages({ folder, folders, locale, messages }: FolderMessagesProps): ReactElement {
  const { adjustUnread } = useFoldersContext();
  const list = useMessageList(folder.id, adjustUnread);
  const text = messages.mail;

  if (list.state.kind === "loading") {
    return (
      <p className="flex items-center justify-center gap-3 py-16 text-steel">
        <Spinner label={messages.common.loading} />
        {text.loading}
      </p>
    );
  }
  if (list.state.kind === "failed") {
    return <FormError message={describeErrorWith(list.state.error, { specific: text.errors, common: messages.errors })} />;
  }
  if (list.state.rows.length === 0) return <EmptyFolder folder={folder} locale={locale} messages={text} />;
  return <MessageRows list={list} state={list.state} folder={folder} folders={folders} locale={locale} messages={messages} />;
}

function EmptyFolder({ folder, locale, messages }: { readonly folder: FolderOption; readonly locale: Locale; readonly messages: MailMessages["mail"] }): ReactElement {
  const role = folder.systemRole ?? "custom";
  const empty = messages.empty[role];
  const pointsToAliases = role === "inbox" || role === "custom";
  return (
    <EmptyState
      title={empty.title}
      description={empty.text}
      action={
        pointsToAliases ? (
          <ButtonLink variant="ghost" href={localizePath(locale, "/app/aliases")}>
            {messages.empty.toAliases}
          </ButtonLink>
        ) : undefined
      }
    />
  );
}
