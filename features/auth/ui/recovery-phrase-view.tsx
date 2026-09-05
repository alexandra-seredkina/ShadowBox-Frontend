"use client";

import { useId, useState, type ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";

type RecoveryPhraseViewProps = {
  readonly words: readonly string[];
  readonly messages: Messages["auth"]["register"]["phrase"];
  readonly onContinue: () => void;
};

// No copy button on purpose: clipboard history and sync would keep the phrase around.
export function RecoveryPhraseView({ words, messages, onContinue }: RecoveryPhraseViewProps): ReactElement {
  const checkboxId = useId();
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="grid gap-5">
      <ol
        aria-label={messages.listLabel}
        // Numbered down each column, the way people copy a list onto paper.
        className="grid grid-flow-col grid-cols-2 grid-rows-12 gap-x-4 gap-y-2 rounded-control border border-line bg-night p-4 font-mono text-sm sm:grid-cols-3 sm:grid-rows-8"
      >
        {words.map((word, index) => (
          // The phrase may repeat a word, so the position is part of the key.
          <li key={`${index}-${word}`} className="flex gap-2">
            <span aria-hidden className="w-5 text-right text-fog">
              {index + 1}
            </span>
            <span translate="no">{word}</span>
          </li>
        ))}
      </ol>
      <p className="rounded-control border border-warn/40 px-3.5 py-2.5 text-sm text-warn">{messages.warning}</p>
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={isSaved}
          onChange={(event) => setIsSaved(event.target.checked)}
          className="mt-1 size-4 accent-red"
        />
        <label htmlFor={checkboxId} className="text-sm">
          {messages.saved}
        </label>
      </div>
      <Button size="lg" disabled={!isSaved} onClick={onContinue}>
        {messages.continue}
      </Button>
    </div>
  );
}
