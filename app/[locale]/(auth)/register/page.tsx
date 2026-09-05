import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { RegisterWizard } from "@/features/auth/ui/register-wizard";
import { isLocale, localizePath } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type RegisterPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getMessages(locale).auth.register.metaTitle,
    alternates: { canonical: localizePath(locale, "/register") },
  };
}

export default async function RegisterPage({ params }: RegisterPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return <RegisterWizard locale={locale} messages={messages.auth} common={messages.common} />;
}
