import type { Messages } from "@/shared/i18n/messages";

/** The dictionary slices the mailbox needs; the server layout passes only these to the client. */
export type MailboxMessages = {
  readonly mailbox: Messages["mailbox"];
  readonly mail: Messages["mail"];
  readonly folders: Messages["folders"];
  readonly common: Messages["common"];
  readonly errors: Messages["auth"]["errors"];
};
