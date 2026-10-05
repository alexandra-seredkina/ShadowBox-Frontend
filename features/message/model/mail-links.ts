/** Something that reads as a domain to a person: labels joined by dots, ending in letters. */
const DOMAIN_IN_TEXT = /(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+\p{L}{2,63}/gu;
const URL_IN_TEXT = /\bhttps?:\/\/[^\s<>"')\]]+/giu;
const MAX_LINKS = 200;

/** A link as the reader sees it and where it really goes. */
export type MailLink = {
  readonly href: string;
  /** What the message shows for it; for bare URLs in plain text, the URL itself. */
  readonly text: string;
  /** Host the link opens, in ASCII (punycode) form. */
  readonly host: string;
  /** The domain the text claims, when it names one. */
  readonly shownHost: string | null;
  /** The text names a different site than the one the link opens. */
  readonly isMismatch: boolean;
};

/** Lower-case ASCII form of a host name, or null when it is not one. */
export function asciiHost(host: string): string | null {
  const url = `http://${host}/`;
  return URL.canParse(url) ? new URL(url).hostname : null;
}

/** Host of an http(s) link; null for mailto:, javascript: and anything else. */
export function webHost(href: string): string | null {
  if (!URL.canParse(href)) return null;
  const url = new URL(href);
  return url.protocol === "http:" || url.protocol === "https:" ? url.hostname : null;
}

/** The same host, or one is a subdomain of the other (paypal.com and www.paypal.com). */
export function isSameSite(a: string, b: string): boolean {
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

function shownHostOf(text: string, target: string): { shownHost: string | null; isMismatch: boolean } {
  const shown = (text.slice(0, 1000).match(DOMAIN_IN_TEXT) ?? []).map(asciiHost).filter((host): host is string => host !== null);
  const mismatched = shown.find((host) => !isSameSite(host, target));
  return { shownHost: mismatched ?? shown[0] ?? null, isMismatch: mismatched !== undefined };
}

/** One entry per distinct web link; links that go nowhere on the web are left out. */
export function analyzeLinks(raw: readonly { readonly href: string; readonly text: string }[]): MailLink[] {
  const seen = new Set<string>();
  const links: MailLink[] = [];
  for (const { href, text } of raw) {
    const host = webHost(href.trim());
    const shown = text.replace(/\s+/gu, " ").trim();
    const key = `${href}\u0000${shown}`;
    if (host === null || seen.has(key)) continue;
    seen.add(key);
    links.push({ href: href.trim(), text: shown || href.trim(), host, ...shownHostOf(shown, host) });
    if (links.length >= MAX_LINKS) break;
  }
  return links;
}

/** Bare URLs in a plain-text body: what they show is what they open. */
export function linksInText(text: string): { href: string; text: string }[] {
  return Array.from(text.matchAll(URL_IN_TEXT), (match) => ({ href: match[0], text: match[0] }));
}
