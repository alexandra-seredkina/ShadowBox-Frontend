import { loadSodium } from "../model/sodium";
import type { PowRequest, PowResponse } from "./pow-messages";
import { searchPowNonce } from "./pow-search";

/** Attempts between progress reports: a few per second on a laptop. */
const BATCH_ATTEMPTS = 50_000;

function reply(message: PowResponse): void {
  self.postMessage(message);
}

async function solve({ prefix, difficulty }: PowRequest): Promise<void> {
  const sodium = await loadSodium();
  const sha256 = (message: Uint8Array): Uint8Array => sodium.crypto_hash_sha256(message);
  for (let start = 0; start < Number.MAX_SAFE_INTEGER; start += BATCH_ATTEMPTS) {
    const nonce = searchPowNonce({ prefix, difficulty, start, attempts: BATCH_ATTEMPTS, sha256 });
    if (nonce !== null) {
      reply({ type: "solved", nonce, attempts: Number(nonce) + 1 });
      return;
    }
    reply({ type: "progress", attempts: start + BATCH_ATTEMPTS });
  }
}

self.addEventListener("message", (event: MessageEvent<PowRequest>) => {
  solve(event.data).catch(() => reply({ type: "failed" }));
});
