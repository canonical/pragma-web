import { describe, expectTypeOf, it } from "vitest";
import type Props from "./types.js";

/**
 * Type-level tests for IconButton's props.
 *
 * Nothing here asserts at runtime: `tsc --noEmit` is the gate, and this
 * package's tsconfig includes test files, so every `@ts-expect-error` below
 * must still be an error or the check fails. The `it()` wrappers exist so
 * Vitest sees a suite.
 */
describe("IconButton props", () => {
  it("requires an accessible name", () => {
    expectTypeOf<{
      icon: "edit";
      "aria-label": "Edit";
    }>().toExtend<Props>();
    expectTypeOf<{
      icon: "edit";
      "aria-labelledby": "edit-label";
    }>().toExtend<Props>();
    // @ts-expect-error neither aria-label nor aria-labelledby is given.
    const unnamed: Props = { icon: "edit" };
    expectTypeOf(unnamed).toEqualTypeOf<Props>();
  });

  it("refuses children", () => {
    const withChildren: Props = {
      icon: "edit",
      "aria-label": "Edit",
      // @ts-expect-error an icon button has no visible children.
      children: "Edit",
    };
    expectTypeOf(withChildren).toEqualTypeOf<Props>();
  });

  it("refuses the link variant", () => {
    const asLink: Props = {
      icon: "edit",
      "aria-label": "Edit",
      // @ts-expect-error the link variant strips the square box.
      variant: "link",
    };
    expectTypeOf(asLink).toEqualTypeOf<Props>();
  });
});
