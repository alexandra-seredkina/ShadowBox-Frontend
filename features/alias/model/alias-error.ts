import { describeErrorWith } from "@/features/auth/model/auth-error";
import type { Messages } from "@/shared/i18n/messages";

/** `/aliases` codes first (API.md §6), then the common ones shared with `/auth`. */
export function describeAliasError(
  error: unknown,
  messages: { readonly aliases: Messages["aliasesPage"]["errors"]; readonly common: Messages["auth"]["errors"] },
): string {
  return describeErrorWith(error, { specific: messages.aliases, common: messages.common });
}
