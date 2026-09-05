"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { FormError } from "./form-error";

type RecoveryPhraseCheckProps = {
  readonly words: readonly string[];
  /** Zero-based positions to ask for. */
  readonly positions: readonly number[];
  readonly messages: Messages["auth"]["register"]["confirm"];
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly onBack: () => void;
  readonly onConfirmed: () => void;
};

function matches(typed: FormDataEntryValue | null, expected: string | undefined): boolean {
  return String(typed ?? "").trim().toLowerCase() === expected;
}

export function RecoveryPhraseCheck({
  words,
  positions,
  messages,
  isSubmitting,
  error,
  onBack,
  onConfirmed,
}: RecoveryPhraseCheckProps): ReactElement {
  const id = useId();
  const [isMismatch, setIsMismatch] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const isCorrect = positions.every((position) => matches(form.get(`word-${position}`), words[position]));
    setIsMismatch(!isCorrect);
    if (isCorrect) onConfirmed();
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <FormError message={isMismatch ? messages.mismatch : error} />
      {positions.map((position) => (
        <Field key={position} id={`${id}-${position}`} label={formatMessage(messages.wordLabel, { number: position + 1 })}>
          {(control) => (
            <Input
              {...control}
              name={`word-${position}`}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>
      ))}
      <div className="grid gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? messages.submitting : messages.submit}
        </Button>
        <Button variant="ghost" disabled={isSubmitting} onClick={onBack}>
          {messages.back}
        </Button>
      </div>
    </form>
  );
}
