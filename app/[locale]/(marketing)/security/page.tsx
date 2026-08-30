import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { CtaSection } from "@/features/landing/ui/cta-section";
import { AdversariesSection } from "@/features/security/ui/adversaries-section";
import { KeysSection } from "@/features/security/ui/keys-section";
import { MailFlowSection } from "@/features/security/ui/mail-flow-section";
import { SecurityIntro } from "@/features/security/ui/security-intro";
import { StoredDataSection } from "@/features/security/ui/stored-data-section";
import { ThreatModelSection } from "@/features/security/ui/threat-model-section";
import { LOCALES, isLocale, localizePath } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type SecurityPageProps = { readonly params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: SecurityPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getMessages(locale).securityPage;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: localizePath(locale, "/security"),
      languages: Object.fromEntries(LOCALES.map((code) => [code, localizePath(code, "/security")])),
    },
  };
}

export default async function SecurityPage({ params }: SecurityPageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  const page = messages.securityPage;

  return (
    <>
      <SecurityIntro messages={page.intro} />
      <MailFlowSection messages={page.flow} />
      <KeysSection messages={page.keys} />
      <ThreatModelSection messages={page.model} />
      <AdversariesSection messages={page.adversaries} />
      <StoredDataSection messages={page.data} />
      <CtaSection locale={locale} messages={messages.cta} />
    </>
  );
}
