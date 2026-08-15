import Link from "next/link";
import type { ComponentProps, ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

const VARIANT_CLASSES = {
  primary: "border-red bg-red text-night hover:border-red-soft hover:bg-red-soft",
  ghost: "border-line bg-transparent text-paper hover:border-red",
} as const;

const SIZE_CLASSES = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;
export type ButtonSize = keyof typeof SIZE_CLASSES;

type StyleProps = {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
};

function buttonClassName(variant: ButtonVariant, size: ButtonSize, extra: string | undefined): string {
  return joinClassNames(
    "inline-flex items-center justify-center gap-2 rounded-control border font-medium whitespace-nowrap",
    "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    extra,
  );
}

type ButtonProps = ComponentProps<"button"> & StyleProps;

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...rest
}: ButtonProps): ReactElement {
  return <button type={type} className={buttonClassName(variant, size, className)} {...rest} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: ButtonLinkProps): ReactElement {
  return <Link className={buttonClassName(variant, size, className)} {...rest} />;
}
