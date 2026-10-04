import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { aliasApi } from "@/features/alias/api/alias-api";
import { blockedSenderApi } from "@/features/blocked-sender/api/blocked-sender-api";
import { sealJson } from "@/features/crypto/model/encrypted-blob";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { lockKeys } from "@/features/crypto/model/key-store";
import { folderApi } from "@/features/folder/api/folder-api";
import type { Folder } from "@/features/folder/api/folder-schemas";
import { labelApi } from "@/features/label/api/label-api";
import { resetMockState } from "@/features/mock-server/mock-state";
import { registerTestAccount, snapshotMockServer } from "@/features/mock-server/testing/register-test-account";
import { ApiError } from "@/shared/api/api-error";
import { messageApi } from "../api/message-api";

vi.mock("@/shared/config/public-env", () => ({ publicEnv: { apiMode: "mock" } }));
vi.mock("@/shared/api/mock-server", () => import("@/features/mock-server/testing/instant-mock-server"));
vi.mock("@/features/crypto/pow/solve-pow", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import("@/features/mock-server/testing/inline-solve-pow")),
}));

let keyPair: KeyPair;
let restoreMockServer: () => void;

async function systemFolder(role: Folder["systemRole"]): Promise<Folder> {
  const folder = (await folderApi.listFolders()).find((item) => item.systemRole === role);
  if (!folder) throw new Error(`no ${String(role)} folder`);
  return folder;
}

/** A temporary address gets a confirmation mail from hello@lumen-store.example. */
async function receiveConfirmation(key: string): Promise<string> {
  await aliasApi.createAlias({ kind: "temporary", ttl: "1h", encryptedLabel: null, folderId: null }, key);
  const all = await Promise.all(
    (await folderApi.listFolders()).map((folder) =>
      messageApi.listMessages({ scope: { kind: "folder", folderId: folder.id }, cursor: null }),
    ),
  );
  const newest = all.flatMap((page) => page.items).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))[0];
  if (!newest) throw new Error("no mail");
  return newest.id;
}

async function createLabel(name: string): Promise<string> {
  return (await labelApi.createLabel(await sealJson({ name, color: "#ff5c6e" }, keyPair.publicKey))).id;
}

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

describe("mailbox on the mock API", () => {
  it("stars messages and lists them across folders but not from the trash", async () => {
    const first = await receiveConfirmation("key-1");
    const second = await receiveConfirmation("key-2");
    const trash = await systemFolder("trash");

    await messageApi.batch({ ids: [first, second], action: "star" });
    await messageApi.updateMessage(second, { folderId: trash.id });
    const starred = await messageApi.listMessages({ scope: { kind: "starred" }, cursor: null });

    expect(starred.items.map((item) => [item.id, item.isStarred])).toEqual([[first, true]]);
  });

  it("labels messages and lists them by label", async () => {
    const work = await createLabel("Работа");
    const id = await receiveConfirmation("key-1");

    const labelled = await messageApi.updateMessage(id, { labelIds: [work] });
    const page = await messageApi.listMessages({ scope: { kind: "label", labelId: work }, cursor: null });
    const labels = await labelApi.listLabels();

    expect(labelled.labelIds).toEqual([work]);
    expect(page.items.map((item) => item.id)).toEqual([id]);
    expect(labels).toMatchObject([{ id: work, unreadCount: 1 }]);
    expect(JSON.stringify(labels)).not.toContain("Работа");
  });

  it("labels new mail to an address that carries a label", async () => {
    const work = await createLabel("Работа");
    const [alias] = await aliasApi.listAliases();
    if (!alias) throw new Error("no alias");

    await aliasApi.updateAlias(alias.id, { labelIds: [work] });
    await expect(aliasApi.updateAlias(alias.id, { labelIds: ["missing"] })).rejects.toMatchObject({ status: 404 });

    expect((await aliasApi.listAliases()).find((item) => item.id === alias.id)?.labelIds).toEqual([work]);
  });

  it("takes a deleted label off messages", async () => {
    const work = await createLabel("Работа");
    const id = await receiveConfirmation("key-1");
    await messageApi.batch({ ids: [id], action: "label", labelId: work });

    await labelApi.deleteLabel(work);

    expect((await messageApi.loadMessage(id)).labelIds).toEqual([]);
  });

  it("sends mail from a blocked sender to spam", async () => {
    const encryptedAddress = await sealJson({ address: "hello@lumen-store.example" }, keyPair.publicKey);
    const first = await blockedSenderApi.block("hello@lumen-store.example", encryptedAddress);
    const again = await blockedSenderApi.block("HELLO@lumen-store.example", encryptedAddress);

    const id = await receiveConfirmation("key-1");

    expect(again.id).toBe(first.id);
    expect((await messageApi.loadMessage(id)).folderId).toBe((await systemFolder("spam")).id);
    await blockedSenderApi.unblock(first.id);
    expect(await blockedSenderApi.listBlocked()).toEqual([]);
  });

  it("refuses a cursor from another scope", async () => {
    await receiveConfirmation("key-1");
    await receiveConfirmation("key-2");
    const inbox = await systemFolder("inbox");
    const page = await messageApi.listMessages({ scope: { kind: "folder", folderId: inbox.id }, cursor: null, limit: 1 });

    const failure = await messageApi.listMessages({ scope: { kind: "starred" }, cursor: page.nextCursor }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 400 });
  });
});
