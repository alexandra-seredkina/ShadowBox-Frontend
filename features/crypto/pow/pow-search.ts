const BITS_PER_BYTE = 8;
/** Decimal uint64 is at most 20 digits; the search never gets near it. */
const MAX_NONCE_DIGITS = 20;

export type Sha256 = (message: Uint8Array) => Uint8Array;

export function countLeadingZeroBits(bytes: Uint8Array): number {
  let count = 0;
  for (const byte of bytes) {
    if (byte !== 0) return count + Math.clz32(byte) - (32 - BITS_PER_BYTE);
    count += BITS_PER_BYTE;
  }
  return count;
}

export type PowSearch = {
  readonly prefix: Uint8Array;
  readonly difficulty: number;
  /** First nonce to try; nonces are tried in increasing order. */
  readonly start: number;
  readonly attempts: number;
  readonly sha256: Sha256;
};

/**
 * Looks for a nonce with SHA-256(prefix || nonce as decimal UTF-8) starting with
 * `difficulty` zero bits (API.md `/auth/pow`). Returns null if none in this range.
 */
export function searchPowNonce({ prefix, difficulty, start, attempts, sha256 }: PowSearch): string | null {
  const message = new Uint8Array(prefix.length + MAX_NONCE_DIGITS);
  message.set(prefix);
  const encoder = new TextEncoder();
  const end = start + attempts;
  for (let nonce = start; nonce < end; nonce += 1) {
    const text = String(nonce);
    const { written } = encoder.encodeInto(text, message.subarray(prefix.length));
    if (countLeadingZeroBits(sha256(message.subarray(0, prefix.length + written))) >= difficulty) return text;
  }
  return null;
}

/**
 * Chance that a solution would have been found after this many attempts.
 * The real number of attempts is random, so this is honest progress rather than a countdown.
 */
export function powProgress(attempts: number, difficulty: number): number {
  return 1 - Math.exp(-attempts / 2 ** difficulty);
}
