"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { useFolders, type Folders } from "../model/use-folders";

const FoldersContext = createContext<Folders | null>(null);

/** One folder list for the sidebar and the open folder, so a rename shows up in both at once. */
export function FoldersProvider({ children }: { readonly children: ReactNode }): ReactElement {
  return <FoldersContext value={useFolders()}>{children}</FoldersContext>;
}

export function useFoldersContext(): Folders {
  const folders = useContext(FoldersContext);
  if (!folders) throw new Error("useFoldersContext must be used inside FoldersProvider");
  return folders;
}
