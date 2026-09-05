"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api/api-error";
import { authApi } from "../api/auth-api";

export type SessionCheck =
  | { readonly kind: "checking" }
  | { readonly kind: "signed-in"; readonly login: string }
  | { readonly kind: "signed-out" }
  | { readonly kind: "failed"; readonly error: unknown };

/** Asks the server whether the session cookie is still alive. */
export function useSessionCheck(): SessionCheck {
  const [check, setCheck] = useState<SessionCheck>({ kind: "checking" });

  useEffect(() => {
    let isCurrent = true;
    authApi.loadSession().then(
      ({ account }) => {
        if (isCurrent) setCheck({ kind: "signed-in", login: account.login });
      },
      (error: unknown) => {
        if (!isCurrent) return;
        const isSignedOut = error instanceof ApiError && error.code === "UNAUTHENTICATED";
        setCheck(isSignedOut ? { kind: "signed-out" } : { kind: "failed", error });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  return check;
}
