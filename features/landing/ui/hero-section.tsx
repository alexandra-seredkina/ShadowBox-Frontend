import Image from "next/image";
import type { ReactElement } from "react";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

const FACTS = ["Без телефона", "Без имени", "Шифрование при приёме"] as const;

export function HeroSection(): ReactElement {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div className="relative -z-10 aspect-16/9 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-3/5">
        <Image
          src="/images/hero-server-hall.webp"
          width={1376}
          height={768}
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt="Девушка с красным каре стоит на мостике в серверном зале, над её ладонью конверт рассыпается в пиксели"
          className="h-full w-full object-cover object-[70%_center]"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night via-night/10 to-transparent" />
        <div aria-hidden className="absolute inset-0 hidden bg-linear-to-r from-night via-night/30 to-transparent lg:block" />
      </div>

      <Container className="-mt-16 pb-16 lg:mt-0 lg:py-36">
        <div className="max-w-xl">
          <p className="font-mono text-xs tracking-[0.12em] text-red-soft uppercase">Анонимная почта</p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-6xl"
          >
            Письмо уходит в <span className="text-red">тень</span>
          </h1>
          <p className="mt-5 text-lg text-steel sm:text-xl">
            Почтовый ящик без телефона и имени. Заводи отдельный адрес для каждого сайта: письма шифруются в момент
            получения, и прочитать их можешь только ты.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Создать ящик
            </ButtonLink>
            <ButtonLink href="/security" size="lg" variant="ghost">
              Как устроена защита
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm text-fog">
            {FACTS.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
