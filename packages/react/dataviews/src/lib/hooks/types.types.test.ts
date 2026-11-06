/**
 * The shared hooks' result types: the value hook hands back the value it
 * reads, with no wrapper around it.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { UseDataViewsValueResult } from "./types.js";

describe("UseDataViewsValueResult", () => {
  it("is the value itself", () => {
    expectTypeOf<UseDataViewsValueResult<number>>().toEqualTypeOf<number>();
    expectTypeOf<UseDataViewsValueResult<readonly string[]>>().toEqualTypeOf<
      readonly string[]
    >();
  });
});
