"use client";

import type { ReactElement } from "react";
import { folderName } from "@/features/folder/model/folder-name";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { LabelOption } from "@/features/label/model/label-option";
import type { MailboxMessages } from "@/features/mailbox/ui/mailbox-messages";
import { IconButton } from "@/shared/ui/icon-button";
import {
  ArchiveIcon,
  BackIcon,
  BlockIcon,
  FolderIcon,
  InboxIcon,
  MailIcon,
  MoveIcon,
  SpamIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { MenuItem, Popover } from "@/shared/ui/popover";
import type { MessageSummary, UpdateMessageRequest } from "../api/message-schemas";
import { LabelPicker } from "./message-toolbar";

type MessagePaneToolbarProps = {
  readonly summary: MessageSummary;
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  readonly canBlock: boolean;
  readonly isBusy: boolean;
  readonly messages: MailboxMessages;
  readonly onMove: (folderId: string) => void;
  readonly onUpdate: (request: UpdateMessageRequest, toast: string | null) => void;
  readonly onDeleteForever: () => void;
  readonly onBlock: () => void;
  readonly onCreateLabel: () => void;
  readonly onClose: () => void;
};

export function MessagePaneToolbar(props: MessagePaneToolbarProps): ReactElement {
  const { summary, folders, isBusy, messages, onMove, onUpdate } = props;
  const text = messages.mailbox.toolbar;
  const toasts = messages.mailbox.toasts;
  const find = (role: FolderOption["systemRole"]): FolderOption | undefined => folders.find((folder) => folder.systemRole === role);
  const role = folders.find((folder) => folder.id === summary.folderId)?.systemRole ?? null;
  const inbox = find("inbox");
  const archive = find("archive");
  const spam = find("spam");
  const trash = find("trash");

  return (
    <div
      role="toolbar"
      aria-label={messages.mailbox.view.actions}
      className="sticky top-0 z-10 flex min-h-12 items-center gap-0.5 border-b border-line bg-night/95 px-1.5 backdrop-blur"
    >
      <IconButton label={messages.mailbox.view.back} icon={<BackIcon />} onClick={props.onClose} className="xl:hidden" />
      {archive && role !== "archive" ? (
        <IconButton label={text.archive} icon={<ArchiveIcon />} disabled={isBusy} onClick={() => onMove(archive.id)} />
      ) : null}
      {role === "spam" && inbox ? (
        <IconButton label={text.notSpam} icon={<InboxIcon />} disabled={isBusy} onClick={() => onMove(inbox.id)} />
      ) : null}
      {role !== "spam" && spam ? <IconButton label={text.spam} icon={<SpamIcon />} disabled={isBusy} onClick={() => onMove(spam.id)} /> : null}
      {role === "trash" ? (
        <IconButton label={text.deleteForever} icon={<TrashIcon />} tone="danger" disabled={isBusy} onClick={props.onDeleteForever} />
      ) : trash ? (
        <IconButton label={text.toTrash} icon={<TrashIcon />} tone="danger" disabled={isBusy} onClick={() => onMove(trash.id)} />
      ) : null}
      <span aria-hidden className="mx-1 h-5 w-px bg-line" />
      <IconButton label={text.markUnread} icon={<MailIcon />} disabled={isBusy} onClick={() => onUpdate({ isRead: false }, null)} />
      <IconButton
        label={summary.isStarred ? text.unstar : text.star}
        icon={<StarIcon isFilled={summary.isStarred} className={summary.isStarred ? "text-warn" : ""} />}
        disabled={isBusy}
        onClick={() => onUpdate({ isStarred: !summary.isStarred }, summary.isStarred ? toasts.unstarred : toasts.starred)}
      />
      <Popover trigger={(trigger) => <IconButton {...trigger} label={text.moveTo} icon={<MoveIcon />} disabled={isBusy} />}>
        {(close) =>
          folders
            .filter((folder) => folder.id !== summary.folderId)
            .map((folder) => (
              <MenuItem
                key={folder.id}
                icon={<FolderIcon />}
                onSelect={() => {
                  close();
                  onMove(folder.id);
                }}
              >
                {folderName(folder, messages.folders)}
              </MenuItem>
            ))
        }
      </Popover>
      <Popover trigger={(trigger) => <IconButton {...trigger} label={text.labelAs} icon={<TagIcon />} disabled={isBusy} />}>
        {(close) => (
          <LabelPicker
            labels={props.labels}
            selectedLabelIds={[summary.labelIds]}
            messages={{ toolbar: text, folders: messages.folders, unnamedLabel: messages.mailbox.unnamedLabel }}
            onApply={({ add, remove }) => {
              close();
              const labelIds = [...summary.labelIds.filter((id) => !remove.includes(id)), ...add.filter((id) => !summary.labelIds.includes(id))];
              onUpdate({ labelIds }, add.length > 0 ? toasts.labelled : toasts.unlabelled);
            }}
            onCreate={() => {
              close();
              props.onCreateLabel();
            }}
          />
        )}
      </Popover>
      {props.canBlock ? (
        <span className="ml-auto">
          <IconButton label={messages.mailbox.view.block} icon={<BlockIcon />} tone="danger" disabled={isBusy} onClick={props.onBlock} />
        </span>
      ) : null}
    </div>
  );
}
