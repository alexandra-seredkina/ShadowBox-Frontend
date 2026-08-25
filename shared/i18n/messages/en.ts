import type { Messages } from "./ru";

export const en: Messages = {
  meta: {
    title: "ShadowBox — anonymous encrypted mail",
    description:
      "Mail with no phone number and no name: a separate address for every site, messages encrypted on arrival and readable only in your browser.",
    ogImageAlt: "ShadowBox — anonymous encrypted mail",
    ogLocale: "en_US",
  },
  header: {
    homeLabel: "ShadowBox, home",
    navLabel: "Sections",
    nav: { how: "How it works", aliases: "Addresses", phishing: "Anti-phishing", security: "Security" },
    signIn: "Sign in",
    signUp: "Create inbox",
    languageLabel: "Language",
  },
  footer: { security: "Security", source: "Source code" },
  hero: {
    eyebrow: "Anonymous mail",
    titleStart: "Your mail fades into the",
    titleAccent: "shadow",
    lede: "An inbox with no phone number and no name. Use a separate address for every site: messages are encrypted the moment they arrive, and only you can read them.",
    primary: "Create inbox",
    secondary: "How protection works",
    facts: ["No phone", "No name", "Encrypted on arrival"],
    imageAlt:
      "A young woman with a red bob stands on a walkway in a server hall, an envelope above her palm dissolving into pixels",
  },
  how: {
    eyebrow: "How it works",
    title: "Three steps to a quiet inbox",
    steps: [
      {
        title: "No name, no phone",
        text: "Pick a login and a password. Instead of a captcha, your browser solves a small puzzle for a couple of seconds, and the inbox is ready.",
      },
      {
        title: "An address for every site",
        text: "One address for the shop, another for social media, a third for the bank. A leak of one reveals nothing about the others.",
      },
      {
        title: "Only you can read it",
        text: "Each message is encrypted with your key as soon as it arrives. The key only unlocks in your browser after you enter your password.",
      },
    ],
    illustration: {
      login: "Login",
      password: "Password",
      addresses: ["Shop", "Social", "News", "Bank"],
    },
  },
  security: {
    eyebrow: "Security",
    title: "The server only stores encrypted mail",
    lede: "Only you can read it. Not even we have a key to look inside.",
    guarantees: [
      {
        title: "Your password never reaches the server",
        text: "Your browser derives two keys from it: one to sign in, the other unlocks your private key. The server only gets the first.",
      },
      {
        title: "Only ciphertext in the database",
        text: "Messages, subjects, address labels and folder names are encrypted. A leaked database dump won't reveal them.",
      },
      {
        title: "We don't keep IP addresses",
        text: "The database holds a hash with a rotating key instead, for no longer than 30 days. You see your sessions and can end any of them.",
      },
    ],
    limitsTitle: "What we don't promise",
    limits: [
      "Mail from regular providers arrives over SMTP in plain text. The server sees it at the moment of delivery, before encryption.",
      "Metadata is visible to the server: arrival time, the address it was sent to and its size.",
      "Your password can't be reset: we don't have the key to your mail. Keep the recovery phrase we show you at sign-up.",
      "For now the inbox only receives mail. Sending comes in a later version.",
    ],
    more: "More about the threat model →",
  },
  aliases: {
    eyebrow: "Addresses",
    title: "An address for every occasion",
    ledeStart: "Nobody sees your inbox. Only random addresses like",
    ledeEnd: " go out, linked neither to your login nor to each other.",
    facts: [
      { title: "Permanent", text: "for your bank and services you use for years." },
      { title: "Temporary", text: "for 1 hour, 24 hours, 7 or 30 days. Then it switches off by itself." },
      { title: "Label and folder", text: "mail to your “Shopping” address goes straight to its folder. Labels are encrypted." },
      {
        title: "Leaked?",
        text: "delete the address. Your inbox stays untouched, and a deleted address is never given to anyone else.",
      },
    ],
    imageAlt:
      "A young woman sits in space with a laptop, red envelope addresses beaming out of it, one dissolving into pixels",
  },
  phishing: {
    eyebrow: "Anti-phishing",
    title: "Suspicious mail stands out at once",
    lede: "Every incoming message is checked with SPF, DKIM and DMARC and scanned for common phishing tricks. Next to it you get a label and a plain-language explanation.",
    badgesLabel: "Label examples",
    badges: { safe: "Known sender", caution: "First message", danger: "Looks like phishing", alias: "Temporary address" },
    note: "Remote images in messages are hidden, so a tracking pixel won't learn you opened the mail. A label is a hint, not a guarantee: the decision is yours.",
    checks: [
      "Sender failed the DMARC check",
      "Sender name pretends to be a different address",
      "Domain built from look-alike letters of other alphabets",
      "Link text doesn't match the real address",
      "Executable attachments and documents with macros",
    ],
    imageAlt: "A young woman stops phishing emails with a red shield",
  },
  cta: {
    title: "Get an inbox in a minute",
    text: "A login and a password. Nothing else.",
    button: "Create inbox",
  },
};
