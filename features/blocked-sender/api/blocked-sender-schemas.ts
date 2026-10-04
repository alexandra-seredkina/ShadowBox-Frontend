import { z } from "zod";
import { encryptedBlobSchema } from "@/features/crypto/model/encrypted-blob";

/** API.md §8.1. */
export const blockedSenderSchema = z.object({
  id: z.string(),
  encryptedAddress: encryptedBlobSchema,
  createdAt: z.iso.date(),
});

export type BlockedSender = z.infer<typeof blockedSenderSchema>;

export const blockedSenderListSchema = z.object({ items: z.array(blockedSenderSchema) });

/** What `encryptedAddress` decrypts to. */
export const blockedAddressSchema = z.object({ address: z.string() });
