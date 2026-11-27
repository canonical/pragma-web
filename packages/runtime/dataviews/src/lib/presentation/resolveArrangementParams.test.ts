import { describe, expect, it } from "vitest";
import resolveArrangementParams from "./resolveArrangementParams.js";
import type { DeclaredColumn } from "./types.js";

const columns: readonly DeclaredColumn[] = [
  { id: "name" },
  { id: "status" },
  { id: "cores" },
];

describe("resolveArrangementParams", () => {
  it("carries the stored order and hidden list as they are stored, undeclared ids included", () => {
    expect(
      resolveArrangementParams({
        table: "t",
        columns,
        presentation: {
          "table.t.order": ["region", "cores", "name", 3],
          "table.t.hidden": ["zone", "status"],
          "table.t.width.name": 200,
        },
      }),
    ).toEqual({
      order: ["region", "cores", "name"],
      hidden: ["zone", "status"],
    });
  });

  it("gives the declared order where none is stored, and no hidden column where none is", () => {
    expect(
      resolveArrangementParams({ table: "t", columns, presentation: {} }),
    ).toEqual({
      order: ["name", "status", "cores"],
      hidden: [],
    });
  });
});
