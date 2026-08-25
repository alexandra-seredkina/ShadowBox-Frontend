import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { AliasesSection } from "@/features/landing/ui/aliases-section";
import { CtaSection } from "@/features/landing/ui/cta-section";
import { HeroSection } from "@/features/landing/ui/hero-section";
import { HowItWorksSection } from "@/features/landing/ui/how-it-works-section";
import { PhishingSection } from "@/features/landing/ui/phishing-section";
import { SecuritySection } from "@/features/landing/ui/security-section";
import { isLocale } from "@/shared/i18n/locales";
import { getMessages } from "@/shared/i18n/messages";

type HomePageProps = { readonly params: Promise<{ locale: string }> };

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <>
      <HeroSection locale={locale} messages={messages.hero} />
      <HowItWorksSection messages={messages.how} />
      <SecuritySection locale={locale} messages={messages.security} />
      <AliasesSection messages={messages.aliases} />
      <PhishingSection messages={messages.phishing} />
      <CtaSection locale={locale} messages={messages.cta} />
    </>
  );
}
