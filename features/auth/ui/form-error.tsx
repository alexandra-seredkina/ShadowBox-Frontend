import type { ReactElement } from "react";

/** Form-level error, announced to screen readers as soon as it appears. */
export function FormError({ message }: { readonly message: string | null }): ReactElement | null {
  if (message === null) return null;
  return (
    <p role="alert" className="rounded-control border border-red/50 bg-wine px-3.5 py-2.5 text-sm text-red-soft">
      {message}
    </p>
  );
}
