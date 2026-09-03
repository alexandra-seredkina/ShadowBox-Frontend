import type { ReactElement } from "react";

type SpinnerProps = {
  /** Screen-reader text from the i18n dictionary (`common.loading`). */
  readonly label: string;
};

export function Spinner({ label }: SpinnerProps): ReactElement {
  return (
    <span role="status" className="inline-flex items-center">
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 animate-spin text-red">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
