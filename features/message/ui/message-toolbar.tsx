"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { folderName } from "@/features/folder/model/folder-name";
import type { FolderOption } from "@/features/folder/model/folder-option";
import { formatMessage } from "@/shared/i18n/format-message";
import { joinClassNames } from "@/shared/lib/class-names";
import { Button } from "@/shared/ui/button";
import { INPUT_CLASS_NAME } from "@/shared/ui/input";
import type { MessageChange } from "../model/message-row";
import type { MailMessages } from "./mail-messages";

const TOOL_CLASS_NAME = "h-9 px-3";
const DESTRUCTIVE_TOOL_CLASS_NAME = "h-9 px-3 hover:border-red hover:text-red-soft";

type MessageToolbarProps = {
  readonly folder: FolderOption;
  /** Every folder, sorted for display; the open one is left out of "Move to". */
  readonly folders: readonly FolderOption[];
  readonly selectedCount: number;
  readonly loadedCount: number;
  readonly isBusy: boolean;
  readonly messages: MailMessages;
  readonly onSelectAll: (isSelected: boolean) => void;
  readonly onChange: (change: MessageChange) => void;
  readonly onDeleteForever: () => void;
};

export function MessageToolbar(props: MessageToolbarProps): ReactElement {
  const { folder, folders, selectedCount, loadedCount, isBusy, messages, onChange } = props;
  const text = messages.mail;
  const inbox = folders.find((option) => option.systemRole === "inbox");
  const trash = folders.find((option) => option.systemRole === "trash");
  const hasSelection = selectedCount > 0;

  return (
    <div className="sticky top-0 z-10 -mx-2 flex min-h-14 flex-wrap items-center gap-2 border-b border-line bg-night/95 px-2 py-2 backdrop-blur sm:-mx-3 sm:px-3">
      <SelectAll selectedCount={selectedCount} loadedCount={loadedCount} label={text.selectAll} onChange={props.onSelectAll} />
      {hasSelection ? (
        <div role="group" aria-label={text.toolbarLabel} className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-steel" aria-live="polite">
            {formatMessage(text.selected, { count: selectedCount })}
          </span>
          <Button variant="ghost" disabled={isBusy} onClick={() => onChange({ action: "markRead" })} className={TOOL_CLASS_NAME}>
            {text.actions.markRead}
          </Button>
          <Button variant="ghost" disabled={isBusy} onClick={() => onChange({ action: "markUnread" })} className={TOOL_CLASS_NAME}>
            {text.actions.markUnread}
          </Button>
          <select
            aria-label={text.actions.moveLabel}
            value=""
            disabled={isBusy}
            onChange={(event) => onChange({ action: "move", folderId: event.target.value })}
            className={joinClassNames(INPUT_CLASS_NAME, "h-9 w-auto max-w-48 text-sm")}
          >
            <option value="" disabled>
              {text.actions.moveTo}
            </option>
            {folders
              .filter((option) => option.id !== folder.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {folderName(option, messages.folders)}
                </option>
              ))}
          </select>
          {folder.systemRole === "spam" && inbox ? (
            <Button variant="ghost" disabled={isBusy} onClick={() => onChange({ action: "move", folderId: inbox.id })} className={TOOL_CLASS_NAME}>
              {text.actions.notSpam}
            </Button>
          ) : null}
          {folder.systemRole === "trash" || !trash ? (
            <Button variant="ghost" disabled={isBusy} onClick={props.onDeleteForever} className={DESTRUCTIVE_TOOL_CLASS_NAME}>
              {text.actions.deleteForever}
            </Button>
          ) : (
            <Button variant="ghost" disabled={isBusy} onClick={() => onChange({ action: "move", folderId: trash.id })} className={DESTRUCTIVE_TOOL_CLASS_NAME}>
              {text.actions.toTrash}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

type SelectAllProps = {
  readonly selectedCount: number;
  readonly loadedCount: number;
  readonly label: string;
  readonly onChange: (isSelected: boolean) => void;
};

function SelectAll({ selectedCount, loadedCount, label, onChange }: SelectAllProps): ReactElement {
  const ref = useRef<HTMLInputElement>(null);
  const isAll = loadedCount > 0 && selectedCount === loadedCount;

  // `indeterminate` exists only as a DOM property, not as an attribute React can set.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = selectedCount > 0 && !isAll;
  }, [selectedCount, isAll]);

  return (
    <label className="flex items-center gap-2 px-0 text-sm text-steel">
      <input
        ref={ref}
        type="checkbox"
        checked={isAll}
        disabled={loadedCount === 0}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4.5 accent-red"
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}
