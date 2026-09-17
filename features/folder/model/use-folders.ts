"use client";

import { useCallback, useEffect, useState } from "react";
import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { folderApi } from "../api/folder-api";
import type { Folder } from "../api/folder-schemas";
import { sealFolderName, toFolderOption, type FolderOption } from "./folder-option";

export type FoldersState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | { readonly kind: "ready"; readonly folders: readonly FolderOption[] };

export type Folders = {
  readonly state: FoldersState;
  readonly create: (name: string) => Promise<FolderOption>;
  readonly rename: (folder: FolderOption, name: string) => Promise<void>;
  readonly remove: (folder: FolderOption) => Promise<void>;
};

function requireKeys(): KeyPair {
  const keys = getUnlockedKeys();
  // The app gate only renders folder screens with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  return keys;
}

async function sealRequiredName(name: string): Promise<EncryptedBlob> {
  const sealed = await sealFolderName(name, requireKeys().publicKey);
  // The form refuses empty names; reaching this is a bug, not a user error.
  if (sealed === null) throw new Error("Folder name is empty");
  return sealed;
}

/** The folder list plus actions that keep it in step with the server. */
export function useFolders(): Folders {
  const [state, setState] = useState<FoldersState>({ kind: "loading" });

  useEffect(() => {
    let isCurrent = true;
    folderApi
      .listFolders()
      .then((folders) => Promise.all(folders.map((folder) => toFolderOption(folder, requireKeys()))))
      .then(
        (folders) => {
          if (isCurrent) setState({ kind: "ready", folders });
        },
        (error: unknown) => {
          if (isCurrent) setState({ kind: "failed", error });
        },
      );
    return () => {
      isCurrent = false;
    };
  }, []);

  const put = useCallback(async (folder: Folder): Promise<FolderOption> => {
    const option = await toFolderOption(folder, requireKeys());
    setState((current) => {
      if (current.kind !== "ready") return current;
      const exists = current.folders.some((item) => item.id === option.id);
      const folders = exists ? current.folders.map((item) => (item.id === option.id ? option : item)) : [...current.folders, option];
      return { kind: "ready", folders };
    });
    return option;
  }, []);

  const create = useCallback(async (name: string) => put(await folderApi.createFolder(await sealRequiredName(name))), [put]);

  const rename = useCallback(
    async (folder: FolderOption, name: string) => {
      await put(await folderApi.renameFolder(folder.id, await sealRequiredName(name)));
    },
    [put],
  );

  const remove = useCallback(async (folder: FolderOption) => {
    await folderApi.deleteFolder(folder.id);
    setState((current) =>
      current.kind === "ready" ? { kind: "ready", folders: current.folders.filter((item) => item.id !== folder.id) } : current,
    );
  }, []);

  return { state, create, rename, remove };
}
