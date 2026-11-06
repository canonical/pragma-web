/**
 * The header cell's props: the column and ordering it renders from, the
 * root's native props beside them, and the attributes it derives itself.
 */
import type { SortDirection } from "@canonical/dataviews-core";
import type { ComponentProps, ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { HeaderCellProps, SortPrecedence } from "./types.js";

describe("SortPrecedence", () => {
  it("places one column's field among the ordering's terms", () => {
    expectTypeOf<SortPrecedence>().toEqualTypeOf<{
      readonly direction: SortDirection;
      readonly position: number;
      readonly count: number;
    }>();
  });
});

describe("HeaderCellProps", () => {
  it("renders from the ordering in force, or none", () => {
    expectTypeOf<
      HeaderCellProps["precedence"]
    >().toEqualTypeOf<SortPrecedence | null>();
    expectTypeOf<HeaderCellProps["destination"]>().toEqualTypeOf<
      string | null
    >();
  });

  it("speaks through the table's announcer", () => {
    expectTypeOf<HeaderCellProps["announce"]>().toEqualTypeOf<
      (message: ReactNode) => void
    >();
  });

  it("takes the native props of the div it renders as its root", () => {
    expectTypeOf<HeaderCellProps["className"]>().toEqualTypeOf<
      ComponentProps<"div">["className"]
    >();
    expectTypeOf<HeaderCellProps>().toHaveProperty("title");
  });

  it("derives its role, name, sort state, description and blur itself", () => {
    expectTypeOf<HeaderCellProps>().not.toHaveProperty("role");
    expectTypeOf<HeaderCellProps>().not.toHaveProperty("aria-labelledby");
    expectTypeOf<HeaderCellProps>().not.toHaveProperty("aria-sort");
    expectTypeOf<HeaderCellProps>().not.toHaveProperty("aria-describedby");
    expectTypeOf<HeaderCellProps>().not.toHaveProperty("onBlur");
    expectTypeOf<HeaderCellProps>().not.toHaveProperty("children");
  });
});
