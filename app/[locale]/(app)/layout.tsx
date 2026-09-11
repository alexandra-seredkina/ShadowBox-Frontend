import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { AppGate } from "@/features/auth/ui/app-gate";
import { AppHeader } from "@/features/auth/ui/app-header";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";
import { ToastProvider } from "@/shared/ui/toast";

type AppLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export const metadata = { robots: { index: false } };

export default async function AppLayout({ children, params }: AppLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <ToastProvider>
      <div className="grid min-h-dvh grid-rows-[auto_1fr]">
        <AppHeader
          locale={locale}
          messages={messages.appNav}
          homeLabel={messages.auth.homeLabel}
          languageLabel={messages.header.languageLabel}
        />
        <main id="content" className="px-4">
          <AppGate locale={locale} loadingLabel={messages.common.loading} checkingText={messages.auth.app.checking}>
            {children}
          </AppGate>
        </main>
      </div>
    </ToastProvider>
  );
}
