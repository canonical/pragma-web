import { PLURAL_CATEGORIES } from "./constants.js";
import type {
  Formatters,
  FormattersOptions,
  Locale,
  PluralRecord,
} from "./types.js";

/**
 * Wrap an `Intl` constructor in an options-keyed cache. Building `Intl`
 * instances is comparatively expensive and formatter calls repeat with the
 * same options, so memoizing by serialized options keeps reuse cheap
 * (Constitution IX — optimise only where it pays).
 */
function memoizeByOptions<TOptions, TFormatter>(
  build: (options: TOptions | undefined) => TFormatter,
): (options?: TOptions) => TFormatter {
  const cache = new Map<string, TFormatter>();
  return (options) => {
    const key = JSON.stringify(options ?? {});
    let formatter = cache.get(key);
    if (formatter === undefined) {
      formatter = build(options);
      cache.set(key, formatter);
    }
    return formatter;
  };
}

/** Options that already ask for a part of the time of day. */
const TIME_FIELDS = [
  "hour",
  "minute",
  "second",
  "dayPeriod",
  "fractionalSecondDigits",
  "timeStyle",
] as const;

/**
 * Options that ask for a part of the date or for the time zone's name. `Intl`
 * refuses a time style beside any of them, so they gain the hour and minute.
 */
const NON_STYLE_FIELDS = [
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "timeZoneName",
] as const;

/**
 * Make sure date-time options ask for the time of day. Options that already
 * name a time field pass through; options that name a date field or the time
 * zone's name gain the hour and minute; any other options gain the short time
 * style.
 */
function ensureTimeFields(
  options: Intl.DateTimeFormatOptions | undefined,
): Intl.DateTimeFormatOptions {
  if (options === undefined) return { timeStyle: "short" };
  if (TIME_FIELDS.some((field) => options[field] !== undefined)) return options;
  if (NON_STYLE_FIELDS.some((field) => options[field] !== undefined)) {
    return { ...options, hour: "numeric", minute: "2-digit" };
  }
  return { ...options, timeStyle: "short" };
}

/**
 * Throw when `forms` lacks a category that `rules` can select for its locale,
 * naming every missing category in CLDR order.
 */
function assertComplete(
  locale: Locale,
  rules: Intl.PluralRules,
  forms: PluralRecord,
): void {
  const { pluralCategories, type } = rules.resolvedOptions();
  const used = new Set<string>(pluralCategories);
  const missing = PLURAL_CATEGORIES.filter(
    (category) => used.has(category) && forms[category] === undefined,
  );
  if (missing.length > 0) {
    throw new RangeError(
      `Missing ${type} plural forms for "${locale}": ${missing.join(", ")}.`,
    );
  }
}

/**
 * Create locale-aware {@link Formatters} backed by memoized native `Intl`
 * instances. Framework-agnostic and SSR-safe — `Intl` is a platform global.
 *
 * @param locale - BCP 47 tag every formatter is bound to.
 * @param options - `strict` makes `selectPlural` and `selectOrdinal` throw on missing
 *   forms; see {@link FormattersOptions}. The options parameter is
 *   experimental, as {@link FormattersOptions} is.
 */
export default function createFormatters(
  locale: Locale,
  options: FormattersOptions = {},
): Formatters {
  const { strict = false } = options;
  const getNumberFormat = memoizeByOptions(
    (options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options),
  );
  const getDateFormat = memoizeByOptions(
    (options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, options),
  );
  const getRelativeTimeFormat = memoizeByOptions(
    (options?: Intl.RelativeTimeFormatOptions) =>
      new Intl.RelativeTimeFormat(locale, options),
  );
  const getListFormat = memoizeByOptions(
    (options?: Intl.ListFormatOptions) => new Intl.ListFormat(locale, options),
  );
  const getPluralRules = memoizeByOptions(
    (options?: Intl.PluralRulesOptions) =>
      new Intl.PluralRules(locale, options),
  );

  /** Select the form of `forms` that `rules` picks for `value`. */
  const selectForm = (
    rules: Intl.PluralRules,
    value: number,
    forms: PluralRecord,
  ): string => {
    if (strict) assertComplete(locale, rules, forms);
    return forms[rules.select(value)] ?? forms.other;
  };

  return {
    formatNumber: (value, options) => getNumberFormat(options).format(value),
    formatCurrency: (value, currency, options) =>
      getNumberFormat({ ...options, style: "currency", currency }).format(
        value,
      ),
    formatDate: (value, options) => getDateFormat(options).format(value),
    formatTime: (value, options) =>
      getDateFormat(ensureTimeFields(options)).format(value),
    formatRelativeTime: (value, unit, options) =>
      getRelativeTimeFormat(options).format(value, unit),
    formatList: (items, options) => getListFormat(options).format([...items]),
    selectPlural: (count, forms) => selectForm(getPluralRules(), count, forms),
    selectOrdinal: (position, forms) =>
      selectForm(getPluralRules({ type: "ordinal" }), position, forms),
    isolate: (text) => `\u2068${text}\u2069`,
  };
}
