import { entropyToMnemonic, mnemonicToEntropy } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { InvalidRecoveryPhraseError } from "./crypto-errors";
import { hkdfSha256 } from "./hkdf";
import { loadSodium } from "./sodium";

const ENTROPY_BYTES = 32;
const KEY_BYTES = 32;
const RECOVERY_KEY_INFO = "shadowbox/recovery/v1";

export const RECOVERY_PHRASE_WORDS = 24;

export type RecoveryPhrase = {
  /** Shown to the user once, never sent anywhere. */
  readonly words: readonly string[];
  /** Encrypts `recoveryEncryptedPrivateKey`. */
  readonly key: Uint8Array;
};

/**
 * 256 bits of entropy written as 24 BIP39 English words (the last word carries a checksum).
 * The entropy is already uniform, so a plain HKDF is enough to turn it into a key.
 */
export async function generateRecoveryPhrase(): Promise<RecoveryPhrase> {
  const sodium = await loadSodium();
  const entropy = sodium.randombytes_buf(ENTROPY_BYTES);
  try {
    const words = entropyToMnemonic(entropy, wordlist).split(" ");
    return { words, key: await hkdfSha256(entropy, RECOVERY_KEY_INFO, KEY_BYTES) };
  } finally {
    sodium.memzero(entropy);
  }
}

/** @throws InvalidRecoveryPhraseError on an unknown word, a wrong word count or a failed checksum. */
export async function recoveryKeyFromPhrase(words: readonly string[]): Promise<Uint8Array> {
  const normalized = words.map((word) => word.trim().toLowerCase()).filter((word) => word.length > 0);
  if (normalized.length !== RECOVERY_PHRASE_WORDS) throw new InvalidRecoveryPhraseError();
  let entropy: Uint8Array;
  try {
    entropy = mnemonicToEntropy(normalized.join(" "), wordlist);
  } catch (error) {
    throw new InvalidRecoveryPhraseError({ cause: error });
  }
  const sodium = await loadSodium();
  try {
    return await hkdfSha256(entropy, RECOVERY_KEY_INFO, KEY_BYTES);
  } finally {
    sodium.memzero(entropy);
  }
}
