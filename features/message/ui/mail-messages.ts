import type { Messages } from "@/shared/i18n/messages";

/** The dictionary slices the mail screens need; the server page passes only these to the client. */
export type MailMessages = {
  readonly mail: Messages["mail"];
  readonly folders: Messages["folders"];
  readonly common: Messages["common"];
  readonly errors: Messages["auth"]["errors"];
};
