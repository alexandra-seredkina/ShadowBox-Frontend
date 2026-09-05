import type { ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";
import { formatMessage } from "@/shared/i18n/format-message";

type StepIndicatorProps = {
  readonly steps: readonly string[];
  /** Zero-based. */
  readonly current: number;
  readonly template: string;
};

export function StepIndicator({ steps, current, template }: StepIndicatorProps): ReactElement {
  return (
    <div className="grid gap-2">
      <p className="font-mono text-xs tracking-[0.12em] text-red-soft uppercase">
        {formatMessage(template, { current: current + 1, total: steps.length })} · {steps[current]}
      </p>
      <ol aria-hidden className="grid grid-cols-3 gap-1.5">
        {steps.map((step, index) => (
          <li key={step} className={joinClassNames("h-1 rounded-full", index <= current ? "bg-red" : "bg-surface-2")} />
        ))}
      </ol>
    </div>
  );
}
