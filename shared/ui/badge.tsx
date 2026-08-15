import type { ReactElement, ReactNode } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

// Red is the brand colour, so danger is told apart by shape: it is the only filled badge.
const TONE_CLASSES = {
  safe: { badge: "border-safe/45 text-safe", dot: "bg-safe" },
  caution: { badge: "border-warn/50 text-warn", dot: "bg-warn" },
  danger: { badge: "border-red bg-red text-night", dot: "bg-night" },
  alias: { badge: "border-line text-steel", dot: "bg-steel" },
} as const;

export type BadgeTone = keyof typeof TONE_CLASSES;

type BadgeProps = {
  readonly tone: BadgeTone;
  readonly children: ReactNode;
};

export function Badge({ tone, children }: BadgeProps): ReactElement {
  const classes = TONE_CLASSES[tone];
  return (
    <span
      className={joinClassNames(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-sm font-medium",
        classes.badge,
      )}
    >
      <i aria-hidden className={joinClassNames("size-1.75", classes.dot)} />
      {children}
    </span>
  );
}
