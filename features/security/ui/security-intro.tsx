import Image from "next/image";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";

export function SecurityIntro({ messages }: { readonly messages: Messages["securityPage"]["intro"] }): ReactElement {
  return (
    <section aria-labelledby="security-title" className="relative isolate overflow-hidden">
      <div className="relative -z-10 aspect-16/9 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-3/5">
        <Image
          src="/images/cover-security-bridge.webp"
          width={1376}
          height={768}
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt={messages.imageAlt}
          className="h-full w-full object-cover object-[75%_center]"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night via-night/10 to-transparent" />
        <div aria-hidden className="absolute inset-0 hidden bg-linear-to-r from-night via-night/30 to-transparent lg:block" />
      </div>
      <Container className="-mt-16 pb-16 lg:mt-0 lg:py-32">
        <div className="grid max-w-xl gap-5">
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
