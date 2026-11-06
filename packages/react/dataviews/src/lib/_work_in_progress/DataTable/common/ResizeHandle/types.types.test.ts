/**
 * The resize handle's props: what it resizes, the bounds every path is held
 * to, and how it names the column and speaks through the table.
 */
import type { GridInteraction } from "@canonical/dataviews-core/bindings";
import type { ComponentProps, ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { ResizeHandleProps } from "./types.js";

describe("ResizeHandleProps", () => {
  it("resizes one column through the grid's interaction", () => {
    expectTypeOf<
      ResizeHandleProps["interaction"]
    >().toEqualTypeOf<GridInteraction>();
    expectTypeOf<ResizeHandleProps["columnId"]>().toEqualTypeOf<string>();
  });

  it("holds every width between the column's declared bounds", () => {
    expectTypeOf<ResizeHandleProps["min"]>().toEqualTypeOf<number>();
    expectTypeOf<ResizeHandleProps["max"]>().toEqualTypeOf<number>();
  });

  it("names the column in its hint and speaks through the table's announcer", () => {
    expectTypeOf<ResizeHandleProps["name"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<ResizeHandleProps["announce"]>().toEqualTypeOf<
      (message: ReactNode) => void
    >();
  });

  it("takes the native props of the div it renders as its root", () => {
    expectTypeOf<ResizeHandleProps["className"]>().toEqualTypeOf<
      ComponentProps<"div">["className"]
    >();
    expectTypeOf<ResizeHandleProps>().toHaveProperty("title");
  });

  it("draws its own content", () => {
    expectTypeOf<ResizeHandleProps>().not.toHaveProperty("children");
  });
});
