"use client";

import { useState, type ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { ExternalIcon, LinkIcon, ShieldAlertIcon } from "@/shared/ui/icons";
import type { MailLink } from "../model/mail-links";

type MessageLinksProps = {
  readonly links: readonly MailLink[];
  /** In a dangerous message the frame's links are off and this list is the only way out. */
  readonly areFrameLinksDisabled: boolean;
  readonly messages: Messages["mailbox"]["view"];
};

function openInNewTab(href: string): void {
  window.open(href, "_blank", "noopener,noreferrer");
}

/** Where every link really goes, outside the frame, where the message itself cannot hide it. */
export function MessageLinks({ links, areFrameLinksDisabled, messages }: MessageLinksProps): ReactElement | null {
  const [pending, setPending] = useState<MailLink | null>(null);
  const text = messages.links;
  if (links.length === 0) return null;
  const sorted = [...links].sort((a, b) => Number(b.isMismatch) - Number(a.isMismatch));

  function open(link: MailLink): void {
    if (link.isMismatch || areFrameLinksDisabled) setPending(link);
    else openInNewTab(link.href);
  }

  return (
    <section className="grid gap-3 rounded-card border border-line bg-surface p-4">
      <div className="grid gap-0.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <LinkIcon className="size-4 text-fog" />
          {text.title}
        </h2>
        <p className="text-xs text-fog">{areFrameLinksDisabled ? text.disabled : text.hint}</p>
      </div>
      <ul className="grid gap-1.5">
        {sorted.map((link) => (
          <li
            key={`${link.href}\u0000${link.text}`}
            className={joinClassNames(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-control px-3 py-2",
              link.isMismatch ? "border border-red/60 bg-wine" : "bg-ink",
            )}
          >
            <div className="grid min-w-0 gap-0.5">
              <span className="truncate text-sm text-steel">
                <span className="text-fog">{text.shows}: </span>
                {link.text}
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-xs text-fog">{text.goesTo}</span>
                <span className={joinClassNames("truncate font-mono text-xs", link.isMismatch ? "text-red-soft" : "text-paper")}>{link.host}</span>
                {link.isMismatch ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-red px-1.5 text-[0.6875rem] leading-4 font-semibold text-night uppercase">
                    <ShieldAlertIcon className="size-3" />
                    {text.mismatch}
                  </span>
                ) : null}
              </span>
            </div>
            <Button variant="ghost" onClick={() => open(link)} className="h-8 px-3">
              <ExternalIcon className="size-4" />
              <span className="max-sm:sr-only">{text.open}</span>
            </Button>
          </li>
        ))}
      </ul>
      {pending ? (
        <Dialog isOpen onClose={() => setPending(null)} title={messages.openLink.title} description={messages.openLink.text}>
          <div className="grid gap-4">
            <p className="rounded-control bg-ink px-3 py-2 font-mono text-sm break-all text-paper">{pending.href}</p>
            {pending.isMismatch && pending.shownHost ? (
              <p role="alert" className="flex gap-2 rounded-control border border-red/60 bg-wine px-3 py-2 text-sm text-paper">
                <ShieldAlertIcon className="mt-0.5 size-4 text-red-soft" />
                {formatMessage(messages.openLink.warning, { shown: pending.shownHost })}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="ghost" onClick={() => setPending(null)}>
                {messages.openLink.cancel}
              </Button>
              <Button
                onClick={() => {
                  openInNewTab(pending.href);
                  setPending(null);
                }}
              >
                {messages.openLink.confirm}
              </Button>
            </div>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}
