import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { MessageList } from "@/features/message/ui/message-list";
import { FolderView } from "@/features/folder/ui/folder-view";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type FolderPageProps = { readonly params: Promise<{ locale: string; folderId: string }> };

export async function generateMetadata({ params }: FolderPageProps): Promise<Metadata> {
  const { locale } = await params;
  // Custom folder names are encrypted, so the tab title stays generic.
  return isLocale(locale) ? { title: getMessages(locale).appNav.inbox } : {};
}

export default async function FolderPage({ params }: FolderPageProps): Promise<ReactElement> {
  const { locale, folderId } = await params;
  if (!isLocale(locale)) notFound();
  const { folders, common, auth, mail } = getMessages(locale);

  return (
    <FolderView locale={locale} slug={decodeURIComponent(folderId)} messages={{ folders, common, errors: auth.errors }}>
      <MessageList locale={locale} slug={decodeURIComponent(folderId)} messages={{ mail, folders, common, errors: auth.errors }} />
    </FolderView>
  );
}
