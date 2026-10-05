"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, type ReactElement } from "react";
import { useMailboxAliasesContext } from "@/features/alias/ui/mailbox-aliases-context";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { blockSender, normalizeAddress } from "@/features/blocked-sender/model/block-sender";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { folderName } from "@/features/folder/model/folder-name";
import { findFolderBySlug, sortFolders, type FolderOption } from "@/features/folder/model/folder-option";
import { useFoldersContext } from "@/features/folder/ui/folders-context";
import type { LabelOption } from "@/features/label/model/label-option";
import { LabelFormDialog } from "@/features/label/ui/label-form-dialog";
import { useLabelsContext } from "@/features/label/ui/labels-context";
import type { MessageScope, MessageSummary } from "@/features/message/api/message-schemas";
import { unreadShift, type MessageChange } from "@/features/message/model/message-row";
import { useMessageList } from "@/features/message/model/use-message-list";
import { MessagePane } from "@/features/message/ui/message-pane";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Kage } from "@/shared/ui/kage";
import { Spinner } from "@/shared/ui/spinner";
import { useToast } from "@/shared/ui/toast";
import { MailboxList } from "./mailbox-list";
import type { MailboxMessages } from "./mailbox-messages";

/** What the URL asks for, before the folder or label is known to exist. */
export type MailboxTarget =
  | { readonly kind: "folder"; readonly slug: string }
  | { readonly kind: "label"; readonly labelId: string }
  | { readonly kind: "starred" };

type MailboxViewProps = {
  readonly locale: Locale;
  readonly target: MailboxTarget;
  readonly messages: MailboxMessages;
};

/** What the list shows, resolved: its scope, title and unread count. */
export type ResolvedMailbox = {
  readonly key: string;
  readonly scope: MessageScope;
  readonly title: string;
  readonly unreadCount: number;
  readonly folder: FolderOption | null;
  readonly label: LabelOption | null;
};

function resolve(target: MailboxTarget, folders: readonly FolderOption[], labels: readonly LabelOption[] | null, messages: MailboxMessages): ResolvedMailbox | "loading" | null {
  switch (target.kind) {
    case "folder": {
      const folder = findFolderBySlug(folders, target.slug);
      if (folder === null) return null;
      const title = folderName(folder, messages.folders);
      return { key: `f:${folder.id}`, scope: { kind: "folder", folderId: folder.id }, title, unreadCount: folder.unreadCount, folder, label: null };
    }
    case "label": {
      if (labels === null) return "loading";
      const label = labels.find((option) => option.id === target.labelId);
      if (label === undefined) return null;
      const title = label.name ?? messages.mailbox.unnamedLabel;
      return { key: `l:${label.id}`, scope: { kind: "label", labelId: label.id }, title, unreadCount: label.unreadCount, folder: null, label };
    }
    case "starred":
      return { key: "s:", scope: { kind: "starred" }, title: messages.mailbox.starred, unreadCount: 0, folder: null, label: null };
  }
}

/** Three columns on wide screens: folders, the list, the open message (`?m=`). */
export function MailboxView({ locale, target, messages }: MailboxViewProps): ReactElement {
  const folders = useFoldersContext();
  const labels = useLabelsContext();

  if (folders.state.kind === "failed") {
    return (
      <div className="p-6">
        <FormError message={describeErrorWith(folders.state.error, { specific: messages.folders.errors, common: messages.errors })} />
      </div>
    );
  }
  const labelList = labels.state.kind === "ready" ? labels.state.labels : labels.state.kind === "failed" ? [] : null;
  const resolved = folders.state.kind === "ready" ? resolve(target, folders.state.folders, labelList, messages) : "loading";
  if (resolved === "loading" || folders.state.kind !== "ready") {
    return (
      <p className="flex items-center justify-center gap-3 py-24 text-steel">
        <Spinner label={messages.common.loading} />
        {messages.mail.loading}
      </p>
    );
  }
  if (resolved === null) {
    const text = messages.folders.missing;
    return (
      <EmptyState
        illustration={<Kage mood="lost" />}
        title={text.title}
        description={text.text}
        action={<ButtonLink href={localizePath(locale, "/app/f/inbox")}>{text.back}</ButtonLink>}
      />
    );
  }
  return (
    <MailboxColumns
      key={resolved.key}
      mailbox={resolved}
      folders={sortFolders(folders.state.folders, locale)}
      labels={labelList ?? []}
      locale={locale}
      messages={messages}
    />
  );
}

type MailboxColumnsProps = {
  readonly mailbox: ResolvedMailbox;
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  readonly locale: Locale;
  readonly messages: MailboxMessages;
};

