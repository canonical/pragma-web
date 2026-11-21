import { describe, expect, it } from "vitest";
import { buildSearchPassage } from "./buildSearchPassage.js";

describe("buildSearchPassage", () => {
  it("keeps a value that fits whole, with every occurrence", () => {
    expect(buildSearchPassage("Line on line", "line", 0)).toEqual({
      passage: "Line on line",
      ranges: [
        { start: 0, length: 4 },
        { start: 8, length: 4 },
      ],
    });
  });

  it("centres the first occurrence in 160 characters of a long value", () => {
    const value = `${"a".repeat(200)}needle${"b".repeat(200)}`;
    const { passage, ranges } = buildSearchPassage(value, "needle", 200);
    expect(passage).toHaveLength(160);
    expect(ranges).toEqual([{ start: 77, length: 6 }]);
  });

  it("clamps the passage to the value's start and end", () => {
    const head = `needle${"a".repeat(300)}`;
    expect(buildSearchPassage(head, "needle", 0).ranges).toEqual([
      { start: 0, length: 6 },
    ]);
    const tail = `${"a".repeat(300)}needle`;
    expect(buildSearchPassage(tail, "needle", 300)).toEqual({
      passage: tail.slice(-160),
      ranges: [{ start: 154, length: 6 }],
    });
  });
});
