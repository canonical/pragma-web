/**
 * Core type vocabulary for `@canonical/i18n-core`. Every type here is
 * framework-agnostic — plain data and function signatures over native `Intl`.
 */

/** A BCP 47 language tag, e.g. `"en"`, `"fr-CA"`, `"ar"`. */
export type Locale = string;

/** Writing direction of a locale's script. */
export type Direction = "ltr" | "rtl";

/**
 * CLDR plural categories. `Intl.PluralRules.select()` resolves a count to one
 * of these.
 */
export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * The forms of a wording that varies by count or position, one per CLDR plural
 * category: the `forms` of `Formatters.selectPlural` and `Formatters.selectOrdinal`, or a
 * plural catalog entry. `other` is required — it is the fallback used whenever
 * a locale does not define the selected category.
 */
export type PluralRecord = Partial<Record<PluralCategory, string>> & {
  other: string;
};

/** A single catalog entry: a flat string or a count-sensitive plural record. */
export type MessageValue = string | PluralRecord;

/**
 * A flat map of message keys to values for one locale. Keys are dotted
 * namespaces by convention (e.g. `"nav.home"`); the engine treats them as
 * opaque strings.
 */
export type Messages = Record<string, MessageValue>;

/**
 * Values interpolated into `{placeholder}` slots. A `count` value additionally
 * drives plural selection for a {@link PluralRecord} entry.
 */
export type TranslateVars = Record<string, string | number>;

/** Resolves a message key (with optional variables) to a localized string. */
export type Translator = (key: string, vars?: TranslateVars) => string;

/**
 * Locale-aware formatting helpers backed by memoized native `Intl` instances.
 * Construct once per locale via `createFormatters`.
 */
export interface Formatters {
  /** Format a number for the locale. */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  /** Format a number as currency (ISO 4217 code, e.g. `"USD"`). */
  formatCurrency(
    value: number,
    currency: string,
    options?: Intl.NumberFormatOptions,
  ): string;
  /** Format a date/timestamp for the locale. */
  formatDate(
    value: Date | number,
    options?: Intl.DateTimeFormatOptions,
  ): string;
  /**
   * Format the time portion of a date/timestamp for the locale. Options that
   * name no time field still get the time: the short time style is added, or
   * the hour and minute when the options name a date field or `timeZoneName`,
   * which `Intl` refuses beside a time style.
   */
  formatTime(
    value: Date | number,
    options?: Intl.DateTimeFormatOptions,
  ): string;
  /** Format a relative time, e.g. `(-3, "day")` → "3 days ago". */
  formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ): string;
  /** Join a list with locale-aware conjunctions, e.g. "A, B, and C". */
  formatList(items: Iterable<string>, options?: Intl.ListFormatOptions): string;
  /**
   * Pick the form a count takes under the locale's cardinal plural rules. The
   * forms hold the whole wording, so format the count inside each one:
   *
   * ```ts
   * f.selectPlural(count, { one: `${f.formatNumber(count)} row`, other: `${f.formatNumber(count)} rows` });
   * ```
   *
   * A category the locale selects but `forms` lacks falls back to `other`.
   *
   * @experimental Part of the typed message records, which are pre-release:
   * the signature may change in a minor release before 1.0.
   */
  selectPlural(count: number, forms: PluralRecord): string;
  /**
   * Pick the form a position takes under the locale's ordinal rules. As with
   * `selectPlural`, each form holds the whole wording:
   *
   * ```ts
   * f.selectOrdinal(position, {
   *   one: `${f.formatNumber(position)}st`,
   *   two: `${f.formatNumber(position)}nd`,
   *   few: `${f.formatNumber(position)}rd`,
   *   other: `${f.formatNumber(position)}th`,
   * }); // "2nd" for 2 in English
   * ```
   *
   * A category the locale selects but `forms` lacks falls back to `other`.
   *
   * @experimental Part of the typed message records, which are pre-release:
   * the signature may change in a minor release before 1.0.
   */
  selectOrdinal(position: number, forms: PluralRecord): string;
  /**
   * Wrap `text` between FIRST STRONG ISOLATE (U+2068) and POP DIRECTIONAL
   * ISOLATE (U+2069), so a name or number placed in a sentence keeps its own
   * direction and cannot reorder the words around it, as an Arabic name can
   * inside an English sentence.
   *
   * @experimental Part of the typed message records, which are pre-release:
   * the signature may change in a minor release before 1.0.
   */
  isolate(text: string): string;
}

/**
 * Options for `createFormatters`.
 *
 * @experimental Part of the typed message records, which are pre-release:
 * options may be added or changed in a minor release before 1.0.
 */
export interface FormattersOptions {
  /**
   * Check plural forms for completeness: `selectPlural` and `selectOrdinal` throw a
   * `RangeError` naming each category the locale uses that `forms` lacks, even
   * when the count selects a category that is present. Meant for tests, so a
   * translation short of a form fails there rather than falling back to
   * `other` in production. Defaults to `false`.
   */
  readonly strict?: boolean;
}

/**
 * Declarative, framework-agnostic locale configuration. Plain data, listed
 * explicitly rather than discovered (Constitution VI — no magic).
 */
export interface I18nConfig {
  /** Supported BCP 47 tags, in preference order. */
  locales: readonly Locale[];
  /** Locale used when negotiation finds no supported match. */
  defaultLocale: Locale;
  /** Base languages whose script is right-to-left (e.g. `["ar", "he"]`). */
  rtlLocales?: readonly string[];
  /** Cookie that persists an explicit choice. Defaults to `"locale"`. */
  cookieName?: string;
}

/** Raw request inputs `negotiateLocale` reads from, in priority order. */
export interface LocaleSources {
  /** Raw `Cookie` header — an explicit prior choice wins over everything. */
  cookieHeader?: string | null;
  /** Raw `Accept-Language` header, consulted when no cookie matches. */
  acceptLanguage?: string | null;
}

/** Options for `createLocaleSource`. */
export interface LocaleSourceOptions {
  /**
   * Starting locale. Defaults to {@link I18nConfig.defaultLocale}. Stored as
   * given, unlike a tag passed to `set`, so pass a configured locale, such as
   * the result of `negotiateLocale`.
   */
  initial?: Locale;
  /** Persist changes to the cookie (browser only). Defaults to `true`. */
  persist?: boolean;
  /** Reflect changes onto `<html lang dir>` (browser only). Defaults to `true`. */
  reflect?: boolean;
}

/**
 * A live, observable locale value shared across frameworks. `subscribe` honors
 * the Svelte store contract — it calls back immediately with the current value
 * and returns an unsubscribe — which also satisfies React's
 * `useSyncExternalStore` and Lit reactive controllers. One source, every
 * framework.
 */
export interface LocaleSource {
  /** Read the current locale. */
  get(): Locale;
  /** Writing direction of the current locale. */
  readonly direction: Direction;
  /**
   * Change the active locale (persists + reflects per options). The tag is
   * matched as negotiation matches an `Accept-Language` tag: the exact
   * configured tag first, then its base language, ignoring case, so
   * `set("fr-CA")` selects `"fr"` when only `"fr"` is configured. A tag that
   * matches the current locale changes nothing.
   *
   * @throws RangeError when the tag matches no configured locale.
   */
  set(tag: Locale): void;
  /** Subscribe; invokes `run` immediately and on each change. Returns unsubscribe. */
  subscribe(run: (locale: Locale) => void): () => void;
}
