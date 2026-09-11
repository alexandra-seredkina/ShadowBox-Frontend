"use client";

import { useState, type ReactElement } from "react";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";

type RevokeAliasDialogProps = {
  readonly isOpen: boolean;
  readonly address: string;
  readonly messages: Messages["aliasesPage"]["revoke"];
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onConfirm: () => Promise<string | null>;
};

export function RevokeAliasDialog({ isOpen, address, messages, onClose, onConfirm }: RevokeAliasDialogProps): ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(): Promise<void> {
    setIsSubmitting(true);
    setError(null);
    setError(await onConfirm());
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={messages.title} description={formatMessage(messages.text, { address })}>
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
