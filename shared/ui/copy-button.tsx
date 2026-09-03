"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Button, type ButtonVariant } from "./button";

const RESET_AFTER_MS = 2000;

type CopyState = "idle" | "copied" | "failed";

type CopyButtonProps = {
  readonly value: string;
  /** Texts from the i18n dictionary (`common.copy`, `common.copied`, `common.copyFailed`). */
  readonly labels: { readonly copy: string; readonly copied: string; readonly failed: string };
  readonly variant?: ButtonVariant;
};

export function CopyButton({ value, labels, variant = "ghost" }: CopyButtonProps): ReactElement {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return undefined;
    const timer = window.setTimeout(() => setState("idle"), RESET_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      // Clipboard access can be denied by the browser; the user still sees the value and can select it.
      setState("failed");
    }
  }

  return (
    <Button variant={variant} onClick={() => void copy()} aria-live="polite">
      {state === "idle" ? labels.copy : labels[state]}
    </Button>
  );
}
