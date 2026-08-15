import type { ReactElement, ReactNode } from "react";

export type FieldControlProps = {
  readonly id: string;
  readonly "aria-describedby": string | undefined;
  readonly "aria-invalid": true | undefined;
};

type FieldProps = {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string | null;
  readonly children: (control: FieldControlProps) => ReactNode;
};

export function Field({ id, label, hint, error, children }: FieldProps): ReactElement {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-paper">
        {label}
      </label>
      {children({
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {hint ? (
        <p id={hintId} className="text-sm text-fog">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}
