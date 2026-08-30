import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Badge } from "@/shared/ui/badge";
import { CoverBand } from "./cover-band";
import { SectionHeading } from "@/shared/ui/section-heading";

export function PhishingSection({ messages }: { readonly messages: Messages["phishing"] }): ReactElement {
  const { badges } = messages;

  return (
    <section aria-labelledby="phishing" className="scroll-mt-16 border-t border-line pb-20">
      <CoverBand
        image={{ src: "/images/cover-phishing-shield.webp", width: 1376, height: 768, alt: messages.imageAlt }}
        details={
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="grid content-start gap-6">
              <div className="flex flex-wrap gap-2" aria-label={messages.badgesLabel}>
                <Badge tone="safe">{badges.safe}</Badge>
                <Badge tone="caution">{badges.caution}</Badge>
                <Badge tone="danger">{badges.danger}</Badge>
                <Badge tone="alias">{badges.alias}</Badge>
              </div>
              <p className="text-sm text-fog">{messages.note}</p>
            </div>
            <ul className="grid list-disc gap-2 pl-5 text-steel marker:text-red">
              {messages.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>
        }
      >
        <SectionHeading id="phishing" eyebrow={messages.eyebrow} title={messages.title}>
          <p>{messages.lede}</p>
        </SectionHeading>
      </CoverBand>
    </section>
  );
}
