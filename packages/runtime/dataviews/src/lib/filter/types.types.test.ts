/**
 * The filter records' contracts: a handle typed by its field's kind and
 * operator, and what only a record's owner reads and calls. A handle that
 * starts addressing an operator its kind does not have fails the build
 * through `@ts-expect-error`.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import { createSchema } from "../schema/index.js";
import type {
  FilterFeedback,
  FilterHandle,
  FilterHandles,
  FilterInput,
} from "./types.js";

const machines = createSchema([
  { field: "status", kind: "choices", options: ["failed", "ready"] },
  { field: "cores", kind: "number" },
  { field: "owner", kind: "presence" },
]);

type Handles = FilterHandles<typeof machines.fields>;

describe("FilterFeedback", () => {
  it("says whether an earlier predicate still stands only where an edit failed", () => {
    const invalid: FilterFeedback = {
      status: "invalid",
      reason: "not a number",
      retainsPredicate: true,
    };
    const applied: FilterFeedback = {
      status: "applied",
      // @ts-expect-error an applied edit leaves nothing earlier standing
      retainsPredicate: false,
    };
    expect([invalid, applied]).toHaveLength(2);
  });
});

describe("FilterHandles", () => {
  it("keys each field's handles by the operators its kind has", () => {
    expectTypeOf<keyof Handles["status"]>().toEqualTypeOf<"isAny" | "isNone">();
    expectTypeOf<keyof Handles["cores"]>().toEqualTypeOf<"gte" | "lte">();
    expectTypeOf<keyof Handles["owner"]>().toEqualTypeOf<"isSet">();
  });

  it("types each handle by its field's applied value", () => {
    expectTypeOf<Handles["owner"]["isSet"]>().toEqualTypeOf<
      FilterHandle<boolean>
    >();
    expectTypeOf<Handles["cores"]["gte"]>().toEqualTypeOf<
      FilterHandle<number>
    >();
  });

  it("refuses an operator the field's kind does not have", () => {
    const bound = (handles: Handles) =>
      // @ts-expect-error a presence field is only ever set or not
      handles.owner.gte;
    expect(bound).toBeTypeOf("function");
  });
});

describe("FilterInput", () => {
  it("is a handle its owner can also move under", () => {
    expectTypeOf<FilterInput>().toExtend<FilterHandle<unknown>>();
  });
});
