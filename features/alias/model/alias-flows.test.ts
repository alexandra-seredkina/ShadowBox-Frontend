import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeRegistration, prepareRegistration } from "@/features/auth/model/register";
import { reauthenticate } from "@/features/auth/model/reauth";
import { getUnlockedKeys, lockKeys } from "@/features/crypto/model/key-store";
import { fromBase64Url, loadSodium } from "@/features/crypto/model/sodium";
import { searchPowNonce } from "@/features/crypto/pow/pow-search";
import type { PowChallenge, PowSolution } from "@/features/crypto/pow/solve-pow";
import { folderApi } from "@/features/folder/api/folder-api";
import { loadMockState, resetMockState, saveMockState } from "@/features/mock-server/mock-state";
import { aliasApi } from "../api/alias-api";
import { sealAliasLabel, toAliasView } from "./alias-view";

vi.mock("@/shared/config/public-env", () => ({ publicEnv: { apiMode: "mock" } }));

vi.mock("@/shared/api/mock-server", async () => {
  const errors = await import("@/shared/api/api-error");
  return {
    mockRespond: async <T>(value: T): Promise<T> => structuredClone(value),
    mockFail: async (failure: { status: number; code: string }): Promise<never> => {
      throw new errors.ApiError(failure);
    },
  };
});

vi.mock("@/features/crypto/pow/solve-pow", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/crypto/pow/solve-pow")>();
  return {
    ...original,
    solvePow: async (challenge: PowChallenge): Promise<PowSolution> => {
      const sodium = await loadSodium();
      const nonce = searchPowNonce({
        prefix: fromBase64Url(sodium, challenge.prefix),
        difficulty: challenge.difficulty,
        start: 0,
        attempts: 2 ** 26,
        sha256: (message) => sodium.crypto_hash_sha256(message),
      });
      if (nonce === null) throw new Error("no nonce");
      return { challengeId: challenge.challengeId, nonce };
    },
  };
});

const PASSWORD = "correct horse battery staple";
const noProgress = (): void => undefined;

function keys() {
  const unlocked = getUnlockedKeys();
  if (unlocked === null) throw new Error("locked");
  return unlocked;
}

beforeEach(async () => {
  resetMockState();
  const { prepared, ticket } = await prepareRegistration({ login: "kage", password: PASSWORD, onProgress: noProgress });
  await completeRegistration({ prepared, ticket, onPowProgress: noProgress });
});

afterEach(async () => {
  await lockKeys();
});

describe("aliases on the mock API", { timeout: 20_000 }, () => {
  it("starts with the permanent address created at sign-up and three system folders", async () => {
    const aliases = await aliasApi.listAliases();
    const folders = await folderApi.listFolders();

    expect(aliases).toMatchObject([{ kind: "permanent", status: "active", folderId: null, expiresAt: null }]);
    expect(aliases[0]?.address).toMatch(/^[a-z0-9]{10}@/);
    expect(folders.map((folder) => folder.systemRole)).toEqual(["inbox", "spam", "trash"]);
  });

  it("creates a temporary address whose label only the owner can read", async () => {
    const encryptedLabel = await sealAliasLabel("  Магазины ", keys().publicKey);

    const alias = await aliasApi.createAlias({ kind: "temporary", ttl: "1h", encryptedLabel, folderId: null }, "key-1");

    expect(JSON.stringify(alias)).not.toContain("Магазины");
    expect((await toAliasView(alias, keys())).label).toEqual({ kind: "text", text: "Магазины" });
    expect(Date.parse(alias.expiresAt ?? "")).toBeGreaterThan(Date.now());
  });

  it("returns the same address for a repeated Idempotency-Key", async () => {
    const request = { kind: "permanent", encryptedLabel: null, folderId: null } as const;

    const first = await aliasApi.createAlias(request, "key-1");
    const second = await aliasApi.createAlias(request, "key-1");

    expect(second.id).toBe(first.id);
    expect(await aliasApi.listAliases()).toHaveLength(2);
  });

  it("rejects an unknown folder as NOT_FOUND", async () => {
    const request = { kind: "permanent", encryptedLabel: null, folderId: "someone-elses" } as const;

    await expect(aliasApi.createAlias(request, "key-1")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("stops at the active address limit", async () => {
    const request = { kind: "temporary", ttl: "24h", encryptedLabel: null, folderId: null } as const;
    for (let index = 1; index < 20; index += 1) await aliasApi.createAlias(request, `key-${index}`);

    await expect(aliasApi.createAlias(request, "one-too-many")).rejects.toMatchObject({ code: "ALIAS_LIMIT_EXCEEDED" });
  });

  it("asks for the password before deleting a permanent address", async () => {
    const [firstAlias] = await aliasApi.listAliases();
    const id = firstAlias?.id ?? "";

    await expect(aliasApi.revokeAlias(id)).rejects.toMatchObject({ code: "REAUTH_REQUIRED" });
    await reauthenticate(PASSWORD);
    await aliasApi.revokeAlias(id);

    expect(await aliasApi.listAliases()).toEqual([]);
  });

  it("refuses reauth with a wrong password", async () => {
    await expect(reauthenticate("not the password")).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("deletes a temporary address without reauth", async () => {
    const request = { kind: "temporary", ttl: "1h", encryptedLabel: null, folderId: null } as const;
    const alias = await aliasApi.createAlias(request, "key-1");

    await aliasApi.revokeAlias(alias.id);

    expect((await aliasApi.listAliases()).map((item) => item.id)).not.toContain(alias.id);
  });

  it("turns an address off and on", async () => {
    const [firstAlias] = await aliasApi.listAliases();

    const disabled = await aliasApi.updateAlias(firstAlias?.id ?? "", { status: "disabled" });

    expect(disabled.status).toBe("disabled");
    expect((await aliasApi.updateAlias(disabled.id, { status: "active" })).status).toBe("active");
  });

  it("drops an expired temporary address from the list", async () => {
    const request = { kind: "temporary", ttl: "1h", encryptedLabel: null, folderId: null } as const;
    const alias = await aliasApi.createAlias(request, "key-1");
    const state = loadMockState();
    const stored = state.accounts["kage"];
    if (!stored) throw new Error("missing account");
    stored.aliases = stored.aliases.map((item) => (item.id === alias.id ? { ...item, expiresAt: "2020-01-15T12:00:00Z" } : item));
    saveMockState(state);

    expect((await aliasApi.listAliases()).map((item) => item.id)).not.toContain(alias.id);
  });
});
