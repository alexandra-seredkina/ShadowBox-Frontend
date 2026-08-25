import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { SiteFooter } from "@/features/landing/ui/site-footer";
import { SiteHeader } from "@/features/landing/ui/site-header";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type MarketingLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({ children, params }: MarketingLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <>
      <SiteHeader locale={locale} messages={messages.header} />
      <main id="content">{children}</main>
      <SiteFooter locale={locale} messages={messages.footer} />
    </>
  );
}
