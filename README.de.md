<p align="center">
  <a href="README.md">English</a> · <a href="README.ru.md">Русский</a> · <b>Deutsch</b>
</p>

<p align="center">
  <img src="public/images/readme-banner.webp" alt="ShadowBox — anonyme verschlüsselte E-Mail" width="100%">
</p>

<h1 align="center">ShadowBox Frontend</h1>

<p align="center">
  <b>Der Web-Client von ShadowBox, einem Postfach, das deine Post nicht lesen kann.</b><br>
  Website, Registrierung, Postfach und die gesamte Kryptografie laufen im Browser.
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
  <a href="#prinzipien">Prinzipien</a> ·
  <a href="#technologien">Technologien</a> ·
  <a href="#struktur">Struktur</a> ·
  <a href="#entwicklung">Entwicklung</a> ·
  <a href="https://github.com/alexandra-seredkina/ShadowBox-Backend#readme">Projektüberblick und Backend</a>
</p>

---

## Über den Client

ShadowBox ist ein anonymes Postfach: Registrierung ohne Telefonnummer und Namen, eine eigene Adresse für jede Website, und jede Nachricht wird beim Eintreffen verschlüsselt. Der Server speichert nur Chiffretext, deshalb passieren Entschlüsselung und alles rund um Schlüssel hier, im Browser.

Projektziele, Bedrohungsmodell, Architektur und der Start der gesamten Umgebung stehen im [README des Backends](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme).

## Screenshots

<p align="center">
  <img src="public/images/screen-inbox.webp" alt="Posteingang: links Ordner und Labels, in der Mitte die Nachrichtenliste, rechts ein geöffneter Newsletter" width="100%"><br>
  <sub>Drei Spalten: Ordner und Labels, die Liste, die geöffnete Nachricht. Phishing ist schon in der Liste markiert.</sub>
</p>

<table>
  <tr>
    <td width="50%"><img src="public/images/screen-phishing.webp" alt="Eine Phishing-Nachricht: eine rote Warnung mit Gründen und ein Link, der eine Website zeigt, aber zu einer anderen führt"><br><sub>Phishing-Warnung in klaren Worten</sub></td>
    <td width="50%"><img src="public/images/screen-addresses.webp" alt="Adressliste: jede Adresse mit ihrem Ordner und ihren Labels"><br><sub>Eine Adresse für jede Website</sub></td>
  </tr>
</table>

## Was schon da ist

- 📬 **Ein Postfach in drei Spalten** wie ein Desktop-Client: links Ordner und Labels, kompakte zweizeilige Zeilen, rechts die geöffnete Nachricht. Auf dem Handy gleiten die Ordner als Seitenleiste herein.
- 🗂 **Ordner und Labels nach Adresse.** Wähle einmal Ordner und Labels für eine Adresse, und neue Post wird beim Eingang sortiert. Markiert, Archiv, Sammelaktionen, Suche in entschlüsselten Vorschauen.
- 🎣 **Sichtbarer Phishing-Schutz.** Ein Banner mit den Gründen in klaren Worten, die echte Absenderadresse, SPF-, DKIM- und DMARC-Ergebnisse, die echte Website neben jedem Link, abgeschaltete Links in gefährlicher Post, Warnungen vor Programmen und Makro-Dokumenten.
- 🚫 **Absender blockieren.** Ihre neue Post landet direkt im Spam; der Server speichert nur einen Hash mit Schlüssel und eine mit deinem Schlüssel versiegelte Kopie.
- 🔐 **Kryptografie im Browser** mit libsodium: Schlüsselableitung mit Argon2id und HKDF, X25519-Schlüsselpaar, verschlüsselter privater Schlüssel, `EncryptedBlob` für Post und Metadaten, eine Wiederherstellungsphrase aus 24 Wörtern. Schlüssel leben nur im Speicher.
- ⛏ **Proof-of-Work** in einem Web Worker mit ehrlichem Fortschritt statt eines fremden Captchas.
- 🌐 **Startseite und Sicherheitsseite** auf Englisch, Russisch und Deutsch mit Sprachumschalter und `hreflang`.
- 🎨 **Designsystem** nach dem Brandbook: Farbtokens in `@theme`, eigene Icons, Kage-Sticker in leeren Zuständen, beim Entsperren und bei der Registrierung.
- 🔌 **API-Client** mit zwei Implementierungen, `http` und `mock`. Die Mocks folgen dem API-Vertrag, sodass die Oberfläche ohne laufendes Backend entsteht.

**Als Nächstes:** Post versenden, Wiederherstellung mit der Phrase.

## Prinzipien

