# **ShadowBox Frontend**

Веб-интерфейс ShadowBox, анонимной и безопасной электронной почты.

Описание проекта, модель угроз и инструкции по запуску находятся в репозитории [ShadowBox-Backend](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme).

## Стек

- Next.js 16 (App Router), React 19
- Tailwind CSS 4
- Content Security Policy с nonce на каждый запрос (`proxy.ts`)

## Разработка

Фронтенд запускается вместе с остальными сервисами через `docker compose up --build` из репозитория бэкенда. Отдельно, без API:

```bash
npm install
npm run dev
```

## Лицензия

[AGPL-3.0](LICENSE)
