import type { ReactElement, ReactNode } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";
import {
  AddressesIllustration,
  PrivateReadingIllustration,
  SignUpIllustration,
} from "./illustrations/step-illustrations";
import { SectionHeading } from "./section-heading";

export function HowItWorksSection({ messages }: { readonly messages: Messages["how"] }): ReactElement {
  const { illustration } = messages;
  const illustrations: readonly ReactNode[] = [
    <SignUpIllustration key="sign-up" labels={{ login: illustration.login, password: illustration.password }} />,
    <AddressesIllustration key="addresses" labels={illustration.addresses} />,
    <PrivateReadingIllustration key="private" />,
  ];

  return (
    <section aria-labelledby="how" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="how" eyebrow={messages.eyebrow} title={messages.title} />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {messages.steps.map((step, index) => (
            <li key={step.title} className="grid content-start gap-4 rounded-card border border-line bg-surface p-6">
              <div className="rounded-control bg-night/60 p-2">{illustrations[index]}</div>
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
