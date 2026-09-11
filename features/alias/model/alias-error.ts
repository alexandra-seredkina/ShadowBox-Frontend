import { describeAuthError } from "@/features/auth/model/auth-error";
import { ApiError } from "@/shared/api/api-error";
import type { Messages } from "@/shared/i18n/messages";

type AliasErrorMessages = Messages["aliasesPage"]["errors"];

function isAliasCode(messages: AliasErrorMessages, code: string): code is keyof AliasErrorMessages {
  return Object.hasOwn(messages, code);
}

/** `/aliases` codes first (API.md §6), then the common ones shared with `/auth`. */
export function describeAliasError(
  error: unknown,
  messages: { readonly aliases: AliasErrorMessages; readonly common: Messages["auth"]["errors"] },
): string {
  if (error instanceof ApiError && isAliasCode(messages.aliases, error.code)) return messages.aliases[error.code];
  return describeAuthError(error, messages.common);
}
