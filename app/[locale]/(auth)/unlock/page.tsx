import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { UnlockForm } from "@/features/auth/ui/unlock-form";
import { isLocale, localizePath } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type UnlockPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: UnlockPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getMessages(locale).auth.unlock.metaTitle,
    alternates: { canonical: localizePath(locale, "/unlock") },
    robots: { index: false },
  };
}

export default async function UnlockPage({ params }: UnlockPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return <UnlockForm locale={locale} messages={messages.auth} common={messages.common} />;
}
