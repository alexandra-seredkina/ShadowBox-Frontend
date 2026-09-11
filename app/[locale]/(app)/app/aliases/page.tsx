import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { AliasesScreen } from "@/features/alias/ui/aliases-screen";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type AliasesPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: AliasesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getMessages(locale).aliasesPage.metaTitle } : {};
}

export default async function AliasesPage({ params }: AliasesPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { aliasesPage, folders, common, auth } = getMessages(locale);

  return (
    <AliasesScreen
      locale={locale}
      messages={{ page: aliasesPage, folders, common, auth: { reauth: auth.reauth, errors: auth.errors, fields: auth.fields } }}
    />
  );
}
