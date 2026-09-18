"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import { normalizeLogin } from "@/features/auth/model/credentials";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type DeleteAccountDialogProps = {
  readonly isOpen: boolean;
  readonly login: string;
  readonly messages: Messages["settingsPage"]["danger"];
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onConfirm: () => Promise<string | null>;
};

/** Typing the login is a speed bump against a misclick, not a security check (reauth is). */
export function DeleteAccountDialog({ isOpen, login, messages, onClose, onConfirm }: DeleteAccountDialogProps): ReactElement {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const typed = String(new FormData(event.currentTarget).get("login") ?? "");
    if (normalizeLogin(typed) !== login) {
      setError(messages.mismatch);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setError(await onConfirm());
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={messages.dialogTitle} description={formatMessage(messages.dialogText, { login })}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        <Field id={`${id}-login`} label={messages.loginField} error={error}>
          {(control) => <Input {...control} name="login" autoComplete="off" autoCapitalize="off" spellCheck={false} />}
        </Field>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {messages.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {messages.confirm}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
