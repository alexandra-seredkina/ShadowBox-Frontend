import type { Locale } from "./locales";

/** API.md §1.3 coarse dates ("2020-01-15") are calendar days in UTC, shown without a time. */
export function formatDay(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

/** Exact moments (ISO 8601 UTC) in the viewer's own time zone. */
export function formatMoment(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}
