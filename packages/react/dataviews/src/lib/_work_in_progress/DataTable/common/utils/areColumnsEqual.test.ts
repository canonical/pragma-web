/** The rendered reading carries what the model reading deliberately does not. */
import { describe, expect, it } from "vitest";
import type { DataTableColumn } from "../../types.js";
import areBodyColumnsEqual from "./areBodyColumnsEqual.js";
import areColumnsEqual from "./areColumnsEqual.js";

const name: DataTableColumn = { id: "name", header: "Name" };

describe("areColumnsEqual", () => {
  it("carries the model", () => {
    expect(areColumnsEqual([name], [{ ...name, id: "machine" }])).toBe(false);
  });

  it("sees sorting and resizing offered or withdrawn", () => {
    expect(areColumnsEqual([name], [{ ...name, sortable: true }])).toBe(false);
    expect(areColumnsEqual([name], [{ ...name, resizable: true }])).toBe(false);
  });

  it("compares the header and the renderer by reference", () => {
    const cell = () => null;
    expect(areColumnsEqual([name], [{ ...name }])).toBe(true);
    expect(areColumnsEqual([name], [{ ...name, header: "Machine" }])).toBe(
      false,
    );
    expect(areColumnsEqual([{ ...name, cell }], [{ ...name, cell }])).toBe(
      true,
    );
    expect(
      areColumnsEqual([{ ...name, cell }], [{ ...name, cell: () => null }]),
    ).toBe(false);
  });

  it("sees a scope, a row header and hideability change with the ids kept", () => {
    const scoped = { ...name, appliesTo: ["container"] };
    expect(areColumnsEqual([scoped], [{ ...scoped }])).toBe(true);
    expect(
      areColumnsEqual([scoped], [{ ...name, appliesTo: ["virtual-machine"] }]),
    ).toBe(false);
    expect(areColumnsEqual([scoped], [name])).toBe(false);
    expect(areColumnsEqual([name], [{ ...name, rowHeader: true }])).toBe(false);
    expect(areColumnsEqual([name], [{ ...name, hideable: false }])).toBe(false);
  });

  it("tells apart every pair the body's comparator does, and headings besides", () => {
    const Cell = () => null;
    const pairs: readonly (readonly [DataTableColumn, DataTableColumn])[] = [
      [name, { ...name, cell: Cell }],
      [name, { ...name, rowHeader: true }],
      [name, { ...name, appliesTo: ["container"] }],
      [name, { ...name, field: "status" }],
    ];
    for (const [a, b] of pairs) {
      expect(areBodyColumnsEqual([a], [b])).toBe(false);
      expect(areColumnsEqual([a], [b])).toBe(false);
    }
    const headings: readonly DataTableColumn[] = [
      { ...name, header: "Host" },
      { ...name, sortable: false },
      { ...name, resizable: false },
      { ...name, hideable: false },
    ];
    for (const other of headings) {
      expect(areBodyColumnsEqual([name], [other])).toBe(true);
      expect(areColumnsEqual([name], [other])).toBe(false);
    }
  });
});
