import { z } from "zod";
import { encryptedBlobSchema } from "@/features/crypto/model/encrypted-blob";

/** API.md §7.1. */
export const labelSchema = z.object({
  id: z.string(),
  encryptedName: encryptedBlobSchema,
  unreadCount: z.number().int(),
});

export type Label = z.infer<typeof labelSchema>;

export const labelListSchema = z.object({ items: z.array(labelSchema) });

/** What `encryptedName` decrypts to: the color is sealed together with the name. */
export const labelContentSchema = z.object({ name: z.string(), color: z.string() });

export type LabelContent = z.infer<typeof labelContentSchema>;
