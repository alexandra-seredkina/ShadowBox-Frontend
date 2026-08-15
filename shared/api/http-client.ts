import type { z } from "zod";
import { ApiError, CLIENT_ERROR_CODES, toApiError } from "./api-error";

const API_BASE_PATH = "/api/v1";
const NO_CONTENT = 204;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions = {
  readonly method?: HttpMethod;
  readonly body?: unknown;
  readonly idempotencyKey?: string;
  readonly signal?: AbortSignal;
};

async function send(path: string, { method = "GET", body, idempotencyKey, signal }: RequestOptions): Promise<Response> {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);

  try {
    return await fetch(`${API_BASE_PATH}${path}`, {
      method,
      headers,
      credentials: "same-origin",
      cache: "no-store",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError({ status: 0, code: CLIENT_ERROR_CODES.network, cause: error });
  }
}

/** Sends a request to the ShadowBox API and validates the response against `schema`. */
export async function requestJson<T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  if (!response.ok) throw await toApiError(response);

  const parsed = schema.safeParse(await response.json().catch(() => undefined));
  if (!parsed.success) {
    throw new ApiError({ status: response.status, code: CLIENT_ERROR_CODES.unexpectedResponse, cause: parsed.error });
  }
  return parsed.data;
}

/** For endpoints that answer `204 No Content`. */
export async function requestEmpty(path: string, options: RequestOptions = {}): Promise<void> {
  const response = await send(path, options);
  if (!response.ok) throw await toApiError(response);
  if (response.status !== NO_CONTENT) {
    throw new ApiError({ status: response.status, code: CLIENT_ERROR_CODES.unexpectedResponse });
  }
}
