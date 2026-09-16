/**
 * A typed column's content took `TypedCellProps`, a second public type
 * repeating `DisplayFieldCellProps` member for member with type parameters
 * added: two names for the one shape every renderer hands a field's content.
 *
 * The one props type takes the value's and the record's types, unknown by
 * default, and a typed column's content is typed through it.
 */

import { describe, expectTypeOf, it } from "vitest";
import { type Instance, instances } from "../../../testing/instances.js";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";

describe("the props a field's content receives", () => {
  it("are one type, untyped by hand and typed through createColumns", () => {
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