function MailboxColumns({ mailbox, folders, labels, locale, messages }: MailboxColumnsProps): ReactElement {
  const { adjustUnread, refresh: refreshFolders } = useFoldersContext();
  const labelActions = useLabelsContext();
  const aliases = useMailboxAliasesContext();
  const router = useRouter();
  const pathname = usePathname();
  const openId = useSearchParams().get("m");
  const showToast = useToast();
  const [labelDialogKey, setLabelDialogKey] = useState<string | null>(null);
  const trash = folders.find((folder) => folder.systemRole === "trash") ?? null;
  const spam = folders.find((folder) => folder.systemRole === "spam") ?? null;
  const list = useMessageList({ scope: mailbox.scope, trashId: trash?.id ?? null, onUnreadChange: adjustUnread });
  const rows = list.state.kind === "ready" ? list.state.rows : [];

  const closeMessage = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  const onChanged = useCallback(
    (before: MessageSummary, after: MessageSummary | null) => {
      if (after === null) list.remove(before.id);
      else list.replace(after);
      adjustUnread(unreadShift(before, after));
      labelActions.refresh();
    },
    [list, adjustUnread, labelActions],
  );

  async function applyToRows(ids: readonly string[], change: MessageChange): Promise<number> {
    const processed = await list.apply(ids, change);
    labelActions.refresh();
    const leavesList = change.action === "delete" || change.action === "move";
    if (openId !== null && ids.includes(openId) && leavesList) closeMessage();
    return processed;
  }

  function othersFrom(address: string, exceptId: string): string[] {
    const wanted = normalizeAddress(address);
    return rows
      .filter((row) => row.summary.id !== exceptId && row.summary.folderId !== spam?.id)
      .filter((row) => row.preview !== null && normalizeAddress(row.preview.from.address) === wanted)
      .map((row) => row.summary.id);
  }

  function aliasAddress(aliasId: string | null): { address: string; isTemporary: boolean } | null {
    if (aliasId === null || aliases.state.kind !== "ready") return null;
    const view = aliases.state.aliases.find((item) => item.alias.id === aliasId);
    return view ? { address: view.alias.address, isTemporary: view.alias.kind === "temporary" } : null;
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] xl:grid-cols-[26rem_minmax(0,1fr)]">
      <section
        aria-label={mailbox.title}
        className={joinClassNames("min-h-0 flex-col border-line xl:flex xl:border-r", openId === null ? "flex" : "hidden")}
      >
        <MailboxList
          list={list}
          mailbox={mailbox}
          folders={folders}
          labels={labels}
          openId={openId}
          pathname={pathname}
          locale={locale}
          messages={messages}
          onApply={applyToRows}
          onRefresh={() => {
            list.reload();
            refreshFolders();
            labelActions.refresh();
          }}
          onCreateLabel={() => setLabelDialogKey(crypto.randomUUID())}
        />
      </section>
      <section
        aria-label={messages.mailbox.view.actions}
        className={joinClassNames("min-h-0 overflow-y-auto xl:block", openId === null ? "hidden" : "block")}
      >
        {openId === null ? (
          <PanePlaceholder messages={messages} />
        ) : (
          <MessagePane
            key={openId}
            messageId={openId}
            locale={locale}
            messages={messages}
            folders={folders}
            labels={labels}
            aliasAddress={aliasAddress}
            othersFrom={othersFrom}
            onChanged={onChanged}
            onMoveToSpam={async (ids) => {
              if (spam !== null && ids.length > 0) await applyToRows(ids, { action: "move", folderId: spam.id });
            }}
            onBlock={async (address) => {
              const keys = getUnlockedKeys();
              if (keys === null) throw new Error("Keys are locked");
              await blockSender(address, keys);
            }}
            onCreateLabel={() => setLabelDialogKey(crypto.randomUUID())}
            onClose={closeMessage}
            onToast={showToast}
          />
        )}
      </section>
      <LabelFormDialog
        key={labelDialogKey ?? "create-label-closed"}
        mode="create"
        isOpen={labelDialogKey !== null}
        initialName=""
        initialColor="#6c8cff"
        messages={messages.mailbox.labelForm}
        onClose={() => setLabelDialogKey(null)}
        onSubmit={async (name, color) => {
          try {
            await labelActions.create(name, color);
          } catch (error) {
            return describeErrorWith(error, { specific: messages.mailbox.errors, common: messages.errors });
          }
          setLabelDialogKey(null);
          showToast(messages.mailbox.toasts.labelCreated);
          return null;
        }}
      />
    </div>
  );
}

function PanePlaceholder({ messages }: { readonly messages: MailboxMessages }): ReactElement {
  const text = messages.mailbox.pane;
  return (
    <div className="grid h-full place-items-center p-10">
      <div className="grid max-w-xs justify-items-center gap-3 text-center">
        <Kage mood="reading" className="h-36" />
        <p className="font-display text-base text-paper">{text.title}</p>
        <p className="text-sm text-fog">{text.text}</p>
      </div>
    </div>
  );
}
