"use client";

import { useCallback, useEffect, useState } from "react";
import type { Account } from "@/features/auth/api/auth-schemas";
import { lockKeys } from "@/features/crypto/model/key-store";
import { accountApi, type SessionInfo } from "../api/account-api";

export type SettingsState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | { readonly kind: "ready"; readonly account: Account; readonly sessions: readonly SessionInfo[] };

export type Settings = {
  readonly state: SettingsState;
  readonly setIpBinding: (ipBinding: boolean) => Promise<void>;
  /** Resolves to true when it was the current session, i.e. this tab is now signed out. */
  readonly endSession: (session: SessionInfo) => Promise<boolean>;
  readonly endOtherSessions: () => Promise<void>;
  /** 🔒 reauth first; afterwards the keys in memory are wiped. */
  readonly deleteAccount: () => Promise<void>;
};

async function loadAll(): Promise<{ account: Account; sessions: readonly SessionInfo[] }> {
  const [account, sessions] = await Promise.all([accountApi.loadAccount(), accountApi.listSessions()]);
  return { account, sessions };
}

export function useSettings(): Settings {
  const [state, setState] = useState<SettingsState>({ kind: "loading" });

  const reload = useCallback(async () => {
    const data = await loadAll();
    setState({ kind: "ready", ...data });
  }, []);

  useEffect(() => {
    let isCurrent = true;
    loadAll().then(
      (data) => {
        if (isCurrent) setState({ kind: "ready", ...data });
      },
      (error: unknown) => {
        if (isCurrent) setState({ kind: "failed", error });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  const setIpBinding = useCallback(
    async (ipBinding: boolean) => {
      // The switch moves at once; a failure puts back whatever the server says.
      setState((current) =>
        current.kind === "ready"
          ? { ...current, account: { ...current.account, settings: { ...current.account.settings, ipBinding } } }
          : current,
      );
      try {
        await accountApi.setIpBinding(ipBinding);
      } finally {
        // Binding changes every session, so the list is fetched again rather than patched.
        await reload();
      }
    },
    [reload],
  );

  const endSession = useCallback(
    async (session: SessionInfo) => {
      await accountApi.endSession(session.id);
      if (session.isCurrent) {
        await lockKeys();
        return true;
      }
      await reload();
      return false;
    },
    [reload],
  );

  const endOtherSessions = useCallback(async () => {
    await accountApi.endOtherSessions();
    await reload();
  }, [reload]);

  const deleteAccount = useCallback(async () => {
    await accountApi.deleteAccount();
    await lockKeys();
  }, []);

  return { state, setIpBinding, endSession, endOtherSessions, deleteAccount };
}
