"use client";

import { useState } from "react";

export type Selection = {
  /** Selected ids that are still on screen, in list order. */
  readonly ids: readonly string[];
  readonly has: (id: string) => boolean;
  readonly toggle: (id: string) => void;
  readonly setAll: (isSelected: boolean) => void;
  readonly clear: () => void;
};

/** Checkbox selection over the loaded rows; ids that leave the list drop out by themselves. */
export function useSelection(visibleIds: readonly string[]): Selection {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const ids = visibleIds.filter((id) => selected.has(id));

  return {
    ids,
    has: (id) => selected.has(id),
    toggle: (id) => {
      setSelected((current) => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      });
    },
    setAll: (isSelected) => setSelected(isSelected ? new Set(visibleIds) : new Set()),
    clear: () => setSelected(new Set()),
  };
}
