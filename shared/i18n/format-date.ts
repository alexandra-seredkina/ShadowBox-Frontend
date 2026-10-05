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

/** List time: the hour for today, the day for this year, the full date before that. */
export function formatListTime(iso: string, locale: Locale, now: Date = new Date()): string {
  const moment = new Date(iso);
  const isToday = moment.toDateString() === now.toDateString();
  if (isToday) return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(moment);
  const isThisYear = moment.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(locale, isThisYear ? { day: "numeric", month: "short" } : { day: "2-digit", month: "2-digit", year: "2-digit" }).format(
    moment,
  );
}

/** Full date and time for the open message. */
export function formatFullMoment(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
