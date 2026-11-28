import { describe, expect, it } from "vitest";
import moveColumn from "./moveColumn.js";
import resolveColumnArrangement from "./resolveColumnArrangement.js";
import type { DeclaredColumn } from "./types.js";

const columns: readonly DeclaredColumn[] = [
  { id: "name" },
  { id: "status" },
  { id: "cores" },
  { id: "owner" },
];

describe("moveColumn", () => {
  it("moves a column past its neighbour either way, naming every declared column", () => {
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation: {},
        id: "cores",
        offset: -1,
      }),
    ).toEqual({ "table.t.order": ["name", "cores", "status", "owner"] });
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation: {},
        id: "status",
        offset: 1,
      }),
    ).toEqual({ "table.t.order": ["name", "cores", "status", "owner"] });
  });

  it("steps over hidden columns, which keep their places", () => {
    const presentation = { "table.t.hidden": ["status", "cores"] };
    const patch = moveColumn({
      table: "t",
      columns,
      presentation,
      id: "owner",
      offset: -1,
    });
    expect(patch).toEqual({
      "table.t.order": ["owner", "name", "status", "cores"],
    });
    expect(
      resolveColumnArrangement("t", columns, { ...presentation, ...patch })
        .filter(({ hidden }) => !hidden)
        .map(({ column }) => column.id),
    ).toEqual(["owner", "name"]);
  });

  it("moves right across hidden columns to after the next shown one", () => {
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation: { "table.t.hidden": ["status", "cores"] },
        id: "name",
        offset: 1,
      }),
    ).toEqual({ "table.t.order": ["status", "cores", "owner", "name"] });
  });

  it("writes no junk or repeated id from a stored order, keeping an undeclared id in its place", () => {
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation: { "table.t.order": ["name", 3, "name", "region"] },
        id: "status",
        offset: -1,
      }),
    ).toEqual({
      "table.t.order": ["status", "region", "name", "cores", "owner"],
    });
  });

  it("keeps the ids of columns it does not declare where they stood", () => {
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation: { "table.t.order": ["region", "owner", "zone", "name"] },
        id: "name",
        offset: 1,
      }),
    ).toEqual({
      "table.t.order": ["region", "owner", "zone", "status", "name", "cores"],
    });
  });

  it("changes nothing past either end, for a hidden column or an unknown one", () => {
    const presentation = { "table.t.hidden": ["cores"] };
    expect(
      moveColumn({ table: "t", columns, presentation, id: "name", offset: -1 }),
    ).toBeNull();
    expect(
      moveColumn({ table: "t", columns, presentation, id: "owner", offset: 1 }),
    ).toBeNull();
    expect(
      moveColumn({ table: "t", columns, presentation, id: "cores", offset: 1 }),
    ).toBeNull();
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation,
        id: "region",
        offset: -1,
      }),
    ).toBeNull();
  });

  it("orders from its own table's keys, writing only its own order", () => {
    expect(
      moveColumn({
        table: "t",
        columns,
        presentation: {
          "table.u.order": ["status", "name"],
          "table.u.hidden": ["cores"],
          "table.u.width.name": 300,
        },
        id: "cores",
        offset: -1,
      }),
    ).toEqual({ "table.t.order": ["name", "cores", "status", "owner"] });
  });
});
