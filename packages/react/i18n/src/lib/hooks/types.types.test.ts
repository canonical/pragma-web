/**
 * Compile-time contract tests for the types in the sibling types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins the
 * shapes those types accept. `tsc --noEmit` checks it.
 */

import type { Direction, Locale, Translator } from "@canonical/i18n-core";
import { describe, expectTypeOf, it } from "vitest";
import type { UseLocaleResult, UseTranslationResult } from "./types.js";

describe("UseTranslationResult", () => {
  it("exposes the translator, the locale and its direction", () => {
    expectTypeOf<UseTranslationResult["t"]>().toEqualTypeOf<Translator>();
    expectTypeOf<UseTranslationResult["locale"]>().toEqualTypeOf<Locale>();
    expectTypeOf<
      UseTranslationResult["direction"]
    >().toEqualTypeOf<Direction>();
  });

  it("has exactly those members", () => {
    expectTypeOf<keyof UseTranslationResult>().toEqualTypeOf<
      "t" | "locale" | "direction"
    >();
  });
});

describe("UseLocaleResult", () => {
  it("exposes the locale, its direction, a setter and the configured locales", () => {
    expectTypeOf<UseLocaleResult["locale"]>().toEqualTypeOf<Locale>();
    expectTypeOf<UseLocaleResult["direction"]>().toEqualTypeOf<Direction>();
    expectTypeOf<UseLocaleResult["setLocale"]>().toEqualTypeOf<
      (locale: Locale) => void
    >();
    expectTypeOf<UseLocaleResult["locales"]>().toEqualTypeOf<
      readonly Locale[]
    >();
  });

  it("has exactly those members", () => {
    expectTypeOf<keyof UseLocaleResult>().toEqualTypeOf<
      "locale" | "direction" | "setLocale" | "locales"
    >();
  });
});
