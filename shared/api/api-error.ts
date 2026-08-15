import { z } from "zod";

export const errorBodySchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string(),
    requestId: z.string().optional(),
    details: z.array(z.object({ path: z.string(), issue: z.string() })).optional(),
  }),
});

export type ApiErrorDetail = { readonly path: string; readonly issue: string };

/** Codes produced on the client when the server gave no usable error body. */
export const CLIENT_ERROR_CODES = {
  network: "NETWORK_ERROR",
  unexpectedResponse: "UNEXPECTED_RESPONSE",
} as const;

type ApiErrorInit = {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string | undefined;
  readonly details?: readonly ApiErrorDetail[] | undefined;
  readonly retryAfterSeconds?: number | undefined;
  readonly cause?: unknown;
};

/** UI branches on `code` only; the server message is for logs and is never shown. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | undefined;
  readonly details: readonly ApiErrorDetail[];
  readonly retryAfterSeconds: number | undefined;

  constructor({ status, code, requestId, details = [], retryAfterSeconds, cause }: ApiErrorInit) {
    super(code, { cause });
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (header === null) return undefined;
  const seconds = Number(header);
  return Number.isInteger(seconds) && seconds >= 0 ? seconds : undefined;
}

export async function toApiError(response: Response): Promise<ApiError> {
  const retryAfterSeconds = parseRetryAfter(response.headers.get("Retry-After"));
  const body: unknown = await response.json().catch(() => null);
  const parsed = errorBodySchema.safeParse(body);

  if (!parsed.success) {
    return new ApiError({
      status: response.status,
      code: CLIENT_ERROR_CODES.unexpectedResponse,
      retryAfterSeconds,
    });
  }

  const { code, requestId, details } = parsed.data.error;
  return new ApiError({ status: response.status, code, requestId, details, retryAfterSeconds });
}
