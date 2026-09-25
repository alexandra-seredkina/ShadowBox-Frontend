"use client";

import { type ChangeEvent, type ReactElement } from "react";

type MessageSearchProps = {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly placeholder: string;
  readonly count: number;
};

/** Search input for decrypted message previews (from, subject, snippet). */
export function MessageSearch({ query, onQueryChange, placeholder, count }: MessageSearchProps): ReactElement {
  return (
    <div className="flex items-center gap-3 rounded bg-surface px-3 py-2">
      <span className="text-lg text-steel">🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm text-paper outline-none placeholder:text-steel"
      />
      {query && <span className="shrink-0 text-xs text-steel">{count}</span>}
    </div>
  );
}
