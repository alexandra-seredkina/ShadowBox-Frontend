"use client";

import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

type TriggerProps = {
  readonly "aria-expanded": boolean;
  readonly "aria-controls": string;
  readonly "aria-haspopup": "true";
  readonly onClick: () => void;
};

type PopoverProps = {
  readonly trigger: (props: TriggerProps) => ReactNode;
  /** Gets a function that closes the panel, for items that finish an action. */
  readonly children: (close: () => void) => ReactNode;
  readonly align?: "start" | "end";
  readonly className?: string;
};

/** A small panel under its trigger; closes on Escape, on a click outside and when an item says so. */
export function Popover({ trigger, children, align = "start", className }: PopoverProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    function onPointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        "aria-expanded": isOpen,
        "aria-controls": panelId,
        "aria-haspopup": "true",
        onClick: () => setIsOpen((current) => !current),
      })}
      {isOpen ? (
        <div
          id={panelId}
          className={joinClassNames(
            "absolute top-full z-30 mt-1 min-w-56 rounded-card border border-line bg-surface p-1.5 shadow-2xl shadow-night/60",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(() => setIsOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

type MenuItemProps = {
  readonly icon?: ReactNode;
  readonly children: ReactNode;
  readonly onSelect: () => void;
  readonly tone?: "default" | "danger";
  readonly disabled?: boolean;
};

export function MenuItem({ icon, children, onSelect, tone = "default", disabled = false }: MenuItemProps): ReactElement {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={joinClassNames(
        "flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-sm transition-colors disabled:opacity-40",
        tone === "danger" ? "text-red-soft hover:bg-wine" : "text-paper hover:bg-surface-2",
      )}
    >
      {icon ? <span className="text-fog">{icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}
