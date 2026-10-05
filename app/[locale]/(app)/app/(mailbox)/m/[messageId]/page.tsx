import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { MessageRedirect } from "@/features/mailbox/ui/message-redirect";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type MessagePageProps = { readonly params: Promise<{ locale: string; messageId: string }> };

export async function generateMetadata({ params }: MessagePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getMessages(locale).appNav.inbox } : {};
}

export default async function MessagePage({ params }: MessagePageProps): Promise<ReactElement> {
  const { locale, messageId } = await params;
  if (!isLocale(locale)) notFound();
  const { mailbox, mail, folders, common, auth } = getMessages(locale);

  return (
    <MessageRedirect
      messageId={decodeURIComponent(messageId)}
      locale={locale}
      messages={{ mailbox, mail, folders, common, errors: auth.errors }}
    />
  );
}
