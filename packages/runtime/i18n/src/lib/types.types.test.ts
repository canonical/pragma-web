/**
 * Compile-time contract tests for the types in types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins which
 * values the types accept and refuse. `tsc --noEmit` checks it, so a
 * `@ts-expect-error` row fails the check once its error goes away.
 */

import { describe, expectTypeOf, it } from "vitest";
import createLocaleSource from "./createLocaleSource.js";
import type {
  Direction,
  Formatters,
  I18nConfig,
  Locale,
  LocaleSource,
  LocaleSourceOptions,
  LocaleSources,
  Messages,
  MessageValue,
  PluralCategory,
  PluralRecord,
  TranslateVars,
  Translator,
} from "./types.js";

describe("Locale", () => {
  it("is any BCP 47 tag string", () => {
    expectTypeOf<Locale>().toEqualTypeOf<string>();
  });
});

describe("Direction", () => {
  it("is left-to-right or right-to-left", () => {
    expectTypeOf<Direction>().toEqualTypeOf<"ltr" | "rtl">();
  });
});

describe("PluralCategory", () => {
  it("lists the six CLDR plural categories", () => {
    expectTypeOf<PluralCategory>().toEqualTypeOf<
      "zero" | "one" | "two" | "few" | "many" | "other"
    >();
  });
});

describe("PluralRecord", () => {
  it("requires the other form", () => {
    expectTypeOf<{ other: string }>().toExtend<PluralRecord>();
    expectTypeOf<{ one: string }>().not.toExtend<PluralRecord>();
  });

  it("accepts any subset of the other categories beside it", () => {
    expectTypeOf<{
      one: string;
      few: string;
      other: string;
    }>().toExtend<PluralRecord>();
  });
});

describe("MessageValue", () => {
  it("is text or a plural record", () => {
    expectTypeOf<string>().toExtend<MessageValue>();
    expectTypeOf<PluralRecord>().toExtend<MessageValue>();
    expectTypeOf<number>().not.toExtend<MessageValue>();
  });
});

describe("Messages", () => {
  it("maps any key to a catalog entry", () => {
    expectTypeOf<{ "nav.home": string }>().toExtend<Messages>();
    expectTypeOf<{ "nav.home": number }>().not.toExtend<Messages>();
  });
});

describe("TranslateVars", () => {
  it("interpolates strings and numbers", () => {
    expectTypeOf<{ name: string; count: number }>().toExtend<TranslateVars>();
    expectTypeOf<{ flag: boolean }>().not.toExtend<TranslateVars>();
  });
});

describe("Translator", () => {
  it("takes a key and optional variables and returns text", () => {
    expectTypeOf<Translator>().toEqualTypeOf<
      (key: string, vars?: TranslateVars) => string
    >();
  });
});

describe("Formatters", () => {
  it("has exactly its members, each named with a verb", () => {
    expectTypeOf<keyof Formatters>().toEqualTypeOf<
      | "formatNumber"
      | "formatCurrency"
      | "formatDate"
      | "formatTime"
      | "formatRelativeTime"
      | "formatList"
      | "selectPlural"
      | "selectOrdinal"
    >();
  });

  it("formats each value to text", () => {
    expectTypeOf<Formatters["formatNumber"]>().returns.toEqualTypeOf<string>();
    expectTypeOf<Formatters["formatTime"]>()
      .parameter(0)
      .toEqualTypeOf<Date | number>();
    expectTypeOf<Formatters["formatList"]>()
      .parameter(0)
      .toEqualTypeOf<Iterable<string>>();
  });

  it("gives each member its full signature", () => {
    expectTypeOf<Formatters["formatNumber"]>().toEqualTypeOf<
      (value: number, options?: Intl.NumberFormatOptions) => string
    >();
    expectTypeOf<Formatters["formatCurrency"]>().toEqualTypeOf<
      (
        value: number,
        currency: string,
        options?: Intl.NumberFormatOptions,
      ) => string
    >();
    expectTypeOf<Formatters["formatDate"]>().toEqualTypeOf<
      (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
    >();
    expectTypeOf<Formatters["formatTime"]>().toEqualTypeOf<
      (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
    >();
    expectTypeOf<Formatters["formatRelativeTime"]>().toEqualTypeOf<
      (
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
        options?: Intl.RelativeTimeFormatOptions,
      ) => string
    >();
    expectTypeOf<Formatters["formatList"]>().toEqualTypeOf<
      (items: Iterable<string>, options?: Intl.ListFormatOptions) => string
    >();
  });

  it("selects a plural form by count from a plural record", () => {
    expectTypeOf<Formatters["selectPlural"]>().toEqualTypeOf<
      (count: number, forms: PluralRecord) => string
    >();
  });

  it("selects an ordinal form by position from a plural record", () => {
    expectTypeOf<Formatters["selectOrdinal"]>().toEqualTypeOf<
      (position: number, forms: PluralRecord) => string
    >();
  });
});

describe("I18nConfig", () => {
  it("requires the locales and the default locale", () => {
    expectTypeOf<{
      locales: readonly string[];
      defaultLocale: string;
    }>().toExtend<I18nConfig>();
    expectTypeOf<{ locales: readonly string[] }>().not.toExtend<I18nConfig>();
  });

  it("accepts a config declared as const", () => {
    const config = {
      locales: ["en", "ar"],
      defaultLocale: "en",
      rtlLocales: ["ar"],
    } as const;
    expectTypeOf(config).toExtend<I18nConfig>();
  });

  it("has exactly these members", () => {
    expectTypeOf<I18nConfig>().toEqualTypeOf<{
      locales: readonly Locale[];
      defaultLocale: Locale;
      rtlLocales?: readonly string[];
      cookieName?: string;
    }>();
  });
});

describe("LocaleSources", () => {
  it("makes both request headers optional and nullable", () => {
    expectTypeOf<Record<string, never>>().toExtend<LocaleSources>();
    expectTypeOf<{
      cookieHeader: null;
      acceptLanguage: null;
    }>().toExtend<LocaleSources>();
  });

  it("has exactly the two request headers", () => {
    expectTypeOf<LocaleSources>().toEqualTypeOf<{
      cookieHeader?: string | null;
      acceptLanguage?: string | null;
    }>();
  });
});

describe("LocaleSourceOptions", () => {
  it("makes every option optional", () => {
    expectTypeOf<Record<string, never>>().toExtend<LocaleSourceOptions>();
  });

  it("has exactly the initial locale, persist and reflect", () => {
    expectTypeOf<LocaleSourceOptions>().toEqualTypeOf<{
      initial?: Locale;
      persist?: boolean;
      reflect?: boolean;
    }>();
  });
});

describe("LocaleSource", () => {
  it("is what createLocaleSource returns", () => {
    expectTypeOf(createLocaleSource).returns.toEqualTypeOf<LocaleSource>();
  });

  it("subscribes with a callback and returns an unsubscribe function", () => {
    expectTypeOf<LocaleSource["subscribe"]>().toEqualTypeOf<
      (run: (locale: Locale) => void) => () => void
    >();
  });

  it("reads, writes and observes the locale and reads its direction", () => {
    expectTypeOf<keyof LocaleSource>().toEqualTypeOf<
      "get" | "direction" | "set" | "subscribe"
    >();
    expectTypeOf<LocaleSource["get"]>().toEqualTypeOf<() => Locale>();
    expectTypeOf<LocaleSource["direction"]>().toEqualTypeOf<Direction>();
  });

  it("sets the locale from a tag, which it matches to a configured locale", () => {
    expectTypeOf<LocaleSource["set"]>().toEqualTypeOf<(tag: Locale) => void>();
  });
});
