import Link from "next/link";
import type { ReactElement } from "react";
import { Card } from "@/shared/ui/card";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "./section-heading";

const GUARANTEES = [
  {
    title: "Пароль не уходит на сервер",
    text: "Браузер выводит из него два ключа: один для входа, второй открывает твой приватный ключ. Сервер получает только первый.",
  },
  {
    title: "В базе только шифротекст",
    text: "Письма, их темы, подписи адресов и названия папок зашифрованы. Утёкший дамп базы их не раскроет.",
  },
  {
    title: "IP не храним",
    text: "Вместо адреса в базе хеш с ротируемым ключом, и не дольше 30 дней. Список сессий видишь ты сам и можешь завершить любую.",
  },
] as const;

const LIMITS = [
  "Письмо из обычной почты приходит по SMTP открытым текстом. Сервер видит его в момент приёма, до шифрования.",
  "Метаданные видны серверу: время получения, адрес, на который пришло письмо, и его размер.",
  "Пароль не сбросить: ключа от твоих писем у нас нет. Recovery-фразу, которую покажем при регистрации, сохрани.",
  "Пока ящик только принимает письма. Отправка появится в следующих версиях.",
] as const;

export function SecuritySection(): ReactElement {
  return (
    <section aria-labelledby="security" className="scroll-mt-16 border-t border-line py-20">
      <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div className="grid gap-10">
          <SectionHeading id="security" eyebrow="Безопасность" title="Сервер хранит только зашифрованные письма">
            <p>Прочитать их можешь только ты. Даже у нас нет ключа, чтобы заглянуть внутрь.</p>
          </SectionHeading>
          <ul className="grid gap-6">
            {GUARANTEES.map((item) => (
              <li key={item.title} className="grid gap-1 border-l-2 border-red pl-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-steel">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <Card className="grid gap-4">
          <h3 className="font-display text-lg font-medium">Чего мы не обещаем</h3>
          <ul className="grid list-disc gap-3 pl-5 text-steel marker:text-fog">
            {LIMITS.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
          <Link href="/security" className="text-red-soft underline-offset-4 hover:underline">
            Подробнее о модели угроз →
          </Link>
        </Card>
      </Container>
    </section>
  );
}
