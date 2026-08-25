import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { localizePath, type Locale } from "@/shared/i18n/locales";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

type CtaSectionProps = {
  readonly locale: Locale;
  readonly messages: Messages["cta"];
};

export function CtaSection({ locale, messages }: CtaSectionProps): ReactElement {
  return (
    <section aria-labelledby="cta-title" className="border-t border-line py-20">
      <Container>
        <div className="grid justify-items-center gap-5 rounded-card border border-line bg-[radial-gradient(80%_120%_at_50%_0%,var(--color-wine),var(--color-ink)_70%)] px-6 py-16 text-center">
          <h2 id="cta-title" className="font-display text-2xl font-medium text-balance sm:text-4xl">
            {messages.title}
          </h2>
          <p className="max-w-md text-lg text-steel">{messages.text}</p>
          <ButtonLink href={localizePath(locale, "/register")} size="lg">
            {messages.button}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
