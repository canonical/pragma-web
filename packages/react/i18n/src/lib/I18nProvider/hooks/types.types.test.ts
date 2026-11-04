/**
 * Compile-time contract tests for the types in the sibling types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins the
 * shapes those types accept. `tsc --noEmit` checks it.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { I18nContextValue, I18nProviderProps } from "../types.js";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

describe("UseProviderStateProps", () => {
  it("is every provider prop except children", () => {
    expectTypeOf<UseProviderStateProps>().toEqualTypeOf<
      Omit<I18nProviderProps, "children">
    >();
    expectTypeOf<UseProviderStateProps>().not.toHaveProperty("children");
  });
});

describe("UseProviderStateResult", () => {
  it("is the value the context carries", () => {
    expectTypeOf<UseProviderStateResult>().toEqualTypeOf<I18nContextValue>();
  });
});
