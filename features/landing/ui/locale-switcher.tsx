"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { joinClassNames } from "@/shared/lib/class-names";
import { LOCALES, type Locale } from "@/shared/i18n/locales";

function swapLocale(pathname: string, locale: Locale): string {
  const [, , ...rest] = pathname.split("/");
  return rest.length > 0 ? `/${locale}/${rest.join("/")}` : `/${locale}`;
}

type LocaleSwitcherProps = {
  readonly current: Locale;
  readonly label: string;
};

export function LocaleSwitcher({ current, label }: LocaleSwitcherProps): ReactElement {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex font-mono text-xs uppercase">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={swapLocale(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={joinClassNames(
                "block rounded-md px-1.5 py-1 transition-colors",
                locale === current ? "text-paper" : "text-fog hover:text-paper",
              )}
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
