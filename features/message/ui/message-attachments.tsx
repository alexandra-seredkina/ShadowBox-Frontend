"use client";

import type { ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import { DownloadIcon, PaperclipIcon, ShieldAlertIcon } from "@/shared/ui/icons";
import type { OpenedAttachment } from "../model/open-message";

const KIB = 1024;

function formatSize(bytes: number): string {
  if (bytes < KIB) return `${bytes} B`;
  if (bytes < KIB * KIB) return `${Math.round(bytes / KIB)} KB`;
  return `${(bytes / KIB / KIB).toFixed(1)} MB`;
}

/** A Blob URL made at the moment of the click and dropped right after: nothing lingers in memory. */
function download(attachment: OpenedAttachment): void {
  const url = URL.createObjectURL(new Blob([attachment.content], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.filename;
  link.rel = "noopener";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type MessageAttachmentsProps = {
  readonly attachments: readonly OpenedAttachment[];
  readonly messages: Messages["mailbox"]["view"]["attachments"];
};

export function MessageAttachments({ attachments, messages }: MessageAttachmentsProps): ReactElement | null {
  if (attachments.length === 0) return null;

  function save(attachment: OpenedAttachment): void {
    if (attachment.isDangerous && !window.confirm(messages.confirmDangerous)) return;
    download(attachment);
  }

  return (
    <section className="grid gap-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <PaperclipIcon className="size-4 text-fog" />
        {messages.title}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {attachments.map((attachment, index) => (
          <li key={`${attachment.filename}-${index}`}>
            <button
              type="button"
              onClick={() => save(attachment)}
              aria-label={formatMessage(messages.download, { name: attachment.filename })}
              className={joinClassNames(
                "flex w-full items-center gap-3 rounded-control border px-3 py-2.5 text-left transition-colors",
                attachment.isDangerous ? "border-red/60 bg-wine hover:border-red" : "border-line bg-surface hover:border-fog",
              )}
            >
              {attachment.isDangerous ? <ShieldAlertIcon className="text-red-soft" /> : <PaperclipIcon className="text-fog" />}
              <span className="grid min-w-0 flex-1">
                <span className="truncate text-sm text-paper">{attachment.filename}</span>
                <span className={joinClassNames("text-xs", attachment.isDangerous ? "text-red-soft" : "text-fog")}>
                  {attachment.isDangerous ? messages.dangerous : `${attachment.mimeType} · ${formatSize(attachment.content.byteLength)}`}
                </span>
              </span>
              <DownloadIcon className="text-fog" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
