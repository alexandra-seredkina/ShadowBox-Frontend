<p align="center">
  <b>English</b> · <a href="README.ru.md">Русский</a> · <a href="README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="public/images/readme-banner.webp" alt="ShadowBox — anonymous encrypted mail" width="100%">
</p>

<h1 align="center">ShadowBox Frontend</h1>

<p align="center">
  <b>The web client of ShadowBox, a mailbox that cannot read your mail.</b><br>
  The website, sign-up, the inbox and all of the cryptography live in the browser.
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
  <a href="#screenshots">Screenshots</a> ·
  <a href="#principles">Principles</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#structure">Structure</a> ·
  <a href="#development">Development</a> ·
  <a href="https://github.com/alexandra-seredkina/ShadowBox-Backend#readme">Project overview and backend</a>
</p>

---

## About the client

ShadowBox is an anonymous mailbox: sign up without a phone number or a name, use a separate address for every site, and every message is encrypted the moment it arrives. The server only stores ciphertext, so decryption and everything that touches keys happens here, in the browser.

Project goals, the threat model, the architecture and how to run the whole stack are described in the [backend README](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme).

## Screenshots

<p align="center">
  <img src="docs/screenshots/landing-hero.webp" alt="Landing page: the headline “Your mail fades into the shadow” and the heroine Kage in a server hall" width="100%">
</p>

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing-how.webp" alt="Three steps with flat illustrations: sign-up, addresses, reading only on your side"></td>
    <td width="50%"><img src="docs/screenshots/landing-security.webp" alt="Security block and the list “What we don't promise”"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing-aliases.webp" alt="Section about permanent and temporary addresses"></td>
    <td width="50%"><img src="docs/screenshots/landing-phishing.webp" alt="Anti-phishing: message labels and the list of checks"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/security-mail-flow.webp" alt="Security page: a message's path from the sender to your browser"></td>
    <td width="50%"><img src="docs/screenshots/security-threat-model.webp" alt="Security page: what we protect and what we don't"></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/mobile-languages.webp" alt="Mobile layout in Russian, English and German" width="85%"><br>
  <sub>Mobile layout in three languages</sub>
</p>

## What is already there

- 🌐 **Landing page and security page** in English, Russian and German, with a language switcher and `hreflang`. The security page explains how mail is encrypted and is honest about what we do not protect.
- 🔐 **Client-side cryptography** on libsodium: Argon2id and HKDF key derivation, X25519 key pair, encrypted private key, `EncryptedBlob` for mail and metadata, a 24-word recovery phrase. Keys live only in memory.
- ⛏ **Proof-of-work** in a Web Worker with honest progress instead of a third-party captcha.
- 🎨 **Design system** following the brand book: colour tokens in `@theme`, dark theme, base components (buttons, fields, threat badges, dialogs, toasts).
- 🔌 **API client** with two implementations, `http` and `mock`. The mocks follow the API contract, including error codes and latency, so the UI can be built without a running backend.

**Next:** sign-up, sign-in and unlock, addresses, folders, reading mail.

## Principles

| | Rule | Why |
| --- | --- | --- |
| 🔑 | Keys live only in the tab's memory, never in `localStorage`, IndexedDB or cookies | XSS or malware with access to browser storage cannot take the key. After a reload the inbox asks for the password again |
| 🔒 | The password never leaves the browser: it yields `authKey` for sign-in and `encKey` for the private key | The server cannot decrypt mail even if it wanted to |
| 🧱 | Strict CSP with a per-request nonce, no `unsafe-inline` or `unsafe-eval` for scripts | An injected script will not run |
| 📦 | No external resources at all: fonts, images and scripts are served from our own origin | No CDNs, analytics or trackers that learn about the visitor |
| 🖼 | HTML mail only inside an isolated `iframe` without scripts, remote images hidden | Tracking pixels never learn that a message was opened |
| 🌍 | The language comes from `Accept-Language` or a link, no cookie | There is nothing to remember about the visitor |

## Tech stack

| | |
| --- | --- |
| **Framework** | Next.js 16 (App Router), React 19, public pages as Server Components |
| **Styles** | Tailwind CSS 4, brand tokens in `app/globals.css` |
| **Fonts** | Unbounded, Onest, JetBrains Mono, bundled in the repo (OFL), the build never goes online |
| **Data** | zod schemas for API responses, one error handler keyed by `error.code` |
| **Cryptography** | `libsodium-wrappers-sumo` (Argon2id, X25519, XChaCha20-Poly1305), WebCrypto HKDF, `@scure/bip39` for the recovery phrase |
| **Quality** | TypeScript with every strict flag, ESLint, Vitest, Semgrep, `npm audit`, Dependabot |

## Structure

```
app/
├── [locale]/              en · ru · de
│   ├── layout.tsx         <html lang>, metadata, Open Graph
│   └── (marketing)/       landing, /security, header and footer
├── fonts/                 brand fonts + OFL licences
└── globals.css            brand tokens
features/
├── crypto/                keys, EncryptedBlob, recovery phrase, PoW worker
├── landing/ui/            landing sections and SVG illustrations
└── security/ui/           security page sections and the mail-flow diagram
shared/
├── api/                   http client, mocks, ApiError
├── config/                public environment variables
├── i18n/                  locales, Accept-Language negotiation, dictionaries
└── ui/                    base components
proxy.ts                   CSP with nonce and locale redirect
```

A new feature lives in `features/<name>/` with its own `ui/`, `model/` and `api/`. Pages in `app/` only compose features.

### Texts and translations

Every interface string lives in `shared/i18n/messages/{en,ru,de}.ts`, including `aria-label`, placeholders and `alt` texts; components never hold copy of their own. The Russian dictionary defines the shape and the other two must match it, so a missing key is a compile error. The tone is the same in every language: calm and informal (“you” / „du“ / «ты»).

## Development

The whole stack (nginx, API, database, web) starts from the [backend repository](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme) with `docker compose up --build` and opens at http://localhost:8080.

Frontend only, without the API, on mocks:

```bash
npm install
NEXT_PUBLIC_API_MODE=mock npm run dev
```

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_MODE` | `http` (default) or `mock` |
| `NEXT_PUBLIC_SITE_URL` | Public site address for Open Graph links, e.g. `https://example.org` |

### Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI runs them on every pull request together with Semgrep and `npm audit`.

### Images

Illustrations live in `public/images/` as WebP without metadata. Markup uses them only through `next/image` with explicit sizes; if an image contains text, the same text is always next to it in HTML.

## License

[AGPL-3.0](LICENSE). Fonts: [SIL Open Font License](app/fonts/).
