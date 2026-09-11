import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { InboxPlaceholder } from "@/features/auth/ui/inbox-placeholder";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type AppPageProps = { readonly params: Promise<{ locale: string }> };

export default async function AppPage({ params }: AppPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <InboxPlaceholder messages={getMessages(locale).auth.app} />;
}
