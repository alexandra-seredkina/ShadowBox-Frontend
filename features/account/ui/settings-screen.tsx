"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { describeAuthError } from "@/features/auth/model/auth-error";
import { isReauthRequired } from "@/features/auth/model/reauth";
import { FormError } from "@/features/auth/ui/form-error";
import { ReauthDialog } from "@/features/auth/ui/reauth-dialog";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Spinner } from "@/shared/ui/spinner";
import { useToast } from "@/shared/ui/toast";
import type { SessionInfo } from "../api/account-api";
import { useSettings } from "../model/use-settings";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { SessionsCard } from "./sessions-card";

export type SettingsMessages = {
  readonly page: Messages["settingsPage"];
  readonly common: Messages["common"];
  readonly auth: Pick<Messages["auth"], "reauth" | "errors" | "fields">;
};

type SettingsScreenProps = { readonly locale: Locale; readonly messages: SettingsMessages };

export function SettingsScreen({ locale, messages }: SettingsScreenProps): ReactElement {
  const settings = useSettings();
  const router = useRouter();
  const showToast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"delete" | "reauth" | null>(null);
  const text = messages.page;
  const describe = (error: unknown): string => describeAuthError(error, messages.auth.errors);

  async function run(id: string, action: () => Promise<void>): Promise<void> {
    setBusyId(id);
    try {
      await action();
    } catch (error) {
      showToast(describe(error));
    } finally {
      setBusyId(null);
    }
  }

  async function endSession(session: SessionInfo): Promise<void> {
    await run(session.id, async () => {
      const isSignedOut = await settings.endSession(session);
      if (isSignedOut) router.replace(localizePath(locale, "/login"));
      else showToast(text.sessions.ended);
    });
  }

  async function deleteAccount(): Promise<string | null> {
    try {
      await settings.deleteAccount();
    } catch (error) {
      if (!isReauthRequired(error)) return describe(error);
      setDialog("reauth");
      return null;
    }
    // A full page load, not a client route: nothing of the deleted account stays in memory,
    // and the app gate cannot race it with a redirect to /login.
    window.location.assign(localizePath(locale, "/"));
    return null;
  }

  const { state } = settings;
  if (state.kind === "loading") {
    return (
      <p className="flex items-center justify-center gap-3 py-24 text-steel">
        <Spinner label={messages.common.loading} />
        {text.loading}
      </p>
    );
  }
  if (state.kind === "failed") return <div className="mx-auto max-w-xl py-12"><FormError message={describe(state.error)} /></div>;

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 py-10">
      <h1 className="font-display text-2xl font-medium sm:text-3xl">{text.title}</h1>
      <SessionsCard
        sessions={state.sessions}
        locale={locale}
        messages={text.sessions}
        busyId={busyId}
        onEnd={(session) => void endSession(session)}
        onEndOthers={() => void run("others", async () => {
          await settings.endOtherSessions();
          showToast(text.sessions.othersEnded);
        })}
      />
      <Card className="grid gap-3">
        <h2 className="font-display text-lg font-medium">{text.ipBinding.title}</h2>
        <p className="text-sm text-steel">{text.ipBinding.text}</p>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={state.account.settings.ipBinding}
            disabled={busyId !== null}
            onChange={(event) => {
              const ipBinding = event.target.checked;
              void run("ip", async () => {
                await settings.setIpBinding(ipBinding);
                showToast(text.ipBinding.saved);
              });
            }}
            className="size-4 accent-red"
          />
          <span>{text.ipBinding.label}</span>
        </label>
      </Card>
      <Card className="grid gap-3 border-red/40">
        <h2 className="font-display text-lg font-medium">{text.danger.title}</h2>
        <p className="text-sm text-steel">{text.danger.text}</p>
        <Button variant="ghost" onClick={() => setDialog("delete")} className="justify-self-start hover:border-red hover:text-red-soft">
          {text.danger.button}
        </Button>
      </Card>
      <DeleteAccountDialog
        key={dialog === "delete" ? "delete-open" : "delete-closed"}
        isOpen={dialog === "delete"}
        login={state.account.login}
        messages={text.danger}
        onClose={() => setDialog(null)}
        onConfirm={deleteAccount}
      />
      <ReauthDialog
        isOpen={dialog === "reauth"}
        messages={messages.auth}
        common={messages.common}
        onClose={() => setDialog(null)}
        onConfirmed={() => {
          void deleteAccount().then((error) => error !== null && showToast(error));
        }}
      />
    </div>
  );
}
