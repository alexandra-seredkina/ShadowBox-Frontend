import type { ReactElement } from "react";
import { CoverBand } from "./cover-band";
import { SectionHeading } from "./section-heading";

const ALIAS_FACTS = [
  { title: "Постоянный", text: "для банка и сервисов, которыми пользуешься годами." },
  { title: "Временный", text: "на 1 час, 24 часа, 7 или 30 дней. Потом отключается сам." },
  { title: "Подпись и папка", text: "письма с адреса «Магазины» сразу лягут в свою папку. Подпись шифруется." },
  { title: "Утёк?", text: "удали адрес. Основной ящик это не затронет, а удалённый адрес больше никому не выдадут." },
] as const;

export function AliasesSection(): ReactElement {
  return (
    <section aria-labelledby="aliases" className="scroll-mt-16 border-t border-line pb-20">
      <CoverBand
        image={{
          src: "/images/cover-aliases-space.webp",
          width: 1376,
          height: 768,
          alt: "Девушка сидит в космосе с ноутбуком, от него лучами расходятся красные конверты-адреса, один рассыпается в пиксели",
        }}
        details={
          <ul className="grid max-w-3xl gap-x-10 gap-y-5 sm:grid-cols-2">
            {ALIAS_FACTS.map((fact) => (
              <li key={fact.title} className="text-steel">
                <span className="font-medium text-paper">{fact.title}</span> — {fact.text}
              </li>
            ))}
          </ul>
        }
      >
        <SectionHeading id="aliases" eyebrow="Адреса" title="Адрес на каждый случай">
          <p>
            Твой ящик никто не видит. Наружу уходят только случайные адреса вида{" "}
            <span className="font-mono text-base text-paper">k7f3mz9q@…</span>, не связанные ни с логином, ни друг с
            другом.
          </p>
        </SectionHeading>
      </CoverBand>
    </section>
  );
}
