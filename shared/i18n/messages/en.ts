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
  securityPage: {
    meta: {
      title: "Security",
      description:
        "How ShadowBox encrypts mail, what the server sees and where protection ends. An honest threat model.",
    },
    intro: {
      eyebrow: "Security",
      title: "How protection works",
      lede: "How a message reaches you, who can see what along the way, and where our protection ends. No big promises.",
    },
    flow: {
      eyebrow: "A message's path",
      title: "From the sender to your screen",
      lede: "The plain text of a message exists with the sender and in your browser. And for a moment in our server's memory while it receives the message.",
      steps: [
        {
          title: "Sender",
          text: "The message reaches us over SMTP like any email. The connection is protected by TLS, but the message itself arrives as plain text: that is how the protocol works.",
        },
        {
          title: "Arrival on the server",
          text: "The server checks SPF, DKIM and DMARC, looks for signs of phishing and immediately encrypts the message with your public key. Plain text exists only in memory and never reaches the disk or the logs.",
        },
        {
          title: "Storage",
          text: "The database holds ciphertext: sender, subject, body and attachments. Only your private key can open it, and the server does not have it.",
        },
        {
          title: "Your browser",
          text: "After you enter your password, the browser unlocks your private key and decrypts your mail. The key lives only in the tab's memory and is gone after a reload.",
        },
      ],
      diagram: {
        smtp: "SMTP",
        captions: ["plain text", "memory only", "ciphertext only", "decrypted here"],
      },
    },
    keys: {
      eyebrow: "Password and keys",
      title: "Your password never reaches the server",
      items: [
        {
          title: "Two keys from one password",
          text: "Your browser runs the password through Argon2id and derives a sign-in key and an encryption key from the result. The server only gets the sign-in key, and the password cannot be recovered from it.",
        },
        {
          title: "Your private key stays locked",
          text: "At sign-up your browser creates an X25519 key pair. The server uses the public key to encrypt incoming mail. The private key is stored only encrypted with your encryption key.",
        },
        {
          title: "Recovery phrase",
          text: "24 words that unlock a second copy of your private key. We show the phrase once, and it never reaches the server. Recovery with it comes later, but you need to save it now.",
        },
        {
          title: "Instead of a captcha",
          text: "To stop mass sign-ups, your browser solves a small puzzle for a couple of seconds. No third-party captchas and none of their scripts.",
        },
      ],
    },
    model: {
      eyebrow: "Threat model",
      title: "What we protect and what we don't",
      lede: "We assume the worst: the adversary may be anyone who got a full dump of the database, logs and disk. Including us.",
      protectsTitle: "We protect",
      protects: [
        "Message contents if the database or a backup leaks: there is only ciphertext.",
        "Your password: the server never receives it, neither at sign-up nor at sign-in.",
        "The link between your addresses: they are random and reveal neither your login nor each other.",
        "Whether you opened a message: external images and tracking pixels are hidden.",
        "Address labels and folder names: they are encrypted in your browser.",
        "Sessions: the cookie is out of reach for scripts, any session can be ended, and by default it is bound to your IP.",
      ],
      limitsTitle: "We don't protect",
      limits: [
        "A message at the moment it arrives. Regular mail comes in as plain text, and a compromised server could read new messages before encryption. Messages already stored stay closed.",
        "Metadata. The server sees when and to which address a message arrived, its size and the sender checks.",
        "Tampered site code. The app is loaded from our server. If the server is compromised, your browser could be served code that captures your password.",
        "An infected device. Malware or a browser extension that can see the open tab can see your mail too.",
        "A weak password. With a database dump, the password can be guessed offline. Argon2id makes every guess expensive, but only a long unique password really helps.",
        "Your IP while you are connected. The server sees it, even though it does not store it. If that matters, connect through Tor or a VPN.",
        "A forgotten password together with a lost phrase. Without them nobody can restore access or your mail, including us.",
      ],
    },
    adversaries: {
      title: "Who might attack and what they get",
      whoLabel: "Who",
      getsLabel: "What they get",
      rows: [
        {
          who: "Outside attacker",
          gets: "Guessing and phishing run into rate limits, proof-of-work and threat labels. Message HTML is shown in an isolated frame without scripts.",
        },
        {
          who: "Owner of another account",
          gets: "Nothing. Every request checks that the resource is yours, and someone else's looks like it does not exist.",
        },
        {
          who: "Session thief",
          gets: "The cookie is out of reach for scripts and holds no encryption keys. Deleting the account or a permanent address asks for the password again.",
        },
        {
          who: "Database or backup leak",
          gets: "Encrypted mail, encrypted keys, IP hashes and metadata. Mail stays unreadable without your password, but a weak password can be guessed.",
        },
        {
          who: "Server operator",
          gets: "Metadata and new messages at the moment they arrive. Stored mail stays closed to them without your password.",
        },
        {
          who: "Spammer",
          gets: "Every sign-up costs computation and runs into limits.",
        },
      ],
    },
    data: {
      title: "What we store about you",
      storedTitle: "Stored",
      stored: [
        "Your login. It is only used to sign in and is never shown to anyone.",
        "A hash of your sign-in key and the salt for deriving keys.",
        "Your public key and two encrypted copies of the private one.",
        "Your addresses, their encrypted labels and folders.",
        "Messages as ciphertext, plus arrival time, size and sender check results.",
        "Sessions: browser and OS without details, dates to the day, an IP hash for 30 days at most.",
      ],
      neverTitle: "Never stored",
      never: [
        "Phone number, backup email, name.",
        "Your password and recovery phrase.",
        "Your IP address in the clear and the full User-Agent.",
        "Analytics, trackers, third-party scripts and fonts.",
      ],
    },
  },
};
