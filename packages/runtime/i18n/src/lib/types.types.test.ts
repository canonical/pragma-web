/**
 * Compile-time contract tests for the types in types.ts.
 *
 * Runtime behaviour lives in the sibling test files; this file pins which
 * values the types accept and refuse. `tsc --noEmit` checks it, so a
 * `@ts-expect-error` row fails the check once its error goes away.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { ItemMessages, TwoLocales } from "../../testing/types.js";
import createFormatters from "./createFormatters.js";
import createLocaleSource from "./createLocaleSource.js";
import type {
  Direction,
  Formatters,
  FormattersOptions,
  I18nConfig,
  Locale,
  LocaleSource,
  LocaleSourceOptions,
  LocaleSources,
  Message,
  MessageRecord,
  Messages,
  MessageValue,
  PluralCategory,
  PluralRecord,
  TranslateVars,
  Translations,
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
      | "isolate"
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

  it("isolates text and returns text", () => {
    expectTypeOf<Formatters["isolate"]>().toEqualTypeOf<
      (text: string) => string
    >();
  });
});

describe("FormattersOptions", () => {
  it("makes strict an optional, read-only flag", () => {
    expectTypeOf<FormattersOptions>().toEqualTypeOf<{
      readonly strict?: boolean;
    }>();
  });

  it("is the optional second argument of createFormatters", () => {
    expectTypeOf(createFormatters)
      .parameter(1)
      .toEqualTypeOf<FormattersOptions | undefined>();
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

describe("Message", () => {
  it("accepts text", () => {
    expectTypeOf<"Search">().toExtend<Message>();
  });

  it("accepts a function of one fact", () => {
    expectTypeOf<(name: string) => string>().toExtend<Message>();
  });

  it("accepts a function of one object of named facts", () => {
    expectTypeOf<
      (facts: { readonly first: number; readonly total: number }) => string
    >().toExtend<Message>();
  });

  it("accepts a function whose one fact is optional", () => {
    expectTypeOf<(name?: string) => string>().toExtend<Message>();
  });

  it("refuses a function of two positional facts", () => {
    expectTypeOf<
      (first: number, total: number) => string
    >().not.toExtend<Message>();
  });

  it("refuses a function with an optional second fact", () => {
    expectTypeOf<
      (first: number, total?: number) => string
    >().not.toExtend<Message>();
  });

  it("refuses a rest parameter of fact types", () => {
    expectTypeOf<(...facts: number[]) => string>().not.toExtend<Message>();
  });

  it("refuses a required second fact typed unknown", () => {
    expectTypeOf<
      (first: string, extra: unknown) => string
    >().not.toExtend<Message>();
  });

  it("refuses a required second fact typed any", () => {
    expectTypeOf<
      // biome-ignore lint/suspicious/noExplicitAny: the row pins how Message treats an any-typed second fact
      (first: string, extra: any) => string
    >().not.toExtend<Message>();
  });

  it("accepts an optional or rest second parameter typed unknown or any, which no type can refuse", () => {
    expectTypeOf<
      (name: string, extra?: unknown) => string
    >().toExtend<Message>();
    expectTypeOf<
      (name: string, ...rest: unknown[]) => string
    >().toExtend<Message>();
    expectTypeOf<
      // biome-ignore lint/suspicious/noExplicitAny: the row pins that an optional any-typed second parameter is accepted
      (name: string, extra?: any) => string
    >().toExtend<Message>();
    expectTypeOf<
      // biome-ignore lint/suspicious/noExplicitAny: the row pins that an any-typed rest parameter is accepted
      (name: string, ...rest: any[]) => string
    >().toExtend<Message>();
  });

  it("refuses a function that does not return text", () => {
    expectTypeOf<(count: number) => number>().not.toExtend<Message>();
  });
});

describe("MessageRecord", () => {
  it("accepts a record declared with type", () => {
    type Greetings = {
      readonly heading: string;
      readonly greeting: (name: string) => string;
    };
    expectTypeOf<Greetings>().toExtend<MessageRecord>();
  });

  it("refuses a record declared as an interface", () => {
    interface Greetings {
      readonly heading: string;
    }
    expectTypeOf<Greetings>().not.toExtend<MessageRecord>();
  });

  it("refuses a member that takes two facts", () => {
    type Pair = { readonly pair: (a: string, b: string) => string };
    expectTypeOf<Pair>().not.toExtend<MessageRecord>();
  });

  it("refuses a method member with an optional second fact", () => {
    type Pair = { pair(a: string, b?: string): string };
    expectTypeOf<Pair>().not.toExtend<MessageRecord>();
  });

  it("refuses an unannotated pair of facts in a record literal", () => {
    const record = {
      // @ts-expect-error two unannotated facts are not a Message
      pair: (a, b) => `${a}${b}`,
    } satisfies MessageRecord;
    expectTypeOf(record).toBeObject();
  });

  describe("a locale factory with the record as its return type", () => {
    it("compiles when it words every member with the formatters", () => {
      const createFrench = (f: Formatters): ItemMessages => ({
        items: (count) =>
          f.selectPlural(count, {
            one: "article",
            many: "d’articles",
            other: "articles",
          }),
      });
      expectTypeOf(
        createFrench(createFormatters("fr")),
      ).toExtend<MessageRecord>();
    });

    it("fails to compile with a misspelled member", () => {
      const createFrench = (f: Formatters): ItemMessages => ({
        // @ts-expect-error `itemz` is not a member of the named record
        itemz: (count: number) => f.selectPlural(count, { other: "articles" }),
      });
      expectTypeOf(createFrench).toBeFunction();
    });

    it("fails to compile with a missing member", () => {
      // @ts-expect-error `items` is missing from the returned record
      const createFrench = (): ItemMessages => ({});
      expectTypeOf(createFrench).toBeFunction();
    });
  });
});

describe("Translations", () => {
  it("requires an entry for every locale", () => {
    expectTypeOf<{
      en: string;
      fr: string;
    }>().toExtend<Translations<string, TwoLocales>>();
    expectTypeOf<{ en: string }>().not.toExtend<
      Translations<string, TwoLocales>
    >();
  });

  it("requires every entry to have the declared type", () => {
    expectTypeOf<{ en: string; fr: number }>().not.toExtend<
      Translations<string, TwoLocales>
    >();
  });

  it("keys any locale when no locale union is given", () => {
    expectTypeOf<Translations<string>>().toEqualTypeOf<{
      readonly [locale: string]: string;
    }>();
  });
});
