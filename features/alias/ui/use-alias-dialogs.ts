"use client";

import { useState } from "react";
import { isReauthRequired } from "@/features/auth/model/reauth";
import { useToast } from "@/shared/ui/toast";
import { describeAliasError } from "../model/alias-error";
import type { AliasView } from "../model/alias-view";
import type { AliasDraft, useAliases } from "../model/use-aliases";
import type { AliasesMessages } from "./aliases-messages";

export type OpenDialog =
  | { readonly kind: "create"; readonly idempotencyKey: string }
  | { readonly kind: "edit" | "revoke" | "reauth"; readonly view: AliasView };

type Actions = Omit<ReturnType<typeof useAliases>, "state">;

export type AliasDialogs = {
  readonly dialog: OpenDialog | null;
  /** The alias whose on/off switch is in flight. */
  readonly busyId: string | null;
  readonly openCreate: () => void;
  readonly open: (kind: "edit" | "revoke", view: AliasView) => void;
  readonly close: () => void;
  /** Each resolves to an error message for the dialog, or null when it may close. */
  readonly submitForm: (draft: AliasDraft) => Promise<string | null>;
  readonly revoke: (view: AliasView) => Promise<string | null>;
  readonly toggle: (view: AliasView) => Promise<void>;
  readonly revokeAfterReauth: (view: AliasView) => Promise<void>;
};

/** Which dialog is open and what each button does. */
export function useAliasDialogs(actions: Actions, messages: AliasesMessages, startWithCreate: boolean): AliasDialogs {
  const showToast = useToast();
  const [dialog, setDialog] = useState<OpenDialog | null>(() =>
    startWithCreate ? { kind: "create", idempotencyKey: crypto.randomUUID() } : null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const text = messages.page;
  const describe = (error: unknown): string =>
    describeAliasError(error, { aliases: text.errors, common: messages.auth.errors });

  async function attempt(action: () => Promise<void>, toast: string): Promise<string | null> {
    try {
      await action();
    } catch (error) {
      return describe(error);
    }
    setDialog(null);
    showToast(toast);
    return null;
  }

  function submitForm(draft: AliasDraft): Promise<string | null> {
    if (dialog?.kind === "create") return attempt(() => actions.create(draft, dialog.idempotencyKey), text.toasts.created);
    if (dialog?.kind === "edit") return attempt(() => actions.edit(dialog.view.alias, draft), text.toasts.saved);
    return Promise.resolve(null);
  }

  async function toggle(view: AliasView): Promise<void> {
    const next = view.alias.status === "active" ? "disabled" : "active";
    setBusyId(view.alias.id);
    const toast = next === "active" ? text.toasts.enabled : text.toasts.disabled;
    const error = await attempt(() => actions.setStatus(view.alias, next), toast);
    if (error !== null) showToast(error);
    setBusyId(null);
  }

  /** A permanent address answers 403 REAUTH_REQUIRED first; the password dialog then retries. */
  async function revoke(view: AliasView): Promise<string | null> {
    try {
      await actions.revoke(view.alias);
    } catch (error) {
      if (!isReauthRequired(error)) return describe(error);
      setDialog({ kind: "reauth", view });
      return null;
    }
    setDialog(null);
    showToast(text.toasts.revoked);
    return null;
  }

  async function revokeAfterReauth(view: AliasView): Promise<void> {
    const error = await revoke(view);
    if (error !== null) showToast(error);
  }

  return {
    dialog,
    busyId,
    openCreate: () => setDialog({ kind: "create", idempotencyKey: crypto.randomUUID() }),
    open: (kind: "edit" | "revoke", view: AliasView) => setDialog({ kind, view }),
    close: () => setDialog(null),
    submitForm,
    toggle,
    revoke,
    revokeAfterReauth,
  };
}
