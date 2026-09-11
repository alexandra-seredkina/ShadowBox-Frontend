import type { z } from "zod";
import { DecryptionFailedError } from "./crypto-errors";
import { openJson, sealJson, type EncryptedBlob } from "./encrypted-blob";
import type { KeyPair } from "./key-pair";

/** A user's own encrypted metadata (alias label, folder name) as the UI shows it. */
export type SealedText =
  | { readonly kind: "empty" }
  | { readonly kind: "text"; readonly text: string }
  /** Encrypted for another key or damaged: shown as such, never guessed. */
  | { readonly kind: "unreadable" };

/** D-007: metadata is sealed with the user's own public key; an empty value is sent as null. */
export async function sealText(field: string, text: string, publicKey: Uint8Array): Promise<EncryptedBlob | null> {
  const trimmed = text.trim();
  return trimmed.length === 0 ? null : sealJson({ [field]: trimmed }, publicKey);
}

export async function openText<T>(params: {
  readonly blob: EncryptedBlob | null;
  readonly keyPair: KeyPair;
  readonly schema: z.ZodType<T>;
  readonly pick: (value: T) => string;
}): Promise<SealedText> {
  if (params.blob === null) return { kind: "empty" };
  try {
    const parsed = params.schema.safeParse(await openJson(params.blob, params.keyPair));
    return parsed.success ? { kind: "text", text: params.pick(parsed.data) } : { kind: "unreadable" };
  } catch (error) {
    if (error instanceof DecryptionFailedError || error instanceof SyntaxError) return { kind: "unreadable" };
    throw error;
  }
}
