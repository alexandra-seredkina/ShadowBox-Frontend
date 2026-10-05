"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { folderName } from "@/features/folder/model/folder-name";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { LabelOption } from "@/features/label/model/label-option";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import {
  ArchiveIcon,
  FolderIcon,
  InboxIcon,
  MailIcon,
  MailOpenIcon,
  MoveIcon,
  PlusIcon,
  RefreshIcon,
  SpamIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { MenuItem, Popover } from "@/shared/ui/popover";
import type { MessageChange } from "../model/message-row";

type ToolbarMessages = {
  readonly toolbar: Messages["mailbox"]["toolbar"];
  readonly folders: Messages["folders"];
  readonly unnamedLabel: string;
};

/** What the label picker should add and take off, from the checkboxes the user changed. */
export type LabelEdit = { readonly add: readonly string[]; readonly remove: readonly string[] };

type MessageToolbarProps = {
  /** The open folder, when the list shows one; cross-folder views have none. */
  readonly folder: FolderOption | null;
  /** Every folder, sorted for display. */
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  /** Label ids of each selected message, to show which labels they share. */
  readonly selectedLabelIds: readonly (readonly string[])[];
  readonly areAllStarred: boolean;
  readonly selectedCount: number;
  readonly loadedCount: number;
  readonly isBusy: boolean;
  readonly messages: ToolbarMessages;
  readonly onSelectAll: (isSelected: boolean) => void;
  readonly onChange: (change: MessageChange) => void;
  readonly onLabels: (edit: LabelEdit) => void;
  readonly onCreateLabel: () => void;
  readonly onDeleteForever: () => void;
  readonly onRefresh: () => void;
};

export function MessageToolbar(props: MessageToolbarProps): ReactElement {
  const { folder, folders, labels, selectedCount, loadedCount, isBusy, messages, onChange } = props;
  const text = messages.toolbar;
  const find = (role: FolderOption["systemRole"]): FolderOption | undefined => folders.find((option) => option.systemRole === role);
  const inbox = find("inbox");
  const archive = find("archive");
  const spam = find("spam");
  const trash = find("trash");
  const role = folder?.systemRole ?? null;
  const isIdle = isBusy;
  const move = (target: FolderOption | undefined): void => {
    if (target) onChange({ action: "move", folderId: target.id });
  };

  return (
    <div role="toolbar" aria-label={text.label} className="flex min-h-12 items-center gap-0.5 border-b border-line px-1.5">
      <SelectAll selectedCount={selectedCount} loadedCount={loadedCount} label={text.selectAll} onChange={props.onSelectAll} />
      {selectedCount > 0 ? (
        <>
          <IconButton label={text.markRead} icon={<MailOpenIcon />} disabled={isIdle} onClick={() => onChange({ action: "markRead" })} />
          <IconButton label={text.markUnread} icon={<MailIcon />} disabled={isIdle} onClick={() => onChange({ action: "markUnread" })} />
          <IconButton
            label={props.areAllStarred ? text.unstar : text.star}
            icon={<StarIcon isFilled={props.areAllStarred && selectedCount > 0} />}
            disabled={isIdle}
            onClick={() => onChange({ action: props.areAllStarred ? "unstar" : "star" })}
          />
          {role !== "archive" ? <IconButton label={text.archive} icon={<ArchiveIcon />} disabled={isIdle} onClick={() => move(archive)} /> : null}
          {role === "spam" ? (
            <IconButton label={text.notSpam} icon={<InboxIcon />} disabled={isIdle} onClick={() => move(inbox)} />
          ) : (
            <IconButton label={text.spam} icon={<SpamIcon />} disabled={isIdle} onClick={() => move(spam)} />
          )}
          {role === "trash" ? (
            <IconButton label={text.deleteForever} icon={<TrashIcon />} tone="danger" disabled={isIdle} onClick={props.onDeleteForever} />
          ) : (
            <IconButton label={text.toTrash} icon={<TrashIcon />} tone="danger" disabled={isIdle} onClick={() => move(trash)} />
          )}
          <span aria-hidden className="mx-1 h-5 w-px bg-line" />
          <Popover trigger={(trigger) => <IconButton {...trigger} label={text.moveTo} icon={<MoveIcon />} disabled={isIdle} />}>
            {(close) =>
              folders
                .filter((option) => option.id !== folder?.id)
                .map((option) => (
                  <MenuItem
                    key={option.id}
                    icon={<FolderIcon />}
                    onSelect={() => {
                      close();
                      move(option);
                    }}
                  >
                    {folderName(option, messages.folders)}
                  </MenuItem>
                ))
            }
          </Popover>
          <Popover trigger={(trigger) => <IconButton {...trigger} label={text.labelAs} icon={<TagIcon />} disabled={isIdle} />}>
            {(close) => (
              <LabelPicker
                labels={labels}
                selectedLabelIds={props.selectedLabelIds}
                messages={messages}
                onApply={(edit) => {
                  close();
                  props.onLabels(edit);
                }}
                onCreate={() => {
                  close();
                  props.onCreateLabel();
                }}
              />
            )}
          </Popover>
        </>
      ) : null}
      <span className="ml-auto flex items-center gap-1">
        <span className="sr-only font-mono text-xs text-steel 2xl:not-sr-only" aria-live="polite">
          {selectedCount > 0 ? formatMessage(text.selected, { count: selectedCount }) : null}
        </span>
        {selectedCount === 0 ? <IconButton label={text.refresh} icon={<RefreshIcon />} onClick={props.onRefresh} /> : null}
      </span>
    </div>
  );
}

