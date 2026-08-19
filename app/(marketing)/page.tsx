import type { ReactElement } from "react";
import { AliasesSection } from "@/features/landing/ui/aliases-section";
import { CtaSection } from "@/features/landing/ui/cta-section";
import { HeroSection } from "@/features/landing/ui/hero-section";
import { HowItWorksSection } from "@/features/landing/ui/how-it-works-section";
import { PhishingSection } from "@/features/landing/ui/phishing-section";
import { SecuritySection } from "@/features/landing/ui/security-section";

export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <SecuritySection />
      <AliasesSection />
      <PhishingSection />
      <CtaSection />
    </>
  );
}
