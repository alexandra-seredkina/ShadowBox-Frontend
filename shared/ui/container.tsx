import type { ComponentProps, ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

export function Container({ className, ...rest }: ComponentProps<"div">): ReactElement {
  return <div className={joinClassNames("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...rest} />;
}
