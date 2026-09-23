import { z } from "zod";
import { encryptedBlobSchema } from "@/features/crypto/model/encrypted-blob";

/** API.md §8. */
export const THREAT_MARKERS = [
  "UNKNOWN_SENDER",
  "AUTH_FAILED",
  "DISPLAY_NAME_SPOOF",
  "LOOKALIKE_DOMAIN",
  "LINK_MISMATCH",
  "DANGEROUS_ATTACHMENT",
] as const;

export type ThreatMarker = (typeof THREAT_MARKERS)[number];

const authResultSchema = z.enum(["pass", "fail", "none"]);

export type AuthResult = z.infer<typeof authResultSchema>;

export const threatSchema = z.object({
  verdict: z.enum(["safe", "caution", "danger"]),
  // A marker this client does not know yet is dropped rather than failing the whole list.
  markers: z.array(z.string()).transform((markers) => markers.filter(isThreatMarker)),
  auth: z.object({ spf: authResultSchema, dkim: authResultSchema, dmarc: authResultSchema }),
});

export type Threat = z.infer<typeof threatSchema>;

function isThreatMarker(marker: string): marker is ThreatMarker {
  return (THREAT_MARKERS as readonly string[]).includes(marker);
}

export const messageSummarySchema = z.object({
  id: z.string(),
  folderId: z.string(),
  aliasId: z.string().nullable(),
  receivedAt: z.iso.datetime(),
  isRead: z.boolean(),
  sizeBytes: z.number().int().nonnegative(),
  threat: threatSchema,
  encryptedPreview: encryptedBlobSchema,
});

export type MessageSummary = z.infer<typeof messageSummarySchema>;

export const messagePageSchema = z.object({
  items: z.array(messageSummarySchema),
  nextCursor: z.string().nullable(),
});

export type MessagePage = z.infer<typeof messagePageSchema>;

/** `body.ciphertext` is the raw RFC 5322 message, up to 25 MiB. */
export const messageContentSchema = z.object({ body: encryptedBlobSchema });

/** What `encryptedPreview` decrypts to. */
export const messagePreviewSchema = z.object({
  from: z.object({ name: z.string(), address: z.string() }),
  subject: z.string(),
  snippet: z.string(),
  hasAttachments: z.boolean(),
});

export type MessagePreview = z.infer<typeof messagePreviewSchema>;

export const MESSAGE_PAGE_LIMIT = 50;
/** API.md §8: `ids` in one batch request. */
export const MAX_BATCH_IDS = 100;

export type ListMessagesRequest = {
  readonly folderId: string;
  readonly cursor: string | null;
  readonly limit?: number;
};

export type UpdateMessageRequest = { readonly isRead?: boolean; readonly folderId?: string };

export type BatchRequest =
  | { readonly ids: readonly string[]; readonly action: "markRead" | "markUnread" | "delete" }
  | { readonly ids: readonly string[]; readonly action: "move"; readonly folderId: string };

export const batchResultSchema = z.object({ processed: z.number().int().nonnegative() });
