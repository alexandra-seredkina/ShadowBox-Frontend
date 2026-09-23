"use client";

import { useState, type ReactElement } from "react";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMessage } from "@/shared/i18n/format-message";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import type { MailMessages } from "./mail-messages";

type DeleteMessagesDialogProps = {
  readonly isOpen: boolean;
  readonly count: number;
  readonly messages: MailMessages["mail"]["delete"];
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onConfirm: () => Promise<string | null>;
};

export function DeleteMessagesDialog({ isOpen, count, messages, onClose, onConfirm }: DeleteMessagesDialogProps): ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(): Promise<void> {
    setIsSubmitting(true);
    setError(null);
    setError(await onConfirm());
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={messages.title} description={formatMessage(messages.text, { count })}>
      <div className="grid gap-5">
        <FormError message={error} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {messages.cancel}
          </Button>
          <Button disabled={isSubmitting} onClick={() => void confirm()}>
            {messages.confirm}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
