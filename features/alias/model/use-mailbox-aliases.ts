"use client";

import { useCallback, useEffect, useState } from "react";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { aliasApi } from "../api/alias-api";
import type { UpdateAliasRequest } from "../api/alias-schemas";
import { toAliasView, type AliasView } from "./alias-view";

export type MailboxAliasesState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | { readonly kind: "ready"; readonly aliases: readonly AliasView[] };

export type MailboxAliases = {
  readonly state: MailboxAliasesState;
  /** For routing from the folder and label side: which addresses deliver where. */
  readonly update: (id: string, request: UpdateAliasRequest) => Promise<void>;
};

function requireKeys(): KeyPair {
  const keys = getUnlockedKeys();
  // The app gate only renders mail screens with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  return keys;
}

/** The addresses as the mail screens need them: who mail came to, and where it goes. */
export function useMailboxAliases(): MailboxAliases {
  const [state, setState] = useState<MailboxAliasesState>({ kind: "loading" });

  useEffect(() => {
    let isCurrent = true;
    aliasApi
      .listAliases()
      .then((aliases) => Promise.all(aliases.map((alias) => toAliasView(alias, requireKeys()))))
      .then(
        (aliases) => {
          if (isCurrent) setState({ kind: "ready", aliases });
        },
        (error: unknown) => {
          if (isCurrent) setState({ kind: "failed", error });
        },
      );
    return () => {
      isCurrent = false;
    };
  }, []);

  const update = useCallback(async (id: string, request: UpdateAliasRequest) => {
    const view = await toAliasView(await aliasApi.updateAlias(id, request), requireKeys());
    setState((current) =>
      current.kind === "ready" ? { kind: "ready", aliases: current.aliases.map((item) => (item.alias.id === id ? view : item)) } : current,
    );
  }, []);

  return { state, update };
}
