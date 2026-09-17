import type { Messages } from "@/shared/i18n/messages";

/** The dictionary slices the folder screens need; the server layout passes only these to the client. */
export type FoldersMessages = {
  readonly folders: Messages["folders"];
  readonly common: Messages["common"];
  readonly errors: Messages["auth"]["errors"];
};
