import { z } from "zod";
import { encryptedBlobSchema } from "@/features/crypto/model/encrypted-blob";

/** API.md §7. */
export const folderSchema = z.object({
  id: z.string(),
  kind: z.enum(["system", "custom"]),
  systemRole: z.enum(["inbox", "spam", "trash"]).nullable(),
  encryptedName: encryptedBlobSchema.nullable(),
  unreadCount: z.number().int(),
});

export type Folder = z.infer<typeof folderSchema>;

export type SystemRole = NonNullable<Folder["systemRole"]>;

export const folderListSchema = z.object({ items: z.array(folderSchema) });

/** What `encryptedName` decrypts to. */
export const folderNameSchema = z.object({ name: z.string() });
