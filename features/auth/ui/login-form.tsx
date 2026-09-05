"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactElement } from "react";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";
import { describeAuthError } from "../model/auth-error";
import { findLoginIssue } from "../model/credentials";
import { signIn } from "../model/sign-in";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";
import { PowProgress } from "./pow-progress";

type LoginFormProps = {
  readonly locale: Locale;
  readonly messages: Messages["auth"];
  readonly common: Messages["common"];
};

type Status =
  | { readonly kind: "idle"; readonly error: string | null; readonly loginError: string | null }
  | { readonly kind: "submitting"; readonly powProgress: number | null };

export function LoginForm({ locale, messages, common }: LoginFormProps): ReactElement {
  const id = useId();
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle", error: null, loginError: null });
  const text = messages.login;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const login = String(form.get("login") ?? "");
    const loginIssue = findLoginIssue(login);
    if (loginIssue !== null) {
      setStatus({ kind: "idle", error: null, loginError: messages.loginIssues[loginIssue] });
      return;
    }
    setStatus({ kind: "submitting", powProgress: null });
    try {
      await signIn({
        login,
        password: String(form.get("password") ?? ""),
        onPowProgress: (powProgress) => setStatus({ kind: "submitting", powProgress }),
      });
      router.replace(localizePath(locale, "/app"));
    } catch (error) {
      setStatus({ kind: "idle", error: describeAuthError(error, messages.errors), loginError: null });
    }
  }

  const isSubmitting = status.kind === "submitting";
  const footer = (
    <>
      {text.noAccount}{" "}
      <Link href={localizePath(locale, "/register")} className="text-red-soft underline-offset-4 hover:underline">
        {text.registerLink}
      </Link>
    </>
  );

  return (
    <AuthCard title={text.title} lede={text.lede} footer={footer}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        <FormError message={status.kind === "idle" ? status.error : null} />
        <Field id={`${id}-login`} label={messages.fields.login} error={status.kind === "idle" ? status.loginError : null}>
          {(control) => (
            <Input {...control} name="login" autoComplete="username" autoCapitalize="off" spellCheck={false} disabled={isSubmitting} />
          )}
        </Field>
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
        {isSubmitting && status.powProgress !== null ? (
          <PowProgress value={status.powProgress} label={messages.register.keys.progressLabel} text={text.pow} />
        ) : null}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? text.submitting : text.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
