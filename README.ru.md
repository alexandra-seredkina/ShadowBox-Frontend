<p align="center">
  <a href="README.md">English</a> · <b>Русский</b> · <a href="README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="public/images/readme-banner.webp" alt="ShadowBox — анонимная зашифрованная почта" width="100%">
</p>

<h1 align="center">ShadowBox Frontend</h1>

<p align="center">
  <b>Веб-клиент ShadowBox — почты, которая не может прочитать твои письма.</b><br>
  Сайт, регистрация, ящик и вся криптография живут в браузере.
</p>

<p align="center">
  <img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-E8334A?style=flat-square">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-14171B?style=flat-square&logo=nextdotjs">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-14171B?style=flat-square&logo=react">
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-14171B?style=flat-square&logo=tailwindcss">
  <img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-14171B?style=flat-square&logo=typescript">
  <img alt="Languages: en, ru, de" src="https://img.shields.io/badge/i18n-en%20·%20ru%20·%20de-14171B?style=flat-square">
</p>

<p align="center">
  <a href="#скриншоты">Скриншоты</a> ·
  <a href="#принципы">Принципы</a> ·
  <a href="#технологии">Технологии</a> ·
  <a href="#структура">Структура</a> ·
  <a href="#разработка">Разработка</a> ·
  <a href="https://github.com/alexandra-seredkina/ShadowBox-Backend#readme">Описание проекта и бэкенд</a>
</p>

---

## О клиенте

ShadowBox — анонимный почтовый ящик: регистрация без телефона и имени, отдельный адрес для каждого сайта, письма шифруются в момент получения. Сервер хранит только шифротекст, поэтому расшифровка и всё, что связано с ключами, происходит здесь — в браузере.

Цели проекта, модель угроз, архитектура и запуск всего стенда описаны в [README бэкенда](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme).

## Скриншоты

<p align="center">
  <img src="docs/screenshots/landing-hero.webp" alt="Главная страница: заголовок «Your mail fades into the shadow» и героиня Kage в серверном зале" width="100%">
</p>

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing-how.webp" alt="Три шага с плоскими иллюстрациями: регистрация, адреса, чтение только у тебя"></td>
    <td width="50%"><img src="docs/screenshots/landing-security.webp" alt="Блок безопасности и список «What we don't promise»"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing-aliases.webp" alt="Раздел про постоянные и временные адреса"></td>
    <td width="50%"><img src="docs/screenshots/landing-phishing.webp" alt="Антифишинг: метки писем и список проверок"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/security-mail-flow.webp" alt="Страница безопасности: путь письма от отправителя до браузера"></td>
    <td width="50%"><img src="docs/screenshots/security-threat-model.webp" alt="Страница безопасности: что защищаем и что нет"></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/mobile-languages.webp" alt="Мобильная версия на русском, английском и немецком" width="85%"><br>
  <sub>Мобильная вёрстка на трёх языках</sub>
</p>

## Что уже есть

- 🌐 **Лендинг и страница безопасности** на английском, русском и немецком с переключателем языка и `hreflang`. Страница безопасности объясняет, как шифруется почта, и честно говорит, от чего мы не защищаем.
- 🔐 **Криптография в браузере** на libsodium: вывод ключей Argon2id + HKDF, пара ключей X25519, зашифрованный приватный ключ, `EncryptedBlob` для писем и метаданных, recovery-фраза из 24 слов. Ключи — только в памяти.
- ⛏ **Proof-of-work** в Web Worker с честным прогрессом вместо капчи сторонних сервисов.
- 🎨 **Дизайн-система** по брендбуку: токены цветов в `@theme`, тёмная тема, базовые компоненты (кнопки, поля, бейджи угроз, диалоги, тосты).
- 🔌 **API-клиент** с двумя реализациями — `http` и `mock`. Моки повторяют контракт API, включая коды ошибок и задержки, поэтому интерфейс разрабатывается без запущенного бэкенда.

**Дальше:** регистрация, вход и разблокировка, адреса, папки, чтение писем.

## Принципы

