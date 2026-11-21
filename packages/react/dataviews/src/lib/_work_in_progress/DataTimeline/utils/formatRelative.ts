type Division = {
  readonly amount: number;
  readonly unit: Intl.RelativeTimeFormatUnit;
};

const DIVISIONS: readonly Division[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const formatters = new Map<string, Intl.RelativeTimeFormat>();

const readFormatter = (locale: string): Intl.RelativeTimeFormat => {
  const cached = formatters.get(locale);
  if (cached !== undefined) {
    return cached;
  }
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  formatters.set(locale, formatter);
  return formatter;
};

/**
 * An instant written relative to `now`, in the largest unit it spans: "2
 * hours ago", "in 3 days". The amount is rounded before its unit is chosen,
 * so 59.6 seconds is a minute.
 *
 * @note Impure: memoises one formatter per locale in a module-level map.
 */
export default function formatRelative(
  at: number,
  now: number,
  locale: string,
): string {
  let amount = (at - now) / 1000;
  for (const { amount: span, unit } of DIVISIONS) {
    const rounded = Math.round(amount);
    if (Math.abs(rounded) < span) {
      return readFormatter(locale).format(rounded, unit);
    }
    amount /= span;
  }
  return "";
}
