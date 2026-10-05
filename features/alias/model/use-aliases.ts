"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { labelApi } from "@/features/label/api/label-api";
import { toLabelOption, type LabelOption } from "@/features/label/model/label-option";
import { folderApi } from "@/features/folder/api/folder-api";
import { isAliasDestination, toFolderOption, type FolderOption } from "@/features/folder/model/folder-option";
import { aliasApi } from "../api/alias-api";
import type { Alias, AliasTtl } from "../api/alias-schemas";
import { sealAliasLabel, toAliasView, type AliasView } from "./alias-view";

export type AliasDraft = {
  readonly kind: Alias["kind"];
  readonly ttl: AliasTtl;
  readonly label: string;
  readonly folderId: string | null;
  /** Labels new mail to this address gets. */
  readonly labelIds: readonly string[];
};

export type AliasEdit = { readonly label: string; readonly folderId: string | null; readonly labelIds: readonly string[] };

export type AliasesState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | {
      readonly kind: "ready";
      readonly aliases: readonly AliasView[];
      readonly folders: readonly FolderOption[];
      readonly labels: readonly LabelOption[];
    };

function requireKeys(): KeyPair {
  const keys = getUnlockedKeys();
  // The app gate only renders this screen with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  return keys;
}

async function loadAll(): Promise<{ aliases: AliasView[]; folders: FolderOption[]; labels: LabelOption[] }> {
  const keys = requireKeys();
  const [aliases, folders, labels] = await Promise.all([aliasApi.listAliases(), folderApi.listFolders(), labelApi.listLabels()]);
  return {
    aliases: await Promise.all(aliases.map((alias) => toAliasView(alias, keys))),
    folders: (await Promise.all(folders.map((folder) => toFolderOption(folder, keys)))).filter(isAliasDestination),
    labels: await Promise.all(labels.map((label) => toLabelOption(label, keys))),
  };
}

/** The alias list with its folders, plus actions that keep the list in step with the server. */
export function useAliases(): {
  readonly state: AliasesState;
  /** The same key for retries of one form submission (API.md §1.6). */
  readonly create: (draft: AliasDraft, idempotencyKey: string) => Promise<void>;
  readonly edit: (alias: Alias, change: AliasEdit) => Promise<void>;
  readonly setStatus: (alias: Alias, status: Alias["status"]) => Promise<void>;
  readonly revoke: (alias: Alias) => Promise<void>;
} {
  const [state, setState] = useState<AliasesState>({ kind: "loading" });

  useEffect(() => {
    let isCurrent = true;
    loadAll().then(
      (data) => {
        if (isCurrent) setState({ kind: "ready", ...data });
      },
      (error: unknown) => {
        if (isCurrent) setState({ kind: "failed", error });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  const replace = useCallback(async (alias: Alias) => {
    const view = await toAliasView(alias, requireKeys());
    setState((current) => {
      if (current.kind !== "ready") return current;
      const exists = current.aliases.some((item) => item.alias.id === alias.id);
      const aliases = exists
        ? current.aliases.map((item) => (item.alias.id === alias.id ? view : item))
        : [view, ...current.aliases];
      return { ...current, aliases };
    });
  }, []);

  const create = useCallback(
    async (draft: AliasDraft, idempotencyKey: string) => {
      const encryptedLabel = await sealAliasLabel(draft.label, requireKeys().publicKey);
      const common = { encryptedLabel, folderId: draft.folderId, labelIds: draft.labelIds };
      const request = draft.kind === "temporary" ? { kind: draft.kind, ttl: draft.ttl, ...common } : { kind: draft.kind, ...common };
      await replace(await aliasApi.createAlias(request, idempotencyKey));
    },
    [replace],
  );

  const edit = useCallback(
    async (alias: Alias, change: AliasEdit) => {
      const encryptedLabel = await sealAliasLabel(change.label, requireKeys().publicKey);
      await replace(await aliasApi.updateAlias(alias.id, { encryptedLabel, folderId: change.folderId, labelIds: change.labelIds }));
    },
    [replace],
  );

  const setStatus = useCallback(
    async (alias: Alias, status: Alias["status"]) => replace(await aliasApi.updateAlias(alias.id, { status })),
    [replace],
  );

  const revoke = useCallback(async (alias: Alias) => {
    await aliasApi.revokeAlias(alias.id);
    setState((current) =>
      current.kind === "ready" ? { ...current, aliases: current.aliases.filter((item) => item.alias.id !== alias.id) } : current,
    );
  }, []);

  return { state, create, edit, setStatus, revoke };
}
