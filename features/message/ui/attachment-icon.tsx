import type { ReactElement } from "react";

export function AttachmentIcon({ label }: { readonly label: string }): ReactElement {
  return (
    <span className="inline-flex shrink-0 text-fog">
      <svg viewBox="0 0 24 24" aria-hidden className="size-4">
        <path
          d="M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3L15 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