| | Regel | Warum |
| --- | --- | --- |
| 🔑 | Schlüssel leben nur im Speicher des Tabs, nie in `localStorage`, IndexedDB oder Cookies | XSS oder Malware mit Zugriff auf den Browserspeicher bekommt den Schlüssel nicht. Nach einem Neuladen fragt das Postfach erneut nach dem Passwort |
| 🔒 | Das Passwort verlässt den Browser nie: daraus entstehen `authKey` für die Anmeldung und `encKey` für den privaten Schlüssel | Der Server kann die Post nicht entschlüsseln, selbst wenn er wollte |
| 🧱 | Strikte CSP mit Nonce pro Anfrage, ohne `unsafe-inline` und `unsafe-eval` für Skripte | Ein eingeschleustes Skript wird nicht ausgeführt |
| 📦 | Keine externen Ressourcen: Schriften, Bilder und Skripte kommen von unserem eigenen Origin | Keine CDNs, Analytics oder Tracker, die etwas über Besucher erfahren |
| 🖼 | HTML-Mails nur in einem isolierten `iframe` ohne Skripte, externe Bilder ausgeblendet | Tracking-Pixel erfahren nicht, dass eine Nachricht geöffnet wurde |
| 🌍 | Die Sprache kommt aus `Accept-Language` oder einem Link, ohne Cookie | Über Besucher gibt es nichts zu speichern |

## Technologien

| | |
| --- | --- |
| **Framework** | Next.js 16 (App Router), React 19, öffentliche Seiten als Server Components |
| **Styles** | Tailwind CSS 4, Marken-Tokens in `app/globals.css` |
| **Schriften** | Unbounded, Onest, JetBrains Mono, im Repo enthalten (OFL), der Build geht nie ins Netz |
| **Daten** | zod-Schemas für API-Antworten, eine Fehlerbehandlung nach `error.code` |
| **Kryptografie** | `libsodium-wrappers-sumo` (Argon2id, X25519, XChaCha20-Poly1305), HKDF aus WebCrypto, `@scure/bip39` für die Recovery-Phrase |
| **Qualität** | TypeScript mit allen strikten Flags, ESLint, Vitest, Semgrep, `npm audit`, Dependabot |

## Struktur

```
app/
├── [locale]/              en · ru · de
│   ├── layout.tsx         <html lang>, Metadaten, Open Graph
│   ├── (app)/app/         Postfach, Adressen, Einstellungen
│   └── (marketing)/       Startseite, /security, Kopf- und Fußzeile
├── fonts/                 Markenschriften + OFL-Lizenzen
└── globals.css            Marken-Tokens
features/
├── alias/                 Adressen, ihre Ordner und Labels
├── auth/                  Registrierung, Anmeldung, Entsperren, App-Schutz
├── blocked-sender/        Absender blockieren, Liste in den Einstellungen
├── crypto/                Schlüssel, EncryptedBlob, Wiederherstellungsphrase, PoW-Worker
├── folder/ · label/       Ordner und Labels, verschlüsselte Namen
├── landing/ui/            Abschnitte der Startseite und SVG-Illustrationen
├── mailbox/ui/            drei Spalten, Seitenleiste, Zuordnungsdialoge
├── message/               Liste, geöffnete Nachricht, Link- und Anhangsprüfung, isolierter Frame
└── security/ui/           Abschnitte der Sicherheitsseite und das Postweg-Diagramm
shared/
├── api/                   HTTP-Client, Mocks, ApiError
├── config/                öffentliche Umgebungsvariablen
├── i18n/                  Sprachen, Auswahl per Accept-Language, Wörterbücher
└── ui/                    Basiskomponenten
proxy.ts                   CSP mit Nonce und Weiterleitung auf die Sprache
```

Ein neues Feature lebt in `features/<name>/` mit eigenem `ui/`, `model/` und `api/`. Seiten in `app/` setzen Features nur zusammen.

### Texte und Übersetzungen

Alle Texte der Oberfläche stehen in `shared/i18n/messages/{en,ru,de}.ts`, auch `aria-label`, Platzhalter und `alt`-Texte; Komponenten haben keine eigenen Texte. Das russische Wörterbuch gibt die Form vor, die anderen beiden müssen ihr entsprechen, ein fehlender Schlüssel ist also ein Kompilierfehler. Der Ton ist in allen Sprachen gleich: ruhig und per du.

## Entwicklung

Die gesamte Umgebung (nginx, API, Datenbank, Web) startet aus dem [Backend-Repository](https://github.com/alexandra-seredkina/ShadowBox-Backend#readme) mit `docker compose up --build` und läuft unter http://localhost:8080.

Nur das Frontend, ohne API, mit Mocks:

```bash
npm install
NEXT_PUBLIC_API_MODE=mock npm run dev
```

| Variable | Wert |
| --- | --- |
| `NEXT_PUBLIC_API_MODE` | `http` (Standard) oder `mock` |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Adresse der Website für Open-Graph-Links, z. B. `https://example.org` |

### Prüfungen

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Die CI führt sie bei jedem Pull Request zusammen mit Semgrep und `npm audit` aus.

### Bilder

Illustrationen liegen in `public/images/` als WebP ohne Metadaten. Im Markup nur über `next/image` mit expliziten Größen; enthält ein Bild Text, steht derselbe Text immer daneben im HTML. Kage-Sticker für leere Zustände liegen in `public/stickers/` als transparentes WebP; sie sind dekorativ, daher ist `alt` leer und der Text daneben sagt dasselbe.

## Lizenz

[AGPL-3.0](LICENSE). Schriften: [SIL Open Font License](app/fonts/).
