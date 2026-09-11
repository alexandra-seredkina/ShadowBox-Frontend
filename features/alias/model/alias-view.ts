import type { KeyPair } from "@/features/crypto/model/key-pair";
import { openText, sealText, type SealedText } from "@/features/crypto/model/sealed-text";
import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { aliasLabelSchema, type Alias } from "../api/alias-schemas";

/** Long enough for "Streaming service (family plan)", short enough to fit a card. */
export const ALIAS_LABEL_MAX_LENGTH = 64;

export type AliasView = {
  readonly alias: Alias;
  readonly label: SealedText;
};

export function sealAliasLabel(label: string, publicKey: Uint8Array): Promise<EncryptedBlob | null> {
  return sealText("label", label, publicKey);
}

export async function toAliasView(alias: Alias, keyPair: KeyPair): Promise<AliasView> {
  const label = await openText({
    blob: alias.encryptedLabel,
    keyPair,
    schema: aliasLabelSchema,
    pick: (value) => value.label,
  });
  return { alias, label };
}

export function labelText(view: AliasView): string {
  return view.label.kind === "text" ? view.label.text : "";
}
