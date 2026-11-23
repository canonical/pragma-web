import { describe, expect, it } from "vitest";
import collapseSortTerms from "./collapseSortTerms.js";

describe("collapseSortTerms", () => {
  it("keeps each field's first term, in precedence order", () => {
    expect(
      collapseSortTerms([
        { field: "name", direction: "asc" },
        { field: "cpu", direction: "desc" },
        { field: "name", direction: "desc" },
      ]),
    ).toEqual([
      { field: "name", direction: "asc" },
      { field: "cpu", direction: "desc" },
    ]);
  });

  it("copies the terms it keeps", () => {
    const term = { field: "name", direction: "asc" } as const;
    expect(collapseSortTerms([term]).at(0)).not.toBe(term);
  });
});
