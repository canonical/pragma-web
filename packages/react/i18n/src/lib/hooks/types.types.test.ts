/**
 * Compile-time contract tests for the types in the sibling types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins the
 * shapes those types accept. `tsc --noEmit` checks it.
 */

import type {
  Direction,
  Formatters,
  Locale,
  Translator,
} from "@canonical/i18n-core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  UseFormattersProps,
  UseFormattersResult,
  UseLocaleProps,
  UseLocaleResult,
  UseTranslationProps,
  UseTranslationResult,
} from "./types.js";

describe("UseTranslationProps", () => {
  it("is empty, since the hook takes no input", () => {
    expectTypeOf<UseTranslationProps>().toEqualTypeOf<Record<string, never>>();
  });
});

describe("UseTranslationResult", () => {
  it("exposes the translator, the locale and its direction", () => {
    expectTypeOf<UseTranslationResult["t"]>().toEqualTypeOf<Translator>();
    expectTypeOf<UseTranslationResult["locale"]>().toEqualTypeOf<Locale>();
    expectTypeOf<
      UseTranslationResult["direction"]
    >().toEqualTypeOf<Direction>();
  });
});

describe("UseLocaleProps", () => {
  it("is empty, since the hook takes no input", () => {
    expectTypeOf<UseLocaleProps>().toEqualTypeOf<Record<string, never>>();
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
});

describe("UseFormattersProps", () => {
  it("is empty, since the hook takes no input", () => {
    expectTypeOf<UseFormattersProps>().toEqualTypeOf<Record<string, never>>();
  });
});

describe("UseFormattersResult", () => {
  it("is the core Formatters interface", () => {
    expectTypeOf<UseFormattersResult>().toEqualTypeOf<Formatters>();
  });
});
