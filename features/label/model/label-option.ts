import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { openJson, sealJson } from "@/features/crypto/model/encrypted-blob";
import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { labelContentSchema, type Label } from "../api/label-schemas";

export const LABEL_NAME_MAX_LENGTH = 40;

/** Muted enough for the dark theme; Signal Red is left to danger. */
export const LABEL_COLORS = ["#ff5c6e", "#e2a03a", "#2fb37e", "#3fb6c9", "#6c8cff", "#a879e6", "#e07bb5", "#b8bac4"] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];

const FALLBACK_COLOR: LabelColor = "#b8bac4";

/** A label ready for the UI: name and color are decrypted here, in the browser. */
export type LabelOption = {
  readonly id: string;
  /** Null when the label was not sealed for this key pair or was damaged. */
  readonly name: string | null;
  readonly color: LabelColor;
  readonly unreadCount: number;
};

/** Only palette colors reach `style`, whatever the decrypted value says. */
export function toLabelColor(value: string): LabelColor {
  return LABEL_COLORS.find((color) => color === value.toLowerCase()) ?? FALLBACK_COLOR;
}

export async function toLabelOption(label: Label, keyPair: KeyPair): Promise<LabelOption> {
  try {
    const parsed = labelContentSchema.safeParse(await openJson(label.encryptedName, keyPair));
    if (parsed.success) {
      return { id: label.id, name: parsed.data.name, color: toLabelColor(parsed.data.color), unreadCount: label.unreadCount };
    }
  } catch (error) {
    if (!(error instanceof DecryptionFailedError || error instanceof SyntaxError)) throw error;
  }
  return { id: label.id, name: null, color: FALLBACK_COLOR, unreadCount: label.unreadCount };
}

export function sealLabel(name: string, color: LabelColor, publicKey: Uint8Array): Promise<EncryptedBlob> {
  return sealJson({ name: name.trim(), color }, publicKey);
}
