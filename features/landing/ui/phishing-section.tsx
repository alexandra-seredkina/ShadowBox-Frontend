import type { ReactElement } from "react";
import { Badge } from "@/shared/ui/badge";
import { CoverBand } from "./cover-band";
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
    <section aria-labelledby="phishing" className="scroll-mt-16 border-t border-line pb-20">
      <CoverBand
        image={{
          src: "/images/cover-phishing-shield.webp",
          width: 1376,
          height: 768,
          alt: "Девушка останавливает фишинговые письма красным щитом",
        }}
        details={
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="grid content-start gap-6">
              <div className="flex flex-wrap gap-2" aria-label="Примеры меток">
                <Badge tone="safe">Знакомый отправитель</Badge>
                <Badge tone="caution">Первое письмо</Badge>
                <Badge tone="danger">Похоже на фишинг</Badge>
                <Badge tone="alias">Временный адрес</Badge>
              </div>
              <p className="text-sm text-fog">
                Внешние картинки в письмах скрыты: трекинг-пиксель не узнает, что ты открыл письмо. Метка — подсказка, а
                не гарантия: решение за тобой.
              </p>
            </div>
            <ul className="grid list-disc gap-2 pl-5 text-steel marker:text-red">
              {CHECKS.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>
        }
      >
        <SectionHeading id="phishing" eyebrow="Антифишинг" title="Подозрительное письмо видно сразу">
          <p>
            Каждое входящее проверяем по SPF, DKIM и DMARC и ищем типичные приёмы фишинга. Рядом с письмом — метка и
            объяснение простыми словами.
          </p>
        </SectionHeading>
      </CoverBand>
    </section>
  );
}
