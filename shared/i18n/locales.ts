export const LOCALES = ["ru", "en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

/** Used when the browser asks for none of the supported languages. */
export const FALLBACK_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

/** Prefixes an app path ("/security", "/#how") with the locale segment. */
export function localizePath(locale: Locale, path: string): string {
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}
