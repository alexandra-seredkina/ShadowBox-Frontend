import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { MailboxShell } from "@/features/mailbox/ui/mailbox-shell";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type MailboxLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function MailboxLayout({ children, params }: MailboxLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { mailbox, mail, folders, common, auth } = getMessages(locale);

  return (
    <MailboxShell locale={locale} messages={{ mailbox, mail, folders, common, errors: auth.errors }}>
      {children}
    </MailboxShell>
  );
}
