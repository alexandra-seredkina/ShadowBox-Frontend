"use client";

import type { ReactElement } from "react";
import { destinationName } from "@/features/folder/model/folder-name";
import type { FolderOption } from "@/features/folder/model/folder-option";
import { formatDay, formatMoment } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CopyButton } from "@/shared/ui/copy-button";
import type { AliasView } from "../model/alias-view";
import type { AliasesMessages } from "./aliases-messages";

export type AliasAction = "edit" | "toggle" | "revoke";

type AliasCardProps = {
  readonly view: AliasView;
  readonly folders: readonly FolderOption[];
  readonly locale: Locale;
  readonly messages: AliasesMessages;
  readonly isBusy: boolean;
  readonly onAction: (action: AliasAction) => void;
};

export function AliasCard({ view, folders, locale, messages, isBusy, onAction }: AliasCardProps): ReactElement {
  const { alias, label } = view;
  const text = messages.page;
  const isDisabled = alias.status === "disabled";
  const common = messages.common;

  return (
    <li className={joinClassNames("grid gap-3 rounded-card border border-line bg-surface p-5", isDisabled ? "opacity-70" : null)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 font-mono text-base break-all text-paper" translate="no">
          {alias.address}
        </p>
        <CopyButton value={alias.address} labels={{ copy: common.copy, copied: common.copied, failed: common.copyFailed }} />
      </div>
      {label.kind === "text" ? <p className="font-medium">{label.text}</p> : null}
      {label.kind === "unreadable" ? <p className="text-sm text-fog italic">{text.unreadableLabel}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {alias.kind === "temporary" ? <Badge tone="alias">{text.kinds.temporary}</Badge> : <Badge tone="safe">{text.kinds.permanent}</Badge>}
        {isDisabled ? <Badge tone="caution">{text.disabled}</Badge> : null}
        {alias.expiresAt ? (
          <span className="font-mono text-xs text-fog">{formatMessage(text.expires, { date: formatMoment(alias.expiresAt, locale) })}</span>
        ) : null}
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-steel">
        <span>{formatMessage(text.folder, { folder: destinationName(alias.folderId, folders, messages.folders) })}</span>
        <span className="font-mono text-xs leading-5 text-fog">
          {formatMessage(text.created, { date: formatDay(alias.createdAt, locale) })}
        </span>
      </p>
      <div role="group" aria-label={formatMessage(text.actionsLabel, { address: alias.address })} className="flex flex-wrap gap-2">
        <Button variant="ghost" disabled={isBusy} onClick={() => onAction("edit")}>
          {text.actions.edit}
        </Button>
        <Button variant="ghost" disabled={isBusy} onClick={() => onAction("toggle")}>
          {isDisabled ? text.actions.enable : text.actions.disable}
        </Button>
        <Button variant="ghost" disabled={isBusy} onClick={() => onAction("revoke")} className="hover:border-red hover:text-red-soft">
          {text.actions.revoke}
        </Button>
      </div>
    </li>
  );
}
