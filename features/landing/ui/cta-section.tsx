import type { ReactElement } from "react";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export function CtaSection(): ReactElement {
  return (
    <section aria-labelledby="cta-title" className="border-t border-line py-20">
      <Container>
        <div className="grid justify-items-center gap-5 rounded-card border border-line bg-[radial-gradient(80%_120%_at_50%_0%,var(--color-wine),var(--color-ink)_70%)] px-6 py-16 text-center">
          <h2 id="cta-title" className="font-display text-2xl font-medium text-balance sm:text-4xl">
            Заведи ящик за минуту
          </h2>
          <p className="max-w-md text-lg text-steel">Логин и пароль. Больше ничего не нужно.</p>
          <ButtonLink href="/register" size="lg">
            Создать ящик
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
