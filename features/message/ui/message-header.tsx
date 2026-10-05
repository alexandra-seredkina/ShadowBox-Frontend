import type { ReactElement } from "react";
import type { LabelOption } from "@/features/label/model/label-option";
import type { MailboxMessages } from "@/features/mailbox/ui/mailbox-messages";
import { formatFullMoment } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import { joinClassNames } from "@/shared/lib/class-names";
import { CloseIcon, TimerIcon } from "@/shared/ui/icons";
import type { MessageSummary } from "../api/message-schemas";
import type { OpenedMessage } from "../model/open-message";
import { SenderCheck } from "./sender-check";

type MessageHeaderProps = {
  readonly summary: MessageSummary;
  readonly message: OpenedMessage;
  readonly domain: string;
  readonly to: { readonly address: string; readonly isTemporary: boolean } | null;
  readonly locale: Locale;
  readonly labels: readonly LabelOption[];
  readonly messages: MailboxMessages;
  readonly onRemoveLabel: (labelId: string) => void;
};

/** Subject, labels, then the sender with the full address always visible: the name alone proves nothing. */
export function MessageHeader(props: MessageHeaderProps): ReactElement {
  const { summary, message, domain, to, locale, labels, messages } = props;
  const text = messages.mailbox.view;
  const isDanger = summary.threat.verdict === "danger";
  const name = message.from.name || message.from.address || messages.mail.unreadable.sender;
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? "?";
  const messageLabels = summary.labelIds.flatMap((id) => labels.filter((label) => label.id === id));

  return (
    <header className="grid gap-4">
      <div className="grid gap-2">
        <h1 className="text-xl font-semibold break-words text-paper sm:text-2xl">{message.subject || messages.mail.noSubject}</h1>
        {messageLabels.length > 0 ? (
          <ul aria-label={text.labelsTitle} className="flex flex-wrap gap-1.5">
            {messageLabels.map((label) => {
              const labelName = label.name ?? messages.mailbox.unnamedLabel;
              return (
                <li key={label.id} className="inline-flex items-center gap-1.5 rounded-sm border border-line py-0.5 pr-1 pl-2 text-xs text-steel">
                  <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
                  {labelName}
                  <button
                    type="button"
                    onClick={() => props.onRemoveLabel(label.id)}
                    aria-label={formatMessage(text.removeLabel, { name: labelName })}
                    className="grid size-4 place-items-center rounded-sm text-fog hover:text-paper"
                  >
                    <CloseIcon className="size-3" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={joinClassNames(
            "grid size-10 shrink-0 place-items-center rounded-control font-display text-sm",
            isDanger ? "bg-red text-night" : "bg-surface-2 text-steel",
          )}
        >
          {initial}
        </span>
        <div className="grid min-w-0 flex-1 gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <p className="min-w-0 truncate text-sm font-semibold text-paper">{name}</p>
            <time dateTime={summary.receivedAt} className="shrink-0 font-mono text-xs text-fog">
              {formatFullMoment(summary.receivedAt, locale)}
            </time>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-0.5 text-xs">
            <dt className="text-fog">{text.from}</dt>
            <dd className={joinClassNames("truncate font-mono", isDanger ? "text-red-soft" : "text-steel")}>
              {message.from.address || "—"}
            </dd>
            <dt className="text-fog">{text.to}</dt>
            <dd className="flex min-w-0 items-center gap-1.5 font-mono text-steel">
              <span className="truncate">{to?.address ?? text.unknownAddress}</span>
              {to?.isTemporary ? (
                <span className="inline-flex shrink-0 items-center gap-1 font-sans text-fog">
                  <TimerIcon className="size-3.5" />
                  {text.toTemporary}
                </span>
              ) : null}
            </dd>
          </dl>
          <SenderCheck auth={summary.threat.auth} domain={domain} messages={text.auth} />
        </div>
      </div>
    </header>
  );
}
