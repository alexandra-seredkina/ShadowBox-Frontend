"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";
import { findLoginIssue, findPasswordIssue } from "../model/credentials";
import { FormError } from "./form-error";

export type Credentials = { readonly login: string; readonly password: string };

type FieldErrors = { readonly login: string | null; readonly password: string | null; readonly confirm: string | null };

type RegisterCredentialsFormProps = {
  readonly messages: Messages["auth"];
  readonly common: Messages["common"];
  readonly initialLogin: string;
  /** Server-side problem from a previous attempt, e.g. LOGIN_TAKEN. */
  readonly error: string | null;
  readonly onSubmit: (credentials: Credentials) => void;
};

function validate(form: FormData, messages: Messages["auth"]): FieldErrors {
  const login = String(form.get("login") ?? "");
  const password = String(form.get("password") ?? "");
  const loginIssue = findLoginIssue(login);
  const passwordIssue = findPasswordIssue(password);
  return {
    login: loginIssue === null ? null : messages.loginIssues[loginIssue],
    password: passwordIssue === null ? null : messages.passwordIssues[passwordIssue],
    confirm: password === String(form.get("confirm") ?? "") ? null : messages.passwordIssues.mismatch,
  };
}

export function RegisterCredentialsForm({
  messages,
  common,
  initialLogin,
  error,
  onSubmit,
}: RegisterCredentialsFormProps): ReactElement {
  const id = useId();
  const [errors, setErrors] = useState<FieldErrors>({ login: null, password: null, confirm: null });
  const toggleLabels = { show: common.showPassword, hide: common.hidePassword };

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors = validate(form, messages);
    setErrors(nextErrors);
    if (nextErrors.login || nextErrors.password || nextErrors.confirm) return;
    onSubmit({ login: String(form.get("login")), password: String(form.get("password")) });
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <FormError message={error} />
      <Field id={`${id}-login`} label={messages.fields.login} hint={messages.fields.loginHint} error={errors.login}>
        {(control) => (
          <Input {...control} name="login" defaultValue={initialLogin} autoComplete="username" autoCapitalize="off" spellCheck={false} />
        )}
      </Field>
      <Field id={`${id}-password`} label={messages.fields.password} hint={messages.fields.passwordHint} error={errors.password}>
        {(control) => <PasswordInput {...control} name="password" autoComplete="new-password" toggleLabels={toggleLabels} />}
      </Field>
      <Field id={`${id}-confirm`} label={messages.fields.passwordConfirm} error={errors.confirm}>
        {(control) => <PasswordInput {...control} name="confirm" autoComplete="new-password" toggleLabels={toggleLabels} />}
      </Field>
      <Button type="submit" size="lg">
        {messages.register.submitCredentials}
      </Button>
    </form>
  );
}
