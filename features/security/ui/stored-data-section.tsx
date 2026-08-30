import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";

type StoredDataSectionProps = {
  readonly messages: Messages["securityPage"]["data"];
};

export function StoredDataSection({ messages }: StoredDataSectionProps): ReactElement {
  return (
    <section aria-labelledby="stored-data" className="border-t border-line py-20">
      <Container className="grid gap-8">
        <h2 id="stored-data" className="font-display text-xl font-medium text-balance sm:text-2xl">
          {messages.title}
        </h2>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid content-start gap-4">
            <h3 className="font-mono text-xs tracking-[0.12em] text-fog uppercase">{messages.storedTitle}</h3>
            <ul className="grid gap-3">
              {messages.stored.map((item) => (
                <li key={item} className="border-l-2 border-line pl-4 text-steel">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-4">
            <h3 className="font-mono text-xs tracking-[0.12em] text-fog uppercase">{messages.neverTitle}</h3>
            <ul className="grid gap-3">
              {messages.never.map((item) => (
                <li key={item} className="border-l-2 border-red pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
