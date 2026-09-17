"use client";

import { useState, type ReactElement } from "react";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";

type DeleteFolderDialogProps = {
  readonly isOpen: boolean;
  readonly name: string;
  readonly messages: Messages["folders"]["delete"];
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onConfirm: () => Promise<string | null>;
};

export function DeleteFolderDialog({ isOpen, name, messages, onClose, onConfirm }: DeleteFolderDialogProps): ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(): Promise<void> {
    setIsSubmitting(true);
    setError(null);
    setError(await onConfirm());
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={formatMessage(messages.title, { name })} description={messages.text}>
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
