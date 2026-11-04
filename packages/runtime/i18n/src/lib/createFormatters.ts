import type { Formatters, Locale } from "./types.js";

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

/**
 * Create locale-aware {@link Formatters} backed by memoized native `Intl`
 * instances. Framework-agnostic and SSR-safe — `Intl` is a platform global.
 *
 * @param locale - BCP 47 tag every formatter is bound to.
 */
export default function createFormatters(locale: Locale): Formatters {
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

  return {
    number: (value, options) => getNumberFormat(options).format(value),
    currency: (value, currency, options) =>
      getNumberFormat({ ...options, style: "currency", currency }).format(
        value,
      ),
    date: (value, options) => getDateFormat(options).format(value),
    time: (value, options) =>
      getDateFormat(options ?? { timeStyle: "short" }).format(value),
    relativeTime: (value, unit, options) =>
      getRelativeTimeFormat(options).format(value, unit),
    list: (items, options) => getListFormat(options).format([...items]),
  };
}
