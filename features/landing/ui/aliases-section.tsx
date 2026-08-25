import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { CoverBand } from "./cover-band";
import { SectionHeading } from "./section-heading";

const EXAMPLE_ADDRESS = "k7f3mz9q@…";

export function AliasesSection({ messages }: { readonly messages: Messages["aliases"] }): ReactElement {
  return (
    <section aria-labelledby="aliases" className="scroll-mt-16 border-t border-line pb-20">
      <CoverBand
        image={{ src: "/images/cover-aliases-space.webp", width: 1376, height: 768, alt: messages.imageAlt }}
        details={
          <ul className="grid max-w-3xl gap-x-10 gap-y-5 sm:grid-cols-2">
            {messages.facts.map((fact) => (
              <li key={fact.title} className="text-steel">
                <span className="font-medium text-paper">{fact.title}</span> — {fact.text}
              </li>
            ))}
          </ul>
        }
      >
        <SectionHeading id="aliases" eyebrow={messages.eyebrow} title={messages.title}>
          <p>
            {messages.ledeStart} <span className="font-mono text-base text-paper">{EXAMPLE_ADDRESS}</span>
            {messages.ledeEnd}
          </p>
        </SectionHeading>
      </CoverBand>
    </section>
  );
}
