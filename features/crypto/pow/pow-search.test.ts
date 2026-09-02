import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { countLeadingZeroBits, powProgress, searchPowNonce } from "./pow-search";

const PREFIX = new Uint8Array(16).fill(3);

function sha256(message: Uint8Array): Uint8Array {
  return new Uint8Array(createHash("sha256").update(message).digest());
}

// Same check as the backend: SHA-256 over the prefix bytes, then the nonce as UTF-8.
function serverAccepts(nonce: string, difficulty: number): boolean {
  const digest = createHash("sha256").update(PREFIX).update(nonce, "utf8").digest();
  return countLeadingZeroBits(digest) >= difficulty;
}

describe("countLeadingZeroBits", () => {
  it.each([
    [[0x80], 0],
    [[0x01], 7],
    [[0x00, 0x40], 9],
    [[0x00, 0x00], 16],
  ])("counts %j as %i", (bytes, expected) => {
    expect(countLeadingZeroBits(Uint8Array.from(bytes))).toBe(expected);
  });
});

describe("searchPowNonce", () => {
  it("finds a canonical decimal nonce the server accepts", () => {
    const nonce = searchPowNonce({ prefix: PREFIX, difficulty: 12, start: 0, attempts: 1_000_000, sha256 });

    expect(nonce).toMatch(/^(0|[1-9]\d*)$/);
    expect(serverAccepts(nonce ?? "", 12)).toBe(true);
  });

  it("returns the first solution in order", () => {
    const nonce = Number(searchPowNonce({ prefix: PREFIX, difficulty: 10, start: 0, attempts: 1_000_000, sha256 }));

    const earlier = Array.from({ length: nonce }, (_, value) => String(value));

    expect(earlier.some((candidate) => serverAccepts(candidate, 10))).toBe(false);
  });

  it("returns null when the range holds no solution", () => {
    expect(searchPowNonce({ prefix: PREFIX, difficulty: 32, start: 0, attempts: 100, sha256 })).toBeNull();
  });
});

describe("powProgress", () => {
  it("grows from 0 towards 1 and passes one half near 0.69 × 2^difficulty attempts", () => {
    expect(powProgress(0, 20)).toBe(0);
    expect(powProgress(Math.LN2 * 2 ** 20, 20)).toBeCloseTo(0.5);
    expect(powProgress(2 ** 24, 20)).toBeGreaterThan(0.99);
  });
});
