"use client";

import { useId, type ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import type { Alias } from "../api/alias-schemas";

const KINDS: readonly Alias["kind"][] = ["temporary", "permanent"];

type AliasKindPickerProps = {
  readonly kind: Alias["kind"];
  readonly onChange: (kind: Alias["kind"]) => void;
  readonly messages: Messages["aliasesPage"];
};

export function AliasKindPicker({ kind, onChange, messages }: AliasKindPickerProps): ReactElement {
  const id = useId();

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium">{messages.form.kindLabel}</legend>
      {KINDS.map((option) => (
        <label
          key={option}
          htmlFor={`${id}-${option}`}
          className={joinClassNames(
            "grid cursor-pointer grid-cols-[auto_1fr] gap-x-3 rounded-control border p-3 transition-colors",
            kind === option ? "border-red bg-wine/40" : "border-line hover:border-fog",
          )}
        >
          <input
            id={`${id}-${option}`}
            type="radio"
            name="kind"
            value={option}
            checked={kind === option}
            onChange={() => onChange(option)}
            className="mt-1 accent-red"
          />
          <span className="font-medium">{messages.kinds[option]}</span>
          <span className="col-start-2 text-sm text-steel">{messages.form.kindHints[option]}</span>
        </label>
      ))}
    </fieldset>
  );
}
