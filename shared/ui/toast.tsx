"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactElement, type ReactNode } from "react";

const TOAST_DURATION_MS = 3000;

type Toast = { readonly id: number; readonly message: string };
type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { readonly children: ReactNode }): ReactElement {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback<ShowToast>((message) => {
    setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message }));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
      >
        {toast ? (
          <p key={toast.id} className="rounded-control bg-paper px-4 py-2 text-sm text-night shadow-lg">
            {toast.message}
          </p>
        ) : null}
      </div>
    </ToastContext>
  );
}

export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used inside ToastProvider");
  return showToast;
}
