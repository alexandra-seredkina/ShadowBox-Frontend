"use client";

import { useCallback, useEffect, useState } from "react";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { labelApi } from "../api/label-api";
import type { Label } from "../api/label-schemas";
import { sealLabel, toLabelOption, type LabelColor, type LabelOption } from "./label-option";

export type LabelsState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | { readonly kind: "ready"; readonly labels: readonly LabelOption[] };

export type Labels = {
  readonly state: LabelsState;
  readonly create: (name: string, color: LabelColor) => Promise<LabelOption>;
  readonly edit: (label: LabelOption, name: string, color: LabelColor) => Promise<void>;
  readonly remove: (label: LabelOption) => Promise<void>;
  /** Unread counts move with every mail action; refetching is simpler than tracking them. */
  readonly refresh: () => void;
};

function requireKeys(): KeyPair {
  const keys = getUnlockedKeys();
  // The app gate only renders mail screens with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  return keys;
}

async function loadLabels(): Promise<LabelOption[]> {
  const keys = requireKeys();
  return Promise.all((await labelApi.listLabels()).map((label) => toLabelOption(label, keys)));
}

/** The label list plus actions that keep it in step with the server. */
export function useLabels(): Labels {
  const [state, setState] = useState<LabelsState>({ kind: "loading" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    loadLabels().then(
      (labels) => {
        if (isCurrent) setState({ kind: "ready", labels });
      },
      (error: unknown) => {
        if (isCurrent) setState((current) => (current.kind === "ready" ? current : { kind: "failed", error }));
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [version]);

  const put = useCallback(async (label: Label): Promise<LabelOption> => {
    const option = await toLabelOption(label, requireKeys());
    setState((current) => {
      if (current.kind !== "ready") return current;
      const exists = current.labels.some((item) => item.id === option.id);
      const labels = exists ? current.labels.map((item) => (item.id === option.id ? option : item)) : [...current.labels, option];
      return { kind: "ready", labels };
    });
    return option;
  }, []);

  const create = useCallback(
    async (name: string, color: LabelColor) => put(await labelApi.createLabel(await sealLabel(name, color, requireKeys().publicKey))),
    [put],
  );

  const edit = useCallback(
    async (label: LabelOption, name: string, color: LabelColor) => {
      await put(await labelApi.renameLabel(label.id, await sealLabel(name, color, requireKeys().publicKey)));
    },
    [put],
  );

  const remove = useCallback(async (label: LabelOption) => {
    await labelApi.deleteLabel(label.id);
    setState((current) => (current.kind === "ready" ? { kind: "ready", labels: current.labels.filter((item) => item.id !== label.id) } : current));
  }, []);

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  return { state, create, edit, remove, refresh };
}
