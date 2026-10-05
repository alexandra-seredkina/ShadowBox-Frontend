import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { SettingsScreen } from "@/features/account/ui/settings-screen";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type SettingsPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: SettingsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getMessages(locale).settingsPage.metaTitle } : {};
}

export default async function SettingsPage({ params }: SettingsPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { settingsPage, common, auth, mailbox } = getMessages(locale);

  return (
    <SettingsScreen
      locale={locale}
      messages={{
        page: settingsPage,
        common,
        auth: { reauth: auth.reauth, errors: auth.errors, fields: auth.fields },
        blocked: mailbox.blocked,
        unblockedToast: mailbox.toasts.unblocked,
      }}
    />
  );
}
