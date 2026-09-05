import { describe, expect, it } from "vitest";
import { pickCheckPositions } from "./phrase-check";

describe("pickCheckPositions", () => {
  it("picks three distinct positions inside the phrase, in order", () => {
    for (let round = 0; round < 50; round += 1) {
      const positions = pickCheckPositions(24);

      expect(new Set(positions).size).toBe(3);
      expect(positions.every((position) => position >= 0 && position < 24)).toBe(true);
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    }
  });
});
