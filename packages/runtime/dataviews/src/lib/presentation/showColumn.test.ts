import { describe, expect, it } from "vitest";
import showColumn from "./showColumn.js";
import type { DeclaredColumn } from "./types.js";

const columns: readonly DeclaredColumn[] = [
  { id: "name" },
  { id: "status" },
  { id: "cores" },
];

describe("showColumn", () => {
  it("takes the column out of the hidden list, keeping every other id", () => {
    expect(
      showColumn({
        table: "t",
        columns,
        presentation: { "table.t.hidden": ["region", "status", "status"] },
        id: "status",
      }),
    ).toEqual({ "table.t.hidden": ["region"] });
  });

  it("drops a column the list kept shown by naming every column, and keeps an unhideable one's id", () => {
    // Every column named: the first is shown anyway, so it leaves the list.
    expect(
      showColumn({
        table: "t",
        columns,
        presentation: { "table.t.hidden": ["name", "status", "cores"] },
        id: "cores",
      }),
    ).toEqual({ "table.t.hidden": ["status"] });
    // An unhideable column is shown whatever the list says: its id stays, for
    // a table that declares it hideable.
    expect(
      showColumn({
        table: "t",
        columns: [{ id: "name", hideable: false }, { id: "status" }],
        presentation: { "table.t.hidden": ["name", "status"] },
        id: "status",
      }),
    ).toEqual({ "table.t.hidden": ["name"] });
  });

  it("changes nothing for an unknown or shown column", () => {
    const presentation = { "table.t.hidden": ["status"] };
    expect(
      showColumn({ table: "t", columns, presentation, id: "region" }),
    ).toBeNull();
    expect(
      showColumn({ table: "t", columns, presentation, id: "cores" }),
    ).toBeNull();
  });

  it("leaves another table's hidden list alone", () => {
    expect(
      showColumn({
        table: "t",
        columns,
        presentation: {
          "table.u.order": ["status", "name"],
          "table.u.hidden": ["cores"],
          "table.u.width.name": 300,
        },
        id: "cores",
      }),
    ).toBeNull();
  });
});
