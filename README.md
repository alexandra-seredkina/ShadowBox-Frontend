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

### The mailbox

<p align="center">
  <img src="public/images/screen-inbox.webp" alt="Inbox: folders and labels on the left, the message list in the middle, an opened newsletter on the right" width="100%"><br>
  <sub>Three panes: folders and labels, the list, the open message. Phishing is marked right in the list.</sub>
</p>

<table>
  <tr>
    <td width="50%"><img src="public/images/screen-phishing.webp" alt="A phishing message: a red warning that explains why, and a link that shows one site but leads to another"><br><sub>A phishing warning in plain words</sub></td>
    <td width="50%"><img src="public/images/screen-folders.webp" alt="The Shopping folder: mail to the shopping address lands here with the Receipts label"><br><sub>Mail sorts itself by address</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="public/images/screen-addresses.webp" alt="Address list: each address with its folder and labels"><br><sub>An address for every site</sub></td>
    <td width="50%"><img src="docs/screenshots/landing-tour.webp" alt="Landing section “What it looks like” with screenshots of the mailbox"><br><sub>The landing page shows the real client</sub></td>
  </tr>
</table>

### The website

<p align="center">
  <img src="docs/screenshots/landing-hero.webp" alt="Landing page: the headline “Your mail fades into the shadow” and the heroine Kage in a server hall" width="100%">
</p>

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing-how.webp" alt="Three steps with flat illustrations and Kage sitting on an envelope"></td>
    <td width="50%"><img src="docs/screenshots/landing-security.webp" alt="Security block over art: Kage pours encrypted pixels into a box while shadows watch through frosted glass"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/landing-aliases.webp" alt="Section about permanent and temporary addresses"></td>
    <td width="50%"><img src="docs/screenshots/landing-phishing.webp" alt="Anti-phishing: message labels and the list of checks"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/security-intro.webp" alt="Security page header with Kage on a walkway holding a red envelope"></td>
    <td width="50%"><img src="docs/screenshots/security-keys.webp" alt="Password and keys: two keys from one password, next to a sealed glass envelope"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/security-mail-flow.webp" alt="Security page: a message's path from the sender to your browser"></td>
    <td width="50%"><img src="docs/screenshots/security-threat-model.webp" alt="What we protect and what we don't, under watching eyes that fall apart into pixels"></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/mobile-languages.webp" alt="Mobile layout in Russian, English and German" width="85%"><br>
  <sub>Mobile layout in three languages</sub>
</p>

## What is already there

- 📬 **A three-pane mailbox** like a desktop client: folders and labels on the left, compact two-line rows, the open message on the right. On a phone the folders slide in as a drawer.
- 🗂 **Folders and labels by address.** Pick a folder and labels for an address once, and its new mail is sorted on arrival. Starred, archive, bulk actions, search over decrypted previews.
- 🎣 **Phishing protection you can see.** A banner with the reasons in plain words, the sender's real address, SPF, DKIM and DMARC results, the real site next to every link, links switched off in dangerous mail, warnings for programs and macro documents.
- 🚫 **Blocking senders.** Their new mail goes straight to spam; the server keeps only a keyed hash and a copy sealed with your key.
- 🔐 **Client-side cryptography** on libsodium: Argon2id and HKDF key derivation, X25519 key pair, encrypted private key, `EncryptedBlob` for mail and metadata, a 24-word recovery phrase. Keys live only in memory.
- ⛏ **Proof-of-work** in a Web Worker with honest progress instead of a third-party captcha.
- 🌐 **Landing page and security page** in English, Russian and German, with a language switcher and `hreflang`.
- 🎨 **Design system** following the brand book: colour tokens in `@theme`, hand-drawn icons, Kage stickers in empty states, on the unlock screen and at sign-up.
- 🔌 **API client** with two implementations, `http` and `mock`. The mocks follow the API contract, so the UI can be built without a running backend.

**Next:** sending mail, recovery with the phrase.

<table>
  <tr>
    <td width="50%"><img src="public/images/readme-sorted-addresses.webp" alt="Kage hangs envelopes labelled shop, bank, forum and games on hooks; one dissolves into red pixels"></td>
    <td width="50%"><img src="public/images/readme-burn-address.webp" alt="Kage burns a temporary address card; the envelopes behind it fly into the inbox box"></td>
  </tr>
</table>
<p align="center"><sub>An address for every site, and a temporary one burns out by itself</sub></p>

## Principles

<p align="center">
  <img src="public/images/readme-private-reading.webp" alt="Kage reads mail on a laptop while blurred figures peer through the glass and see only pixels" width="100%">
</p>

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
│   ├── (app)/app/         mailbox, addresses, settings
│   └── (marketing)/       landing, /security, header and footer
├── fonts/                 brand fonts + OFL licences
└── globals.css            brand tokens
features/
├── alias/                 addresses, their folders and labels
├── auth/                  sign-up, sign-in, unlock, app gate
├── blocked-sender/        blocking senders, list in settings
├── crypto/                keys, EncryptedBlob, recovery phrase, PoW worker
├── folder/ · label/       folders and labels, encrypted names
├── landing/ui/            landing sections and SVG illustrations
├── mailbox/ui/            three-pane layout, sidebar, routing dialogs
├── message/               list, open message, link and attachment checks, sandboxed frame
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

Illustrations live in `public/images/` as WebP without metadata. Markup uses them only through `next/image` with explicit sizes; if an image contains text, the same text is always next to it in HTML. Kage stickers for empty states live in `public/stickers/` as transparent WebP; they are decorative, so their `alt` is empty and the text next to them says the same.

## License

[AGPL-3.0](LICENSE). Fonts: [SIL Open Font License](app/fonts/).
