"use client";

import { useEffect, useState, type ReactElement } from "react";
import { describeErrorWith } from "@/features/auth/model/auth-error";
import { FormError } from "@/features/auth/ui/form-error";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { formatDay } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { Card } from "@/shared/ui/card";
import { IconButton } from "@/shared/ui/icon-button";
import { BlockIcon, CloseIcon } from "@/shared/ui/icons";
import { Spinner } from "@/shared/ui/spinner";
import { useToast } from "@/shared/ui/toast";
import { blockedSenderApi } from "../api/blocked-sender-api";
import { openBlockedAddress } from "../model/block-sender";

type Entry = { readonly id: string; readonly address: string | null; readonly createdAt: string };

type State =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | { readonly kind: "ready"; readonly entries: readonly Entry[] };

async function loadEntries(): Promise<Entry[]> {
  const keys = getUnlockedKeys();
  // The app gate only renders settings with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  const items = await blockedSenderApi.listBlocked();
  return Promise.all(items.map(async (item) => ({ id: item.id, address: await openBlockedAddress(item, keys), createdAt: item.createdAt })));
}

type BlockedSendersCardProps = {
  readonly locale: Locale;
  readonly messages: Messages["mailbox"]["blocked"];
  readonly unblockedToast: string;
  readonly errors: Messages["auth"]["errors"];
};

/** Addresses are decrypted here; the server holds only fingerprints and sealed copies. */
export function BlockedSendersCard({ locale, messages, unblockedToast, errors }: BlockedSendersCardProps): ReactElement {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  useEffect(() => {
    let isCurrent = true;
    loadEntries().then(
      (entries) => {
        if (isCurrent) setState({ kind: "ready", entries });
      },
      (failure: unknown) => {
        if (isCurrent) setState({ kind: "failed", error: failure });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  async function unblock(entry: Entry): Promise<void> {
    setBusyId(entry.id);
    setError(null);
    try {
      await blockedSenderApi.unblock(entry.id);
      setState((current) => (current.kind === "ready" ? { kind: "ready", entries: current.entries.filter((item) => item.id !== entry.id) } : current));
      showToast(unblockedToast);
    } catch (failure) {
      setError(describeErrorWith(failure, { specific: {}, common: errors }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="grid gap-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-medium">
        <BlockIcon className="text-fog" />
        {messages.title}
      </h2>
      <p className="text-sm text-steel">{messages.text}</p>
      <FormError message={state.kind === "failed" ? describeErrorWith(state.error, { specific: {}, common: errors }) : error} />
      {state.kind === "loading" ? <Spinner label={messages.title} /> : null}
      {state.kind === "ready" && state.entries.length === 0 ? <p className="text-sm text-fog">{messages.empty}</p> : null}
      {state.kind === "ready" && state.entries.length > 0 ? (
        <ul className="grid divide-y divide-line rounded-control border border-line">
          {state.entries.map((entry) => {
            const address = entry.address ?? messages.unreadable;
            return (
              <li key={entry.id} className="flex items-center gap-3 py-1.5 pr-1.5 pl-3">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-paper">{address}</span>
                <span className="shrink-0 font-mono text-xs text-fog">
                  {formatMessage(messages.since, { date: formatDay(entry.createdAt, locale) })}
                </span>
                <IconButton
                  label={formatMessage(messages.unblock, { address })}
                  icon={<CloseIcon />}
                  disabled={busyId !== null}
                  onClick={() => void unblock(entry)}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </Card>
  );
}
