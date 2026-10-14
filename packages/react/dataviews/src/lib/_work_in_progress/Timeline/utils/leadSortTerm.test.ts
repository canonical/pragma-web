import { describe, expect, it } from "vitest";
import leadSortTerm from "./leadSortTerm.js";

describe("leadSortTerm", () => {
  it("puts the field first, keeping every other term after it", () => {
    expect(
      leadSortTerm(
        [
          { field: "actor", direction: "asc" },
          { field: "at", direction: "asc" },
        ],
        "at",
        "desc",
        null,
      ),
    ).toEqual([
      { field: "at", direction: "desc" },
      { field: "actor", direction: "asc" },
    ]);
  });

  it("orders by the field alone where nothing is in force", () => {
    expect(leadSortTerm([], "at", "asc", null)).toEqual([
      { field: "at", direction: "asc" },
    ]);
  });

  it("keeps as many terms as the source's limit allows", () => {
    expect(
      leadSortTerm([{ field: "actor", direction: "asc" }], "at", "desc", 1),
    ).toEqual([{ field: "at", direction: "desc" }]);
  });
});
