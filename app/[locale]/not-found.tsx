"use client";

import { useParams } from "next/navigation";
import type { ReactElement } from "react";
import { FALLBACK_LOCALE, isLocale, localizePath } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Kage } from "@/shared/ui/kage";

// Next.js passes no props to not-found, so the locale is read from the URL on the client.
export default function NotFound(): ReactElement {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale !== undefined && isLocale(params.locale) ? params.locale : FALLBACK_LOCALE;
  const messages = getMessages(locale).notFound;

  return (
    <main className="grid min-h-dvh place-items-center">
      <EmptyState
        title={messages.title}
        description={messages.text}
        illustration={
          <>
            <Kage mood="lost" className="h-36" />
            <p className="font-mono text-3xl text-red">404</p>
          </>
        }
        action={<ButtonLink href={localizePath(locale, "/")}>{messages.home}</ButtonLink>}
      />
    </main>
  );
}
