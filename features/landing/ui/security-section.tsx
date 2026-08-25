import Link from "next/link";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { Card } from "@/shared/ui/card";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "./section-heading";

type SecuritySectionProps = {
  readonly locale: Locale;
  readonly messages: Messages["security"];
};

export function SecuritySection({ locale, messages }: SecuritySectionProps): ReactElement {
  return (
    <section aria-labelledby="security" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="grid gap-10">
          <SectionHeading id="security" eyebrow={messages.eyebrow} title={messages.title}>
            <p>{messages.lede}</p>
          </SectionHeading>
          <ul className="grid gap-6">
            {messages.guarantees.map((item) => (
              <li key={item.title} className="grid gap-1 border-l-2 border-red pl-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-steel">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
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
      </Container>
    </section>
  );
}
