import Link from "next/link";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";

const SOURCE_URL = "https://github.com/alexandra-seredkina/ShadowBox-Backend";

type SiteFooterProps = {
  readonly locale: Locale;
  readonly messages: Messages["footer"];
};

export function SiteFooter({ locale, messages }: SiteFooterProps): ReactElement {
  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fog">
          <li>
            <Link href={localizePath(locale, "/security")} className="transition-colors hover:text-paper">
              {messages.security}
            </Link>
          </li>
          <li>
            <a href={SOURCE_URL} rel="noopener noreferrer" className="transition-colors hover:text-paper">
              {messages.source}
            </a>
          </li>
          <li className="font-mono">AGPL-3.0</li>
        </ul>
      </Container>
    </footer>
  );
}
