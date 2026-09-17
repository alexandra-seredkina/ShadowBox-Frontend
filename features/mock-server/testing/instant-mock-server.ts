import { ApiError } from "@/shared/api/api-error";
import type { ApiErrorDetail } from "@/shared/api/api-error";

// Test stand-in for shared/api/mock-server: same results, no latency, so tests never wait on real time.

export async function mockRespond<T>(value: T): Promise<T> {
  return structuredClone(value);
}

export async function mockFail(failure: {
  readonly status: number;
  readonly code: string;
  readonly details?: readonly ApiErrorDetail[];
  readonly retryAfterSeconds?: number;
}): Promise<never> {
  throw new ApiError(failure);
}
