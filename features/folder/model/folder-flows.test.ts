import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { aliasApi } from "@/features/alias/api/alias-api";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { lockKeys } from "@/features/crypto/model/key-store";
import { resetMockState } from "@/features/mock-server/mock-state";
import { registerTestAccount, snapshotMockServer } from "@/features/mock-server/testing/register-test-account";
import { folderApi } from "../api/folder-api";
import type { Folder } from "../api/folder-schemas";
import { findFolderBySlug, folderSlug, sealFolderName, sortFolders, toFolderOption } from "./folder-option";

vi.mock("@/shared/config/public-env", () => ({ publicEnv: { apiMode: "mock" } }));
vi.mock("@/shared/api/mock-server", () => import("@/features/mock-server/testing/instant-mock-server"));
vi.mock("@/features/crypto/pow/solve-pow", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import("@/features/mock-server/testing/inline-solve-pow")),
}));

let keyPair: KeyPair;

async function createFolder(name: string): Promise<Folder> {
  const sealed = await sealFolderName(name, keyPair.publicKey);
  if (sealed === null) throw new Error("empty name");
  return folderApi.createFolder(sealed);
}

async function systemFolder(role: Folder["systemRole"]): Promise<Folder> {
  const folder = (await folderApi.listFolders()).find((item) => item.systemRole === role);
  if (!folder) throw new Error(`no ${String(role)} folder`);
  return folder;
}

let restoreMockServer: () => void;

beforeAll(async () => {
  resetMockState();
  keyPair = await registerTestAccount("kage");
  restoreMockServer = snapshotMockServer();
});

beforeEach(() => {
  restoreMockServer();
});

afterAll(async () => {
  await lockKeys();
});

describe("folders on the mock API", () => {
  it("creates a custom folder whose name only the owner can read", async () => {
    const folder = await createFolder("Работа");

    expect(folder).toMatchObject({ kind: "custom", systemRole: null, unreadCount: 0 });
    expect(JSON.stringify(folder)).not.toContain("Работа");
    expect((await toFolderOption(folder, keyPair)).name).toEqual({ kind: "text", text: "Работа" });
  });

  it("renames a custom folder", async () => {
    const folder = await createFolder("Работа");
    const sealed = await sealFolderName("Учёба", keyPair.publicKey);
    if (sealed === null) throw new Error("empty name");

    const renamed = await folderApi.renameFolder(folder.id, sealed);

    expect((await toFolderOption(renamed, keyPair)).name).toEqual({ kind: "text", text: "Учёба" });
  });

  it("refuses to rename or delete a system folder", async () => {
    const inbox = await systemFolder("inbox");
    const sealed = await sealFolderName("Other", keyPair.publicKey);
    if (sealed === null) throw new Error("empty name");

    await expect(folderApi.renameFolder(inbox.id, sealed)).rejects.toMatchObject({ code: "FOLDER_IS_SYSTEM" });
    await expect(folderApi.deleteFolder(inbox.id)).rejects.toMatchObject({ code: "FOLDER_IS_SYSTEM" });
  });

  it("sends addresses back to the inbox when their folder is deleted", async () => {
    const folder = await createFolder("Магазины");
    const alias = await aliasApi.createAlias({ kind: "permanent", encryptedLabel: null, folderId: folder.id }, "key-1");

    await folderApi.deleteFolder(folder.id);

    const after = (await aliasApi.listAliases()).find((item) => item.id === alias.id);
    expect(after?.folderId).toBeNull();
    await expect(folderApi.deleteFolder(folder.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("stops at 50 custom folders, system ones not counted", async () => {
    for (let index = 0; index < 50; index += 1) await createFolder(`Folder ${index}`);

    await expect(createFolder("One too many")).rejects.toMatchObject({ code: "FOLDER_LIMIT_EXCEEDED" });
  });
});

describe("sortFolders and slugs", () => {
  it("keeps system folders first in a fixed order and sorts custom ones by name", async () => {
    const zeta = await toFolderOption(await createFolder("Zeta"), keyPair);
    const alpha = await toFolderOption(await createFolder("alpha"), keyPair);
    const systemFolders = (await folderApi.listFolders()).filter((folder) => folder.kind === "system");
    const system = await Promise.all(systemFolders.map((folder) => toFolderOption(folder, keyPair)));

    const sorted = sortFolders([zeta, ...system.reverse(), alpha], "en");

    expect(sorted.map(folderSlug)).toEqual(["inbox", "spam", "trash", alpha.id, zeta.id]);
    expect(findFolderBySlug(sorted, "spam")?.systemRole).toBe("spam");
    expect(findFolderBySlug(sorted, zeta.id)).toBe(zeta);
    expect(findFolderBySlug(sorted, "missing")).toBeNull();
  });
});
