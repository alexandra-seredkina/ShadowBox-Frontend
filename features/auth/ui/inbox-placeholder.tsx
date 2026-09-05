"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { signOut } from "../model/sign-in";

type InboxPlaceholderProps = {
  readonly locale: Locale;
  readonly messages: Messages["auth"]["app"];
};

/** Stands in for the inbox until the mail screens arrive. */
export function InboxPlaceholder({ locale, messages }: InboxPlaceholderProps): ReactElement {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function leave(): Promise<void> {
    setIsSigningOut(true);
    // Keys are wiped first; a failed request still leaves this tab signed out.
    await signOut().catch(() => undefined);
    router.replace(localizePath(locale, "/login"));
  }

  return (
    <EmptyState
      title={messages.title}
      description={messages.text}
      action={
        <Button variant="ghost" disabled={isSigningOut} onClick={() => void leave()}>
          {messages.signOut}
        </Button>
      }
    />
  );
}
