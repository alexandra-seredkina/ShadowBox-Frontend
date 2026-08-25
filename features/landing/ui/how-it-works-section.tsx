import type { ReactElement, ReactNode } from "react";
import { Container } from "@/shared/ui/container";
import {
  AddressesIllustration,
  PrivateReadingIllustration,
  SignUpIllustration,
} from "./illustrations/step-illustrations";
import { SectionHeading } from "./section-heading";

type Step = { readonly title: string; readonly text: string; readonly illustration: ReactNode };

const STEPS: readonly Step[] = [
  {
    title: "Без имени и телефона",
    text: "Придумай логин и пароль. Вместо капчи браузер пару секунд решает вычислительную задачу, и ящик готов.",
    illustration: <SignUpIllustration labels={{ login: "Логин", password: "Пароль" }} />,
  },
  {
    title: "Адрес для каждого сайта",
    text: "Магазину один адрес, соцсети другой, банку третий. Утечка одного не раскрывает остальные.",
    illustration: <AddressesIllustration labels={["Магазин", "Соцсеть", "Новости", "Банк"]} />,
  },
  {
    title: "Прочитать можешь только ты",
    text: "Письмо шифруется твоим ключом сразу при получении. Ключ открывается только в твоём браузере после ввода пароля.",
    illustration: <PrivateReadingIllustration />,
  },
];

export function HowItWorksSection(): ReactElement {
  return (
    <section aria-labelledby="how" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12">
        <SectionHeading id="how" eyebrow="Как это работает" title="Три шага до тихого ящика" />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="grid content-start gap-4 rounded-card border border-line bg-surface p-6">
              <div className="rounded-control bg-night/60 p-2">{step.illustration}</div>
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
