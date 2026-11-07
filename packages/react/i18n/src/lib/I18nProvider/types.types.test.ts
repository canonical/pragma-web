/**
 * Compile-time contract tests for the types in the sibling types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins the
 * shapes those types accept. `tsc --noEmit` checks it.
 */

import type {
  I18nConfig,
  Locale,
  LocaleSource,
  Messages,
} from "@canonical/i18n-core";
import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { I18nContextValue, I18nProviderProps } from "./types.js";

describe("I18nProviderProps", () => {
  it("requires the children, the config and the catalogs", () => {
    expectTypeOf<{
      children: ReactNode;
      config: I18nConfig;
      catalogs: Record<Locale, Messages>;
    }>().toExtend<I18nProviderProps>();
    expectTypeOf<{
      config: I18nConfig;
      catalogs: Record<Locale, Messages>;
    }>().not.toExtend<I18nProviderProps>();
    expectTypeOf<{
      children: ReactNode;
      catalogs: Record<Locale, Messages>;
    }>().not.toExtend<I18nProviderProps>();
  });

  it("has exactly these props, with the children and config types", () => {
    expectTypeOf<keyof I18nProviderProps>().toEqualTypeOf<
      "children" | "config" | "catalogs" | "locale" | "source"
    >();
    expectTypeOf<I18nProviderProps["children"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<I18nProviderProps["config"]>().toEqualTypeOf<I18nConfig>();
  });

  it("makes the initial locale and the source optional", () => {
    expectTypeOf<I18nProviderProps["locale"]>().toEqualTypeOf<
      Locale | undefined
    >();
    expectTypeOf<I18nProviderProps["source"]>().toEqualTypeOf<
      LocaleSource | undefined
    >();
  });
});

describe("I18nContextValue", () => {
  it("carries the source, the config and the catalogs", () => {
    expectTypeOf<I18nContextValue>().toEqualTypeOf<{
      source: LocaleSource;
      config: I18nConfig;
      catalogs: Record<Locale, Messages>;
    }>();
  });
});
