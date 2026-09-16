/**
 * Whether a column could head every row was read from its declaration and
 * its schema field directly, apart from the scopes every column's heading
 * and cells are drawn from, so the header check and the cells could come to
 * disagree about what one column applies to.
 *
 * The header is checked against the scope the table read for that column.
 */

import { describe, expect, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import readRowHeader from "../../lib/_work_in_progress/DataTable/common/ScopedDataTable/readRowHeader.js";
import type { FieldScope } from "../../lib/utils/types.js";

const header = { id: "name", header: "Name", rowHeader: true } as const;

/** Every column read as scoped to the given types, and no other reading. */
const scopedTo = (scope: FieldScope["scope"]) => (): FieldScope => ({
  scope,
  applicability: () => "applies",
});

describe("the column heading each row", () => {
  it("is checked against the scope the table read for it", () => {
    // Nothing in the declaration or the schema narrows `name`: the scope
    // read for it alone decides.
    expect(() =>
      readRowHeader([header], scopedTo(["container"]), instances.types),
    ).toThrow(
      'DataTable column "name" is the row header, but its field "name" does not apply to every record type',
    );
    expect(
      readRowHeader(
        [header],
        scopedTo(["container", "virtual-machine"]),
        instances.types,
      ),
    ).toMatchObject({ id: "name", hideable: false });
    expect(
      readRowHeader([header], scopedTo(null), instances.types),
    ).toMatchObject({ id: "name" });
  });
});
