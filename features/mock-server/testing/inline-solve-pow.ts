import { fromBase64Url, loadSodium } from "@/features/crypto/model/sodium";
import { searchPowNonce } from "@/features/crypto/pow/pow-search";
import type { PowChallenge, PowSolution } from "@/features/crypto/pow/solve-pow";

// Test stand-in for `solvePow`: Node has no Web Workers, so the same search runs inline.
// Tests merge it over the real module with `importOriginal`; re-exporting from the mocked
// module here would make it import itself and hang.

export async function solvePow(challenge: PowChallenge): Promise<PowSolution> {
  const sodium = await loadSodium();
  const nonce = searchPowNonce({
    prefix: fromBase64Url(sodium, challenge.prefix),
    difficulty: challenge.difficulty,
    start: 0,
    attempts: 2 ** 26,
    sha256: (message) => sodium.crypto_hash_sha256(message),
  });
  if (nonce === null) throw new Error("No proof-of-work solution in range");
  return { challengeId: challenge.challengeId, nonce };
}
