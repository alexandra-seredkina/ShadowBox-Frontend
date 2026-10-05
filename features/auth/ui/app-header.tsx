"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import { Button } from "@/shared/ui/button";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { Logo } from "@/shared/ui/logo";
import { signOut } from "../model/sign-in";

type AppHeaderProps = {
  readonly locale: Locale;
  readonly messages: Messages["appNav"];
  readonly homeLabel: string;
  readonly languageLabel: string;
};

export function AppHeader({ locale, messages, homeLabel, languageLabel }: AppHeaderProps): ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const links = [
    { href: localizePath(locale, "/app/f/inbox"), section: localizePath(locale, "/app/f/"), label: messages.inbox },
    { href: localizePath(locale, "/app/aliases"), section: localizePath(locale, "/app/aliases"), label: messages.aliases },
    { href: localizePath(locale, "/app/settings"), section: localizePath(locale, "/app/settings"), label: messages.settings },
  ];

  async function leave(): Promise<void> {
    setIsSigningOut(true);
    // Keys are wiped first; a failed request still leaves this tab signed out.
    await signOut().catch(() => undefined);
    router.replace(localizePath(locale, "/login"));
  }

  return (
    <header className="border-b border-line">
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:gap-6 sm:py-0">
        <Link href={localizePath(locale, "/")} aria-label={homeLabel} className="mr-auto rounded-control sm:mr-0">
          <Logo variant="mark" />
        </Link>
        {/* Phones get the sections as a second row, so the header never widens the page. */}
        <nav aria-label={messages.label} className="order-last w-full sm:order-none sm:mr-auto sm:w-auto">
          <ul className="flex gap-1 text-sm">
            {links.map((link) => {
              const isCurrent = pathname.startsWith(link.section);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={joinClassNames(
                      "block rounded-control px-3 py-2 transition-colors",
                      isCurrent ? "bg-surface-2 text-paper" : "text-fog hover:text-paper",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <LocaleSwitcher current={locale} label={languageLabel} />
        <Button variant="ghost" disabled={isSigningOut} onClick={() => void leave()} className="max-sm:px-3">
          {messages.signOut}
        </Button>
      </div>
    </header>
  );
}
