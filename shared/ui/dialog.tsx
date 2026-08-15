"use client";

import { useEffect, useId, useRef, type ReactElement, type ReactNode } from "react";

type DialogProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
};

export function Dialog({ isOpen, onClose, title, description, children }: DialogProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-card border border-line bg-surface p-6 text-paper backdrop:bg-night/80 backdrop:backdrop-blur-sm"
    >
      <h2 id={titleId} className="font-display text-lg font-medium">
        {title}
      </h2>
      {description ? (
        <p id={descriptionId} className="mt-2 text-sm text-steel">
          {description}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </dialog>
  );
}
