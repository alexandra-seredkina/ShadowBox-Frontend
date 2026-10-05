"use client";

import { useState, type ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import { ChevronDownIcon, ShieldAlertIcon, ShieldCheckIcon } from "@/shared/ui/icons";
import type { AuthResult, Threat } from "../api/message-schemas";

const RESULT_CLASSES: Readonly<Record<AuthResult, string>> = {
  pass: "border-safe/40 text-safe",
  fail: "border-red text-red-soft",
  none: "border-line text-fog",
};

type SenderCheckProps = {
  readonly auth: Threat["auth"];
  readonly domain: string;
  readonly messages: Messages["mailbox"]["view"]["auth"];
};

/** DMARC decides the headline: it is what ties the visible From address to the domain's own rules. */
export function SenderCheck({ auth, domain, messages }: SenderCheckProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const name = domain || "?";
  const summary =
    auth.dmarc === "pass"
      ? { title: messages.verified, text: formatMessage(messages.verifiedText, { domain: name }), tone: "text-safe", Icon: ShieldCheckIcon }
      : auth.dmarc === "fail"
        ? { title: messages.failed, text: formatMessage(messages.failedText, { domain: name }), tone: "text-red-soft", Icon: ShieldAlertIcon }
        : { title: messages.unverified, text: formatMessage(messages.unverifiedText, { domain: name }), tone: "text-fog", Icon: ShieldAlertIcon };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-fit items-center gap-1.5 rounded-control text-left text-sm"
      >
        <summary.Icon className={joinClassNames("size-4", summary.tone)} />
        <span className={summary.tone}>{summary.title}</span>
        <ChevronDownIcon className={joinClassNames("size-4 text-fog transition-transform", isOpen ? "rotate-180" : null)} />
        <span className="sr-only">{messages.details}</span>
      </button>
      {isOpen ? (
        <div className="grid gap-2 rounded-control bg-ink px-3 py-2.5">
          <p className="text-sm text-steel">{summary.text}</p>
          <ul className="flex flex-wrap gap-2">
            {(["spf", "dkim", "dmarc"] as const).map((check) => (
              <li key={check} className={joinClassNames("rounded-sm border px-2 py-0.5 font-mono text-xs", RESULT_CLASSES[auth[check]])}>
                {check.toUpperCase()} · {messages[auth[check]]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
