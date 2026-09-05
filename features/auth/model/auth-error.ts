import { DecryptionFailedError } from "@/features/crypto/model/crypto-errors";
import { PowSolverError } from "@/features/crypto/pow/solve-pow";
import { ApiError } from "@/shared/api/api-error";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";

type ErrorMessages = Messages["auth"]["errors"];
type ErrorCode = keyof ErrorMessages["codes"];

const SECONDS_PER_MINUTE = 60;

function isKnownCode(codes: ErrorMessages["codes"], code: string): code is ErrorCode {
  return Object.hasOwn(codes, code);
}

function minutesUntilRetry(error: ApiError): number {
  return Math.max(1, Math.ceil((error.retryAfterSeconds ?? SECONDS_PER_MINUTE) / SECONDS_PER_MINUTE));
}

function describeApiError(error: ApiError, messages: ErrorMessages): string {
  if (error.code === "ACCOUNT_LOCKED" || error.code === "RATE_LIMITED") {
    return formatMessage(messages.codes[error.code], { minutes: minutesUntilRetry(error) });
  }
  return isKnownCode(messages.codes, error.code) ? messages.codes[error.code] : messages.unknown;
}

/** Text for any failure of an `/auth` flow. Branches on `error.code` only (API.md §1.5). */
export function describeAuthError(error: unknown, messages: ErrorMessages): string {
  if (error instanceof ApiError) return describeApiError(error, messages);
  if (error instanceof DecryptionFailedError) return messages.wrongPassword;
  if (error instanceof PowSolverError) return messages.powFailed;
  return messages.unknown;
}

const LOGIN_REJECTION_CODES: ReadonlySet<string> = new Set(["LOGIN_TAKEN", "LOGIN_RESERVED"]);

/** The server refused the login itself: the user has to pick another one. */
export function isLoginRejection(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (LOGIN_REJECTION_CODES.has(error.code)) return true;
  return error.code === "VALIDATION_FAILED" && error.details.some((detail) => detail.path === "login");
}
