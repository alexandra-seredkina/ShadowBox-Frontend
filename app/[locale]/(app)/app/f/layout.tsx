import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { FolderSidebar } from "@/features/folder/ui/folder-sidebar";
import { FoldersProvider } from "@/features/folder/ui/folders-context";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type MailboxLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function MailboxLayout({ children, params }: MailboxLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { folders, common, auth } = getMessages(locale);

  return (
    <FoldersProvider>
      <div className="mx-auto grid w-full max-w-6xl gap-4 pt-4 lg:grid-cols-[15rem_1fr] lg:gap-10 lg:pt-0">
        <FolderSidebar locale={locale} messages={{ folders, common, errors: auth.errors }} />
        {children}
      </div>
    </FoldersProvider>
  );
}
