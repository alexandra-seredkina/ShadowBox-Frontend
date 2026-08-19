import type { ReactElement } from "react";
import { Container } from "@/shared/ui/container";
import { DiagramFigure } from "./diagram-figure";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    title: "Без имени и телефона",
    text: "Придумай логин и пароль. Вместо капчи браузер пару секунд решает вычислительную задачу, и ящик готов.",
  },
  {
    title: "Адрес для каждого сайта",
    text: "Магазину один адрес, соцсети другой, банку третий. Утечка одного не раскрывает остальные.",
  },
  {
    title: "Прочитать можешь только ты",
    text: "Письмо шифруется твоим ключом сразу при получении. Ключ открывается только в твоём браузере после ввода пароля.",
  },
] as const;

export function HowItWorksSection(): ReactElement {
  return (
    <section aria-labelledby="how" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="how" eyebrow="Как это работает" title="Три шага до тихого ящика" />
        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="grid content-start gap-3">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-full bg-red font-display text-sm font-bold text-night"
              >
                {index + 1}
              </span>
              <h3 className="font-display text-lg font-medium">{step.title}</h3>
              <p className="text-steel">{step.text}</p>
            </li>
          ))}
        </ol>
        <DiagramFigure
          src="/images/how-it-works.webp"
          width={1376}
          height={768}
          sizes="(min-width: 832px) 768px, 100vw"
          className="mx-auto w-full max-w-3xl"
          alt="Схема из трёх шагов: форма входа без телефона, один человек и отдельные адреса для магазина, соцсети, новостей и банка, письмо под ключом"
        />
      </Container>
    </section>
  );
}
