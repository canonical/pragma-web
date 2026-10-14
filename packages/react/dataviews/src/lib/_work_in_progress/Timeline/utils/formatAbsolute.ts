import { readInstant } from "@canonical/dataviews-core/bindings";

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

const formatters = new Map<string, Intl.DateTimeFormat>();

const readFormatter = (
  locale: string,
  timeZone: string | undefined,
  dateOnly: boolean,
): Intl.DateTimeFormat => {
  const key = `${locale}\u0000${timeZone ?? ""}\u0000${dateOnly}`;
  const cached = formatters.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(dateOnly ? {} : { timeStyle: "short" }),
    ...(timeZone === undefined ? {} : { timeZone }),
  });
  formatters.set(key, formatter);
  return formatter;
};

/**
 * A date value written in full: a date-time as its date and time in
 * `timeZone`, or the runtime's zone without one, and a calendar date as the
 * date it names, whatever the zone. A value the core reads no instant from
 * is written as nothing.
 *
 * @note Impure: memoises one formatter per locale, zone and form in a
 * module-level map.
 */
export default function formatAbsolute(
  value: string,
  locale: string,
  timeZone?: string,
): string {
  const at = readInstant(value);
  if (at === null) {
    return "";
  }
  const dateOnly = CALENDAR_DATE.test(value);
  return readFormatter(locale, dateOnly ? "UTC" : timeZone, dateOnly).format(
    at,
  );
}
