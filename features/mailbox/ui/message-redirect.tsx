"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { folderSlug } from "@/features/folder/model/folder-option";
import { useFoldersContext } from "@/features/folder/ui/folders-context";
import { messageApi } from "@/features/message/api/message-api";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Spinner } from "@/shared/ui/spinner";
import type { MailboxMessages } from "./mailbox-messages";

type MessageRedirectProps = {
  readonly messageId: string;
  readonly locale: Locale;
  readonly messages: MailboxMessages;
};

/** A link to one message opens it inside its folder, next to the list. */
export function MessageRedirect({ messageId, locale, messages }: MessageRedirectProps): ReactElement {
  const { state } = useFoldersContext();
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const folders = state.kind === "ready" ? state.folders : null;

  useEffect(() => {
    if (folders === null) return undefined;
    let isCurrent = true;
    messageApi.loadMessage(messageId).then(
      (summary) => {
        const folder = folders.find((option) => option.id === summary.folderId);
        const slug = folder ? folderSlug(folder) : "inbox";
        if (isCurrent) router.replace(localizePath(locale, `/app/f/${slug}?m=${encodeURIComponent(messageId)}`));
      },
      (failure: unknown) => {
        if (isCurrent) setError(failure);
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [folders, messageId, locale, router]);

  if (error !== null) {
    return (
      <div className="p-6">
        <FormError message={describeErrorWith(error, { specific: messages.mail.errors, common: messages.errors })} />
      </div>
    );
  }
  return (
    <p className="flex items-center justify-center gap-3 py-24 text-steel">
      <Spinner label={messages.common.loading} />
      {messages.mail.loading}
    </p>
  );
}
