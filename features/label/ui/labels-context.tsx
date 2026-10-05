"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { useLabels, type Labels } from "../model/use-labels";

const LabelsContext = createContext<Labels | null>(null);

/** One label list for the sidebar, the toolbar and the open message. */
export function LabelsProvider({ children }: { readonly children: ReactNode }): ReactElement {
  return <LabelsContext value={useLabels()}>{children}</LabelsContext>;
}

export function useLabelsContext(): Labels {
  const labels = useContext(LabelsContext);
  if (!labels) throw new Error("useLabelsContext must be used inside LabelsProvider");
  return labels;
}
