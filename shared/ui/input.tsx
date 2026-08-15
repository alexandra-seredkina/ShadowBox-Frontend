import type { ComponentProps, ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

export const INPUT_CLASS_NAME = joinClassNames(
  "h-11 w-full rounded-control border border-line bg-ink px-3.5 text-paper placeholder:text-fog",
  "transition-colors hover:border-fog focus-visible:border-red-soft aria-invalid:border-red",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export function Input({ className, ...rest }: ComponentProps<"input">): ReactElement {
  return <input className={joinClassNames(INPUT_CLASS_NAME, className)} {...rest} />;
}
