import type { Locale } from "./locales";
import { de } from "./messages/de";
import { en } from "./messages/en";
import { ru, type Messages } from "./messages/ru";

const MESSAGES: Readonly<Record<Locale, Messages>> = { ru, en, de };

export type { Messages };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
