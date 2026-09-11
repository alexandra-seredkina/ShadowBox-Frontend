"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import { ApiError } from "@/shared/api/api-error";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field } from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { describeAuthError } from "../model/auth-error";
import { reauthenticate } from "../model/reauth";
import { FormError } from "./form-error";

type ReauthDialogProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /** Runs right after the server confirmed the password; the 🔒 window is open for 5 minutes. */
  readonly onConfirmed: () => void;
  readonly messages: Pick<Messages["auth"], "reauth" | "errors" | "fields">;
  readonly common: Messages["common"];
};

export function ReauthDialog({ isOpen, onClose, onConfirmed, messages, common }: ReauthDialogProps): ReactElement {
  const id = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = messages.reauth;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setError(null);
    try {
      await reauthenticate(String(new FormData(form).get("password") ?? ""));
      form.reset();
      onConfirmed();
    } catch (reauthError) {
      // Only the password is asked here, so "wrong login or password" would mislead.
      const isWrongPassword = reauthError instanceof ApiError && reauthError.code === "INVALID_CREDENTIALS";
      setError(isWrongPassword ? messages.errors.wrongPassword : describeAuthError(reauthError, messages.errors));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={text.title} description={text.text}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        <FormError message={error} />
        <Field id={`${id}-password`} label={messages.fields.password}>
          {(control) => (
            <PasswordInput
              {...control}
              name="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              toggleLabels={{ show: common.showPassword, hide: common.hidePassword }}
            />
          )}
        </Field>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {text.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? text.submitting : text.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
