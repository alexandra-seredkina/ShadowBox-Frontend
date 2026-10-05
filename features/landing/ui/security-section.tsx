import Link from "next/link";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Card } from "@/shared/ui/card";
import { SectionHeading } from "@/shared/ui/section-heading";
import { CoverBand } from "./cover-band";

type SecuritySectionProps = {
  readonly locale: Locale;
  readonly messages: Messages["security"];
};

export function SecuritySection({ locale, messages }: SecuritySectionProps): ReactElement {
  return (
    <section aria-labelledby="security" className="scroll-mt-16 border-t border-line pb-20">
      <CoverBand
        image={{ src: "/images/cover-encrypted-only.webp", width: 1376, height: 768, alt: messages.imageAlt }}
        details={
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <ul className="grid gap-6">
              {messages.guarantees.map((item) => (
                <li key={item.title} className="grid gap-1 border-l-2 border-red pl-4">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-steel">{item.text}</p>
                </li>
              ))}
            </ul>
            <Card className="grid gap-4">
              <h3 className="font-display text-lg font-medium">{messages.limitsTitle}</h3>
              <ul className="grid list-disc gap-3 pl-5 text-steel marker:text-fog">
                {messages.limits.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
              <Link href={localizePath(locale, "/security")} className="text-red-soft underline-offset-4 hover:underline">
                {messages.more}
              </Link>
            </Card>
          </div>
        }
      >
        <SectionHeading id="security" eyebrow={messages.eyebrow} title={messages.title}>
          <p>{messages.lede}</p>
        </SectionHeading>
      </CoverBand>
    </section>
  );
}
