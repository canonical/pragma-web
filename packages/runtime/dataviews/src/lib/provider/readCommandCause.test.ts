import { describe, expect, it } from "vitest";
import readCommandCause from "./readCommandCause.js";

describe("readCommandCause", () => {
  it("announces every predicate command as a move of the filter", () => {
    expect(
      readCommandCause({
        kind: "setPredicate",
        predicate: { field: "cpu", operator: "gte", operands: [4] },
      }),
    ).toBe("filter");
    expect(
      readCommandCause({
        kind: "removePredicate",
        field: "cpu",
        operator: "gte",
      }),
    ).toBe("filter");
    expect(
      readCommandCause({ kind: "editPredicates", remove: [], add: [] }),
    ).toBe("filter");
  });

  it("announces each other command as the member it is named for", () => {
    expect(readCommandCause({ kind: "setSearch", search: "ex" })).toBe(
      "search",
    );
    expect(readCommandCause({ kind: "setSort", sort: [] })).toBe("sort");
    expect(readCommandCause({ kind: "setGroup", group: [] })).toBe("group");
    expect(readCommandCause({ kind: "setCollapsed", collapsed: [] })).toBe(
      "collapse",
    );
    expect(readCommandCause({ kind: "navigateWindow", page: 2 })).toBe(
      "window",
    );
  });

  it("announces a clear as the filter's move when it empties the filter", () => {
    expect(readCommandCause({ kind: "clear", paths: ["filter"] })).toBe(
      "filter",
    );
    expect(
      readCommandCause({ kind: "clear", paths: ["search", "filter"] }),
    ).toBe("filter");
    expect(readCommandCause({ kind: "clear", paths: ["search"] })).toBe(
      "search",
    );
  });
});
