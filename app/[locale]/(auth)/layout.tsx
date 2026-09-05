import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { MinimalHeader } from "@/features/auth/ui/minimal-header";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type AuthLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: AuthLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-wine),transparent_70%)]">
      <MinimalHeader locale={locale} homeLabel={messages.auth.homeLabel} languageLabel={messages.header.languageLabel} />
      <main id="content" className="px-4 py-12 sm:py-20">
        {children}
      </main>
    </div>
  );
}
