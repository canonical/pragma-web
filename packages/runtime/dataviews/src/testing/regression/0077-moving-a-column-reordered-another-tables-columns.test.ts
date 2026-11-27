/**
 * Regression: a move reordered the stored ids of columns the moving table
 * does not declare.
 *
 * A move now keeps every stored id in its place and fills the moving
 * table's places in its new order.
 */

import { describe, expect, it } from "vitest";
import {
  moveColumn,
  resolveColumnArrangement,
} from "../../lib/presentation/index.js";

describe("regression 0077 — a move reordered undeclared ids", () => {
  it("keeps the stored ids of undeclared columns in place", () => {
    const stored = { "table.t.order": ["cores", "status"] };
    const patch = moveColumn({
      table: "t",
      columns: [{ id: "name" }, { id: "status" }],
      presentation: stored,
      id: "name",
      offset: 1,
    });
    expect(patch).toEqual({ "table.t.order": ["cores", "status", "name"] });
    const other = [{ id: "status" }, { id: "cores" }];
    expect(
      resolveColumnArrangement("t", other, { ...stored, ...patch }).map(
        ({ column }) => column.id,
      ),
    ).toEqual(
      resolveColumnArrangement("t", other, stored).map(
        ({ column }) => column.id,
      ),
    );
  });
});