type LabelPickerProps = {
  readonly labels: readonly LabelOption[];
  readonly selectedLabelIds: readonly (readonly string[])[];
  readonly messages: ToolbarMessages;
  readonly onApply: (edit: LabelEdit) => void;
  readonly onCreate: () => void;
};

type LabelState = "all" | "some" | "none";

function stateOf(labelId: string, selected: readonly (readonly string[])[]): LabelState {
  const count = selected.filter((ids) => ids.includes(labelId)).length;
  if (count === 0) return "none";
  return count === selected.length ? "all" : "some";
}

/** Checkboxes per label: a dash means some of the selected messages have it. */
export function LabelPicker({ labels, selectedLabelIds, messages, onApply, onCreate }: LabelPickerProps): ReactElement {
  const [wanted, setWanted] = useState<ReadonlyMap<string, boolean>>(new Map());
  const text = messages.toolbar;

  function apply(): void {
    const add: string[] = [];
    const remove: string[] = [];
    for (const [labelId, isWanted] of wanted) (isWanted ? add : remove).push(labelId);
    onApply({ add, remove });
  }

  return (
    <div className="grid w-64 gap-1">
      {labels.length === 0 ? <p className="px-2.5 py-2 text-sm text-fog">{text.noLabels}</p> : null}
      <ul className="grid max-h-64 gap-0.5 overflow-y-auto">
        {labels.map((label) => (
          <li key={label.id}>
            <LabelCheckbox
              label={label}
              name={label.name ?? messages.unnamedLabel}
              state={stateOf(label.id, selectedLabelIds)}
              wanted={wanted.get(label.id)}
              onChange={(isWanted) => setWanted((current) => new Map(current).set(label.id, isWanted))}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2 border-t border-line pt-1.5">
        <button type="button" onClick={onCreate} className="inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm text-steel hover:text-paper">
          <PlusIcon className="size-4" />
          {text.createLabel}
        </button>
        <Button disabled={wanted.size === 0} onClick={apply} className="h-8 px-3">
          {text.apply}
        </Button>
      </div>
    </div>
  );
}

type LabelCheckboxProps = {
  readonly label: LabelOption;
  readonly name: string;
  readonly state: LabelState;
  readonly wanted: boolean | undefined;
  readonly onChange: (isWanted: boolean) => void;
};

function LabelCheckbox({ label, name, state, wanted, onChange }: LabelCheckboxProps): ReactElement {
  const ref = useRef<HTMLInputElement>(null);
  const isChecked = wanted ?? state === "all";
  const isMixed = wanted === undefined && state === "some";

  // `indeterminate` exists only as a DOM property, not as an attribute React can set.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = isMixed;
  }, [isMixed]);

  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-sm hover:bg-surface-2">
      <input ref={ref} type="checkbox" checked={isChecked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-red" />
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
      <span className="min-w-0 flex-1 truncate">{name}</span>
    </label>
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
    <label className="grid size-9 cursor-pointer place-items-center">
      <input
        ref={ref}
        type="checkbox"
        checked={isAll}
        disabled={loadedCount === 0}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-red"
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}
