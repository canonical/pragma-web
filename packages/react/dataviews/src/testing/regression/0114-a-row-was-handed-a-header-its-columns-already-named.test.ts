/**
 * A row was handed the column heading it, beside the columns, whose row
 * header it already reads cell by cell: a prop derived from another prop,
 * which could disagree with it.
 *
 * The row reads its header from its columns.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { Machine } from "../../../testing/machines.js";
import type { RowProps } from "../../lib/_work_in_progress/DataTable/common/Row/types.js";

describe("a row's header", () => {
  it("is read from its columns, not handed beside them", () => {
    expectTypeOf<RowProps<Machine>>().not.toHaveProperty("rowHeader");
  });
});
