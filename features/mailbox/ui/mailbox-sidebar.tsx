"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";
import type { AliasView } from "@/features/alias/model/alias-view";
import { useMailboxAliasesContext } from "@/features/alias/ui/mailbox-aliases-context";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { destinationName, folderName } from "@/features/folder/model/folder-name";
import { folderSlug, sortFolders, type FolderOption } from "@/features/folder/model/folder-option";
import { DeleteFolderDialog } from "@/features/folder/ui/delete-folder-dialog";
import { FolderNameDialog } from "@/features/folder/ui/folder-name-dialog";
import { useFoldersContext } from "@/features/folder/ui/folders-context";
import type { LabelOption } from "@/features/label/model/label-option";
import { LabelFormDialog } from "@/features/label/ui/label-form-dialog";
import { useLabelsContext } from "@/features/label/ui/labels-context";
import { formatMessage } from "@/shared/i18n/format-message";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import { ButtonLink } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import {
  ArchiveIcon,
  AtIcon,
  FolderIcon,
  InboxIcon,
  MoreIcon,
  PlusIcon,
  SpamIcon,
  StarIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { MenuItem, Popover } from "@/shared/ui/popover";
import { useToast } from "@/shared/ui/toast";
import { ConfirmDialog } from "./confirm-dialog";
import type { MailboxMessages } from "./mailbox-messages";
import { RoutingDialog } from "./routing-dialog";

const SYSTEM_ICONS = {
  inbox: InboxIcon,
  archive: ArchiveIcon,
  spam: SpamIcon,
  trash: TrashIcon,
} as const;

type DialogState =
  | { readonly kind: "none" }
  | { readonly kind: "createFolder" | "createLabel"; readonly key: string }
  | { readonly kind: "renameFolder" | "deleteFolder" | "routeFolder"; readonly folder: FolderOption }
  | { readonly kind: "editLabel" | "deleteLabel" | "routeLabel"; readonly label: LabelOption };

type MailboxSidebarProps = {
  readonly locale: Locale;
  readonly messages: MailboxMessages;
  /** Called when a link is followed, so the mobile drawer can close. */
  readonly onNavigate?: () => void;
};

export function MailboxSidebar({ locale, messages, onNavigate }: MailboxSidebarProps): ReactElement {
  const folders = useFoldersContext();
  const labels = useLabelsContext();
  const pathname = usePathname();
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
  const text = messages.mailbox;
  const folderList = folders.state.kind === "ready" ? sortFolders(folders.state.folders, locale) : [];
  const system = folderList.filter((folder) => folder.systemRole !== null);
  const custom = folderList.filter((folder) => folder.systemRole === null);
  const labelList = labels.state.kind === "ready" ? labels.state.labels : [];
  const isAt = (path: string): boolean => pathname === localizePath(locale, path);
  const close = (): void => setDialog({ kind: "none" });

  return (
    <nav aria-label={text.navLabel} className="flex h-full flex-col gap-5 overflow-y-auto px-3 pt-4 pb-6">
      <ButtonLink href={localizePath(locale, "/app/aliases?new=1")} onClick={() => onNavigate?.()} className="w-full">
        <PlusIcon />
        {text.newAddress}
      </ButtonLink>

      <ul className="grid gap-0.5">
        {system.slice(0, 1).map((folder) => (
          <SystemLink key={folder.id} folder={folder} locale={locale} messages={messages} isActive={isAt(`/app/f/${folderSlug(folder)}`)} onNavigate={onNavigate} />
        ))}
        <SidebarLink
          href={localizePath(locale, "/app/starred")}
          icon={<StarIcon />}
          label={text.starred}
          isActive={isAt("/app/starred")}
          onNavigate={onNavigate}
        />
        {system.slice(1).map((folder) => (
          <SystemLink key={folder.id} folder={folder} locale={locale} messages={messages} isActive={isAt(`/app/f/${folderSlug(folder)}`)} onNavigate={onNavigate} />
        ))}
      </ul>

      <SidebarSection
        title={text.folders}
        addLabel={text.addFolder}
        onAdd={() => setDialog({ kind: "createFolder", key: crypto.randomUUID() })}
      >
        {custom.map((folder) => {
          const name = folderName(folder, messages.folders);
          return (
            <SidebarLink
              key={folder.id}
              href={localizePath(locale, `/app/f/${folder.id}`)}
              icon={<FolderIcon />}
              label={name}
              count={folder.unreadCount}
              countLabel={formatMessage(text.unread, { count: folder.unreadCount })}
              isActive={isAt(`/app/f/${folder.id}`)}
              onNavigate={onNavigate}
              menu={
                <ItemMenu label={formatMessage(text.itemActions, { name })}>
                  {(closeMenu) => (
                    <>
                      <MenuItem onSelect={() => { closeMenu(); setDialog({ kind: "renameFolder", folder }); }}>{text.folderActions.rename}</MenuItem>
                      <MenuItem icon={<AtIcon />} onSelect={() => { closeMenu(); setDialog({ kind: "routeFolder", folder }); }}>{text.folderActions.addresses}</MenuItem>
                      <MenuItem icon={<TrashIcon />} tone="danger" onSelect={() => { closeMenu(); setDialog({ kind: "deleteFolder", folder }); }}>{text.folderActions.delete}</MenuItem>
                    </>
                  )}
                </ItemMenu>
              }
            />
          );
        })}
      </SidebarSection>

      <SidebarSection
        title={text.labels}
        addLabel={text.addLabel}
        onAdd={() => setDialog({ kind: "createLabel", key: crypto.randomUUID() })}
      >
        {labelList.map((label) => {
          const name = label.name ?? text.unnamedLabel;
          return (
            <SidebarLink
              key={label.id}
              href={localizePath(locale, `/app/l/${label.id}`)}
              icon={<LabelDot color={label.color} />}
              label={name}
              count={label.unreadCount}
              countLabel={formatMessage(text.unread, { count: label.unreadCount })}
              isActive={isAt(`/app/l/${label.id}`)}
              onNavigate={onNavigate}
              menu={
                <ItemMenu label={formatMessage(text.itemActions, { name })}>
                  {(closeMenu) => (
                    <>
                      <MenuItem onSelect={() => { closeMenu(); setDialog({ kind: "editLabel", label }); }}>{text.labelActions.edit}</MenuItem>
                      <MenuItem icon={<AtIcon />} onSelect={() => { closeMenu(); setDialog({ kind: "routeLabel", label }); }}>{text.labelActions.addresses}</MenuItem>
                      <MenuItem icon={<TrashIcon />} tone="danger" onSelect={() => { closeMenu(); setDialog({ kind: "deleteLabel", label }); }}>{text.labelActions.delete}</MenuItem>
                    </>
                  )}
                </ItemMenu>
              }
            />
          );
        })}
      </SidebarSection>

      <SidebarDialogs dialog={dialog} folders={folderList} locale={locale} messages={messages} onClose={close} />
    </nav>
  );
}

function LabelDot({ color }: { readonly color: string }): ReactElement {
  return (
    <span className="grid size-[1.125rem] shrink-0 place-items-center">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

type SystemLinkProps = {
  readonly folder: FolderOption;
  readonly locale: Locale;
  readonly messages: MailboxMessages;
  readonly isActive: boolean;
  readonly onNavigate: (() => void) | undefined;
};

function SystemLink({ folder, locale, messages, isActive, onNavigate }: SystemLinkProps): ReactElement | null {
  if (folder.systemRole === null) return null;
  const Icon = SYSTEM_ICONS[folder.systemRole];
  // Unread mail in spam or trash is not a call to action, so its count stays quiet.
  const isQuiet = folder.systemRole === "spam" || folder.systemRole === "trash" || folder.systemRole === "archive";
  return (
    <SidebarLink
      href={localizePath(locale, `/app/f/${folderSlug(folder)}`)}
      icon={<Icon />}
      label={folderName(folder, messages.folders)}
      count={folder.unreadCount}
      countLabel={formatMessage(messages.mailbox.unread, { count: folder.unreadCount })}
      isQuietCount={isQuiet}
      isActive={isActive}
      onNavigate={onNavigate}
    />
  );
}

type SidebarLinkProps = {
  readonly href: string;
  readonly icon: ReactNode;
  readonly label: string;
  readonly count?: number;
  readonly countLabel?: string;
  readonly isQuietCount?: boolean;
  readonly isActive: boolean;
  readonly menu?: ReactNode;
  readonly onNavigate: (() => void) | undefined;
};

function SidebarLink(props: SidebarLinkProps): ReactElement {
  const { href, icon, label, count = 0, countLabel, isQuietCount = false, isActive, menu, onNavigate } = props;
  return (
    <li className="group relative">
      <Link
        href={href}
        onClick={() => onNavigate?.()}
        aria-current={isActive ? "page" : undefined}
        className={joinClassNames(
          "relative flex h-9 items-center gap-3 rounded-control pr-2 pl-3 text-sm transition-colors",
          isActive
            ? "bg-surface-2 text-paper before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-red"
            : "text-steel hover:bg-surface hover:text-paper",
          menu ? "pr-10" : null,
        )}
      >
        <span className={isActive ? "text-paper" : "text-fog group-hover:text-steel"}>{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {count > 0 ? (
          <span
            className={joinClassNames(
              "font-mono text-xs transition-opacity",
              isQuietCount ? "text-fog" : "rounded-full bg-red/15 px-1.5 leading-5 text-red-soft",
              menu ? "group-focus-within:opacity-0 group-hover:opacity-0" : null,
            )}
          >
            <span aria-hidden>{count}</span>
            <span className="sr-only">{countLabel}</span>
          </span>
        ) : null}
      </Link>
      {menu ? (
        <div className="absolute top-0 right-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 has-[[aria-expanded=true]]:opacity-100">
          {menu}
        </div>
      ) : null}
    </li>
  );
}

function ItemMenu({ label, children }: { readonly label: string; readonly children: (close: () => void) => ReactNode }): ReactElement {
  return (
    <Popover align="end" trigger={(trigger) => <IconButton {...trigger} label={label} icon={<MoreIcon />} />}>
      {children}
    </Popover>
  );
}

type SidebarSectionProps = {
  readonly title: string;
  readonly addLabel: string;
  readonly onAdd: () => void;
  readonly children: ReactNode;
};

function SidebarSection({ title, addLabel, onAdd, children }: SidebarSectionProps): ReactElement {
  return (
    <section className="grid gap-1">
      <div className="flex items-center justify-between pl-3">
        <h2 className="font-mono text-[0.6875rem] tracking-[0.12em] text-fog uppercase">{title}</h2>
        <IconButton label={addLabel} icon={<PlusIcon className="size-4" />} onClick={onAdd} className="size-7" />
      </div>
      <ul className="grid gap-0.5">{children}</ul>
    </section>
  );
}

type SidebarDialogsProps = {
  readonly dialog: DialogState;
  readonly folders: readonly FolderOption[];
  readonly locale: Locale;
  readonly messages: MailboxMessages;
  readonly onClose: () => void;
};

function SidebarDialogs({ dialog, folders, locale, messages, onClose }: SidebarDialogsProps): ReactElement {
  const folderActions = useFoldersContext();
  const labelActions = useLabelsContext();
  const aliases = useMailboxAliasesContext();
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useToast();
  const text = messages.mailbox;
  const aliasList: readonly AliasView[] = aliases.state.kind === "ready" ? aliases.state.aliases : [];
  const describe = (error: unknown): string =>
    describeErrorWith(error, { specific: { ...messages.folders.errors, ...text.errors }, common: messages.errors });

  async function attempt(action: () => Promise<void>, toast: string): Promise<string | null> {
    try {
      await action();
    } catch (error) {
      return describe(error);
    }
    onClose();
    showToast(toast);
    return null;
  }

  function leaveIfOpen(path: string): void {
    if (pathname === localizePath(locale, path)) router.replace(localizePath(locale, "/app/f/inbox"));
  }

  return (
    <>
      <FolderNameDialog
        key={dialog.kind === "createFolder" ? dialog.key : "create-folder-closed"}
        mode="create"
        isOpen={dialog.kind === "createFolder"}
        initialName=""
        messages={messages.folders.form}
        onClose={onClose}
        onSubmit={(name) => attempt(async () => {
          const folder = await folderActions.create(name);
          router.push(localizePath(locale, `/app/f/${folder.id}`));
        }, messages.folders.toasts.created)}
      />
      {dialog.kind === "renameFolder" ? (
        <FolderNameDialog
          key={`rename-${dialog.folder.id}`}
          mode="rename"
          isOpen
          initialName={dialog.folder.name.kind === "text" ? dialog.folder.name.text : ""}
          messages={messages.folders.form}
          onClose={onClose}
          onSubmit={(name) => attempt(() => folderActions.rename(dialog.folder, name), messages.folders.toasts.renamed)}
        />
      ) : null}
      {dialog.kind === "deleteFolder" ? (
        <DeleteFolderDialog
          key={`delete-${dialog.folder.id}`}
          isOpen
          name={folderName(dialog.folder, messages.folders)}
          messages={messages.folders.delete}
          onClose={onClose}
          onConfirm={() => attempt(async () => {
            await folderActions.remove(dialog.folder);
            leaveIfOpen(`/app/f/${dialog.folder.id}`);
          }, messages.folders.toasts.deleted)}
        />
      ) : null}
      {dialog.kind === "routeFolder" ? (
        <RoutingDialog
          key={`route-folder-${dialog.folder.id}`}
          isOpen
          title={formatMessage(text.routing.folderTitle, { name: folderName(dialog.folder, messages.folders) })}
          description={text.routing.folderText}
          aliases={aliasList}
          isRouted={(view) => view.alias.folderId === dialog.folder.id}
          currentPlace={(view) => destinationName(view.alias.folderId, folders, messages.folders)}
          messages={text.routing}
          onClose={onClose}
          onSave={(changed) => attempt(async () => {
            for (const [id, isRouted] of changed) await aliases.update(id, { folderId: isRouted ? dialog.folder.id : null });
          }, text.toasts.routingSaved)}
        />
      ) : null}
      <LabelFormDialog
        key={dialog.kind === "createLabel" ? dialog.key : "create-label-closed"}
        mode="create"
        isOpen={dialog.kind === "createLabel"}
        initialName=""
        initialColor="#6c8cff"
        messages={text.labelForm}
        onClose={onClose}
        onSubmit={(name, color) => attempt(async () => {
          await labelActions.create(name, color);
        }, text.toasts.labelCreated)}
      />
      {dialog.kind === "editLabel" ? (
        <LabelFormDialog
          key={`edit-${dialog.label.id}`}
          mode="edit"
          isOpen
          initialName={dialog.label.name ?? ""}
          initialColor={dialog.label.color}
          messages={text.labelForm}
          onClose={onClose}
          onSubmit={(name, color) => attempt(() => labelActions.edit(dialog.label, name, color), text.toasts.labelSaved)}
        />
      ) : null}
      {dialog.kind === "deleteLabel" ? (
        <ConfirmDialog
          key={`delete-${dialog.label.id}`}
          isOpen
          title={formatMessage(text.labelDelete.title, { name: dialog.label.name ?? text.unnamedLabel })}
          description={text.labelDelete.text}
          confirmLabel={text.labelDelete.confirm}
          cancelLabel={text.labelDelete.cancel}
          onClose={onClose}
          onConfirm={() => attempt(async () => {
            await labelActions.remove(dialog.label);
            leaveIfOpen(`/app/l/${dialog.label.id}`);
          }, text.toasts.labelDeleted)}
        />
      ) : null}
      {dialog.kind === "routeLabel" ? (
        <RoutingDialog
          key={`route-label-${dialog.label.id}`}
          isOpen
          title={formatMessage(text.routing.labelTitle, { name: dialog.label.name ?? text.unnamedLabel })}
          description={text.routing.labelText}
          aliases={aliasList}
          isRouted={(view) => view.alias.labelIds.includes(dialog.label.id)}
          messages={text.routing}
          onClose={onClose}
          onSave={(changed) => attempt(async () => {
            for (const [id, isRouted] of changed) {
              const current = aliasList.find((view) => view.alias.id === id)?.alias.labelIds ?? [];
              const labelIds = isRouted ? [...current, dialog.label.id] : current.filter((labelId) => labelId !== dialog.label.id);
              await aliases.update(id, { labelIds });
            }
          }, text.toasts.routingSaved)}
        />
      ) : null}
    </>
  );
}
