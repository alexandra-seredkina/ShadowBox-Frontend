import { hkdfSync } from "node:crypto";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { describe, expect, it } from "vitest";
import { InvalidRecoveryPhraseError } from "./crypto-errors";
import { generateRecoveryPhrase, recoveryKeyFromPhrase } from "./recovery-phrase";

// BIP39 reference vector: 32 zero bytes of entropy.
const ZERO_ENTROPY_PHRASE = [...Array<string>(23).fill("abandon"), "art"];

describe("generateRecoveryPhrase", () => {
  it("produces 24 words from the BIP39 English list", async () => {
    const { words } = await generateRecoveryPhrase();

    expect(words).toHaveLength(24);
    expect(words.every((word) => wordlist.includes(word))).toBe(true);
  });

  it("derives the same key again from the shown words", async () => {
    const phrase = await generateRecoveryPhrase();

    expect(await recoveryKeyFromPhrase(phrase.words)).toEqual(phrase.key);
  });
});

describe("recoveryKeyFromPhrase", () => {
  it("is HKDF-SHA256 of the phrase entropy", async () => {
    const expected = new Uint8Array(hkdfSync("sha256", new Uint8Array(32), new Uint8Array(0), "shadowbox/recovery/v1", 32));

    expect(await recoveryKeyFromPhrase(ZERO_ENTROPY_PHRASE)).toEqual(expected);
  });

  it("ignores letter case and stray spaces", async () => {
    const typed = ZERO_ENTROPY_PHRASE.map((word, index) => (index === 0 ? ` ${word.toUpperCase()} ` : word));

    expect(await recoveryKeyFromPhrase(typed)).toEqual(await recoveryKeyFromPhrase(ZERO_ENTROPY_PHRASE));
  });

  it("rejects a phrase with a wrong checksum word", async () => {
    const wrongChecksum = [...ZERO_ENTROPY_PHRASE.slice(0, 23), "abandon"];

    await expect(recoveryKeyFromPhrase(wrongChecksum)).rejects.toBeInstanceOf(InvalidRecoveryPhraseError);
  });

  it("rejects a phrase of the wrong length", async () => {
    await expect(recoveryKeyFromPhrase(ZERO_ENTROPY_PHRASE.slice(0, 12))).rejects.toBeInstanceOf(
      InvalidRecoveryPhraseError,
    );
  });
});
