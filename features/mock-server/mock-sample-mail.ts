import type { IncomingMail } from "./mock-mail-delivery";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
/** More than one page of `GET /messages`, so infinite scroll has something to load. */
const DIGEST_COUNT = 55;

const PASSED = { spf: "pass", dkim: "pass", dmarc: "pass" } as const;

const bytes = (text: string): Uint8Array => new TextEncoder().encode(text);

// A few hand-made cases cover every label and every part of the message view; the digests are filler.
const PHISHING: IncomingMail = {
  from: { name: "support@northwind-bank.example", address: "alerts@northwind-bank.example.verify-session.example" },
  subject: "Your account has been limited",
  text: "We noticed unusual activity. Confirm your identity within 24 hours: https://northwind-bank.example/secure",
  html: [
    "<p>Dear customer,</p>",
    "<p>We noticed unusual activity on your account. Confirm your identity within 24 hours or it will be closed.</p>",
    '<p><a href="http://northwind-bank.example.verify-session.example/login">https://northwind-bank.example/secure</a></p>',
    '<form action="http://verify-session.example/collect"><input name="password"></form>',
    '<script>document.title = "x"</script>',
    "<p>Northwind Bank security team</p>",
  ].join(""),
  markers: ["AUTH_FAILED", "DISPLAY_NAME_SPOOF", "LINK_MISMATCH"],
  auth: { spf: "fail", dkim: "none", dmarc: "fail" },
};

const NEWSLETTER: IncomingMail = {
  from: { name: "Ferris Weekly", address: "news@ferris.example" },
  subject: "Five quiet places to read this autumn ✓",
  text: "Our autumn picks: a lighthouse library, a station café and three more. Read the issue online.",
  html: [
    '<div style="font-family: Georgia, serif; max-width: 560px">',
    '<img src="https://cdn.ferris.example/banner.jpg" alt="Autumn issue" width="560">',
    "<h1>Five quiet places to read</h1>",
    "<p>Our autumn picks: a lighthouse library, a station café and three more.</p>",
    '<p><a href="https://ferris.example/issues/42">Read the issue online</a></p>',
    '<img src="https://track.ferris.example/open.gif?u=8c1f" width="1" height="1" alt="">',
    "</div>",
  ].join(""),
  markers: [],
  auth: PASSED,
};

const EXECUTABLE_INVOICE: IncomingMail = {
  from: { name: "Accounts", address: "billing@invoices.example" },
  subject: "Invoice 4471 is overdue",
  text: "Please see the attached invoice and pay it today to avoid a late fee.",
  attachments: [
    { filename: "invoice_4471.pdf.exe", contentType: "application/octet-stream", content: bytes("MZ\u0090\u0000 not a real program") },
  ],
  markers: ["DANGEROUS_ATTACHMENT"],
  auth: PASSED,
};

const LOOKALIKE: IncomingMail = {
  // The "і" in the domain is Cyrillic.
  from: { name: "Kitsune Cloud", address: "security@kіtsune.example" },
  subject: "New sign-in from Windows",
  text: "Someone signed in to your Kitsune Cloud account. If this wasn't you, reset your password now.",
  markers: ["LOOKALIKE_DOMAIN"],
  auth: { spf: "none", dkim: "none", dmarc: "none" },
};

const TICKET: IncomingMail = {
  from: { name: "Coastline Rail", address: "tickets@rail.example" },
  subject: "Your ticket: Harbour → Old Town, Saturday",
  text: "Your seat is 14B in coach 3. The ticket is attached; show it on your phone or print it.",
  attachments: [
    {
      filename: "ticket-14B.pdf",
      contentType: "application/pdf",
      content: bytes("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n"),
    },
  ],
  markers: [],
  auth: PASSED,
};

function digest(issue: number): IncomingMail {
  return {
    from: { name: "Morning Digest", address: "digest@news.example" },
    subject: `Morning digest #${issue}`,
    text: `Issue ${issue}: three short reads for your coffee, one long read for the weekend and a crossword.`,
    markers: [],
    auth: PASSED,
  };
}

export type ScheduledMail = { readonly mail: IncomingMail; readonly receivedAt: Date };

/** What a fresh mock account finds in its inbox, oldest first so "first message" lands right. */
export function sampleMailbox(now: number): ScheduledMail[] {
  const digests = Array.from({ length: DIGEST_COUNT }, (_, index) => ({
    mail: digest(index + 1),
    receivedAt: new Date(now - (DIGEST_COUNT - index) * DAY_MS - 7 * HOUR_MS),
  }));
  const featured = [
    { mail: TICKET, receivedAt: new Date(now - 2 * DAY_MS) },
    { mail: LOOKALIKE, receivedAt: new Date(now - DAY_MS) },
    { mail: EXECUTABLE_INVOICE, receivedAt: new Date(now - 5 * HOUR_MS) },
    { mail: NEWSLETTER, receivedAt: new Date(now - 2 * HOUR_MS) },
    { mail: PHISHING, receivedAt: new Date(now - 20 * MINUTE_MS) },
  ];
  return [...digests, ...featured];
}

/** A site confirming a sign-up, the usual first mail to a temporary address. */
export function confirmationMail(address: string): IncomingMail {
  return {
    from: { name: "Lumen Store", address: "hello@lumen-store.example" },
    subject: "Confirm your email address",
    text: `Thanks for signing up with ${address}. Confirm it here: https://lumen-store.example/confirm?t=4f2a`,
    html: `<p>Thanks for signing up with <b>${address}</b>.</p><p><a href="https://lumen-store.example/confirm?t=4f2a">Confirm my email</a></p>`,
    markers: [],
    auth: PASSED,
  };
}
