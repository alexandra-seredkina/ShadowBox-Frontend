import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { LoginForm } from "@/features/auth/ui/login-form";
import { isLocale, localizePath } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type LoginPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getMessages(locale).auth.login.metaTitle,
    alternates: { canonical: localizePath(locale, "/login") },
  };
}

export default async function LoginPage({ params }: LoginPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return <LoginForm locale={locale} messages={messages.auth} common={messages.common} />;
}
