import Link from "next/link";
import type { ReactElement } from "react";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Container } from "@/shared/ui/container";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { Logo } from "@/shared/ui/logo";

type MinimalHeaderProps = {
  readonly locale: Locale;
  readonly homeLabel: string;
  readonly languageLabel: string;
};

/** Header for sign-in screens and the app: no marketing navigation, nothing to distract. */
export function MinimalHeader({ locale, homeLabel, languageLabel }: MinimalHeaderProps): ReactElement {
  return (
    <header className="border-b border-line">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link href={localizePath(locale, "/")} aria-label={homeLabel} className="rounded-control">
          <Logo />
        </Link>
        <LocaleSwitcher current={locale} label={languageLabel} />
      </Container>
    </header>
  );
}
