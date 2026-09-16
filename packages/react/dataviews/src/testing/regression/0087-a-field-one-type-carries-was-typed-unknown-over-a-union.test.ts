/**
 * A typed column read its field's value as `TRow[TName]`, which over a
 * record that is a union of types only answers for the keys every type
 * carries. A field one type carries — the scoped field, the case the typed
 * table is about — fell through to `unknown`, so content over it was handed
 * nothing better than an untyped cell would have been.
 *
 * The value is read per type of the union: the field's value where a type
 * carries it, `undefined` where a type does not, which is the not-applicable
 * case; a name no type carries stays `unknown` only for a record that
 * describes no names.
 */
import { describe, expectTypeOf, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";

describe("a field only one type of a union carries", () => {
  it("is typed as that type's value, or undefined", () => {
    createColumns(instances, [
      {
        field: "image",
        header: "Image",
        cell: ({ value }) => {
          expectTypeOf(value).toEqualTypeOf<string | undefined>();
          return null;
        },
      },
      {
        field: "firmware",
        header: "Firmware",
        cell: ({ value }) => {
          expectTypeOf(value).toEqualTypeOf<"bios" | "uefi" | undefined>();
          return null;
        },
      },
      {
        field: "name",
        header: "Name",
        // A field every type carries: the value alone.
        cell: ({ value }) => {
          expectTypeOf(value).toEqualTypeOf<string>();
          return null;
        },
      },
    ]);
  });
});
