"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { formatMessage } from "@/shared/i18n/format-message";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Button, ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { useToast } from "@/shared/ui/toast";
import { folderName } from "../model/folder-name";
import { findFolderBySlug, type FolderOption } from "../model/folder-option";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { FolderNameDialog } from "./folder-name-dialog";
import { useFoldersContext } from "./folders-context";
import type { FoldersMessages } from "./folders-messages";

type FolderViewProps = {
  readonly locale: Locale;
  /** `inbox`, `spam`, `trash` or a custom folder id. */
  readonly slug: string;
  readonly messages: FoldersMessages;
  /** The folder's messages, rendered once the folder is known to exist. */
  readonly children: ReactNode;
};

/** The open folder: its name and actions above whatever lists its mail. */
export function FolderView({ locale, slug, messages, children }: FolderViewProps): ReactElement | null {
  const { state } = useFoldersContext();
  if (state.kind !== "ready") return null;
  const folder = findFolderBySlug(state.folders, slug);
  const text = messages.folders;

  if (folder === null) {
    return (
      <EmptyState
        title={text.missing.title}
        description={text.missing.text}
        action={<ButtonLink href={localizePath(locale, "/app/f/inbox")}>{text.missing.back}</ButtonLink>}
      />
    );
  }
  return (
    <div className="grid min-w-0 content-start gap-6 py-8">
      <FolderHeader folder={folder} locale={locale} messages={messages} />
      {children}
    </div>
  );
}

type Dialog = "rename" | "delete" | null;

type FolderHeaderProps = { readonly folder: FolderOption } & Omit<FolderViewProps, "slug" | "children">;

function FolderHeader({ folder, locale, messages }: FolderHeaderProps): ReactElement {
  const { rename, remove } = useFoldersContext();
  const router = useRouter();
  const showToast = useToast();
  const [dialog, setDialog] = useState<Dialog>(null);
  const text = messages.folders;
  const name = folderName(folder, text);

  async function attempt(action: () => Promise<void>, toast: string): Promise<string | null> {
    try {
      await action();
    } catch (error) {
      return describeErrorWith(error, { specific: text.errors, common: messages.errors });
    }
    setDialog(null);
    showToast(toast);
    return null;
  }

  async function confirmDelete(): Promise<string | null> {
    const error = await attempt(() => remove(folder), text.toasts.deleted);
    if (error === null) router.replace(localizePath(locale, "/app/f/inbox"));
    return error;
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="font-display text-2xl font-medium break-words sm:text-3xl">{name}</h1>
        {folder.unreadCount > 0 ? (
          <p className="text-sm text-steel">{formatMessage(text.unread, { count: folder.unreadCount })}</p>
        ) : null}
      </div>
      {folder.systemRole === null ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setDialog("rename")}>
            {text.actions.rename}
          </Button>
          <Button variant="ghost" onClick={() => setDialog("delete")} className="hover:border-red hover:text-red-soft">
            {text.actions.delete}
          </Button>
        </div>
      ) : null}
      <FolderNameDialog
        key={dialog === "rename" ? `rename-${folder.id}` : "rename-closed"}
        mode="rename"
        isOpen={dialog === "rename"}
        initialName={folder.name.kind === "text" ? folder.name.text : ""}
        messages={text.form}
        onClose={() => setDialog(null)}
        onSubmit={(newName) => attempt(() => rename(folder, newName), text.toasts.renamed)}
      />
      <DeleteFolderDialog
        key={dialog === "delete" ? `delete-${folder.id}` : "delete-closed"}
        isOpen={dialog === "delete"}
        name={name}
        messages={text.delete}
        onClose={() => setDialog(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
