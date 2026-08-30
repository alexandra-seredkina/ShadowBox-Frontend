import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "@/shared/ui/section-heading";

export function KeysSection({ messages }: { readonly messages: Messages["securityPage"]["keys"] }): ReactElement {
  return (
    <section aria-labelledby="keys" className="border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="keys" eyebrow={messages.eyebrow} title={messages.title} />
        <ul className="grid gap-8 sm:grid-cols-2">
          {messages.items.map((item) => (
            <li key={item.title} className="grid content-start gap-1 border-l-2 border-red pl-4">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-steel">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
