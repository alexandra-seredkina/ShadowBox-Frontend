import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "@/shared/ui/section-heading";
import { MailFlowDiagram } from "./mail-flow-diagram";

export function MailFlowSection({ messages }: { readonly messages: Messages["securityPage"]["flow"] }): ReactElement {
  const names = messages.steps.map((step) => step.title);

  return (
    <section aria-labelledby="flow" className="border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="flow" eyebrow={messages.eyebrow} title={messages.title}>
          <p>{messages.lede}</p>
        </SectionHeading>
        {/* Below md the labels would shrink past readable size; the steps carry the same text. */}
        <div className="hidden rounded-card border border-line bg-surface px-6 py-8 md:block">
          <MailFlowDiagram names={names} labels={messages.diagram} />
        </div>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {messages.steps.map((step, index) => (
            <li key={step.title} className="grid content-start gap-3">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-red font-display text-sm font-bold text-night"
                >
                  {index + 1}
                </span>
                <h3 className="font-display text-lg font-medium">{step.title}</h3>
              </div>
              <p className="text-steel">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
