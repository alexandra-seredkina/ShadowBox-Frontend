import Image from "next/image";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "@/shared/ui/section-heading";

export function KeysSection({ messages }: { readonly messages: Messages["securityPage"]["keys"] }): ReactElement {
  return (
    <section aria-labelledby="keys" className="border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="keys" eyebrow={messages.eyebrow} title={messages.title} />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <ul className="grid gap-8">
            {messages.items.map((item) => (
              <li key={item.title} className="grid content-start gap-1 border-l-2 border-red pl-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-steel">{item.text}</p>
              </li>
            ))}
          </ul>
          <div className="relative overflow-hidden rounded-card border border-line">
            <Image
              src="/images/cover-sealed-envelope.webp"
              width={1376}
              height={768}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt={messages.imageAlt}
              className="h-auto w-full"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night/60 to-transparent" />
          </div>
        </div>
      </Container>
    </section>
  );
}
