import Link from "next/link";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";

type SiteHeaderProps = {
  readonly locale: Locale;
  readonly messages: Messages["header"];
};

export function SiteHeader({ locale, messages }: SiteHeaderProps): ReactElement {
  const navLinks = [
    { path: "/#how", label: messages.nav.how },
    { path: "/#aliases", label: messages.nav.aliases },
    { path: "/#phishing", label: messages.nav.phishing },
    { path: "/security", label: messages.nav.security },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-night/85 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-3 sm:gap-5">
        <Link href={localizePath(locale, "/")} aria-label={messages.homeLabel} className="mr-auto rounded-control">
          <span className="sm:hidden">
            <Logo variant="mark" />
          </span>
          <span className="hidden sm:inline">
            <Logo />
          </span>
        </Link>
        <nav aria-label={messages.navLabel} className="hidden xl:block">
          <ul className="flex gap-6 text-sm">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link href={localizePath(locale, link.path)} className="text-fog transition-colors hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <LocaleSwitcher current={locale} label={messages.languageLabel} />
        <div className="flex gap-2">
          <ButtonLink href={localizePath(locale, "/login")} variant="ghost" className="max-sm:hidden">
            {messages.signIn}
          </ButtonLink>
          <ButtonLink href={localizePath(locale, "/register")}>{messages.signUp}</ButtonLink>
        </div>
      </Container>
    </header>
  );
}
