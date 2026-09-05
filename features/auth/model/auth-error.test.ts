import { describe, expect, it } from "vitest";
import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { ApiError } from "@/shared/api/api-error";
import { de } from "@/shared/i18n/messages/de";
import { en } from "@/shared/i18n/messages/en";
import { ru } from "@/shared/i18n/messages/ru";
import { describeAuthError, isLoginRejection } from "./auth-error";

const messages = en.auth.errors;

// Every code `/auth/*` can return (API.md §1.5, §3) plus the client-side ones (D-024).
const AUTH_CODES = [
  "VALIDATION_FAILED",
  "POW_INVALID",
  "POW_REQUIRED",
  "LOGIN_TAKEN",
  "LOGIN_RESERVED",
  "IDEMPOTENCY_CONFLICT",
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "UNAUTHENTICATED",
  "ORIGIN_MISMATCH",
  "PAYLOAD_TOO_LARGE",
  "RATE_LIMITED",
  "INTERNAL",
  "NETWORK_ERROR",
  "UNEXPECTED_RESPONSE",
];

describe("describeAuthError", () => {
  it.each([ru, en, de])("has a message for every /auth error code", (dictionary) => {
    expect(Object.keys(dictionary.auth.errors.codes).sort()).toEqual([...AUTH_CODES].sort());
  });

  it("uses the text for the error code", () => {
    const error = new ApiError({ status: 409, code: "LOGIN_TAKEN" });

    expect(describeAuthError(error, messages)).toBe(messages.codes.LOGIN_TAKEN);
  });

  it("puts the wait time in minutes, rounded up, into ACCOUNT_LOCKED", () => {
    const error = new ApiError({ status: 423, code: "ACCOUNT_LOCKED", retryAfterSeconds: 61 });

    expect(describeAuthError(error, messages)).toContain("2 min");
  });

  it("falls back to a generic text for an unknown code", () => {
    expect(describeAuthError(new ApiError({ status: 418, code: "TEAPOT" }), messages)).toBe(messages.unknown);
  });

  it("reports a failed decryption as a wrong password", () => {
    expect(describeAuthError(new DecryptionFailedError(), messages)).toBe(messages.wrongPassword);
  });
});

describe("isLoginRejection", () => {
  it("is true for a taken, reserved or invalid login", () => {
    expect(isLoginRejection(new ApiError({ status: 409, code: "LOGIN_TAKEN" }))).toBe(true);
    expect(isLoginRejection(new ApiError({ status: 422, code: "LOGIN_RESERVED" }))).toBe(true);
    expect(
      isLoginRejection(
        new ApiError({ status: 400, code: "VALIDATION_FAILED", details: [{ path: "login", issue: "too_short" }] }),
      ),
    ).toBe(true);
  });

  it("is false for other failures", () => {
    expect(isLoginRejection(new ApiError({ status: 400, code: "POW_INVALID" }))).toBe(false);
  });
});
