import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { MailboxView } from "@/features/mailbox/ui/mailbox-view";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type StarredPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: StarredPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getMessages(locale).mailbox.starred } : {};
}

export default async function StarredPage({ params }: StarredPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { mailbox, mail, folders, common, auth } = getMessages(locale);

  return <MailboxView locale={locale} target={{ kind: "starred" }} messages={{ mailbox, mail, folders, common, errors: auth.errors }} />;
}
