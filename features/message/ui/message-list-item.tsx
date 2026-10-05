"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import type { LabelOption } from "@/features/label/model/label-option";
import { formatListTime } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import { PaperclipIcon, ShieldAlertIcon, StarIcon, TimerIcon } from "@/shared/ui/icons";
import type { MessageRow } from "../model/message-row";

const MAX_LABEL_CHIPS = 2;

type MessageListItemProps = {
  readonly row: MessageRow;
  readonly href: string;
  readonly locale: Locale;
  readonly labels: readonly LabelOption[];
  readonly messages: { readonly row: Messages["mailbox"]["row"]; readonly mail: Messages["mail"]; readonly unnamedLabel: string };
  readonly isSelected: boolean;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onToggleStar: () => void;
};

/** Two lines like a desktop mail client: who and when, then subject and snippet. */
export function MessageListItem(props: MessageListItemProps): ReactElement {
  const { row, href, locale, labels, messages, isSelected, isOpen, onToggle, onToggleStar } = props;
  const { summary, preview } = row;
  const text = messages.row;
  const isUnread = !summary.isRead;
  const isDanger = summary.threat.verdict === "danger";
  const sender = preview ? preview.from.name || preview.from.address : messages.mail.unreadable.sender;
  const subject = preview ? preview.subject || messages.mail.noSubject : messages.mail.unreadable.subject;
  const rowLabels = summary.labelIds.flatMap((id) => labels.filter((label) => label.id === id));

  return (
    <li
      className={joinClassNames(
        "group relative grid grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-x-1 border-b border-line/70 py-2 pr-3 pl-1.5 transition-colors",
        isDanger ? "bg-wine/50 shadow-[inset_3px_0_0_var(--color-red)]" : null,
        isOpen ? "bg-surface-2 shadow-[inset_3px_0_0_var(--color-red-soft)]" : null,
        !isOpen && isSelected ? "bg-surface" : null,
        !isOpen && !isSelected && !isDanger ? "hover:bg-surface" : null,
      )}
    >
      <label className="grid size-8 cursor-pointer place-items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          aria-label={formatMessage(messages.mail.select, { subject })}
          className="size-4 accent-red"
        />
      </label>
      <button
        type="button"
        onClick={onToggleStar}
        aria-pressed={summary.isStarred}
        aria-label={summary.isStarred ? text.unstar : text.star}
        title={summary.isStarred ? text.unstar : text.star}
        className={joinClassNames(
          "grid size-8 place-items-center rounded-control transition-colors",
          summary.isStarred ? "text-warn" : "text-line group-hover:text-fog hover:!text-warn",
        )}
      >
        <StarIcon isFilled={summary.isStarred} className="size-4" />
      </button>
      <Link
        href={href}
        scroll={false}
        aria-current={isOpen ? "true" : undefined}
        aria-label={formatMessage(text.open, { subject })}
        className="grid min-w-0 gap-0.5 rounded-control py-1 pl-1"
      >
        <span className="flex min-w-0 items-center gap-2">
          {isUnread ? (
            <span className="size-1.5 shrink-0 bg-red-soft">
              <span className="sr-only">{text.unread}</span>
            </span>
          ) : null}
          {isDanger ? <ShieldAlertIcon className="size-4 text-red-soft" /> : null}
          <span className={joinClassNames("min-w-0 flex-1 truncate text-sm", isUnread ? "font-semibold text-paper" : "text-steel")}>
            {sender}
          </span>
          {isDanger ? (
            <span className="shrink-0 rounded-sm bg-red px-1.5 text-[0.6875rem] leading-4 font-semibold tracking-wide text-night uppercase">
              {text.phishing}
            </span>
          ) : null}
          {preview?.hasAttachments ? (
            <span title={text.attachment} className="text-fog">
              <PaperclipIcon className="size-3.5" />
              <span className="sr-only">{text.attachment}</span>
            </span>
          ) : null}
          {row.isToTemporaryAlias ? (
            <span title={text.temporary} className="text-fog">
              <TimerIcon className="size-3.5" />
              <span className="sr-only">{text.temporary}</span>
            </span>
          ) : null}
          <time dateTime={summary.receivedAt} className={joinClassNames("shrink-0 font-mono text-xs", isUnread ? "text-paper" : "text-fog")}>
            {formatListTime(summary.receivedAt, locale)}
          </time>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
          {rowLabels.slice(0, MAX_LABEL_CHIPS).map((label) => (
            <span
              key={label.id}
              className="inline-flex max-w-24 shrink-0 items-center gap-1 rounded-sm border border-line px-1 text-[0.6875rem] leading-4 text-steel"
            >
              <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
              <span className="truncate">{label.name ?? messages.unnamedLabel}</span>
            </span>
          ))}
          {rowLabels.length > MAX_LABEL_CHIPS ? <span className="shrink-0 text-[0.6875rem] text-fog">+{rowLabels.length - MAX_LABEL_CHIPS}</span> : null}
          <span className="min-w-0 truncate">
            <span className={joinClassNames(isUnread ? "font-medium text-paper" : "text-steel", preview ? null : "italic")}>{subject}</span>
            {preview?.snippet ? <span className="text-fog"> — {preview.snippet}</span> : null}
          </span>
        </span>
      </Link>
    </li>
  );
}
