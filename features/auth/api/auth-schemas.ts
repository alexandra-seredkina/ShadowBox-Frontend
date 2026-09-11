import { z } from "zod";
import { aliasSchema } from "@/features/alias/api/alias-schemas";
import { kdfParamsSchema } from "@/features/crypto/model/kdf";
import { encryptedKeySchema } from "@/features/crypto/model/key-pair";
import type { PowSolution } from "@/features/crypto/pow/solve-pow";

// Responses use z.object, not strictObject: the server may add fields (settings.locale, D-028).

/** API.md §5. */
export const accountSchema = z.object({
  login: z.string(),
  createdAt: z.iso.date(),
  settings: z.object({ ipBinding: z.boolean() }),
  limits: z.object({
    maxActiveAliases: z.number().int(),
    activeAliases: z.number().int(),
    maxMessageBytes: z.number().int(),
  }),
});

export type Account = z.infer<typeof accountSchema>;

/** API.md §5 `Keys`. */
export const keysSchema = z.object({
  publicKey: z.string().min(1),
  encryptedPrivateKey: encryptedKeySchema,
  kdf: kdfParamsSchema,
});

export type Keys = z.infer<typeof keysSchema>;

export const preloginResponseSchema = z.object({ kdf: kdfParamsSchema });

export const registerResponseSchema = z.object({ account: accountSchema, firstAlias: aliasSchema });

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const loginResponseSchema = z.object({ account: accountSchema, keys: keysSchema });

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const sessionResponseSchema = z.object({
  account: accountSchema,
  keys: keysSchema,
  session: z.object({ id: z.string(), reauthUntil: z.iso.datetime().nullable() }),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

export type RegisterRequest = {
  readonly login: string;
  readonly authKey: string;
  readonly kdf: z.infer<typeof kdfParamsSchema>;
  readonly keys: {
    readonly publicKey: string;
    readonly encryptedPrivateKey: z.infer<typeof encryptedKeySchema>;
    readonly recoveryEncryptedPrivateKey: z.infer<typeof encryptedKeySchema>;
  };
  readonly pow: PowSolution;
};

export type LoginRequest = {
  readonly login: string;
  readonly authKey: string;
  readonly pow?: PowSolution;
};

export type PowPurpose = "register" | "login";
