"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { Spinner } from "@/shared/ui/spinner";
import { describeAuthError } from "../model/auth-error";
import { signOut, unlock } from "../model/sign-in";
import { useSessionCheck } from "../model/use-session-check";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";

type UnlockFormProps = {
  readonly locale: Locale;
  readonly messages: Messages["auth"];
  readonly common: Messages["common"];
};

export function UnlockForm({ locale, messages, common }: UnlockFormProps): ReactElement {
  const id = useId();
  const router = useRouter();
  const session = useSessionCheck();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = messages.unlock;

  useEffect(() => {
    if (session.kind === "signed-out") router.replace(localizePath(locale, "/login"));
  }, [session.kind, router, locale]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setIsSubmitting(true);
    setError(null);
    try {
      await unlock(password);
      router.replace(localizePath(locale, "/app"));
    } catch (unlockError) {
      setError(describeAuthError(unlockError, messages.errors));
      setIsSubmitting(false);
    }
  }

  async function switchAccount(): Promise<void> {
    await signOut().catch(() => undefined);
    router.replace(localizePath(locale, "/login"));
  }

  if (session.kind === "checking" || session.kind === "signed-out") {
    return (
      <AuthCard title={text.title}>
        <p className="flex items-center gap-3 text-steel">
          <Spinner label={common.loading} />
          {text.checking}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={text.title} lede={text.lede}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        {session.kind === "signed-in" ? (
          <p className="font-mono text-sm text-fog">{formatMessage(text.signedInAs, { login: session.login })}</p>
        ) : null}
        <FormError message={session.kind === "failed" ? describeAuthError(session.error, messages.errors) : error} />
        {/* Lets password managers match the saved entry. */}
        <input type="text" name="username" autoComplete="username" value={session.kind === "signed-in" ? session.login : ""} readOnly hidden />
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
        <Button type="submit" size="lg" disabled={isSubmitting || session.kind !== "signed-in"}>
          {isSubmitting ? text.submitting : text.submit}
        </Button>
        <Button variant="ghost" disabled={isSubmitting} onClick={() => void switchAccount()}>
          {text.otherAccount}
        </Button>
      </form>
    </AuthCard>
  );
}
