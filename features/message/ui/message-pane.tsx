"use client";

import { useState, type ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { BlockSenderDialog } from "@/features/blocked-sender/ui/block-sender-dialog";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { LabelOption } from "@/features/label/model/label-option";
import type { MailboxMessages } from "@/features/mailbox/ui/mailbox-messages";
import { ConfirmDialog } from "@/features/mailbox/ui/confirm-dialog";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import { Spinner } from "@/shared/ui/spinner";
import type { MessageSummary, UpdateMessageRequest } from "../api/message-schemas";
import { messageApi } from "../api/message-api";
import { useOpenedMessage, type OpenedMessageState } from "../model/use-opened-message";
import { MessageAttachments } from "./message-attachments";
import { MessageHeader } from "./message-header";
import { MessageHtmlFrame } from "./message-html-frame";
import { MessageLinks } from "./message-links";
import { MessagePaneToolbar } from "./message-pane-toolbar";
import { ThreatBanner } from "./threat-banner";

type Ready = Extract<OpenedMessageState, { kind: "ready" }>;

export type MessagePaneProps = {
  readonly messageId: string;
  readonly locale: Locale;
  readonly messages: MailboxMessages;
  /** Every folder, sorted for display. */
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  /** The address the message came to, when it still exists. */
  readonly aliasAddress: (aliasId: string | null) => { readonly address: string; readonly isTemporary: boolean } | null;
  /** Ids of other loaded messages from this sender, for the block dialog. */
  readonly othersFrom: (address: string, exceptId: string) => readonly string[];
  /** The message changed; `after` is null once it is deleted for good. */
  readonly onChanged: (before: MessageSummary, after: MessageSummary | null) => void;
  /** Moves other loaded messages to spam after their sender is blocked. */
  readonly onMoveToSpam: (ids: readonly string[]) => Promise<void>;
  readonly onBlock: (address: string) => Promise<void>;
  readonly onCreateLabel: () => void;
  readonly onClose: () => void;
  readonly onToast: (text: string) => void;
};

type Dialog = "none" | "delete" | "block";

/** The open message: verdict first, then who sent it, then the body in its sandbox. */
export function MessagePane(props: MessagePaneProps): ReactElement {
  const { messageId, messages, onChanged } = props;
  const opened = useOpenedMessage(messageId, onChanged);
  const describe = (error: unknown): string =>
    describeErrorWith(error, { specific: { ...messages.mail.errors, ...messages.mailbox.errors }, common: messages.errors });

  if (opened.state.kind === "loading") {
    return (
      <p className="flex items-center justify-center gap-3 py-24 text-steel">
        <Spinner label={messages.common.loading} />
        {messages.mail.loading}
      </p>
    );
  }
  if (opened.state.kind === "failed") {
    return (
      <div className="p-6">
        <FormError message={describe(opened.state.error)} />
      </div>
    );
  }
  return <OpenMessage {...props} state={opened.state} setSummary={opened.setSummary} describe={describe} />;
}

type OpenMessageProps = MessagePaneProps & {
  readonly state: Ready;
  readonly setSummary: (summary: MessageSummary) => void;
  readonly describe: (error: unknown) => string;
};

function OpenMessage(props: OpenMessageProps): ReactElement {
  const { state, messages, folders, setSummary, onChanged, onClose, onToast, describe } = props;
  const { summary, message, frame, links } = state;
  const [dialog, setDialog] = useState<Dialog>("none");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const text = messages.mailbox.view;
  const isDanger = summary.threat.verdict === "danger";
  const address = message.from.address;
  const domain = address.includes("@") ? address.slice(address.lastIndexOf("@") + 1) : "";
  const roleOf = (id: string): FolderOption["systemRole"] => folders.find((folder) => folder.id === id)?.systemRole ?? null;

  async function run(action: () => Promise<void>): Promise<string | null> {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      return null;
    } catch (failure) {
      const description = describe(failure);
      setError(description);
      return description;
    } finally {
      setIsBusy(false);
    }
  }

  function update(request: UpdateMessageRequest, toast: string | null): Promise<string | null> {
    return run(async () => {
      const after = await messageApi.updateMessage(summary.id, request);
      setSummary(after);
      onChanged(summary, after);
      if (toast !== null) onToast(toast);
      // Leaving the folder on screen closes the message, as in any mail client.
      if (request.folderId !== undefined) onClose();
    });
  }

  function move(folderId: string): void {
    const role = roleOf(folderId);
    const toasts = messages.mailbox.toasts;
    const toast =
      role === "archive" ? toasts.archived : role === "spam" ? toasts.spam : role === "trash" ? toasts.trashed : messages.mail.toasts.moved;
    void update({ folderId }, formatMessage(toast, { count: 1 }));
  }

  async function deleteForever(): Promise<string | null> {
    return run(async () => {
      await messageApi.deleteMessage(summary.id);
      onChanged(summary, null);
      onToast(formatMessage(messages.mail.toasts.deleted, { count: 1 }));
      onClose();
    });
  }

  async function block(moveOthers: boolean): Promise<string | null> {
    const spam = folders.find((folder) => folder.systemRole === "spam");
    const failure = await run(async () => {
      await props.onBlock(address);
      if (moveOthers) await props.onMoveToSpam(props.othersFrom(address, summary.id));
    });
    if (failure !== null) return failure;
    setDialog("none");
    onToast(messages.mailbox.toasts.blocked);
    if (spam && summary.folderId !== spam.id) await update({ folderId: spam.id }, null);
    return null;
  }

  return (
    <article className="grid content-start">
      <MessagePaneToolbar
        summary={summary}
        folders={folders}
        labels={props.labels}
        canBlock={address !== ""}
        isBusy={isBusy}
        messages={messages}
        onMove={move}
        onUpdate={(request, toast) => void update(request, toast)}
        onDeleteForever={() => setDialog("delete")}
        onBlock={() => setDialog("block")}
        onCreateLabel={props.onCreateLabel}
        onClose={onClose}
      />
      <div className="grid gap-5 px-4 pt-5 pb-10 sm:px-6">
        <FormError message={error} />
        <ThreatBanner threat={summary.threat} domain={domain} messages={text} />
        <MessageHeader
          summary={summary}
          message={message}
          domain={domain}
          to={props.aliasAddress(summary.aliasId)}
          locale={props.locale}
          labels={props.labels}
          messages={messages}
          onRemoveLabel={(labelId) =>
            void update({ labelIds: summary.labelIds.filter((id) => id !== labelId) }, messages.mailbox.toasts.unlabelled)
          }
        />
        <MessageBody state={state} isDanger={isDanger} messages={messages} />
        <MessageLinks links={links} areFrameLinksDisabled={isDanger} messages={text} />
        <MessageAttachments attachments={message.attachments} messages={text.attachments} />
        {frame === null && message.text === null ? <p className="text-sm text-fog">{messages.mail.unreadable.subject}</p> : null}
      </div>
      {dialog === "delete" ? (
        <ConfirmDialog
          isOpen
          title={messages.mail.delete.title}
          description={formatMessage(messages.mail.delete.text, { count: 1 })}
          confirmLabel={messages.mail.delete.confirm}
          cancelLabel={messages.mail.delete.cancel}
          onClose={() => setDialog("none")}
          onConfirm={deleteForever}
        />
      ) : null}
      {dialog === "block" ? (
        <BlockSenderDialog
          isOpen
          address={address}
          otherCount={props.othersFrom(address, summary.id).length}
          messages={text.blockDialog}
          onClose={() => setDialog("none")}
          onConfirm={block}
        />
      ) : null}
    </article>
  );
}

type MessageBodyProps = {
  readonly state: Ready;
  readonly isDanger: boolean;
  readonly messages: MailboxMessages;
};

function MessageBody({ state, isDanger, messages }: MessageBodyProps): ReactElement | null {
  const { frame, message } = state;
  const text = messages.mailbox.view.body;
  if (frame !== null) {
    return (
      <div className="grid gap-2">
        {frame.hiddenImages > 0 ? <p className="text-xs text-fog">{text.imagesHidden}</p> : null}
        <MessageHtmlFrame srcdoc={frame.srcdoc} height={frame.estimatedHeight} title={text.frameTitle} areLinksDisabled={isDanger} />
      </div>
    );
  }
  if (message.text === null) return null;
  return (
    <div className="rounded-card bg-surface px-5 py-4 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-paper [overflow-wrap:anywhere]">
      {message.text}
    </div>
  );
}
