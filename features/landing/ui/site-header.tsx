import Link from "next/link";
import type { ReactElement } from "react";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";

const NAV_LINKS = [
  { href: "/#how", label: "Как это работает" },
  { href: "/#aliases", label: "Адреса" },
  { href: "/#phishing", label: "Антифишинг" },
  { href: "/security", label: "Безопасность" },
] as const;

export function SiteHeader(): ReactElement {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-night/85 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-3 sm:gap-6">
        <Link href="/" aria-label="ShadowBox, на главную" className="mr-auto rounded-control">
          <span className="sm:hidden">
            <Logo variant="mark" />
          </span>
          <span className="hidden sm:inline">
            <Logo />
          </span>
        </Link>
        <nav aria-label="Разделы" className="hidden lg:block">
          <ul className="flex gap-6 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-fog transition-colors hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex gap-2">
          <ButtonLink href="/login" variant="ghost">
            Войти
          </ButtonLink>
          <ButtonLink href="/register">Создать ящик</ButtonLink>
        </div>
      </Container>
    </header>
  );
}
