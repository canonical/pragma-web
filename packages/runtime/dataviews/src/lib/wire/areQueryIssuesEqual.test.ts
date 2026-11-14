import { describe, expect, it } from "vitest";
import type { QueryIssue } from "../result/index.js";
import areQueryIssuesEqual from "./areQueryIssuesEqual.js";

const melted: QueryIssue = {
  parameter: "status",
  field: "status",
  code: "invalid",
  reason: '"melted" is not an option',
};

describe("areQueryIssuesEqual", () => {
  it("reads two lists saying the same thing as equal", () => {
    expect(areQueryIssuesEqual([melted], [{ ...melted }])).toBe(true);
    expect(areQueryIssuesEqual([], [])).toBe(true);
  });

  it("tells apart lists differing in any member of any issue, or in length", () => {
    for (const changed of [
      { parameter: "status__isAny" },
      { field: null },
      { code: "malformed" as const },
      { reason: "other" },
    ]) {
      expect(areQueryIssuesEqual([melted], [{ ...melted, ...changed }])).toBe(
        false,
      );
    }
    expect(areQueryIssuesEqual([melted], [])).toBe(false);
  });
});
