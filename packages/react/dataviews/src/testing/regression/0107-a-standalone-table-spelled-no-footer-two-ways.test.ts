/**
 * The table's footer took an element, or null, or nothing. Standalone, null
 * and nothing both meant no footer; only the connected table, which places
 * the root's pagination bar by default, gave null a meaning of its own. The
 * shared prop said two things for one.
 *
 * The standalone table takes an element or nothing; the connected table
 * alone also takes null, for none, since it alone has a footer by default.
 */

import type { ReactElement } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { MachineFields } from "../../../testing/machines.js";
import type { DataTableProps } from "../../lib/_work_in_progress/DataTable/index.js";
import type { DataViewsDataTableProps } from "../../lib/_work_in_progress/DataViews/index.js";

describe("the footer of each table", () => {
  it("has one spelling for none on each", () => {
    expectTypeOf<DataTableProps<MachineFields>["footer"]>().toEqualTypeOf<
      ReactElement | undefined
    >();
    expectTypeOf<DataViewsDataTableProps["footer"]>().toEqualTypeOf<
      ReactElement | null | undefined
    >();
  });
});
