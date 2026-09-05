import { describe, expect, it } from "vitest";
import { findLoginIssue, findPasswordIssue, normalizeLogin } from "./credentials";

describe("normalizeLogin", () => {
  it("applies NFKC and lower-case like the server", () => {
    expect(normalizeLogin(" ＫＡＧＥ ")).toBe("kage");
  });
});

describe("findLoginIssue", () => {
  it.each([
    ["kage", null],
    ["k.a-g_e", null],
    ["_kage_", null],
    ["ka", "too_short"],
    ["k".repeat(33), "too_long"],
    [".kage", "invalid_format"],
    ["kage-", "invalid_format"],
    ["ка ge", "invalid_format"],
  ])("%s → %s", (login, issue) => {
    expect(findLoginIssue(login)).toBe(issue);
  });
});

describe("findPasswordIssue", () => {
  it("counts characters, not UTF-16 units", () => {
    expect(findPasswordIssue("🔑".repeat(11))).toBe("too_short");
    expect(findPasswordIssue("🔑".repeat(12))).toBeNull();
  });

  it("limits the password to 256 bytes of UTF-8", () => {
    expect(findPasswordIssue("ы".repeat(128))).toBeNull();
    expect(findPasswordIssue("ы".repeat(129))).toBe("too_long");
  });
});
