/** Same rules as the server's `/auth/register` (API.md §3). */
export const LOGIN_MIN_LENGTH = 3;
export const LOGIN_MAX_LENGTH = 32;
const LOGIN_PATTERN = /^[a-z0-9_](?:[a-z0-9._-]*[a-z0-9_])?$/;

/** The server checks neither: it never sees the password. */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_BYTES = 256;

export type LoginIssue = "too_short" | "too_long" | "invalid_format";
export type PasswordIssue = "too_short" | "too_long";

/** NFKC + lower-case, the only form the server stores or compares. */
export function normalizeLogin(raw: string): string {
  return raw.trim().normalize("NFKC").toLowerCase();
}

export function findLoginIssue(raw: string): LoginIssue | null {
  const login = normalizeLogin(raw);
  if (login.length < LOGIN_MIN_LENGTH) return "too_short";
  if (login.length > LOGIN_MAX_LENGTH) return "too_long";
  return LOGIN_PATTERN.test(login) ? null : "invalid_format";
}

/** Length in characters as people count them, not UTF-16 units. */
export function findPasswordIssue(password: string): PasswordIssue | null {
  if ([...password].length < PASSWORD_MIN_LENGTH) return "too_short";
  if (new TextEncoder().encode(password.normalize("NFKC")).length > PASSWORD_MAX_BYTES) return "too_long";
  return null;
}
