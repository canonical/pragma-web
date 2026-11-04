/**
 * The presence filter's props: its own, the root's native props beside
 * them, and the content it draws itself.
 */
import type { Count, FilterHandle } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { FlagFilterProps } from "./types.js";

describe("FlagFilterProps", () => {
  it("binds one field's presence handle, with its count when a facet answers", () => {
    expectTypeOf<FlagFilterProps["handle"]>().toEqualTypeOf<
      FilterHandle<boolean>
    >();
    expectTypeOf<FlagFilterProps["count"]>().toEqualTypeOf<Count | null>();
  });

  it("takes the native props of the div it renders as its root", () => {
    expectTypeOf<FlagFilterProps["className"]>().toEqualTypeOf<
      ComponentProps<"div">["className"]
    >();
    expectTypeOf<FlagFilterProps>().toHaveProperty("onKeyDown");
  });

  it("draws its own content", () => {
    expectTypeOf<FlagFilterProps>().not.toHaveProperty("children");
  });
});
