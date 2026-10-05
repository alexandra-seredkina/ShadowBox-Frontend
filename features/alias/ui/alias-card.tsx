"use client";

import type { ReactElement } from "react";
import { destinationName } from "@/features/folder/model/folder-name";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { LabelOption } from "@/features/label/model/label-option";
import { formatDay, formatMoment } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CopyButton } from "@/shared/ui/copy-button";
import { FolderIcon } from "@/shared/ui/icons";
import type { AliasView } from "../model/alias-view";
import type { AliasesMessages } from "./aliases-messages";

export type AliasAction = "edit" | "toggle" | "revoke";

type AliasCardProps = {
  readonly view: AliasView;
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  readonly locale: Locale;
  readonly messages: AliasesMessages;
  readonly isBusy: boolean;
  readonly onAction: (action: AliasAction) => void;
};

export function AliasCard({ view, folders, labels, locale, messages, isBusy, onAction }: AliasCardProps): ReactElement {
  const { alias, label } = view;
  const text = messages.page;
  const isDisabled = alias.status === "disabled";
  const common = messages.common;

  const aliasLabels = alias.labelIds.flatMap((id) => labels.filter((option) => option.id === id));

  return (
    <li className={joinClassNames("grid content-start gap-4 rounded-card border border-line bg-surface p-5", isDisabled ? "opacity-70" : null)}>
      <div className="grid gap-1">
        <div className="flex items-start justify-between gap-3">
          {label.kind === "text" ? <p className="min-w-0 font-medium break-words text-paper">{label.text}</p> : null}
          {label.kind === "unreadable" ? <p className="text-sm text-fog italic">{text.unreadableLabel}</p> : null}
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {alias.kind === "temporary" ? <Badge tone="alias">{text.kinds.temporary}</Badge> : <Badge tone="safe">{text.kinds.permanent}</Badge>}
            {isDisabled ? <Badge tone="caution">{text.disabled}</Badge> : null}
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate font-mono text-sm text-steel" translate="no">
            {alias.address}
          </p>
          <CopyButton value={alias.address} labels={{ copy: common.copy, copied: common.copied, failed: common.copyFailed }} />
        </div>
      </div>
      <ul className="flex flex-wrap items-center gap-1.5 text-xs">
        <li className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-steel">
          <FolderIcon className="size-3.5 text-fog" />
          {formatMessage(text.folder, { folder: destinationName(alias.folderId, folders, messages.folders) })}
        </li>
        {aliasLabels.map((option) => (
          <li key={option.id} className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-steel">
            <span className="size-2 rounded-full" style={{ backgroundColor: option.color }} />
            {option.name ?? text.form.unnamedLabel}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <span className="font-mono text-xs text-fog">
          {alias.expiresAt
            ? formatMessage(text.expires, { date: formatMoment(alias.expiresAt, locale) })
            : formatMessage(text.created, { date: formatDay(alias.createdAt, locale) })}
        </span>
        <div role="group" aria-label={formatMessage(text.actionsLabel, { address: alias.address })} className="flex flex-wrap gap-1">
          <Button variant="ghost" disabled={isBusy} onClick={() => onAction("edit")} className="h-8 px-3">
            {text.actions.edit}
          </Button>
          <Button variant="ghost" disabled={isBusy} onClick={() => onAction("toggle")} className="h-8 px-3">
            {isDisabled ? text.actions.enable : text.actions.disable}
          </Button>
          <Button variant="ghost" disabled={isBusy} onClick={() => onAction("revoke")} className="h-8 px-3 hover:border-red hover:text-red-soft">
            {text.actions.revoke}
          </Button>
        </div>
      </div>
    </li>
  );
}
