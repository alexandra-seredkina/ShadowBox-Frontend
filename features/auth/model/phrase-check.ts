export const CHECKED_WORDS = 3;

/** Distinct random word positions (zero-based, ascending) the user has to type back. */
export function pickCheckPositions(wordCount: number, count: number = CHECKED_WORDS): number[] {
  const positions = new Set<number>();
  const random = new Uint32Array(1);
  while (positions.size < Math.min(count, wordCount)) {
    crypto.getRandomValues(random);
    positions.add((random[0] ?? 0) % wordCount);
  }
  return [...positions].sort((a, b) => a - b);
}
