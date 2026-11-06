/**
 * The result contracts a renderer switches on: every outcome is told apart
 * by one discriminant, and each carries only what that outcome means. A
 * shape that starts accepting another outcome's members fails the build
 * through `@ts-expect-error`.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { Completion, Count, SourceRefusal } from "./types.js";

describe("Count", () => {
  it("carries a value only when the count says how many", () => {
    const exact: Count = { kind: "exact", value: 4 };
    const atLeast: Count = { kind: "at-least", value: 100 };
    const unknown: Count = { kind: "unknown" };
    // @ts-expect-error an unknown count has no value to carry
    const valued: Count = { kind: "unknown", value: 0 };
    expect([exact, atLeast, unknown, valued]).toHaveLength(4);
  });
});

describe("Completion", () => {
  it("adds the binding's refusal to what a source delivers", () => {
    expectTypeOf<Completion["status"]>().toEqualTypeOf<
      "succeeded" | "failed" | "refused"
    >();
    expectTypeOf<
      Extract<Completion, { readonly status: "refused" }>["refusals"]
    >().toEqualTypeOf<readonly SourceRefusal[]>();
  });
});
