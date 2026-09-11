import type { Messages } from "@/shared/i18n/messages";

/** The dictionary slices the alias screen needs; the server page passes only these to the client. */
export type AliasesMessages = {
  readonly page: Messages["aliasesPage"];
  readonly folders: Messages["folders"];
  readonly common: Messages["common"];
  readonly auth: Pick<Messages["auth"], "reauth" | "errors" | "fields">;
};
