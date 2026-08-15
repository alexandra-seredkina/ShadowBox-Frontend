import type { ReactElement } from "react";

type ProgressProps = {
  /** Share of work done, from 0 to 1. */
  readonly value: number;
  readonly label: string;
};

export function Progress({ value, label }: ProgressProps): ReactElement {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <div className="h-full bg-red transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
}
