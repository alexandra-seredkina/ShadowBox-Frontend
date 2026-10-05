import type { ComponentProps, ReactElement, ReactNode } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

const TONE_CLASSES = {
  default: "text-steel hover:bg-surface-2 hover:text-paper",
  danger: "text-steel hover:bg-wine hover:text-red-soft",
  active: "bg-surface-2 text-paper",
} as const;

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** Read by screen readers and shown as a tooltip: the icon alone says nothing. */
  readonly label: string;
  readonly icon: ReactNode;
  readonly tone?: keyof typeof TONE_CLASSES;
};

export function IconButton({ label, icon, tone = "default", className, type = "button", ...rest }: IconButtonProps): ReactElement {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={joinClassNames(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-control transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
        TONE_CLASSES[tone],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
