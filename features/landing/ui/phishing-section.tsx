import Image from "next/image";
import type { ReactElement } from "react";
import { Badge } from "@/shared/ui/badge";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "./section-heading";

const CHECKS = [
  "Провал проверки отправителя по DMARC",
  "Имя отправителя выдаёт себя за другой адрес",
  "Домен из похожих букв других алфавитов",
  "Текст ссылки не совпадает с настоящим адресом",
  "Исполняемые вложения и документы с макросами",
] as const;

export function PhishingSection(): ReactElement {
  return (
    <section aria-labelledby="phishing" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative overflow-hidden rounded-card lg:order-last">
          <Image
            src="/images/cover-phishing-shield.webp"
            width={1376}
            height={768}
            sizes="(min-width: 1024px) 540px, 100vw"
            alt="Девушка останавливает фишинговые письма красным щитом"
            className="h-auto w-full"
          />
          <div aria-hidden className="absolute inset-0 rounded-card shadow-[inset_0_0_48px_24px_var(--color-night)]" />
        </div>
        <div className="grid gap-8">
          <SectionHeading id="phishing" eyebrow="Антифишинг" title="Подозрительное письмо видно сразу">
            <p>
              Каждое входящее проверяем по SPF, DKIM и DMARC и ищем типичные приёмы фишинга. Рядом с письмом —
              метка и объяснение простыми словами.
            </p>
          </SectionHeading>
          <div className="flex flex-wrap gap-2" aria-label="Примеры меток">
            <Badge tone="safe">Знакомый отправитель</Badge>
            <Badge tone="caution">Первое письмо</Badge>
            <Badge tone="danger">Похоже на фишинг</Badge>
            <Badge tone="alias">Временный адрес</Badge>
          </div>
          <ul className="grid list-disc gap-2 pl-5 text-steel marker:text-red">
            {CHECKS.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="text-sm text-fog">
            Внешние картинки в письмах скрыты: трекинг-пиксель не узнает, что ты открыл письмо. Метка — подсказка, а
            не гарантия: решение за тобой.
          </p>
        </div>
      </Container>
    </section>
  );
}
