const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** A relative time, ready for `Intl.RelativeTimeFormat`: negative is past. */
export interface RelativeTime {
  readonly value: number;
  readonly unit: "minute" | "hour" | "day";
}

/**
 * Expresses how long ago something happened in the largest whole unit that
 * fits: minutes under an hour, hours under a day, days beyond. The result is
 * formatted by the locale's relative-time formatter, which reads neighbouring
 * days as words where the locale has them ("yesterday", "hier").
 */
export default function selectRelativeTime(minutesAgo: number): RelativeTime {
  if (minutesAgo < MINUTES_PER_HOUR) {
    return { value: -minutesAgo, unit: "minute" };
  }
  if (minutesAgo < MINUTES_PER_DAY) {
    return { value: -Math.round(minutesAgo / MINUTES_PER_HOUR), unit: "hour" };
  }
  return { value: -Math.round(minutesAgo / MINUTES_PER_DAY), unit: "day" };
}
