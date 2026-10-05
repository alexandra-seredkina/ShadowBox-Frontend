import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Card } from "@/shared/ui/card";
import { CoverBand } from "@/features/landing/ui/cover-band";
import { SectionHeading } from "@/shared/ui/section-heading";

type ThreatModelSectionProps = {
  readonly messages: Messages["securityPage"]["model"];
};

export function ThreatModelSection({ messages }: ThreatModelSectionProps): ReactElement {
  return (
    <section aria-labelledby="model" className="border-t border-line pb-20">
      <CoverBand
        image={{ src: "/images/cover-no-trackers.webp", width: 1376, height: 768, alt: messages.imageAlt }}
        details={
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <Card className="grid gap-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-medium">
              <i aria-hidden className="size-2.5 bg-safe" />
              {messages.protectsTitle}
            </h3>
            <ul className="grid list-disc gap-3 pl-5 text-steel marker:text-safe">
              {messages.protects.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="grid gap-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-medium">
              <i aria-hidden className="size-2.5 bg-red" />
              {messages.limitsTitle}
            </h3>
            <ul className="grid list-disc gap-3 pl-5 text-steel marker:text-red-soft">
              {messages.limits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
        }
      >
        <SectionHeading id="model" eyebrow={messages.eyebrow} title={messages.title}>
          <p>{messages.lede}</p>
        </SectionHeading>
      </CoverBand>
    </section>
  );
}
