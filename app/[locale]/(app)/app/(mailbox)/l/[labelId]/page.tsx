import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { MailboxView } from "@/features/mailbox/ui/mailbox-view";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type LabelPageProps = { readonly params: Promise<{ locale: string; labelId: string }> };

export async function generateMetadata({ params }: LabelPageProps): Promise<Metadata> {
  const { locale } = await params;
  // Label names are encrypted, so the tab title stays generic.
  return isLocale(locale) ? { title: getMessages(locale).mailbox.labels } : {};
}

export default async function LabelPage({ params }: LabelPageProps): Promise<ReactElement> {
  const { locale, labelId } = await params;
  if (!isLocale(locale)) notFound();
  const { mailbox, mail, folders, common, auth } = getMessages(locale);

  return (
    <MailboxView
      locale={locale}
      target={{ kind: "label", labelId: decodeURIComponent(labelId) }}
      messages={{ mailbox, mail, folders, common, errors: auth.errors }}
    />
  );
}
