"use client";

import { createContext, useContext } from "react";

export type MailboxDrawer = { readonly open: () => void };

/** Lets the list header open the folder drawer on narrow screens. */
export const MailboxDrawerContext = createContext<MailboxDrawer>({ open: () => undefined });

export function useMailboxDrawer(): MailboxDrawer {
  return useContext(MailboxDrawerContext);
}
