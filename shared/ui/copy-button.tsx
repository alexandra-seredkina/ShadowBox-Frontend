"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Button, type ButtonVariant } from "./button";

const RESET_AFTER_MS = 2000;

type CopyState = "idle" | "copied" | "failed";

const LABELS: Record<Exclude<CopyState, "idle">, string> = {
  copied: "Скопировано",
  failed: "Не удалось",
};

type CopyButtonProps = {
  readonly value: string;
  readonly label?: string;
  readonly variant?: ButtonVariant;
};

export function CopyButton({ value, label = "Копировать", variant = "ghost" }: CopyButtonProps): ReactElement {
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
      {state === "idle" ? label : LABELS[state]}
    </Button>
  );
}
