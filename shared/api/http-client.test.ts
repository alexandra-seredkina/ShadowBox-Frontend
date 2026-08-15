import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, CLIENT_ERROR_CODES } from "./api-error";
import { requestEmpty, requestJson } from "./http-client";

const pingSchema = z.object({ ok: z.literal(true) });

function stubFetch(implementation: typeof fetch) {
  const fetchMock = vi.fn<typeof fetch>(implementation);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestJson", () => {
  it("sends JSON to the versioned API path and returns the parsed body", async () => {
    const fetchMock = stubFetch(async () => Response.json({ ok: true }));

    const result = await requestJson("/ping", pingSchema, { method: "POST", body: { a: 1 }, idempotencyKey: "key-1" });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(url).toBe("/api/v1/ping");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe('{"a":1}');
    expect(init?.credentials).toBe("same-origin");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Idempotency-Key")).toBe("key-1");
  });

  it("throws the API error code on a non-2xx response", async () => {
    stubFetch(async () => Response.json({ error: { code: "NOT_FOUND", message: "" } }, { status: 404 }));

    await expect(requestJson("/ping", pingSchema)).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("rejects a 2xx body that does not match the schema", async () => {
    stubFetch(async () => Response.json({ ok: "yes" }));

    await expect(requestJson("/ping", pingSchema)).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.unexpectedResponse,
    });
  });

  it("reports a failed connection as NETWORK_ERROR", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    const error: unknown = await requestJson("/ping", pingSchema).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: CLIENT_ERROR_CODES.network });
  });

  it("lets an aborted request reject with AbortError", async () => {
    stubFetch(async () => {
      throw new DOMException("aborted", "AbortError");
    });

    await expect(requestJson("/ping", pingSchema)).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("requestEmpty", () => {
  it("resolves on 204 No Content", async () => {
    stubFetch(async () => new Response(null, { status: 204 }));

    await expect(requestEmpty("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});
