"use client";

import { useMemo } from "react";
import type { MessageRow } from "./message-row";

export type SearchQuery = string;

/** Filter loaded messages by searchable preview fields (decrypted only, client-side). */
export function useMessageSearch(rows: readonly MessageRow[], query: SearchQuery): readonly MessageRow[] {
  return useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) => {
      if (!row.preview) return false;
      const { from, subject, snippet } = row.preview;
      const searchableText = [from.name || from.address, subject, snippet || ""].join(" ").toLowerCase();
      return searchableText.includes(q);
    });
  }, [rows, query]);
}
