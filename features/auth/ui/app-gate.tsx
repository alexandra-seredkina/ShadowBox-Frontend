"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactElement, type ReactNode } from "react";
import { hasUnlockedKeys, subscribeToKeys } from "@/features/crypto/model/key-store";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Spinner } from "@/shared/ui/spinner";
import { useSessionCheck, type SessionCheck } from "../model/use-session-check";

type AppGateProps = {
  readonly locale: Locale;
  readonly loadingLabel: string;
  readonly checkingText: string;
  readonly children: ReactNode;
};

function targetFor(session: SessionCheck): "/login" | "/unlock" | null {
  if (session.kind === "signed-out") return "/login";
  // `/unlock` also shows why the session check failed, e.g. no network.
  if (session.kind === "signed-in" || session.kind === "failed") return "/unlock";
  return null;
}

/**
 * UX redirect only, not authorization: the server checks the session on every request
 * (security_quality.md §4). No keys in memory → `/unlock` if the session lives, else `/login`.
 */
export function AppGate({ locale, loadingLabel, checkingText, children }: AppGateProps): ReactElement {
  const isUnlocked = useSyncExternalStore(subscribeToKeys, hasUnlockedKeys, () => false);
  return isUnlocked ? (
    <>{children}</>
  ) : (
    <LockedRedirect locale={locale} loadingLabel={loadingLabel} checkingText={checkingText} />
  );
}

function LockedRedirect({ locale, loadingLabel, checkingText }: Omit<AppGateProps, "children">): ReactElement {
  const router = useRouter();
  const session = useSessionCheck();
  const target = targetFor(session);

  useEffect(() => {
    if (target !== null) router.replace(localizePath(locale, target));
  }, [target, router, locale]);

  return (
    <p className="flex items-center justify-center gap-3 py-24 text-steel">
      <Spinner label={loadingLabel} />
      {checkingText}
    </p>
  );
}
