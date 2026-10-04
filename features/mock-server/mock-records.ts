import type { Alias, AliasTtl } from "@/features/alias/api/alias-schemas";
import type { Folder } from "@/features/folder/api/folder-schemas";
import { newId, today } from "./mock-state";

const LOCAL_PART_LENGTH = 10;
const LOCAL_PART_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
/** The real domain comes from the server's MAIL_DOMAIN (D-023); the mock uses the dev one. */
const MOCK_MAIL_DOMAIN = "shadowbox.test";

const HOUR_MS = 60 * 60 * 1000;
export const TTL_MS: Readonly<Record<AliasTtl, number>> = {
  "1h": HOUR_MS,
  "24h": 24 * HOUR_MS,
  "7d": 7 * 24 * HOUR_MS,
  "30d": 30 * 24 * HOUR_MS,
};

/** 10 characters of `[a-z0-9]` from CSPRNG, rejection sampling keeps them uniform (API.md §6). */
function randomLocalPart(): string {
  const limit = 256 - (256 % LOCAL_PART_ALPHABET.length);
  const result: string[] = [];
  const buffer = new Uint8Array(1);
  while (result.length < LOCAL_PART_LENGTH) {
    crypto.getRandomValues(buffer);
    const value = buffer[0] ?? limit;
    if (value < limit) result.push(LOCAL_PART_ALPHABET.charAt(value % LOCAL_PART_ALPHABET.length));
  }
  return result.join("");
}

export function newAlias(params: {
  readonly kind: Alias["kind"];
  readonly ttl: AliasTtl | null;
  readonly encryptedLabel?: Alias["encryptedLabel"];
  readonly folderId?: string | null;
  readonly labelIds?: readonly string[];
}): Alias {
  return {
    id: newId(),
    address: `${randomLocalPart()}@${MOCK_MAIL_DOMAIN}`,
    kind: params.kind,
    status: "active",
    encryptedLabel: params.encryptedLabel ?? null,
    folderId: params.folderId ?? null,
    labelIds: [...(params.labelIds ?? [])],
    expiresAt: params.ttl === null ? null : new Date(Date.now() + TTL_MS[params.ttl]).toISOString(),
    createdAt: today(),
    lastReceivedAt: null,
  };
}

export function systemFolders(): Folder[] {
  return (["inbox", "archive", "spam", "trash"] as const).map((systemRole) => ({
    id: newId(),
    kind: "system",
    systemRole,
    encryptedName: null,
    unreadCount: 0,
  }));
}
