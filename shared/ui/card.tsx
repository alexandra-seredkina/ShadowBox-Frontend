import type { ComponentProps, ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

export function Card({ className, ...rest }: ComponentProps<"div">): ReactElement {
  return (
    <div className={joinClassNames("rounded-card border border-line bg-surface p-6", className)} {...rest} />
  );
}
