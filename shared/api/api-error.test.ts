import { describe, expect, it } from "vitest";
import { ApiError, CLIENT_ERROR_CODES, toApiError } from "./api-error";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

describe("toApiError", () => {
  it("reads code, request id and validation details from an API error body", async () => {
    const response = jsonResponse(400, {
      error: {
        code: "VALIDATION_FAILED",
        message: "bad input",
        requestId: "req-1",
        details: [{ path: "login", issue: "too_short" }],
      },
    });

    const error = await toApiError(response);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.requestId).toBe("req-1");
    expect(error.details).toEqual([{ path: "login", issue: "too_short" }]);
  });

  it("reads Retry-After seconds on rate limit responses", async () => {
    const response = jsonResponse(429, { error: { code: "RATE_LIMITED", message: "slow down" } }, { "Retry-After": "30" });

    const error = await toApiError(response);

    expect(error.retryAfterSeconds).toBe(30);
  });

  it("ignores a Retry-After header that is not a whole number of seconds", async () => {
    const response = jsonResponse(429, { error: { code: "RATE_LIMITED", message: "" } }, { "Retry-After": "soon" });

    const error = await toApiError(response);

    expect(error.retryAfterSeconds).toBeUndefined();
  });

  it("falls back to UNEXPECTED_RESPONSE when the body is not an API error", async () => {
    const response = new Response("<html>Bad gateway</html>", { status: 502 });

    const error = await toApiError(response);

    expect(error.status).toBe(502);
    expect(error.code).toBe(CLIENT_ERROR_CODES.unexpectedResponse);
  });
});
