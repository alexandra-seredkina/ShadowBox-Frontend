# **ShadowBox Frontend**

Веб-интерфейс ShadowBox, анонимной и безопасной электронной почты.

Описание проекта, модель угроз и инструкции по запуску находятся в репозитории [ShadowBox-Backend](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme).

## Стек

- Next.js 16 (App Router), React 19
- Tailwind CSS 4
- Content Security Policy с nonce на каждый запрос (`proxy.ts`)
- zod для проверки ответов API, Vitest для тестов
- Интерфейс на русском, английском и немецком: `/ru`, `/en`, `/de`; без префикса язык выбирается по `Accept-Language`

## Разработка

Фронтенд запускается вместе с остальными сервисами через `docker compose up --build` из репозитория бэкенда. Отдельно, без API, на моках:

```bash
npm install
NEXT_PUBLIC_API_MODE=mock npm run dev
```

`NEXT_PUBLIC_API_MODE` выбирает реализацию API-клиента: `http` (по умолчанию) или `mock`. Моки повторяют контракт API, включая ошибки и задержки.

Проверки:

```bash
npm run typecheck
npm run lint
npm test
```

## Лицензия

[AGPL-3.0](LICENSE)
