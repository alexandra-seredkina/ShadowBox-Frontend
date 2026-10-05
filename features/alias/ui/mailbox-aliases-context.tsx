"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { useMailboxAliases, type MailboxAliases } from "../model/use-mailbox-aliases";

const MailboxAliasesContext = createContext<MailboxAliases | null>(null);

export function MailboxAliasesProvider({ children }: { readonly children: ReactNode }): ReactElement {
  return <MailboxAliasesContext value={useMailboxAliases()}>{children}</MailboxAliasesContext>;
}

export function useMailboxAliasesContext(): MailboxAliases {
  const aliases = useContext(MailboxAliasesContext);
  if (!aliases) throw new Error("useMailboxAliasesContext must be used inside MailboxAliasesProvider");
  return aliases;
}
