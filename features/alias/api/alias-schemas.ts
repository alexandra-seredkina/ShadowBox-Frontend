import { z } from "zod";
import { encryptedBlobSchema, type EncryptedBlob } from "@/features/crypto/model/encrypted-blob";

/** API.md §6. */
export const aliasSchema = z.object({
  id: z.string(),
  address: z.string(),
  kind: z.enum(["permanent", "temporary"]),
  status: z.enum(["active", "disabled"]),
  encryptedLabel: encryptedBlobSchema.nullable(),
  folderId: z.string().nullable(),
  /** Labels new mail to this address gets (API.md §6). */
  labelIds: z.array(z.string()).default([]),
  expiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.date(),
  lastReceivedAt: z.iso.date().nullable(),
});

export type Alias = z.infer<typeof aliasSchema>;

export const aliasListSchema = z.object({ items: z.array(aliasSchema) });

export const ALIAS_TTLS = ["1h", "24h", "7d", "30d"] as const;

export type AliasTtl = (typeof ALIAS_TTLS)[number];

/** `ttl` is required for temporary addresses and forbidden for permanent ones. */
export type CreateAliasRequest = (
  | { readonly kind: "temporary"; readonly ttl: AliasTtl }
  | { readonly kind: "permanent" }
) & {
  readonly encryptedLabel: EncryptedBlob | null;
  readonly folderId: string | null;
  readonly labelIds?: readonly string[];
};

export type UpdateAliasRequest = {
  readonly status?: Alias["status"];
  readonly encryptedLabel?: EncryptedBlob | null;
  readonly folderId?: string | null;
  /** Replaces the whole set. */
  readonly labelIds?: readonly string[];
};

/** What `encryptedLabel` decrypts to. */
export const aliasLabelSchema = z.object({ label: z.string() });
