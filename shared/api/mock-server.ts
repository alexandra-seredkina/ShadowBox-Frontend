import { ApiError, type ApiErrorDetail } from "./api-error";

const DEFAULT_LATENCY_MS = 300;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolves like a real endpoint would, after network-like latency. */
export async function mockRespond<T>(value: T, latencyMs = DEFAULT_LATENCY_MS): Promise<T> {
  await wait(latencyMs);
  return structuredClone(value);
}

type MockFailure = {
  readonly status: number;
  readonly code: string;
  readonly details?: readonly ApiErrorDetail[];
  readonly retryAfterSeconds?: number;
  readonly latencyMs?: number;
};

/** Rejects with the same `ApiError` the HTTP client builds from an API.md error body. */
export async function mockFail({ latencyMs = DEFAULT_LATENCY_MS, ...error }: MockFailure): Promise<never> {
  await wait(latencyMs);
  throw new ApiError({ ...error, requestId: crypto.randomUUID() });
}
