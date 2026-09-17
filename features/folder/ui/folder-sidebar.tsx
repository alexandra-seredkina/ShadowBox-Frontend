"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMessage } from "@/shared/i18n/format-message";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { useToast } from "@/shared/ui/toast";
import { folderName } from "../model/folder-name";
import { folderSlug, sortFolders, type FolderOption } from "../model/folder-option";
import { FolderNameDialog } from "./folder-name-dialog";
import { useFoldersContext } from "./folders-context";
import type { FoldersMessages } from "./folders-messages";

type FolderSidebarProps = { readonly locale: Locale; readonly messages: FoldersMessages };

export function FolderSidebar({ locale, messages }: FolderSidebarProps): ReactElement {
  const { state, create } = useFoldersContext();
  const params = useParams<{ folderId?: string }>();
  const router = useRouter();
  const showToast = useToast();
  const [creatingKey, setCreatingKey] = useState<string | null>(null);
  const text = messages.folders;

  async function submitCreate(name: string): Promise<string | null> {
    try {
      const folder = await create(name);
      setCreatingKey(null);
      showToast(text.toasts.created);
      router.push(localizePath(locale, `/app/f/${folderSlug(folder)}`));
      return null;
    } catch (error) {
      return describeErrorWith(error, { specific: text.errors, common: messages.errors });
    }
  }

  if (state.kind === "loading") {
    return (
      <p className="flex items-center gap-3 py-6 text-sm text-steel">
        <Spinner label={messages.common.loading} />
        {text.loading}
      </p>
    );
  }
  if (state.kind === "failed") {
    return <FormError message={describeErrorWith(state.error, { specific: text.errors, common: messages.errors })} />;
  }

  return (
    <div className="grid content-start gap-3 lg:py-8">
      {/* On phones the list scrolls sideways inside itself; the page never does. */}
      <nav aria-label={text.sidebarLabel} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <ul className="flex gap-1 lg:grid">
          {sortFolders(state.folders, locale).map((folder) => (
            <FolderLink key={folder.id} folder={folder} locale={locale} messages={messages} isActive={params.folderId === folderSlug(folder)} />
          ))}
        </ul>
      </nav>
      <Button variant="ghost" onClick={() => setCreatingKey(crypto.randomUUID())} className="justify-self-start">
        {text.create}
      </Button>
      <FolderNameDialog
        key={creatingKey ?? "create-closed"}
        mode="create"
        isOpen={creatingKey !== null}
        initialName=""
        messages={text.form}
        onClose={() => setCreatingKey(null)}
        onSubmit={submitCreate}
      />
    </div>
  );
}

type FolderLinkProps = {
  readonly folder: FolderOption;
  readonly locale: Locale;
  readonly messages: FoldersMessages;
  readonly isActive: boolean;
};

function FolderLink({ folder, locale, messages, isActive }: FolderLinkProps): ReactElement {
  const name = folderName(folder, messages.folders);
  return (
    <li className="shrink-0">
      <Link
        href={localizePath(locale, `/app/f/${folderSlug(folder)}`)}
        aria-current={isActive ? "page" : undefined}
        className={joinClassNames(
          "flex items-center justify-between gap-3 rounded-control px-3 py-2 text-sm whitespace-nowrap transition-colors",
          isActive ? "bg-surface-2 text-paper" : "text-steel hover:text-paper",
        )}
      >
        <span className="max-w-48 truncate">{name}</span>
        {folder.unreadCount > 0 ? (
          <span className="rounded-full bg-red px-2 font-mono text-xs leading-5 text-night">
            <span aria-hidden>{folder.unreadCount}</span>
            <span className="sr-only">{formatMessage(messages.folders.unread, { count: folder.unreadCount })}</span>
          </span>
        ) : null}
      </Link>
    </li>
  );
}
