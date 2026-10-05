import Image from "next/image";
import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "@/shared/ui/section-heading";

const SHOTS = ["/images/screen-inbox.webp", "/images/screen-phishing.webp", "/images/screen-folders.webp", "/images/screen-addresses.webp"] as const;

/** Real screens of the web client, so people see where they are signing up. */
export function TourSection({ messages }: { readonly messages: Messages["tour"] }): ReactElement {
  const [main, ...rest] = messages.shots.map((shot, index) => ({ ...shot, src: SHOTS[index] ?? SHOTS[0] }));

  return (
    <section aria-labelledby="tour" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="tour" eyebrow={messages.eyebrow} title={messages.title}>
          <p>{messages.lede}</p>
        </SectionHeading>
        {main ? (
          <figure className="grid gap-4">
            <Screen src={main.src} alt={main.alt} sizes="(min-width: 1280px) 1200px, 100vw" />
            <figcaption className="max-w-2xl text-steel">
              <span className="font-medium text-paper">{main.title}.</span> {main.text}
            </figcaption>
          </figure>
        ) : null}
        <ul className="grid gap-8 md:grid-cols-3">
          {rest.map((shot) => (
            <li key={shot.src}>
              <figure className="grid gap-3">
                <Screen src={shot.src} alt={shot.alt} sizes="(min-width: 768px) 33vw, 100vw" />
                <figcaption className="grid gap-1">
                  <span className="font-medium">{shot.title}</span>
                  <span className="text-sm text-steel">{shot.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Screen({ src, alt, sizes }: { readonly src: string; readonly alt: string; readonly sizes: string }): ReactElement {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-ink shadow-[0_24px_80px_-32px_rgb(232_51_74/0.35)]">
      <div aria-hidden className="flex h-7 items-center gap-1.5 border-b border-line px-3">
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
      </div>
      <Image src={src} width={1600} height={900} sizes={sizes} alt={alt} className="h-auto w-full" />
    </div>
  );
}
