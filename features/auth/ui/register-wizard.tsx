"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { describeAuthError, isLoginRejection } from "../model/auth-error";
import { pickCheckPositions } from "../model/phrase-check";
import { completeRegistration, prepareRegistration, type PreparedRegistration, type RegistrationTicket } from "../model/register";
import { AuthCard } from "./auth-card";
import { PowProgress } from "./pow-progress";
import { RecoveryPhraseCheck } from "./recovery-phrase-check";
import { RecoveryPhraseView } from "./recovery-phrase-view";
import { RegisterCredentialsForm, type Credentials } from "./register-credentials-form";
import { StepIndicator } from "./step-indicator";

type Ready = { readonly prepared: PreparedRegistration; readonly ticket: RegistrationTicket };

type WizardState =
  | { readonly step: "credentials"; readonly login: string; readonly error: string | null }
  | { readonly step: "keys"; readonly progress: number }
  | { readonly step: "phrase"; readonly ready: Ready }
  | { readonly step: "confirm"; readonly ready: Ready; readonly positions: readonly number[] };

const STEP_INDEX = { credentials: 0, keys: 1, phrase: 2, confirm: 2 } as const;

type RegisterWizardProps = {
  readonly locale: Locale;
  readonly messages: Messages["auth"];
  readonly common: Messages["common"];
};

export function RegisterWizard({ locale, messages, common }: RegisterWizardProps): ReactElement {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({ step: "credentials", login: "", error: null });
  const [submit, setSubmit] = useState<{ readonly progress: number | null; readonly error: string | null } | null>(null);
  const text = messages.register;

  async function startKeys({ login, password }: Credentials): Promise<void> {
    setState({ step: "keys", progress: 0 });
    try {
      const ready = await prepareRegistration({
        login,
        password,
        onProgress: (progress) => setState({ step: "keys", progress }),
      });
      setState({ step: "phrase", ready });
    } catch (error) {
      setState({ step: "credentials", login, error: describeAuthError(error, messages.errors) });
    }
  }

  async function finish(ready: Ready): Promise<void> {
    setSubmit({ progress: null, error: null });
    try {
      await completeRegistration({ ...ready, onPowProgress: (progress) => setSubmit({ progress, error: null }) });
      router.replace(localizePath(locale, "/app"));
    } catch (error) {
      const message = describeAuthError(error, messages.errors);
      if (!isLoginRejection(error)) {
        setSubmit({ progress: null, error: message });
        return;
      }
      // A new login means a new request; the keys and phrase are rebuilt from scratch.
      setSubmit(null);
      setState({ step: "credentials", login: ready.prepared.request.login, error: message });
    }
  }

  const header = <StepIndicator steps={text.steps} current={STEP_INDEX[state.step]} template={text.stepOf} />;
  const footer = (
    <>
      {text.haveAccount}{" "}
      <Link href={localizePath(locale, "/login")} className="text-red-soft underline-offset-4 hover:underline">
        {text.signInLink}
      </Link>
    </>
  );

  switch (state.step) {
    case "credentials":
      return (
        <AuthCard title={text.title} lede={text.lede} header={header} footer={footer}>
          <RegisterCredentialsForm
            messages={messages}
            common={common}
            initialLogin={state.login}
            error={state.error}
            onSubmit={(credentials) => void startKeys(credentials)}
          />
        </AuthCard>
      );
    case "keys":
      return (
        <AuthCard title={text.keys.title} header={header}>
          <PowProgress value={state.progress} label={text.keys.progressLabel} text={text.keys.text} />
        </AuthCard>
      );
    case "phrase":
      return (
        <AuthCard title={text.phrase.title} lede={text.phrase.text} header={header}>
          <RecoveryPhraseView
            words={state.ready.prepared.recoveryWords}
            messages={text.phrase}
            onContinue={() =>
              setState({ step: "confirm", ready: state.ready, positions: pickCheckPositions(state.ready.prepared.recoveryWords.length) })
            }
          />
        </AuthCard>
      );
    case "confirm":
      return (
        <AuthCard title={text.confirm.title} lede={text.confirm.text} header={header}>
          {submit?.progress != null ? (
            <PowProgress value={submit.progress} label={text.keys.progressLabel} text={text.keys.text} />
          ) : null}
          <RecoveryPhraseCheck
            words={state.ready.prepared.recoveryWords}
            positions={state.positions}
            messages={text.confirm}
            isSubmitting={submit !== null && submit.error === null}
            error={submit?.error ?? null}
            onBack={() => setState({ step: "phrase", ready: state.ready })}
            onConfirmed={() => void finish(state.ready)}
          />
        </AuthCard>
      );
  }
}
