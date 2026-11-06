/**
 * The refused-clause list's props: its own, the root's native props beside
 * them, and the content it draws itself.
 */
import type { QueryIssue } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { LinkRefusalsProps } from "./types.js";

describe("LinkRefusalsProps", () => {
  it("lists the location's refused parameters and clears one at a time", () => {
    expectTypeOf<LinkRefusalsProps["issues"]>().toEqualTypeOf<
      readonly QueryIssue[]
    >();
    expectTypeOf<LinkRefusalsProps["onClear"]>().toEqualTypeOf<
      (issue: QueryIssue) => void
    >();
  });

  it("leads its links nowhere without a location", () => {
    expectTypeOf<
      LinkRefusalsProps["params"]
    >().toEqualTypeOf<URLSearchParams | null>();
  });

  it("takes the native props of the div it renders as its root", () => {
    expectTypeOf<LinkRefusalsProps["className"]>().toEqualTypeOf<
      ComponentProps<"div">["className"]
    >();
    expectTypeOf<LinkRefusalsProps>().toHaveProperty("aria-describedby");
  });

  it("draws its own content", () => {
    expectTypeOf<LinkRefusalsProps>().not.toHaveProperty("children");
  });
});
