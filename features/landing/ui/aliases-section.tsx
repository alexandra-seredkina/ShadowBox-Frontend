import Image from "next/image";
import type { ReactElement } from "react";
import { Container } from "@/shared/ui/container";
import { DiagramFigure } from "./diagram-figure";
import { SectionHeading } from "./section-heading";

const ALIAS_FACTS = [
  { title: "Постоянный", text: "для банка и сервисов, которыми пользуешься годами." },
  { title: "Временный", text: "на 1 час, 24 часа, 7 или 30 дней. Потом отключается сам." },
  { title: "Подпись и папка", text: "письма с адреса «Магазины» сразу лягут в свою папку. Подпись шифруется." },
  { title: "Утёк?", text: "удали адрес. Основной ящик это не затронет, а удалённый адрес больше никому не выдадут." },
] as const;

export function AliasesSection(): ReactElement {
  return (
    <section aria-labelledby="aliases" className="scroll-mt-16 border-t border-line">
      <div className="relative isolate overflow-hidden">
        <Image
          src="/images/cover-aliases-space.webp"
          width={1376}
          height={768}
          sizes="100vw"
          alt="Девушка сидит в космосе с ноутбуком, от него лучами расходятся красные конверты-адреса, один рассыпается в пиксели"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[75%_center]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-night via-night/70 to-night/10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-night via-transparent to-night" />
        <Container className="py-28 lg:py-40">
          <SectionHeading id="aliases" eyebrow="Адреса" title="Адрес на каждый случай">
            <p>
              Твой ящик никто не видит. Наружу уходят только случайные адреса вида{" "}
              <span className="font-mono text-base text-paper">k7f3mz9q@…</span>, не связанные ни с логином, ни друг с
              другом.
            </p>
          </SectionHeading>
        </Container>
      </div>
      <Container className="grid gap-12 pb-20 lg:grid-cols-2 lg:items-center">
        <ul className="grid gap-5">
          {ALIAS_FACTS.map((fact) => (
            <li key={fact.title} className="text-steel">
              <span className="font-medium text-paper">{fact.title}</span> — {fact.text}
            </li>
          ))}
        </ul>
        <DiagramFigure
          src="/images/aliases-diagram.webp"
          width={1200}
          height={896}
          sizes="(min-width: 1024px) 540px, 100vw"
          alt="Схема: из одного ящика расходятся адреса для магазина, банка, форума, игр и временный; утёкший адрес форума удалён, ящик остаётся скрытым"
        />
      </Container>
    </section>
  );
}
