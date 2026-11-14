import { describe, expectTypeOf, it } from "vitest";
import type { QueryChipsProps as Props } from "./types.js";

/** Type-level tests, enforced by `tsc --noEmit`. */
describe("QueryChips props", () => {
  it("takes exactly one of label and aria-labelledby", () => {
    expectTypeOf<{ label: "Filters"; children: "x" }>().toExtend<Props>();
    expectTypeOf<{
      "aria-labelledby": "heading";
      children: "x";
    }>().toExtend<Props>();
    // @ts-expect-error the list needs a name.
    const unnamed: Props = { children: "x" };
    // @ts-expect-error label and aria-labelledby are not given together.
    const both: Props = {
      label: "Filters",
      "aria-labelledby": "heading",
      children: "x",
    };
    expectTypeOf(unnamed).toEqualTypeOf<Props>();
    expectTypeOf(both).toEqualTypeOf<Props>();
  });

  it("fixes the role", () => {
    expectTypeOf<Props>().not.toHaveProperty("role");
  });
});
