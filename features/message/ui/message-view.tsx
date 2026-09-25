"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { openBlob } from "@/features/crypto/model/encrypted-blob";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMoment } from "@/shared/i18n/format-date";
import type { Locale } from "@/shared/i18n/locales";
import { Spinner } from "@/shared/ui/spinner";
import { messageApi } from "../api/message-api";
import type { MessageSummary } from "../api/message-schemas";
import type { MailMessages } from "./mail-messages";
import { MessageHtmlFrame } from "./message-html-frame";
import { MessageAuth } from "./message-auth";

type MessageViewProps = {
  readonly messageId: string;
  readonly locale: Locale;
  readonly messages: MailMessages;
};

type Attachment = { filename: string; contentType: string; content: Uint8Array };

type ViewState =
  | { kind: "loading" }
  | { kind: "failed"; error: string }
  | { kind: "ready"; from: string; subject: string; html: string | null; text: string | null; attachments: Attachment[] };

/**
 * Message view: decrypt MIME content from encrypted blob, parse with postal-mime,
 * render HTML in sandbox, display text fallback or as-is, show attachments.
 */
export function MessageView({ messageId, locale, messages }: MessageViewProps): ReactElement | null {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [summary, setSummary] = useState<MessageSummary | null>(null);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([messageApi.loadMessage(messageId), messageApi.loadContent(messageId)])
      .then(async ([msg, encrypted]) => {
        setSummary(msg);
        const keys = getUnlockedKeys();
        if (keys === null) throw new Error("Keys are locked");

        try {
          const mimeBuffer = await openBlob(encrypted, keys);
          const Mimeparser = (await import("postal-mime")).default;
          const mimeText = new TextDecoder().decode(mimeBuffer);
          const email = await new Mimeparser().parse(mimeText);

          const from =
            email.from?.name && email.from?.address
              ? `${email.from.name} <${email.from.address}>`
              : email.from?.address || "Unknown";
          const subject = email.subject || messages.mail.noSubject;
          const html = email.html ?? null;
          const text = email.text ?? null;
          const attachments = (email.attachments || []).map((att: any) => ({
            filename: att.filename || "unnamed",
            contentType: att.contentType || "application/octet-stream",
            content: new Uint8Array(Buffer.from(att.content, "binary")),
          }));

          if (isCurrent) {
            setState({ kind: "ready", from, subject, html, text, attachments });
          }
        } catch (error) {
          if (isCurrent) {
            if (error instanceof DecryptionFailedError) {
              setState({ kind: "failed", error: messages.mail.unreadable.subject });
            } else {
              setState({ kind: "failed", error: describeErrorWith(error, { specific: messages.mail.errors, common: messages.errors }) });
            }
          }
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setState({ kind: "failed", error: describeErrorWith(error, { specific: messages.mail.errors, common: messages.errors }) });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [messageId, messages]);

  if (state.kind === "loading") {
    return <Spinner label={messages.common.loading} />;
  }

  if (state.kind === "failed") {
    return <FormError message={state.error} />;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 border-b border-line pb-6">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold break-words">{state.subject}</h1>
          <p className="text-sm text-steel">{state.from}</p>
        </div>
        {summary && (
          <div className="flex items-center justify-between text-xs text-steel">
            <time dateTime={summary.receivedAt}>{formatMoment(summary.receivedAt, locale)}</time>
            <MessageAuth threat={summary.threat} labels={messages.mail.auth} />
          </div>
        )}
      </div>

      {state.html ? (
        <MessageHtmlFrame html={state.html} />
      ) : state.text ? (
        <pre className="bg-surface rounded p-4 overflow-auto text-sm text-steel whitespace-pre-wrap break-words">{state.text}</pre>
      ) : (
        <p className="text-center text-steel text-sm">{messages.mail.unreadable.subject}</p>
      )}

      {state.attachments.length > 0 && (
        <div className="grid gap-2 border-t border-line pt-6">
          <h2 className="font-semibold">{messages.mail.attachments}</h2>
          <ul className="space-y-2">
            {state.attachments.map((att, index) => (
              <li key={index} className="flex items-center justify-between gap-3 rounded bg-surface p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{att.filename}</p>
                  <p className="text-xs text-steel">{att.contentType}</p>
                </div>
                <a
                  href={URL.createObjectURL(new Blob([Buffer.from(att.content)], { type: att.contentType }))}
                  download={att.filename}
                  className="shrink-0 rounded bg-red-soft px-3 py-1 text-xs font-semibold text-ink hover:bg-red transition-colors"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
