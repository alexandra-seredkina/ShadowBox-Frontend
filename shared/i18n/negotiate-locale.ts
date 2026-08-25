import { FALLBACK_LOCALE, isLocale, type Locale } from "./locales";

type WeightedLanguage = { readonly language: string; readonly quality: number };

function parseAcceptLanguage(header: string): WeightedLanguage[] {
  return header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qualityParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qualityParam ? Number(qualityParam.trim().slice(2)) : 1;
      return { language: tag.toLowerCase().split("-")[0] ?? "", quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.language !== "" && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return FALLBACK_LOCALE;
  const match = parseAcceptLanguage(acceptLanguage).find((entry) => isLocale(entry.language));
  return match && isLocale(match.language) ? match.language : FALLBACK_LOCALE;
}
