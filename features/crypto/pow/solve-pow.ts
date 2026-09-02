import { z } from "zod";
import { fromBase64Url, loadSodium } from "../model/sodium";
import type { PowRequest, PowResponse } from "./pow-messages";
import { powProgress } from "./pow-search";

/** `POST /auth/pow` response, API.md §3. */
export const powChallengeSchema = z.strictObject({
  challengeId: z.string().min(1),
  prefix: z.string().min(1),
  difficulty: z.number().int().min(1).max(32),
  expiresAt: z.iso.datetime(),
});

export type PowChallenge = z.infer<typeof powChallengeSchema>;

/** `pow` field of `/auth/register` and `/auth/login`. */
export type PowSolution = {
  readonly challengeId: string;
  readonly nonce: string;
};

export class PowSolverError extends Error {
  readonly code = "POW_SOLVER_FAILED";

  constructor() {
    super("Proof-of-work solver failed");
    this.name = "PowSolverError";
  }
}

type SolveOptions = {
  /** 0..1, see `powProgress`. */
  readonly onProgress?: (progress: number) => void;
  readonly signal?: AbortSignal;
};

/** Solves the challenge in a Web Worker so the page stays responsive. */
export async function solvePow(challenge: PowChallenge, options: SolveOptions = {}): Promise<PowSolution> {
  const sodium = await loadSodium();
  const request: PowRequest = { prefix: fromBase64Url(sodium, challenge.prefix), difficulty: challenge.difficulty };
  const worker = new Worker(new URL("./pow.worker.ts", import.meta.url), { type: "module" });

  return new Promise<PowSolution>((resolve, reject) => {
    const finish = (): void => {
      worker.terminate();
      options.signal?.removeEventListener("abort", abort);
    };
    const abort = (): void => {
      finish();
      reject(options.signal?.reason);
    };
    if (options.signal?.aborted) return abort();
    options.signal?.addEventListener("abort", abort, { once: true });

    worker.addEventListener("message", (event: MessageEvent<PowResponse>) => {
      const message = event.data;
      switch (message.type) {
        case "progress":
          options.onProgress?.(powProgress(message.attempts, challenge.difficulty));
          return;
        case "solved":
          finish();
          options.onProgress?.(1);
          resolve({ challengeId: challenge.challengeId, nonce: message.nonce });
          return;
        case "failed":
          finish();
          reject(new PowSolverError());
          return;
      }
    });
    worker.addEventListener("error", () => {
      finish();
      reject(new PowSolverError());
    });
    worker.postMessage(request);
  });
}
