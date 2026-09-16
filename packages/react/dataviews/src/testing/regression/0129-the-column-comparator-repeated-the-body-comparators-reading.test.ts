/**
 * The table held its columns by one comparator and handed its rows columns
 * held by another, and the two spelled their shared reading — the model,
 * the scopes, each cell and which column heads the row — separately. A
 * reading added to the body's alone would leave the table holding columns
 * the rows were told had changed.
 *
 * The table's comparator is the body's, and the header's reading besides.
 */

import { describe, expect, it } from "vitest";
import areBodyColumnsEqual from "../../lib/_work_in_progress/DataTable/common/utils/areBodyColumnsEqual.js";
import areColumnsEqual from "../../lib/_work_in_progress/DataTable/common/utils/areColumnsEqual.js";
import type { DataTableColumn } from "../../lib/_work_in_progress/DataTable/types.js";

const Cell = () => null;
const base: DataTableColumn = { id: "name", header: "Name" };

describe("the table's column comparator", () => {
  it("tells apart every pair the body's comparator does, and headings besides", () => {
    const pairs: readonly (readonly [DataTableColumn, DataTableColumn])[] = [
      [base, { ...base, cell: Cell }],
      [base, { ...base, rowHeader: true }],
      [base, { ...base, appliesTo: ["container"] }],
      [base, { ...base, field: "status" }],
    ];
    for (const [a, b] of pairs) {
      expect(areBodyColumnsEqual([a], [b])).toBe(false);
      expect(areColumnsEqual([a], [b])).toBe(false);
    }
    const headings: readonly DataTableColumn[] = [
      { ...base, header: "Host" },
      { ...base, sortable: false },
      { ...base, resizable: false },
      { ...base, hideable: false },
    ];
    for (const other of headings) {
      expect(areBodyColumnsEqual([base], [other])).toBe(true);
      expect(areColumnsEqual([base], [other])).toBe(false);
    }
    expect(areColumnsEqual([base], [{ ...base }])).toBe(true);
  });
});
