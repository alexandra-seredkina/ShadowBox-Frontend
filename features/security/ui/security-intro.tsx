import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";

export function SecurityIntro({ messages }: { readonly messages: Messages["securityPage"]["intro"] }): ReactElement {
  return (
    <section
      aria-labelledby="security-title"
      className="bg-[radial-gradient(60%_100%_at_15%_0%,var(--color-wine),transparent_70%)]"
    >
      <Container className="py-20 sm:py-28">
        <div className="grid max-w-2xl gap-5">
          <p className="font-mono text-xs tracking-[0.12em] text-red-soft uppercase">{messages.eyebrow}</p>
          <h1
            id="security-title"
            className="font-display text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl"
          >
            {messages.title}
          </h1>
          <p className="text-lg text-steel sm:text-xl">{messages.lede}</p>
        </div>
      </Container>
    </section>
  );
}
