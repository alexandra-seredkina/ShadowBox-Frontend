"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { FormError } from "@/features/auth/ui/form-error";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";

type ConfirmDialogProps = {
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onConfirm: () => Promise<string | null>;
};

export function ConfirmDialog(props: ConfirmDialogProps): ReactElement {
  const { isOpen, title, description, confirmLabel, cancelLabel, children, onClose, onConfirm } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(): Promise<void> {
    setIsSubmitting(true);
    setError(null);
    setError(await onConfirm());
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="grid gap-5">
        {children}
        <FormError message={error} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button disabled={isSubmitting} onClick={() => void confirm()}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
