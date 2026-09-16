/** The connected table alone takes null for its footer: it has one by default. */
import type { ReactElement } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { DataViewsDataTableProps } from "./types.js";

describe("DataViewsDataTableProps", () => {
  it("takes a footer element, null for none, or nothing for the default", () => {
    expectTypeOf<DataViewsDataTableProps["footer"]>().toEqualTypeOf<
      ReactElement | null | undefined
    >();
  });
});
