"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { formatMoment } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import type { MessageRow } from "../model/message-row";
import { AttachmentIcon } from "./attachment-icon";
import type { MailMessages } from "./mail-messages";
import { ThreatBadges } from "./threat-badges";

type MessageListItemProps = {
  readonly row: MessageRow;
  readonly locale: Locale;
  readonly messages: MailMessages["mail"];
  readonly isSelected: boolean;
  readonly onToggle: () => void;
};

export function MessageListItem({ row, locale, messages, isSelected, onToggle }: MessageListItemProps): ReactElement {
  const { summary, preview } = row;
  const isUnread = !summary.isRead;
  const sender = preview ? preview.from.name || preview.from.address : messages.unreadable.sender;
  const subject = preview ? preview.subject || messages.noSubject : messages.unreadable.subject;

  return (
    <li
      className={joinClassNames(
        "grid grid-cols-[auto_1fr] items-start gap-3 border-b border-line px-2 py-3 transition-colors sm:px-3",
        isSelected ? "bg-surface-2" : "hover:bg-surface",
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        aria-label={formatMessage(messages.select, { subject })}
        className="mt-1 size-4.5 accent-red"
      />
      <Link href={localizePath(locale, `/app/m/${summary.id}`)} className="grid min-w-0 gap-1 rounded-control">
        <span className="flex min-w-0 items-baseline gap-3">
          {isUnread ? (
            <span className="size-2 shrink-0 self-center bg-red">
              <span className="sr-only">{messages.unread}</span>
            </span>
          ) : null}
          <span className={joinClassNames("min-w-0 flex-1 truncate", isUnread ? "font-semibold text-paper" : "text-steel")}>
            {sender}
          </span>
          <time dateTime={summary.receivedAt} className="shrink-0 font-mono text-xs text-fog">
            {formatMoment(summary.receivedAt, locale)}
          </time>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className={joinClassNames("min-w-0 truncate", isUnread ? "font-medium text-paper" : "text-steel", preview ? null : "italic")}>
            {subject}
          </span>
          {preview?.hasAttachments ? <AttachmentIcon label={messages.attachment} /> : null}
        </span>
        {preview && preview.snippet ? <span className="line-clamp-1 text-sm text-fog">{preview.snippet}</span> : null}
        <ThreatBadges
          verdict={summary.threat.verdict}
          isToTemporaryAlias={row.isToTemporaryAlias}
          labels={messages.labels}
          showSafe={false}
        />
      </Link>
    </li>
  );
}