| | Правило | Почему |
| --- | --- | --- |
| 🔑 | Ключи хранятся только в памяти вкладки — никогда в `localStorage`, IndexedDB или cookie | XSS или малварь с доступом к хранилищу браузера не получат ключ. После перезагрузки — экран разблокировки паролем |
| 🔒 | Пароль не покидает браузер: из него выводятся `authKey` для входа и `encKey` для приватного ключа | Сервер не может расшифровать письма, даже если захочет |
| 🧱 | Строгий CSP с nonce на каждый запрос, без `unsafe-inline` и `unsafe-eval` для скриптов | Внедрённый скрипт не выполнится |
| 📦 | Ни одного внешнего ресурса: шрифты, картинки и скрипты отдаются с нашего origin | Никаких CDN, аналитики и трекеров, которые узнают о посетителе |
| 🖼 | HTML-письма — только в изолированном `iframe` без скриптов, внешние картинки скрыты | Трекинг-пиксели не узнают, что письмо открыто |
| 🌍 | Язык выбирается по `Accept-Language` или ссылкой, без cookie | О посетителе нечего запоминать |

## Технологии

| | |
| --- | --- |
| **Фреймворк** | Next.js 16 (App Router), React 19 — публичные страницы как Server Components |
| **Стили** | Tailwind CSS 4, токены бренда в `app/globals.css` |
| **Шрифты** | Unbounded, Onest, JetBrains Mono — лежат в репозитории (OFL), сборка не ходит в сеть |
| **Данные** | zod-схемы ответов API, единый разбор ошибок по `error.code` |
| **Криптография** | `libsodium-wrappers-sumo` (Argon2id, X25519, XChaCha20-Poly1305), HKDF из WebCrypto, `@scure/bip39` для recovery-фразы |
| **Качество** | TypeScript со всеми строгими флагами, ESLint, Vitest, Semgrep, `npm audit`, Dependabot |

## Структура

```
app/
├── [locale]/              en · ru · de
│   ├── layout.tsx         <html lang>, метаданные, Open Graph
│   └── (marketing)/       лендинг, /security, шапка и футер
├── fonts/                 шрифты бренда + лицензии OFL
└── globals.css            токены бренда
features/
├── crypto/                ключи, EncryptedBlob, recovery-фраза, PoW-воркер
├── landing/ui/            секции лендинга и SVG-иллюстрации
└── security/ui/           секции страницы безопасности и схема пути письма
shared/
├── api/                   http-клиент, моки, ApiError
├── config/                публичные переменные окружения
├── i18n/                  языки, выбор по Accept-Language, словари
└── ui/                    базовые компоненты
proxy.ts                   CSP с nonce и редирект на язык
```

Новая фича живёт в `features/<имя>/` со своими `ui/`, `model/` и `api/`. Страницы в `app/` только собирают фичи.

### Тексты и переводы

Все строки интерфейса — в `shared/i18n/messages/{en,ru,de}.ts`, включая `aria-label`, плейсхолдеры и `alt`; своих текстов у компонентов нет. Русский словарь задаёт форму, английский и немецкий обязаны ей соответствовать: забытый ключ — ошибка компиляции. Тон один на всех языках: спокойно, на «ты» / «you» / «du».

## Разработка

Весь стенд (nginx, API, база, веб) запускается из [репозитория бэкенда](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme) командой `docker compose up --build` и открывается на http://localhost:8080.

Только фронтенд, без API, на моках:

```bash
npm install
NEXT_PUBLIC_API_MODE=mock npm run dev
```

| Переменная | Значение |
| --- | --- |
| `NEXT_PUBLIC_API_MODE` | `http` (по умолчанию) или `mock` |
| `NEXT_PUBLIC_SITE_URL` | Публичный адрес сайта для ссылок Open Graph, например `https://example.org` |

### Проверки

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI запускает их на каждый pull request вместе с Semgrep и `npm audit`.

### Картинки

Иллюстрации лежат в `public/images/` в WebP без метаданных. В вёрстке — только через `next/image` с явными размерами; если на картинке есть текст, рядом всегда есть тот же текст в HTML.

## Лицензия

[AGPL-3.0](LICENSE). Шрифты — [SIL Open Font License](app/fonts/).
