/**
 * The props a field's content receives: one type, unknown by default, typed
 * by value and record where a column is declared through `createColumns`.
 */
import { describe, expectTypeOf, it } from "vitest";
import { type Instance, instances } from "../../../../testing/instances.js";
import createColumns from "../../_work_in_progress/DataTable/createColumns.js";
import type { DisplayFieldCellProps } from "./types.js";

describe("DisplayFieldCellProps", () => {
  it("is one type, untyped by hand and typed through createColumns", () => {
    expectTypeOf<DisplayFieldCellProps>().toEqualTypeOf<
      DisplayFieldCellProps<unknown, unknown>
    >();
    createColumns(instances, [
      {
        field: "name",
        header: "Name",
        cell: (props) => {
          expectTypeOf(props).toEqualTypeOf<
            DisplayFieldCellProps<string, Instance>
          >();
          return null;
        },
      },
    ]);
  });
});
