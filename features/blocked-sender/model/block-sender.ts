import { openJson, sealJson } from "@/features/crypto/model/encrypted-blob";
import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { blockedSenderApi } from "../api/blocked-sender-api";
import { blockedAddressSchema, type BlockedSender } from "../api/blocked-sender-schemas";

/** The server compares lower-cased addresses; the sealed copy keeps the same form so the list matches. */
export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

export async function blockSender(address: string, keyPair: KeyPair): Promise<BlockedSender> {
  const normalized = normalizeAddress(address);
  return blockedSenderApi.block(normalized, await sealJson({ address: normalized }, keyPair.publicKey));
}

/** The address behind an entry, or null when it was not sealed for this key pair. */
export async function openBlockedAddress(entry: BlockedSender, keyPair: KeyPair): Promise<string | null> {
  try {
    const parsed = blockedAddressSchema.safeParse(await openJson(entry.encryptedAddress, keyPair));
    return parsed.success ? parsed.data.address : null;
  } catch (error) {
    if (error instanceof DecryptionFailedError || error instanceof SyntaxError) return null;
    throw error;
  }
}
