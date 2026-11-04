/**
 * Compile-time contract tests for the types in the sibling types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins the
 * shapes those types accept. `tsc --noEmit` checks it.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { I18nContextValue, I18nProviderProps } from "../types.js";
import type {
  UseI18nContextProps,
  UseI18nContextResult,
  UseProviderStateProps,
  UseProviderStateResult,
} from "./types.js";

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

describe("UseI18nContextProps", () => {
  it("is empty, since the hook takes no input", () => {
    expectTypeOf<UseI18nContextProps>().toEqualTypeOf<Record<string, never>>();
  });
});

describe("UseI18nContextResult", () => {
  it("is the value the context carries", () => {
    expectTypeOf<UseI18nContextResult>().toEqualTypeOf<I18nContextValue>();
  });
});
